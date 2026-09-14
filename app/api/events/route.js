import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const events = await Event.find({ user: userId }).sort({ date: 1 }).lean();
  return NextResponse.json(events);
}

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  if (!body.name || !body.date) return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
  await dbConnect();
  const event = await Event.create({ ...body, user: userId });
  return NextResponse.json(event, { status: 201 });
}
