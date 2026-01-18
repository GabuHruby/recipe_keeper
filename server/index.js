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
const Recipe = require("./models/Recipe");

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
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: "Invalid recipe data." });
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
