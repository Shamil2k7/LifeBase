import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Education", "Home", "Job", "Personal", "Financial", "Medical", "Other"],
      default: "Personal",
    },
    description: String,
    tags: [String],
    fileType: String,
    fileUrl: String,
    favorite: { type: Boolean, default: false },
    driveSynced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
