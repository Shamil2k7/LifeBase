import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Todo from "@/models/Todo";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const todos = await Todo.find({ user: userId }).sort({ dueDate: 1 }).lean();
  return NextResponse.json(todos);
}

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  await dbConnect();
  const todo = await Todo.create({ ...body, user: userId, status: "pending" });
  return NextResponse.json(todo, { status: 201 });
}
