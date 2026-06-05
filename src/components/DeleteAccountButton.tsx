"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setConfirm("");
      setError(null);
      setBusy(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, busy]);

  const handleDelete = async () => {
    if (confirm.trim() !== "DELETE") {
      setError('Type "DELETE" to confirm');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not delete account");
        setBusy(false);
        return;
      }
      await signOut({ redirectTo: "/" });
    } catch (err) {
      console.error("Delete account failed:", err);
      setError("Network error. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="delete-btn"
        onClick={() => setOpen(true)}
      >
        Delete my account
      </button>

      {open && (
        <div
          className="danger-backdrop"
          onClick={() => { if (!busy) setOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="danger-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="danger-tick danger-tick--tl" />
            <span className="danger-tick danger-tick--tr" />
            <span className="danger-tick danger-tick--bl" />
            <span className="danger-tick danger-tick--br" />

            <div className="danger-modal__icon">!</div>

            <div className="danger-modal__eyebrow">⚠ FINAL WARNING ⚠</div>
            <h2 className="danger-modal__title">정말 탈퇴하시겠습니까?</h2>
            <p className="danger-modal__sub-kr">
              모든 정보는 되돌릴 수 없습니다.
            </p>
            <p className="danger-modal__sub-en">
              This wipes your nickname, password, and account record from the
              belt. Past orders stay on file (unlinked) so shipping and receipts
              survive — but the account itself is gone forever.
            </p>

            <label className="danger-modal__field">
              <span>
                Type <strong>DELETE</strong> below to confirm
              </span>
              <input
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                autoFocus
                disabled={busy}
                spellCheck={false}
                autoComplete="off"
              />
            </label>

            {error && <div className="danger-modal__error">[!] {error}</div>}

            <div className="danger-modal__actions">
              <button
                type="button"
                className="auth-btn"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn delete-btn--final"
                onClick={handleDelete}
                disabled={busy || confirm.trim() !== "DELETE"}
              >
                {busy ? "Wiping..." : "Yes, delete forever →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
