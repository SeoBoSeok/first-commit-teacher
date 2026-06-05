import Link from "next/link";

type Status = "ok" | "invalid" | "missing" | "unknown";

const COPY: Record<Status, { eyebrow: string; title: string; sub: string; tone: "ok" | "err" }> = {
  ok: {
    eyebrow: "★ SIGNAL LOCKED ★",
    title: "Email verified",
    sub: "You're on the belt. Tune in by signing in.",
    tone: "ok",
  },
  invalid: {
    eyebrow: "★ LINK EXPIRED ★",
    title: "Could not verify",
    sub: "This link has expired or was already used. Request a new one and try again.",
    tone: "err",
  },
  missing: {
    eyebrow: "★ NO TOKEN ★",
    title: "Missing token",
    sub: "The link looks incomplete. Try opening the original email again.",
    tone: "err",
  },
  unknown: {
    eyebrow: "★ STATUS ★",
    title: "Verification",
    sub: "—",
    tone: "ok",
  },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.status;
  const status: Status =
    raw === "ok" || raw === "invalid" || raw === "missing" ? raw : "unknown";
  const copy = COPY[status];

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

        <div className="auth-modal__eyebrow">{copy.eyebrow}</div>
        <h1 className="auth-modal__title">{copy.title}</h1>
        <p className="auth-modal__sub">{copy.sub}</p>

        <Link className="auth-btn auth-btn--primary" href="/">
          {copy.tone === "ok" ? "Sign in →" : "Back to the belt →"}
        </Link>
      </div>
    </main>
  );
}
