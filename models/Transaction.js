import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    notes: String,
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank", "Card"], default: "UPI" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
