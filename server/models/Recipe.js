const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: String, trim: true },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    timeMinutes: { type: String, trim: true },
    ingredients: { type: [IngredientSchema], default: [] },
    instructions: { type: String, trim: true },
    imageUri: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
