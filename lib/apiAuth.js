import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// Returns the authenticated user id, or writes a 401 response and returns null.
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { userId: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id, unauthorized: null };
}
