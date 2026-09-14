import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Todo from "@/models/Todo";
import { requireUser } from "@/lib/apiAuth";

export async function PATCH(req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  await dbConnect();
  const todo = await Todo.findOneAndUpdate({ _id: params.id, user: userId }, { $set: body }, { new: true });
  if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(todo);
}

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  await Todo.deleteOne({ _id: params.id, user: userId });
  return NextResponse.json({ deleted: true });
}
