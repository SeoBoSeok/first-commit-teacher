import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  findUserById,
  findUserByNickname,
  updateUser,
} from "@/lib/store";

const schema = z.object({
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(20, "Nickname must be at most 20 characters")
    .regex(/^[A-Za-z0-9_가-힣\- ]+$/, "Nickname has invalid characters"),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

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
  const { nickname } = parsed.data;

  const me = await findUserById(session.user.id);
  if (!me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await findUserByNickname(nickname);
  if (existing && existing.id !== me.id) {
    return NextResponse.json({ error: "Nickname is taken" }, { status: 409 });
  }

  await updateUser(me.id, { nickname, name: nickname });
  return NextResponse.json({ ok: true, nickname });
}
