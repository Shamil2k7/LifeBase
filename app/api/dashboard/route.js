import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Todo from "@/models/Todo";
import Event from "@/models/Event";
import Document from "@/models/Document";
import Transaction from "@/models/Transaction";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();

  const [trips, todos, events, documents, transactions] = await Promise.all([
    Trip.find({ user: userId }).lean(),
    Todo.find({ user: userId }).lean(),
    Event.find({ user: userId }).lean(),
    Document.find({ user: userId }).sort({ updatedAt: -1 }).limit(3).lean(),
    Transaction.find({ user: userId }).sort({ date: -1 }).lean(),
  ]);

  return NextResponse.json({ trips, todos, events, documents, transactions });
}
