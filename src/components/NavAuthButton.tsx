"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import SignInModal from "./SignInModal";

export default function NavAuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return <span className="nav-auth nav-auth--ghost">···</span>;
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <>
        <button
          type="button"
          className="nav-auth"
          onClick={() => setOpen(true)}
          aria-label="Sign in"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.31 0-6 2.24-6 5v1h12v-1c0-2.76-2.69-5-6-5z" />
          </svg>
          Sign In
        </button>
        <SignInModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  const display =
    session.user.nickname ?? session.user.name ?? "kkabbi";

  return (
    <div className="nav-auth-wrap">
      <button
        type="button"
        className="nav-auth nav-auth--me"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="nav-auth__dot" />
        {display}
      </button>
      {menuOpen && (
        <div className="nav-auth-menu" onMouseLeave={() => setMenuOpen(false)}>
          <div className="nav-auth-menu__head">
            <div className="nav-auth-menu__nick">{display}</div>
            {session.user.email && (
              <div className="nav-auth-menu__email">{session.user.email}</div>
            )}
          </div>
          <button
            type="button"
            className="nav-auth-menu__item"
            onClick={() => { setMenuOpen(false); signOut({ redirectTo: "/" }); }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
