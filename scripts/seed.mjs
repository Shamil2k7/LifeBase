// Run with: npm run seed
// Creates one seed user (and a few sample records) so you can log in immediately.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const UserSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const TripSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const TodoSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const EventSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Trip = mongoose.models.Trip || mongoose.model("Trip", TripSchema);
const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env or .env.local first.");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const email = (process.env.SEED_EMAIL || "demo@example.com").toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Seed user ${email} already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || "password123", 10);
  const masterPasswordHash = await bcrypt.hash(process.env.SEED_MASTER_PASSWORD || "1234", 10);

  const user = await User.create({
    name: process.env.SEED_NAME || "Demo User",
    email,
    passwordHash,
    masterPasswordHash,
    driveConnected: false,
    notificationPrefs: { events: true, todos: true, trips: true, documents: false },
  });

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };

  await Trip.create({
    user: user._id,
    name: "Wayanad Adventure",
    destination: "Wayanad, Kerala",
    startDate: plus(10),
    endDate: plus(13),
    travelers: 2,
    budget: 20000,
    description: "Misty hills, spice plantations and a lazy weekend away from the city.",
    cover: "\uD83C\uDF04",
    coverColor: "#0BA97A",
    places: [{ name: "Chembra Peak", location: "Meppadi", description: "Heart-shaped lake trek.", visitDate: plus(11), status: "Want to Visit" }],
    itinerary: [{ day: 1, activities: [{ time: "09:00", title: "Travel from Kochi" }, { time: "15:00", title: "Tea Museum" }] }],
    expenses: [{ amount: 3200, category: "Travel", date: plus(10), notes: "Cab from Kochi" }],
  });

  await Todo.create([
    { user: user._id, title: "Renew car insurance", type: "Finance", priority: "High", dueDate: plus(3), status: "pending", reminder: "1 Day Before" },
    { user: user._id, title: "Pack for Wayanad", type: "Travel", priority: "Medium", dueDate: plus(9), status: "pending", reminder: "1 Day Before" },
  ]);

  await Event.create([
    { user: user._id, name: "Team Sprint Planning", category: "Meeting", date: plus(2), time: "10:30", location: "Office", reminder: "1 Day Before" },
  ]);

  console.log(`Seed user created: ${email} / ${process.env.SEED_PASSWORD || "password123"}`);
  console.log(`Master password for the vault: ${process.env.SEED_MASTER_PASSWORD || "1234"}`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
