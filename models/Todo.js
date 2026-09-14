import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["Personal", "Study", "Work", "Shopping", "Health", "Finance", "Travel", "Other"],
      default: "Personal",
    },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    dueDate: String,
    reminder: { type: String, default: "None" },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
