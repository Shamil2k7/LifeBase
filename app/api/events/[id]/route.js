import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { requireUser } from "@/lib/apiAuth";

export async function PATCH(req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  await dbConnect();
  const event = await Event.findOneAndUpdate({ _id: params.id, user: userId }, { $set: body }, { new: true });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  await Event.deleteOne({ _id: params.id, user: userId });
  return NextResponse.json({ deleted: true });
}
