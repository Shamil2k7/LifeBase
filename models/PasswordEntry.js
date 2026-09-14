import mongoose from "mongoose";

// `password` is stored encrypted (see lib/crypto.js). Never store plaintext.
const PasswordEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    site: { type: String, required: true },
    username: String,
    password: { type: String, required: true },
    url: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.PasswordEntry || mongoose.model("PasswordEntry", PasswordEntrySchema);
