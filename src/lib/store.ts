/**
 * File-backed JSON store. Temporary swap-in for Prisma while npm install
 * is blocked by network. Same surface area can be re-implemented on top
 * of Prisma later without touching callers.
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

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

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const buf = await fs.readFile(file, "utf8");
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

/* ============ Users ============ */

async function readUsers(): Promise<StoredUser[]> {
  return readJson<StoredUser[]>(USERS_FILE, []);
}
async function writeUsers(users: StoredUser[]): Promise<void> {
  return writeJson(USERS_FILE, users);
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserByNickname(nickname: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.nickname?.toLowerCase() === nickname.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function findUserByDiscordId(discordId: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.discordId === discordId) ?? null;
}

export async function createUser(
  data: Partial<StoredUser> & { email?: string | null }
): Promise<StoredUser> {
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: data.id ?? crypto.randomUUID(),
    email: data.email ?? null,
    emailVerified: data.emailVerified ?? null,
    name: data.name ?? null,
    image: data.image ?? null,
    nickname: data.nickname ?? null,
    passwordHash: data.passwordHash ?? null,
    discordId: data.discordId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<StoredUser, "id" | "createdAt">>
): Promise<StoredUser | null> {
  const users = await readUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i < 0) return null;
  users[i] = {
    ...users[i],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeUsers(users);
  return users[i];
}

/**
 * Hard-delete a user record and any verification tokens they own.
 * Orders are kept (with userId nulled out) so receipts and shipping records
 * survive — same pattern most real stores follow for tax/audit reasons.
 */
export async function deleteUserById(id: string): Promise<boolean> {
  const users = await readUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) return false;
  await writeUsers(next);

  // Anonymize orders (keep them, but unlink from the deleted user)
  const orders = await readOrders();
  const updatedOrders = orders.map((o) =>
    o.userId === id
      ? { ...o, userId: null, nickname: null, updatedAt: new Date().toISOString() }
      : o
  );
  if (updatedOrders.some((o, i) => o !== orders[i])) {
    await writeOrders(updatedOrders);
  }

  // Drop any of their outstanding tokens
  const tokens = await readTokens();
  const tokensLeft = tokens.filter((t) => t.userId !== id);
  if (tokensLeft.length !== tokens.length) await writeTokens(tokensLeft);

  return true;
}

/* ============ Orders ============ */

async function readOrders(): Promise<StoredOrder[]> {
  return readJson<StoredOrder[]>(ORDERS_FILE, []);
}
async function writeOrders(orders: StoredOrder[]): Promise<void> {
  return writeJson(ORDERS_FILE, orders);
}

export async function createOrder(
  data: Omit<StoredOrder, "id" | "createdAt" | "updatedAt">
): Promise<StoredOrder> {
  const now = new Date().toISOString();
  const order: StoredOrder = {
    ...data,
    id: "ord_" + crypto.randomBytes(8).toString("hex"),
    createdAt: now,
    updatedAt: now,
  };
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  return order;
}

export async function findOrderById(id: string): Promise<StoredOrder | null> {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function findOrderBySessionId(
  sessionId: string
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  return orders.find((o) => o.stripeSessionId === sessionId) ?? null;
}

export async function listOrdersByUser(userId: string): Promise<StoredOrder[]> {
  const orders = await readOrders();
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOrdersByEmail(email: string): Promise<StoredOrder[]> {
  const orders = await readOrders();
  return orders
    .filter((o) => o.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateOrder(
  id: string,
  patch: Partial<Omit<StoredOrder, "id" | "createdAt">>
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const i = orders.findIndex((o) => o.id === id);
  if (i < 0) return null;
  orders[i] = {
    ...orders[i],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeOrders(orders);
  return orders[i];
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

async function readTokens(): Promise<StoredToken[]> {
  return readJson<StoredToken[]>(TOKENS_FILE, []);
}
async function writeTokens(tokens: StoredToken[]): Promise<void> {
  return writeJson(TOKENS_FILE, tokens);
}

export async function createToken(
  data: Omit<StoredToken, "token" | "createdAt">
): Promise<StoredToken> {
  // 32 random bytes → 43-char url-safe string
  const token = crypto.randomBytes(32).toString("base64url");
  const t: StoredToken = {
    ...data,
    token,
    createdAt: new Date().toISOString(),
  };
  const tokens = await readTokens();
  // Drop any existing tokens for the same user+purpose so we don't accumulate
  const filtered = tokens.filter(
    (x) => !(x.userId === data.userId && x.purpose === data.purpose)
  );
  filtered.push(t);
  await writeTokens(filtered);
  return t;
}

export async function consumeToken(
  token: string,
  purpose: StoredToken["purpose"]
): Promise<StoredToken | null> {
  const tokens = await readTokens();
  const t = tokens.find((x) => x.token === token && x.purpose === purpose);
  if (!t) return null;
  if (new Date(t.expiresAt).getTime() < Date.now()) return null;
  // One-time use: drop it.
  const next = tokens.filter((x) => x.token !== token);
  await writeTokens(next);
  return t;
}

export async function purgeExpiredTokens(): Promise<void> {
  const tokens = await readTokens();
  const now = Date.now();
  const kept = tokens.filter((x) => new Date(x.expiresAt).getTime() >= now);
  if (kept.length !== tokens.length) await writeTokens(kept);
}
