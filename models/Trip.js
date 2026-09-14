import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  { time: String, title: String },
  { _id: true }
);

const ItineraryDaySchema = new mongoose.Schema(
  { day: Number, activities: [ActivitySchema] },
  { _id: false }
);

const PlaceSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    description: String,
    visitDate: String,
    status: { type: String, enum: ["Want to Visit", "Visited", "Skipped"], default: "Want to Visit" },
  },
  { timestamps: true }
);

const TripExpenseSchema = new mongoose.Schema(
  {
    amount: Number,
    category: { type: String, enum: ["Travel", "Food", "Hotel", "Shopping", "Activities", "Other"] },
    date: String,
    notes: String,
  },
  { timestamps: true }
);

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    travelers: { type: Number, default: 1 },
    budget: { type: Number, default: 0 },
    description: String,
    notes: String,
    cover: { type: String, default: "\uD83E\uDDF3" },
    coverColor: { type: String, default: "#2C3E8C" },
    places: [PlaceSchema],
    itinerary: [ItineraryDaySchema],
    expenses: [TripExpenseSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
