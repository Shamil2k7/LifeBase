import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const trips = await Trip.find({ user: userId }).sort({ startDate: 1 }).lean();
  return NextResponse.json(trips);
}

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  if (!body.name || !body.destination || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "Name, destination and dates are required" }, { status: 400 });
  }
  await dbConnect();
  const trip = await Trip.create({ ...body, user: userId, places: [], itinerary: [], expenses: [] });
  return NextResponse.json(trip, { status: 201 });
}
