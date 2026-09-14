import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import Trip from "@/models/Trip";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const transactions = await Transaction.find({ user: userId }).sort({ date: -1 }).lean();
  return NextResponse.json(transactions);
}

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  if (!body.amount || !body.type || !body.category) {
    return NextResponse.json({ error: "Amount, type and category are required" }, { status: 400 });
  }
  await dbConnect();
  const transaction = await Transaction.create({
    ...body,
    user: userId,
    trip: body.trip || null,
  });

  // Mirror expense transactions linked to a trip into that trip's own expenses list,
  // so the Trip Expenses tab and this transaction stay in sync.
  if (transaction.type === "expense" && transaction.trip) {
    await Trip.updateOne(
      { _id: transaction.trip, user: userId },
      { $push: { expenses: { amount: transaction.amount, category: mapCategory(transaction.category), date: transaction.date, notes: transaction.notes } } }
    );
  }

  return NextResponse.json(transaction, { status: 201 });
}

function mapCategory(cat) {
  const allowed = ["Travel", "Food", "Hotel", "Shopping", "Activities", "Other"];
  return allowed.includes(cat) ? cat : "Other";
}
