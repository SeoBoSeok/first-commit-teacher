import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeReady } from "@/lib/stripe";
import { findOrderBySessionId, updateOrder } from "@/lib/store";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripeReady || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook signature: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = session.id ? await findOrderBySessionId(session.id) : null;
    if (order) {
      // Stripe API renamed/shifted shipping fields across versions; pull defensively.
      const ship =
        ((session as unknown) as {
          shipping_details?: {
            name?: string | null;
            address?: {
              line1?: string | null;
              line2?: string | null;
              city?: string | null;
              state?: string | null;
              postal_code?: string | null;
              country?: string | null;
            } | null;
          };
          collected_information?: {
            shipping_details?: {
              name?: string | null;
              address?: {
                line1?: string | null;
                line2?: string | null;
                city?: string | null;
                state?: string | null;
                postal_code?: string | null;
                country?: string | null;
              } | null;
            };
          };
        }).shipping_details ??
        ((session as unknown) as {
          collected_information?: {
            shipping_details?: {
              name?: string | null;
              address?: {
                line1?: string | null;
                line2?: string | null;
                city?: string | null;
                state?: string | null;
                postal_code?: string | null;
                country?: string | null;
              } | null;
            };
          };
        }).collected_information?.shipping_details ??
        null;
      const address = ship?.address ?? null;
      await updateOrder(order.id, {
        status: "paid",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null,
        shippingAddress: address
          ? {
              name: ship?.name ?? order.email,
              line1: address.line1 ?? "",
              line2: address.line2 ?? null,
              city: address.city ?? "",
              state: address.state ?? null,
              postalCode: address.postal_code ?? "",
              country: address.country ?? "",
            }
          : null,
      });
    }
  } else if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = session.id ? await findOrderBySessionId(session.id) : null;
    if (order) await updateOrder(order.id, { status: "failed" });
  }

  return NextResponse.json({ received: true });
}
