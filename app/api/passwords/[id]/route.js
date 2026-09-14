import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import PasswordEntry from "@/models/PasswordEntry";
import { requireUser } from "@/lib/apiAuth";
import { verifyVaultToken, VAULT_COOKIE_NAME } from "@/lib/vaultSession";
import { encrypt } from "@/lib/crypto";

function checkVault(userId) {
  const token = cookies().get(VAULT_COOKIE_NAME)?.value;
  return verifyVaultToken(token, userId);
}

export async function PUT(req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  if (!checkVault(userId)) return NextResponse.json({ error: "Vault is locked" }, { status: 403 });

  const body = await req.json();
  await dbConnect();
  const update = {
    site: body.site,
    username: body.username || "",
    url: body.url || "",
    notes: body.notes || "",
  };
  if (body.password) update.password = encrypt(body.password);

  const entry = await PasswordEntry.findOneAndUpdate(
    { _id: params.id, user: userId },
    update,
    { new: true }
  );
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...entry.toObject(), password: body.password || undefined });
}

export async function DELETE(_req, { params }) {
  const { userId, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  if (!checkVault(userId)) return NextResponse.json({ error: "Vault is locked" }, { status: 403 });

  await dbConnect();
  await PasswordEntry.deleteOne({ _id: params.id, user: userId });
  return NextResponse.json({ deleted: true });
}
