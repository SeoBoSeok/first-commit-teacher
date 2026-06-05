import { NextResponse } from "next/server";
import { consumeToken, findUserById, updateUser } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verify?status=missing", url.origin));
  }

  const found = await consumeToken(token, "email_verification");
  if (!found) {
    return NextResponse.redirect(new URL("/verify?status=invalid", url.origin));
  }

  const user = await findUserById(found.userId);
  if (!user) {
    return NextResponse.redirect(new URL("/verify?status=invalid", url.origin));
  }

  await updateUser(user.id, {
    emailVerified: new Date().toISOString(),
  });

  return NextResponse.redirect(new URL("/verify?status=ok", url.origin));
}
