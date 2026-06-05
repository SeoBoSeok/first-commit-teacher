import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserById } from "@/lib/store";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const ok = await deleteUserById(session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
