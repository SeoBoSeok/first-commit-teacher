import Link from "next/link";

export default function CheckoutCancelPage() {
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

        <div className="auth-modal__eyebrow">★ SIGNAL DROPPED ★</div>
        <h1 className="auth-modal__title">Checkout cancelled</h1>
        <p className="auth-modal__sub">
          No charge was made. Your cart is still on the belt.
        </p>

        <Link className="auth-btn auth-btn--primary" href="/#shop">
          Back to the shop →
        </Link>
      </div>
    </main>
  );
}
