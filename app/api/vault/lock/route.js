import { NextResponse } from "next/server";
import { VAULT_COOKIE_NAME } from "@/lib/vaultSession";

export async function POST() {
  const res = NextResponse.json({ locked: true });
  res.cookies.set(VAULT_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
