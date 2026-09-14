import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Transaction from "@/models/Transaction";
import { requireUser } from "@/lib/apiAuth";

export async function GET(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const trip = await Trip.findOne({ _id: params.id, user: userId }).lean();
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

// Partial update - used for editing trip fields, notes, and for replacing the
// places / itinerary / expenses arrays (the client sends the full updated array).
export async function PATCH(req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  await dbConnect();
  const trip = await Trip.findOneAndUpdate(
    { _id: params.id, user: userId },
    { $set: body },
    { new: true }
  );
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  await Trip.deleteOne({ _id: params.id, user: userId });
  await Transaction.updateMany({ trip: params.id, user: userId }, { $set: { trip: null } });
  return NextResponse.json({ deleted: true });
}
