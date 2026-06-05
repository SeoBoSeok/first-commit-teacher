import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createToken,
  createUser,
  findUserByEmail,
  findUserByNickname,
} from "@/lib/store";
import { sendEmail, verificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(20, "Nickname must be at most 20 characters")
    .regex(/^[A-Za-z0-9_가-힣\- ]+$/, "Nickname has invalid characters"),
});

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { email, password, nickname } = parsed.data;

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  if (await findUserByNickname(nickname)) {
    return NextResponse.json({ error: "Nickname is taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    email,
    passwordHash,
    nickname,
    name: nickname,
    emailVerified: null,
  });

  const token = await createToken({
    userId: user.id,
    identifier: email,
    purpose: "email_verification",
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
  });

  const origin = process.env.AUTH_URL ?? new URL(req.url).origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${encodeURIComponent(token.token)}`;
  const { subject, html, text } = verificationEmail({ nickname, verifyUrl });
  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    // Roll back the user record so the email can be re-used on retry.
    console.error("Failed to send verification email:", err);
    return NextResponse.json(
      { error: "Could not send verification email — try again in a moment" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    pendingVerification: true,
    email,
  });
}
