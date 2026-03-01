require("dotenv").config();
//Express makes it easy to create routes and handle requests
const express = require("express");
//Allows requests from different origins such as the app
const cors = require("cors");
//Mongoose makes it easy to interact with MongoDB
const mongoose = require("mongoose");
//Multer handles file uploads
const multer = require("multer");
//Cloudinary stores images in the cloud
const { v2: cloudinary } = require("cloudinary");
//Bcrypt hashes passwords
const bcrypt = require("bcryptjs");
const Recipe = require("./models/Recipe");
const User = require("./models/User");
const Family = require("./models/Family");

const app = express();

app.use(cors());
app.use(express.json());

//https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
//Website that shows all status codes

//Means file will be stored in RAM temporarily
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//public ID is made up of folder path and file name without extension
const getCloudinaryPublicId = (imageUrl) => {
  //get last part of the url after the last /
  const parts = imageUrl.split("/");
  const fileName = parts[parts.length - 1];
  const publicIdWithExtension = fileName.split(".")[0];
  //Get folder path
  const folder = parts.slice(parts.indexOf("recipes")).slice(0, -1).join("/");
  //Combine folder and file name without extension
  const publicId = `${folder}/${publicIdWithExtension}`;
  return publicId;
};

//Test to see if server is running
app.get("/", (req, res) => {
  res.json({ ok: true });
});

//Async allows to use await inside the function
//Gets all recipes but is currently not being used after the family implimentation
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    //500 is internal server error, which means something went wrong in te server
    res.status(500).json({ error: "Failed to fetch recipes." });
  }
});

app.post("/recipes", async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    //add created recipe to user's recipesCreated array
    const createdByUser = await User.findById(req.body.createdBy);
    if (createdByUser) {
      createdByUser.recipesCreated.push(recipe._id);
      await createdByUser.save();
    }
    //201 means created (usual post and put requests)
    res.status(201).json(recipe);
  } catch (err) {
    //400 means bad request (invalid data sent)
    res.status(400).json({ error: "Invalid recipe data." });
  }
});

//get a single recipe by id
app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      //404 means not found
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json(recipe);
  } catch (err) {
    //internal server error, most catch (err) are 500 errors
    res.status(500).json({ error: "Failed to fetch recipe." });
  }
});

//update recipe
app.put("/recipes/:id", async (req, res) => {
  try {
    const existing = await Recipe.findById(req.params.id);
    if (!existing) {
      //404 means not found
      return res.status(404).json({ error: "Recipe not found." });
    }

    if (
      //Object is a safe way to check if property exists
      //If the imageUri is being changed, delete the old one
      Object.prototype.hasOwnProperty.call(req.body, "imageUri") &&
      existing.imageUri &&
      req.body.imageUri !== existing.imageUri
    ) {
      const publicId = getCloudinaryPublicId(existing.imageUri);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(recipe);
  } catch (err) {
    //400 means bad request
    res.status(400).json({ error: "Failed to update recipe." });
  }
});

//delete recipe
app.delete("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      //404 not found
      return res.status(404).json({ error: "Recipe not found." });
    }
    if (recipe.imageUri) {
      const publicId = getCloudinaryPublicId(recipe.imageUri);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
    await Recipe.deleteOne({ _id: recipe._id });
    //remove recipe from user's recipesCreated array
    const createdByUser = await User.findById(recipe.createdBy);
    if (createdByUser) {
      createdByUser.recipesCreated = createdByUser.recipesCreated.filter(
        (recipeId) => recipeId.toString() !== req.params.id
      );
      await createdByUser.save();
    }
    res.json({ message: "Recipe deleted successfully." });
  } catch (err) {
    //500 internal server error
    res.status(500).json({ error: "Failed to delete recipe." });
  }
});

//Get family recipes
app.get("/recipes/family/:familyId", async (req, res) => {
  try {
    //Get all users in the family
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      //404 not found
      return res.status(404).json({ error: "Family not found." });
    }
    const members = family.members || [];
    
    //Get all recipes created by family members
    //Finding recipes and seeing if the createdBy ID is in the members array and sorting by most recent
    const recipes = await Recipe.find({ createdBy: { $in: members }, private: false }).sort({
      createdAt: -1,
    });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch family recipes." });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    //Delete family association
    const familyId = req.body.familyId;
    const family = await Family.findById(familyId);
    if (family) {
      //Remove user from family members
      family.members = family.members.filter(
        (memberId) => memberId.toString() !== req.params.id
      );

      if (family.members.length === 0) {
        //Delete family if no members left
        await Family.deleteOne({ _id: family._id });
      }else{
        family.createdBy = family.members[0];
        await family.save();
      }
    }

    //Delete all recipes created by the user
    const recipesCreated = user.recipesCreated || [];
    for (const recipeId of recipesCreated) {
      const recipe = await Recipe.findById(recipeId);
      if (recipe) {
        if (recipe.imageUri) {
          const publicId = getCloudinaryPublicId(recipe.imageUri);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
        await Recipe.deleteOne({ _id: recipe._id });
      }
    }

    //Delete user
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User and recipes deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

app.post("/users/signup", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    //Error prevention
    if (!username || !email || !password) {
      //400 bad request
      return res.status(400).json({ error: "Missing required fields." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    //201 created
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    //11000 is duplicate key error code in MongoDB
    if (err.code === 11000) {
      //409 means conflict
      return res.status(409).json({ error: "Email already in use." });
    }
    res.status(500).json({ error: "Failed to create user." });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    //Check for missing fields
    if (!email || !password) {
      //409 conflict
      return res.status(400).json({ error: "Missing required fields." });
    }

    //User.findOne finds a single user that has the correct email
    const user = await User.findOne({ email });
    //If there is not then return invalid
    if (!user) {
      //401 means unauthorized
      return res.status(401).json({ error: "Invalid credentials." });
    }

    //Check if passwords are the same after ensuring there is a user with that email
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      //401 - Unauthorized
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.json({ id: user._id, username: user.username, email: user.email, family: user.family || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in." });
  }
});

const generateFamilyCode = () => {
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * possibleChars.length);
      code += possibleChars.charAt(idx);
    }

    return code;
};

app.post("/family", async (req, res) => {
  try {
    const familyName = (req.body.name || "").trim();
    const userId = req.body.userId;

    if (!familyName || !userId ) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    //Generate code
    let inviteCode = generateFamilyCode();
    while (await Family.findOne({ inviteCode })) {
      inviteCode = generateFamilyCode();
    }

    const family = await Family.create({ name: familyName, inviteCode: inviteCode, members: [userId], createdBy: userId });
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.family = family._id; 
    await user.save();

    res.status(201).json({ id: family._id, inviteCode: family.inviteCode });
  } catch (err) {
    res.status(500).json({ error: "Failed to create family." });
  }
});

app.put("/family/join", async (req, res) => {
  try {
    const inviteCode = (req.body.inviteCode || "").trim();
    const userId = req.body.userId;

    if (!inviteCode || !userId ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const family = await Family.findOne({ inviteCode });
    if (!family) {
      return res.status(404).json({ error: "Invalid code." });
    }

    //Add user to family members
    family.members.push(userId);
    await family.save();

    //Add family to user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.family = family._id; 
    await user.save();

    res.json({ id: family._id, name: family.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to join family." });
  }
});

app.delete("/family/:familyId", async (req, res) => {
  try {
    const familyId = req.params.familyId;
    
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: "Family not found." });
    }
    
    //Remove family reference from all members
    await User.updateMany(
      { family: familyId },
      { $set: { family: null } }
    );

    //Delete the family
    await Family.deleteOne({ _id: familyId });
    res.json({ message: "Family deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete family." });
  }
});

app.get("/family/:familyId", async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      return res.status(404).json({ error: "Family not found." });
    }
    res.json({
      id: family._id,
      name: family.name,
      inviteCode: family.inviteCode,
      members: family.members || [],
      createdBy: family.createdBy,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch family." });
  }
});

app.put("/users/leaveFamily/:familyId", async (req, res) => {
  try {
    const userId = req.body.userId;
    const familyId = req.params.familyId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: "Family not found." });
    }

    //Remove user from family members
    family.members = family.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    if (family.members.length === 0) {
      //Delete family if no members left
      await Family.deleteOne({ _id: family._id });
    }else{
      family.createdBy = family.members[0];
      await family.save();
    }
    
    //Remove family from user
    user.family = null;
    await user.save();
    res.json({ message: "Left family successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave family." });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    //:id puts anything after /users/ into req.params.id
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      favoriteRecipes: user.favoriteRecipes || [],
      profilePictureUri: user.profilePictureUri || "",
      recipesInCart: user.recipesInCart || [],
      recipesCreated: user.recipesCreated || [],
      family: user.family || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});


//Get recipes from a specific user for the personal screen
app.get("/users/:id/recipes", async (req, res) => {
  try {
    //add favoriteRecipe as well
    const recipes = await User.findById(req.params.id).populate("recipesCreated").populate("favoriteRecipes");
    if (!recipes) {
      return res.status(404).json({ error: "There are no recipes for this user." });
    }
    res.json({
      recipesCreated: recipes.recipesCreated || [],
      favoriteRecipes: recipes.favoriteRecipes || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's recipes." });
  }
});

//Get recipes in cart
app.get("/users/:id/recipesInCart", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("recipesInCart");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({
      recipesInCart: user.recipesInCart || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipes in cart." });
  }
});

app.put("/users/:id/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const { recipeId, add } = req.body;
    if (add) {
      //Add to favorites
      if (!user.favoriteRecipes.includes(recipeId)) {
        user.favoriteRecipes.push(recipeId);
      }
    } else {
      //Remove from favorites
      user.favoriteRecipes = user.favoriteRecipes.filter(
        (id) => id.toString() !== recipeId
      );
    }
    await user.save();
    res.json({ message: "Favorites updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update favorites." });
  }
});

app.put("/users/:id/cart", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const { recipeId, add } = req.body;
    if (add) {
      //Add to cart
      if (!user.recipesInCart.includes(recipeId)) {
        user.recipesInCart.push(recipeId);
      }
    } else {
      //Remove from cart
      user.recipesInCart = user.recipesInCart.filter(
        (id) => id.toString() !== recipeId
      );
    }
    await user.save();
    res.json({ message: "Cart updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart." });
  }
});

//Expects a file and puts it into req.file
app.post("/uploads", upload.single("file"), async (req, res) => {
  //If no file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  try {
    //Create a promise to handle the async upload stream
    const image = await new Promise((resolve, reject) => {
      //Stream minizes memory usage as file is uploaded in chunks instead of all at once
      cloudinary.uploader.upload_stream(
        { folder: "recipes" }, //Folder path
        (error, result) => {
          if (error) {
            reject(error); //Reject promise if upload encounters an error
            return;
          }
          resolve(result);//Resolve promise with successful upload result
        }
      ).end(req.file.buffer); //End stream and send file data from multer buffer to Cloudinary
    });
    // Return the secure URL (HTTPS) of the uploaded image
    res.status(201).json({ url: image.secure_url });
  } catch (err) {
    // Handle upload errors with 500 status
    res.status(500).json({ error: "Image upload failed." });
  }
});

const port = process.env.PORT || 6767;
const mongoUri = process.env.MONGODB_URI;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;

//Safety
if (!mongoUri) {
  throw new Error("MONGODB_URI is required.");
}
if (!cloudName || !cloudKey || !cloudSecret) {
  throw new Error("Cloudinary credentials are required.");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  //Prevents server from starting if DB connection fails
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
