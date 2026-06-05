"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

type Mode = "signin" | "signup";

export default function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setBusy(false);
      setAwaitingVerification(null);
      setResendBusy(false);
      setResendDone(false);
    }
  }, [open]);

  if (!open) return null;

  const handleDiscord = async () => {
    setBusy(true);
    try {
      // next-auth v5 beta sometimes doesn't navigate from inside a modal — call
      // the signin endpoint ourselves, then hard-navigate to the Discord URL.
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      const body = new URLSearchParams({
        csrfToken,
        callbackUrl: "/",
      });
      const res = await fetch("/api/auth/signin/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Auth-Return-Redirect": "1",
        },
        body,
      });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // Fallback: try the library's signIn
      await signIn("discord", { redirectTo: "/" });
    } catch (err) {
      console.error("Discord signin failed:", err);
      setBusy(false);
      setError("Could not start Discord sign-in. Check the browser console.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === "signup") {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error ?? "Signup failed");
        setBusy(false);
        return;
      }
      // Stop here — user must verify email before they can sign in.
      setAwaitingVerification(email);
      setBusy(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      // Auth.js wraps thrown messages in CredentialsSignin; we surface
      // EMAIL_NOT_VERIFIED specifically so users know to check inbox.
      const message =
        res.code === "EMAIL_NOT_VERIFIED" ||
        (typeof res.error === "string" && res.error.includes("EMAIL_NOT_VERIFIED"))
          ? "Your email isn't verified yet — check your inbox."
          : "Invalid email or password";
      setError(message);
      if (
        res.code === "EMAIL_NOT_VERIFIED" ||
        (typeof res.error === "string" && res.error.includes("EMAIL_NOT_VERIFIED"))
      ) {
        setAwaitingVerification(email);
      }
      setBusy(false);
      return;
    }

    onClose();
    setBusy(false);
  };

  const handleResend = async () => {
    if (!awaitingVerification) return;
    setResendBusy(true);
    setResendDone(false);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: awaitingVerification }),
    }).catch(() => null);
    setResendBusy(false);
    setResendDone(true);
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <span className="auth-tick auth-tick--tl" />
        <span className="auth-tick auth-tick--tr" />
        <span className="auth-tick auth-tick--bl" />
        <span className="auth-tick auth-tick--br" />

        <button className="auth-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {awaitingVerification ? (
          <>
            <div className="auth-modal__eyebrow">★ CHECK YOUR INBOX ★</div>
            <h2 className="auth-modal__title">Verify your email</h2>
            <p className="auth-modal__sub">
              We sent a confirmation link to
              <br />
              <strong style={{ color: "var(--cyan)" }}>{awaitingVerification}</strong>
            </p>
            <p className="auth-modal__sub" style={{ marginTop: 14 }}>
              Click the link, then come back and sign in.
            </p>

            <button
              type="button"
              className="auth-btn"
              onClick={handleResend}
              disabled={resendBusy || resendDone}
            >
              {resendBusy ? "Sending..." : resendDone ? "Sent · check inbox again" : "Resend verification email"}
            </button>

            <div className="auth-modal__switch">
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => {
                  setAwaitingVerification(null);
                  setMode("signup");
                  setError(null);
                }}
              >
                Sign up again
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-modal__eyebrow">
              ★ {mode === "signin" ? "TUNE IN" : "JOIN THE BELT"} ★
            </div>
            <h2 className="auth-modal__title">
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </h2>
            <p className="auth-modal__sub">
              {mode === "signin"
                ? "Welcome back to the broadcast."
                : "Pick a nickname. Set a password. Confirm by email."}
            </p>

            <button
              type="button"
              className="auth-btn auth-btn--discord"
              onClick={handleDiscord}
              disabled={busy}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
              </svg>
              Continue with Discord
            </button>

            <div className="auth-divider">
              <span className="auth-divider__line" />
              OR EMAIL
              <span className="auth-divider__line" />
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="auth-field">
                  <span>Nickname</span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="your_dokkaebi_handle"
                    required
                    disabled={busy}
                    minLength={2}
                    maxLength={20}
                  />
                </label>
              )}
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@orbit.belt"
                  required
                  disabled={busy}
                  autoComplete={mode === "signin" ? "email" : "new-email"}
                />
              </label>
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={busy}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </label>

              {error && <div className="auth-error">[!] {error}</div>}

              <button type="submit" className="auth-btn auth-btn--primary" disabled={busy}>
                {busy
                  ? "Tuning in..."
                  : mode === "signin"
                  ? "Sign In →"
                  : "Create Account →"}
              </button>
            </form>

            <div className="auth-modal__switch">
              {mode === "signin" ? (
                <>
                  New here?{" "}
                  <button type="button" onClick={() => { setMode("signup"); setError(null); }}>
                    Join the belt
                  </button>
                </>
              ) : (
                <>
                  Already on the belt?{" "}
                  <button type="button" onClick={() => { setMode("signin"); setError(null); }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
