import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Simple self-serve registration for this single-user-style app.
// In production you'd likely disable this after the first account is created.
export async function POST(req) {
  const { name, email, password, masterPassword } = await req.json();
  if (!name || !email || !password || !masterPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  await dbConnect();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const masterPasswordHash = await bcrypt.hash(masterPassword, 10);
  await User.create({ name, email: email.toLowerCase(), passwordHash, masterPasswordHash });
  return NextResponse.json({ created: true }, { status: 201 });
}
