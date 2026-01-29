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

const app = express();

app.use(cors());
app.use(express.json());

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
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
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
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: "Invalid recipe data." });
  }
});

//get a single recipe by id
app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipe." });
  }
});

//update recipe
app.put("/recipes/:id", async (req, res) => {
  try {
    const existing = await Recipe.findById(req.params.id);
    if (!existing) {
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
    res.status(400).json({ error: "Failed to update recipe." });
  }
});

//delete recipe
app.delete("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
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
    res.status(500).json({ error: "Failed to delete recipe." });
  }
});

app.post("/users/signup", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    //Error prevention
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
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
      return res.status(400).json({ error: "Missing required fields." });
    }

    //User.findOne finds a single user that has the correct email
    const user = await User.findOne({ email });
    //If there is not then return invalid
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    //Check if passwords are the same after ensuring there is a user with that email
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    console.log("User logged in:", user._id);
    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in." });
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
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "recipes" },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
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
