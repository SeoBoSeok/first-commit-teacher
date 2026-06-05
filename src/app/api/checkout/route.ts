import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { stripe, stripeReady } from "@/lib/stripe";
import { createOrder, findUserById } from "@/lib/store";
import { PRODUCTS } from "@/components/spacekkabbi-data";

const lineSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).max(99),
});

const bodySchema = z.object({
  items: z.array(lineSchema).min(1),
  // Guest checkout requires an email; logged-in users can omit.
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  if (!stripeReady) {
    return NextResponse.json(
      { error: "Stripe is not configured — set STRIPE_SECRET_KEY in .env.local" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const session = await auth();
  const me = session?.user?.id ? await findUserById(session.user.id) : null;

  const email = me?.email ?? parsed.data.email ?? null;
  if (!email) {
    return NextResponse.json(
      { error: "Email is required for guest checkout" },
      { status: 400 }
    );
  }

  // Resolve line items against our trusted catalog so prices can't be tampered.
  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; description?: string };
      unit_amount: number;
    };
    quantity: number;
  }> = [];
  const storedItems: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    qty: number;
  }> = [];
  let subtotal = 0;

  for (const line of parsed.data.items) {
    const product = PRODUCTS.find((p) => p.id === line.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product: ${line.productId}` },
        { status: 400 }
      );
    }
    const unit = Math.round(product.price * 100);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.blurb,
        },
        unit_amount: unit,
      },
      quantity: line.qty,
    });
    storedItems.push({
      productId: product.id,
      name: product.name,
      unitPrice: unit,
      qty: line.qty,
    });
    subtotal += unit * line.qty;
  }

  // Flat shipping rule mirrors the cart drawer: FREE at $80+, else $8.
  const shipping = subtotal >= 8000 ? 0 : 800;
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Belt Standard Shipping" },
        unit_amount: shipping,
      },
      quantity: 1,
    });
  }

  // Pre-create our order (status=pending) so we have an id to thread through
  // success_url. Webhook flips it to paid; meanwhile the client can poll.
  const order = await createOrder({
    userId: me?.id ?? null,
    email,
    nickname: me?.nickname ?? null,
    items: storedItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: "usd",
    status: "pending",
    stripeSessionId: null,
    stripePaymentIntentId: null,
    shippingAddress: null,
  });

  const origin = new URL(req.url).origin;
  const sessionStripe = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: email,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.id}`,
    cancel_url: `${origin}/checkout/cancel?order=${order.id}`,
    shipping_address_collection: { allowed_countries: ["US", "KR", "CA", "GB", "JP"] },
    metadata: {
      orderId: order.id,
      userId: me?.id ?? "",
      nickname: me?.nickname ?? "",
    },
  });

  // Stamp the Stripe session id on the order so webhook can correlate.
  await import("@/lib/store").then(({ updateOrder }) =>
    updateOrder(order.id, { stripeSessionId: sessionStripe.id })
  );

  return NextResponse.json({
    url: sessionStripe.url,
    orderId: order.id,
  });
}
