import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createToken,
  findUserByEmail,
} from "@/lib/store";
import { sendEmail, verificationEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  const user = await findUserByEmail(email);
  // Don't leak existence — pretend success even if user is missing.
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const token = await createToken({
    userId: user.id,
    identifier: email,
    purpose: "email_verification",
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
  });

  const origin = process.env.AUTH_URL ?? new URL(req.url).origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${encodeURIComponent(token.token)}`;
  const { subject, html, text } = verificationEmail({
    nickname: user.nickname ?? "kkabbi",
    verifyUrl,
  });
  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    console.error("Resend failed:", err);
    return NextResponse.json(
      { error: "Could not send verification email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
