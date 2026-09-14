import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import PasswordEntry from "@/models/PasswordEntry";
import { requireUser } from "@/lib/apiAuth";
import { verifyVaultToken, VAULT_COOKIE_NAME } from "@/lib/vaultSession";
import { encrypt, decrypt } from "@/lib/crypto";

function checkVault(userId) {
  const token = cookies().get(VAULT_COOKIE_NAME)?.value;
  return verifyVaultToken(token, userId);
}

export async function GET() {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  if (!checkVault(userId)) return NextResponse.json({ error: "Vault is locked" }, { status: 403 });

  await dbConnect();
  const entries = await PasswordEntry.find({ user: userId }).sort({ site: 1 }).lean();
  const decrypted = entries.map((e) => ({ ...e, password: decrypt(e.password) }));
  return NextResponse.json(decrypted);
}

export async function POST(req) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  if (!checkVault(userId)) return NextResponse.json({ error: "Vault is locked" }, { status: 403 });

  const body = await req.json();
  if (!body.site || !body.password) {
    return NextResponse.json({ error: "Site and password are required" }, { status: 400 });
  }
  await dbConnect();
  const entry = await PasswordEntry.create({
    user: userId,
    site: body.site,
    username: body.username || "",
    password: encrypt(body.password),
    url: body.url || "",
    notes: body.notes || "",
  });
  return NextResponse.json({ ...entry.toObject(), password: body.password }, { status: 201 });
}
