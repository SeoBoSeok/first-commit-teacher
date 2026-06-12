"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};
type Order = {
  id: string;
  email: string;
  nickname: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  } | null;
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// useSearchParams()는 Suspense 경계가 필요하다 — 없으면 프로덕션 빌드(프리렌더)가 실패한다
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}

function CheckoutSuccessInner() {
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      try {
        const r = await fetch(`/api/orders/${orderId}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setOrder(data.order);
            // Stop polling once webhook flips status to paid (or 20 tries)
            if (data.order?.status === "paid" || attempts > 20) {
              setPolling(false);
              return;
            }
          }
        }
      } catch {
        /* ignore network blip */
      }
      if (!cancelled) setTimeout(tick, 1500);
    };
    tick();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <main className="checkout-result">
      <div className="cosmos-bg" />
      <div className="grain" />
      <div className="scanlines" />

      <div className="checkout-result__card">
        <span className="auth-tick auth-tick--tl" />
        <span className="auth-tick auth-tick--tr" />
        <span className="auth-tick auth-tick--bl" />
        <span className="auth-tick auth-tick--br" />

        <div className="auth-modal__eyebrow">★ SIGNAL LOCKED ★</div>
        <h1 className="auth-modal__title">Order received</h1>
        <p className="auth-modal__sub">
          {order?.status === "paid"
            ? "Payment confirmed. The belt is shipping."
            : polling
            ? "Confirming payment with the broadcast…"
            : "Order placed. Confirmation pending."}
        </p>

        {orderId && (
          <div className="checkout-result__id">
            ORDER · {orderId}
          </div>
        )}

        {order && (
          <>
            <div className="checkout-result__lines">
              {order.items.map((it) => (
                <div key={it.productId} className="checkout-result__line">
                  <span className="checkout-result__qty">{it.qty}×</span>
                  <span className="checkout-result__name">{it.name}</span>
                  <span className="checkout-result__amt">{money(it.unitPrice * it.qty)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-result__totals">
              <div><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              <div><span>Shipping</span><span>{order.shipping === 0 ? "FREE" : money(order.shipping)}</span></div>
              <div className="checkout-result__total"><span>Total</span><span>{money(order.total)}</span></div>
            </div>

            {order.shippingAddress && (
              <div className="checkout-result__addr">
                <div className="checkout-result__addr-eyebrow">SHIPPING TO</div>
                <div>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                  {" "}
                  {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            )}
          </>
        )}

        <Link className="auth-btn auth-btn--primary" href="/">
          Back to the belt →
        </Link>
      </div>
    </main>
  );
}
