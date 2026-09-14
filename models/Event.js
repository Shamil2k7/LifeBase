import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: String,
    date: { type: String, required: true },
    time: { type: String, default: "12:00" },
    location: String,
    category: {
      type: String,
      enum: ["Birthday", "Exam", "Meeting", "Appointment", "Travel", "Personal", "Other"],
      default: "Personal",
    },
    reminder: { type: String, default: "2 Days Before" },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
