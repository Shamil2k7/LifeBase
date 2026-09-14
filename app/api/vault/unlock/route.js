import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireUser } from "@/lib/apiAuth";
import { signVaultToken, VAULT_COOKIE_NAME, VAULT_TTL_SECONDS } from "@/lib/vaultSession";

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { masterPassword } = await req.json();
  if (!masterPassword) {
    return NextResponse.json({ error: "Master password is required" }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(userId);
  const valid = await bcrypt.compare(masterPassword, user.masterPasswordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect master password" }, { status: 401 });
  }

  const token = signVaultToken(userId);
  const res = NextResponse.json({ unlocked: true });
  res.cookies.set(VAULT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: VAULT_TTL_SECONDS,
  });
  return res;
}
