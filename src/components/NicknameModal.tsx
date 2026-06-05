"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NicknameModal() {
  const { data: session, status, update } = useSession();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const needsNickname =
    status === "authenticated" && session?.user && !session.user.nickname;

  useEffect(() => {
    if (!needsNickname) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [needsNickname]);

  if (!needsNickname) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const r = await fetch("/api/user/nickname", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error ?? "Could not set nickname");
      setBusy(false);
      return;
    }
    // Refresh the session so JWT picks up the new nickname.
    await update();
    setBusy(false);
  };

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal auth-modal--narrow">
        <span className="auth-tick auth-tick--tl" />
        <span className="auth-tick auth-tick--tr" />
        <span className="auth-tick auth-tick--bl" />
        <span className="auth-tick auth-tick--br" />

        <div className="auth-modal__eyebrow">★ ONE MORE STEP ★</div>
        <h2 className="auth-modal__title" data-text="HANDLE">Pick a nickname</h2>
        <p className="auth-modal__sub">
          This is how the belt knows you. 2–20 characters.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>Nickname</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="your_dokkaebi_handle"
              required
              minLength={2}
              maxLength={20}
              disabled={busy}
              autoFocus
            />
          </label>
          {error && <div className="auth-error">[!] {error}</div>}
          <button type="submit" className="auth-btn auth-btn--primary" disabled={busy}>
            {busy ? "Setting..." : "Lock it in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
