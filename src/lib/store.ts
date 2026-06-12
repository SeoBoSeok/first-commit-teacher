/**
 * Prisma(Postgres) 기반 스토어 — M1 전환 완료.
 *
 * 원래 파일 JSON 스토어가 "함수 표면 유지, 호출부 무변경" 전제로 설계돼 있어서
 * (원작자의 주석 그대로) 이 파일의 내부만 교체했다. 호출하는 쪽은 한 줄도 안 바뀐다.
 * 날짜는 DB에선 DateTime, 이 경계 바깥에선 기존과 같은 ISO 문자열이다.
 */

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type StoredUser = {
  id: string;
  email: string | null;
  emailVerified: string | null;
  name: string | null;
  image: string | null;
  nickname: string | null;
  passwordHash: string | null;
  // Discord OAuth: store providerAccountId so we can re-find on subsequent logins
  discordId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredOrderItem = {
  productId: string;
  name: string;
  unitPrice: number; // in cents
  qty: number;
};

export type StoredOrder = {
  id: string;
  userId: string | null; // null for guest checkout
  email: string;
  nickname: string | null;
  items: StoredOrderItem[];
  subtotal: number; // cents
  shipping: number; // cents
  total: number; // cents
  currency: string;
  status: "pending" | "paid" | "shipped" | "cancelled" | "failed";
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

/* ============ DB ↔ 앱 경계 변환 ============ */

type DbUser = Prisma.UserGetPayload<object>;
type DbOrder = Prisma.OrderGetPayload<object>;
type DbToken = Prisma.TokenGetPayload<object>;

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null);

function toStoredUser(u: DbUser): StoredUser {
  return {
    id: u.id,
    email: u.email,
    emailVerified: iso(u.emailVerified),
    name: u.name,
    image: u.image,
    nickname: u.nickname,
    passwordHash: u.passwordHash,
    discordId: u.discordId,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function toStoredOrder(o: DbOrder): StoredOrder {
  return {
    id: o.id,
    userId: o.userId,
    email: o.email,
    nickname: o.nickname,
    items: (o.items as StoredOrderItem[]) ?? [],
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    currency: o.currency,
    status: o.status as StoredOrder["status"],
    stripeSessionId: o.stripeSessionId,
    stripePaymentIntentId: o.stripePaymentIntentId,
    shippingAddress: (o.shippingAddress as StoredOrder["shippingAddress"]) ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

/* ============ Users ============ */

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const u = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  return u ? toStoredUser(u) : null;
}

export async function findUserByNickname(nickname: string): Promise<StoredUser | null> {
  const u = await prisma.user.findFirst({
    where: { nickname: { equals: nickname, mode: "insensitive" } },
  });
  return u ? toStoredUser(u) : null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const u = await prisma.user.findUnique({ where: { id } });
  return u ? toStoredUser(u) : null;
}

export async function findUserByDiscordId(discordId: string): Promise<StoredUser | null> {
  const u = await prisma.user.findUnique({ where: { discordId } });
  return u ? toStoredUser(u) : null;
}

export async function createUser(
  data: Partial<StoredUser> & { email?: string | null }
): Promise<StoredUser> {
  const u = await prisma.user.create({
    data: {
      id: data.id ?? crypto.randomUUID(),
      email: data.email ?? null,
      emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      name: data.name ?? null,
      image: data.image ?? null,
      nickname: data.nickname ?? null,
      passwordHash: data.passwordHash ?? null,
      discordId: data.discordId ?? null,
    },
  });
  return toStoredUser(u);
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<StoredUser, "id" | "createdAt">>
): Promise<StoredUser | null> {
  try {
    const u = await prisma.user.update({
      where: { id },
      data: {
        ...("email" in patch ? { email: patch.email ?? null } : {}),
        ...("emailVerified" in patch
          ? { emailVerified: patch.emailVerified ? new Date(patch.emailVerified) : null }
          : {}),
        ...("name" in patch ? { name: patch.name ?? null } : {}),
        ...("image" in patch ? { image: patch.image ?? null } : {}),
        ...("nickname" in patch ? { nickname: patch.nickname ?? null } : {}),
        ...("passwordHash" in patch ? { passwordHash: patch.passwordHash ?? null } : {}),
        ...("discordId" in patch ? { discordId: patch.discordId ?? null } : {}),
      },
    });
    return toStoredUser(u);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null; // 대상 없음
    throw e;
  }
}

/**
 * Hard-delete a user record and any verification tokens they own.
 * Orders are kept (with userId nulled out) so receipts and shipping records
 * survive — same pattern most real stores follow for tax/audit reasons.
 */
export async function deleteUserById(id: string): Promise<boolean> {
  try {
    // 주문 익명화 + 회원 삭제(토큰은 onDelete: Cascade)가 함께 성공하거나 함께 실패해야 한다
    await prisma.$transaction([
      prisma.order.updateMany({
        where: { userId: id },
        data: { userId: null, nickname: null },
      }),
      prisma.user.delete({ where: { id } }),
    ]);
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}

/* ============ Orders ============ */

export async function createOrder(
  data: Omit<StoredOrder, "id" | "createdAt" | "updatedAt">
): Promise<StoredOrder> {
  const o = await prisma.order.create({
    data: {
      id: "ord_" + crypto.randomBytes(8).toString("hex"),
      userId: data.userId,
      email: data.email,
      nickname: data.nickname,
      items: data.items as unknown as Prisma.InputJsonValue,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      currency: data.currency,
      status: data.status,
      stripeSessionId: data.stripeSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      shippingAddress: data.shippingAddress
        ? (data.shippingAddress as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  });
  return toStoredOrder(o);
}

export async function findOrderById(id: string): Promise<StoredOrder | null> {
  const o = await prisma.order.findUnique({ where: { id } });
  return o ? toStoredOrder(o) : null;
}

export async function findOrderBySessionId(
  sessionId: string
): Promise<StoredOrder | null> {
  const o = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } });
  return o ? toStoredOrder(o) : null;
}

export async function listOrdersByUser(userId: string): Promise<StoredOrder[]> {
  const rows = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toStoredOrder);
}

export async function listOrdersByEmail(email: string): Promise<StoredOrder[]> {
  const rows = await prisma.order.findMany({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toStoredOrder);
}

export async function updateOrder(
  id: string,
  patch: Partial<Omit<StoredOrder, "id" | "createdAt">>
): Promise<StoredOrder | null> {
  try {
    const o = await prisma.order.update({
      where: { id },
      data: {
        ...("userId" in patch ? { userId: patch.userId ?? null } : {}),
        ...("email" in patch && patch.email !== undefined ? { email: patch.email } : {}),
        ...("nickname" in patch ? { nickname: patch.nickname ?? null } : {}),
        ...("items" in patch && patch.items
          ? { items: patch.items as unknown as Prisma.InputJsonValue }
          : {}),
        ...("subtotal" in patch && patch.subtotal !== undefined ? { subtotal: patch.subtotal } : {}),
        ...("shipping" in patch && patch.shipping !== undefined ? { shipping: patch.shipping } : {}),
        ...("total" in patch && patch.total !== undefined ? { total: patch.total } : {}),
        ...("currency" in patch && patch.currency !== undefined ? { currency: patch.currency } : {}),
        ...("status" in patch && patch.status !== undefined ? { status: patch.status } : {}),
        ...("stripeSessionId" in patch ? { stripeSessionId: patch.stripeSessionId ?? null } : {}),
        ...("stripePaymentIntentId" in patch
          ? { stripePaymentIntentId: patch.stripePaymentIntentId ?? null }
          : {}),
        ...("shippingAddress" in patch
          ? {
              shippingAddress: patch.shippingAddress
                ? (patch.shippingAddress as unknown as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            }
          : {}),
      },
    });
    return toStoredOrder(o);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

/* ============ Verification tokens ============ */

export type StoredToken = {
  token: string;
  userId: string;
  identifier: string; // email
  purpose: "email_verification" | "password_reset";
  expiresAt: string;
  createdAt: string;
};

function toStoredToken(t: DbToken): StoredToken {
  return {
    token: t.token,
    userId: t.userId,
    identifier: t.identifier,
    purpose: t.purpose as StoredToken["purpose"],
    expiresAt: t.expiresAt.toISOString(),
    createdAt: t.createdAt.toISOString(),
  };
}

export async function createToken(
  data: Omit<StoredToken, "token" | "createdAt">
): Promise<StoredToken> {
  // 32 random bytes → 43-char url-safe string
  const token = crypto.randomBytes(32).toString("base64url");
  // 같은 user+purpose 토큰은 교체 — 스키마의 @@unique와 함께 이중 보장
  const [, t] = await prisma.$transaction([
    prisma.token.deleteMany({ where: { userId: data.userId, purpose: data.purpose } }),
    prisma.token.create({
      data: {
        token,
        userId: data.userId,
        identifier: data.identifier,
        purpose: data.purpose,
        expiresAt: new Date(data.expiresAt),
      },
    }),
  ]);
  return toStoredToken(t);
}

export async function consumeToken(
  token: string,
  purpose: StoredToken["purpose"]
): Promise<StoredToken | null> {
  const t = await prisma.token.findUnique({ where: { token } });
  if (!t || t.purpose !== purpose) return null;
  if (t.expiresAt.getTime() < Date.now()) return null;
  // One-time use: drop it. (동시 사용 경쟁은 삭제가 먼저 된 쪽만 성공)
  try {
    await prisma.token.delete({ where: { token } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
  return toStoredToken(t);
}

export async function purgeExpiredTokens(): Promise<void> {
  await prisma.token.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
