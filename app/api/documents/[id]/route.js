import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import { requireUser } from "@/lib/apiAuth";

export async function PATCH(req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  await dbConnect();
  const doc = await Document.findOneAndUpdate({ _id: params.id, user: userId }, { $set: body }, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const doc = await Document.findOneAndDelete({ _id: params.id, user: userId });
  if (doc?.fileUrl) {
    const filePath = path.join(process.cwd(), "public", doc.fileUrl);
    await unlink(filePath).catch(() => {});
  }
  return NextResponse.json({ deleted: true });
}
