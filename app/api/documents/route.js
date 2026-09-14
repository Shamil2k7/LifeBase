import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  await dbConnect();
  const documents = await Document.find({ user: userId }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json(documents);
}

// Accepts multipart/form-data: name, category, description, tags (comma separated), file (optional)
export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const form = await req.formData();
  const name = form.get("name");
  const category = form.get("category") || "Other";
  const description = form.get("description") || "";
  const tags = (form.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const file = form.get("file");
  const driveConnected = form.get("driveConnected") === "true";

  if (!name) return NextResponse.json({ error: "Document name is required" }, { status: 400 });

  let fileUrl = "";
  let fileType = "PDF";
  if (file && typeof file === "object" && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
    fileType = ext.toUpperCase();
    const uploadsDir = path.join(process.cwd(), "public", "uploads", userId);
    await mkdir(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    await writeFile(path.join(uploadsDir, safeName), bytes);
    fileUrl = `/uploads/${userId}/${safeName}`;
  }

  await dbConnect();
  const doc = await Document.create({
    user: userId,
    name,
    category,
    description,
    tags,
    fileType,
    fileUrl,
    favorite: false,
    driveSynced: driveConnected && !!fileUrl,
  });
  return NextResponse.json(doc, { status: 201 });
}
