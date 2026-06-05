import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Lazy-export so importing this module doesn't crash before the key is set.
// Server routes that touch payments must check stripeReady first.
export const stripeReady = Boolean(key);

export const stripe = key
  ? new Stripe(key, { apiVersion: "2026-05-27.dahlia" })
  : (null as unknown as Stripe);
