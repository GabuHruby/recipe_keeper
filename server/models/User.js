const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    favoriteRecipes: { type: [mongoose.Schema.Types.ObjectId], ref: "Recipe", default: [] },
    profilePictureUri: { type: String, trim: true },
    recipesCreated: { type: [mongoose.Schema.Types.ObjectId], ref: "Recipe", default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);