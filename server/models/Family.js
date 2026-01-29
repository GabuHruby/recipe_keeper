const FamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inviteCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Family", FamilySchema);