import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { requireUser } from "@/lib/apiAuth";

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  await Transaction.deleteOne({ _id: params.id, user: userId });
  return NextResponse.json({ deleted: true });
}
