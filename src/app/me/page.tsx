import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findUserById, listOrdersByUser } from "@/lib/store";
import DeleteAccountButton from "@/components/DeleteAccountButton";

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<string, { label: string; tone: "ok" | "warn" | "err" | "info" }> = {
  pending: { label: "PAYMENT PENDING", tone: "warn" },
  paid: { label: "PAID · PREPARING", tone: "ok" },
  shipped: { label: "SHIPPED", tone: "ok" },
  cancelled: { label: "CANCELLED", tone: "err" },
  failed: { label: "FAILED", tone: "err" },
};

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/?signin=1");
  }
  const me = await findUserById(session.user.id);
  if (!me) {
    redirect("/?signin=1");
  }

  const orders = await listOrdersByUser(me.id);
  const displayName = me.nickname ?? me.name ?? "kkabbi";

  return (
    <main className="me-page">
      <div className="cosmos-bg" />
      <div className="grain" />
      <div className="scanlines" />

      <div className="me-page__shell">
        <Link href="/" className="me-page__back">← back to the belt</Link>

        {/* ============ Dossier ============ */}
        <section className="me-card">
          <span className="auth-tick auth-tick--tl" />
          <span className="auth-tick auth-tick--tr" />
          <span className="auth-tick auth-tick--bl" />
          <span className="auth-tick auth-tick--br" />

          <div className="me-card__head">
            <div>
              <div className="me-card__eyebrow">★ DOSSIER ★</div>
              <h1 className="me-card__name">{displayName}</h1>
              <div className="me-card__sub">
                Member since {formatDate(me.createdAt)}
                {me.emailVerified && <span className="me-verified">· VERIFIED</span>}
              </div>
            </div>
            <div className="me-avatar">
              {me.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.image} alt={displayName} />
              ) : (
                <span>{displayName[0]?.toUpperCase() ?? "★"}</span>
              )}
            </div>
          </div>

          <div className="me-specs">
            <div className="me-spec">
              <span className="me-spec__l">Email</span>
              <span className="me-spec__v">{me.email ?? "—"}</span>
            </div>
            <div className="me-spec">
              <span className="me-spec__l">Nickname</span>
              <span className="me-spec__v">{me.nickname ?? "—"}</span>
            </div>
            <div className="me-spec">
              <span className="me-spec__l">Linked accounts</span>
              <span className="me-spec__v">
                {[
                  me.passwordHash ? "Email" : null,
                  me.discordId ? "Discord" : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </div>
            <div className="me-spec">
              <span className="me-spec__l">Orders</span>
              <span className="me-spec__v">{String(orders.length).padStart(2, "0")}</span>
            </div>
          </div>

        </section>

        {/* ============ Characters (placeholder for NFT phase) ============ */}
        <section className="me-card">
          <span className="auth-tick auth-tick--tl" />
          <span className="auth-tick auth-tick--tr" />
          <span className="auth-tick auth-tick--bl" />
          <span className="auth-tick auth-tick--br" />

          <div className="me-card__eyebrow">★ MY CHARACTERS ★</div>
          <h2 className="me-section__title">Collection</h2>

          <div className="me-empty">
            <p>
              Connect your wallet (MetaMask or Kaikas) to surface dokkaebi NFTs you
              own from OpenSea and Upbit. One of them becomes your profile picture.
            </p>
            <button type="button" className="auth-btn" disabled>
              Connect wallet · coming soon
            </button>
          </div>
        </section>

        {/* ============ Orders ============ */}
        <section className="me-card">
          <span className="auth-tick auth-tick--tl" />
          <span className="auth-tick auth-tick--tr" />
          <span className="auth-tick auth-tick--bl" />
          <span className="auth-tick auth-tick--br" />

          <div className="me-card__eyebrow">★ TRANSMISSIONS ★</div>
          <h2 className="me-section__title">Order history</h2>

          {orders.length === 0 ? (
            <div className="me-empty">
              <p>No orders yet. The belt awaits.</p>
              <Link href="/#shop" className="auth-btn auth-btn--primary">
                Browse the shop →
              </Link>
            </div>
          ) : (
            <div className="me-orders">
              {orders.map((order) => {
                const tone = STATUS_LABEL[order.status]?.tone ?? "info";
                const label = STATUS_LABEL[order.status]?.label ?? order.status.toUpperCase();
                return (
                  <article key={order.id} className={`me-order me-order--${tone}`}>
                    <header className="me-order__head">
                      <div>
                        <div className="me-order__id">{order.id}</div>
                        <div className="me-order__date">{formatDate(order.createdAt)}</div>
                      </div>
                      <span className={`me-order__status me-order__status--${tone}`}>
                        ● {label}
                      </span>
                    </header>

                    <ul className="me-order__lines">
                      {order.items.map((it) => (
                        <li key={it.productId}>
                          <span className="me-order__qty">{it.qty}×</span>
                          <span className="me-order__name">{it.name}</span>
                          <span className="me-order__amt">{money(it.unitPrice * it.qty)}</span>
                        </li>
                      ))}
                    </ul>

                    <footer className="me-order__foot">
                      <div className="me-order__totals">
                        <span>Subtotal · {money(order.subtotal)}</span>
                        <span>Ship · {order.shipping === 0 ? "FREE" : money(order.shipping)}</span>
                        <span className="me-order__total">{money(order.total)}</span>
                      </div>
                      {order.shippingAddress ? (
                        <div className="me-order__addr">
                          <div className="me-spec__l">Shipping to</div>
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
                      ) : (
                        <div className="me-order__addr me-order__addr--missing">
                          Shipping address will appear once payment is confirmed.
                        </div>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============ Danger zone ============ */}
        <section className="me-danger">
          <div className="me-danger__head">
            <span className="me-danger__eyebrow">⚠ DANGER ZONE</span>
            <h2 className="me-danger__title">Leave the belt</h2>
          </div>
          <p className="me-danger__copy">
            Permanently delete your account. Your nickname will be released,
            your password wiped, and your dossier removed. Past orders are
            preserved (unlinked) so receipts and shipping survive.
          </p>
          <DeleteAccountButton />
        </section>
      </div>
    </main>
  );
}
