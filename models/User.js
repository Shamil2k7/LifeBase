import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    masterPasswordHash: { type: String, required: true },
    driveConnected: { type: Boolean, default: false },
    notificationPrefs: {
      events: { type: Boolean, default: true },
      todos: { type: Boolean, default: true },
      trips: { type: Boolean, default: true },
      documents: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
