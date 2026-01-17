require("dotenv").config();
//Express makes it easy to create routes and handle requests
const express = require("express");
//Allows requests from different origins such as the app
const cors = require("cors");
//Mongoose makes it easy to interact with MongoDB
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const app = express();

app.use(cors());
app.use(express.json());

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

const port = process.env.PORT || 6767;
const mongoUri = process.env.MONGODB_URI;

//Safety
if (!mongoUri) {
  throw new Error("MONGODB_URI is required.");
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
