"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "./Loader";
import MusicPlayer from "./MusicPlayer";
import AuthProvider from "./AuthProvider";
import NavAuthButton from "./NavAuthButton";
import NicknameModal from "./NicknameModal";
import {
  CHARACTERS,
  FACTIONS,
  LORE,
  RELATIONSHIPS,
  NEWS,
  FAQS,
  PRODUCTS,
  CONST_POSITIONS,
  type Character as Char,
  type FactionKey,
  type Product,
} from "./spacekkabbi-data";

/* ============ reveal-on-scroll hook ============ */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

/* ============ Nav ============ */
function Nav({
  cartCount,
  cartTotal,
  onCartOpen,
}: {
  cartCount: number;
  cartTotal: number;
  onCartOpen: () => void;
}) {
  return (
    <nav className="nav">
      <a className="nav__logo" href="#top">
        <span className="star" />
        <span>SPACEKKABBI</span>
      </a>
      <div className="nav__links">
        <a href="#world">World</a>
        <a href="#codex">Codex</a>
        <a href="#constellation">Bonds</a>
        <a href="#shop">Shop</a>
        <a href="#fanart">Fanart</a>
        <a href="#faq">FAQ</a>
      </div>
      <div className="nav__right">
        <a className="nav__cta" href="#join">Join the Belt →</a>
        <button
          type="button"
          className={`nav-cart ${cartCount > 0 ? "has-items" : ""}`}
          onClick={onCartOpen}
          aria-label={`Open cart with ${cartCount} items`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M3 3h2l.6 2H17a1 1 0 0 1 .98 1.22l-1.4 6A1 1 0 0 1 15.6 13H7.2L7 14h10v2H6a1 1 0 0 1-.98-1.22L6.4 9 5.05 4H3V3zm5 14a1.5 1.5 0 1 1-.001 3.001A1.5 1.5 0 0 1 8 17zm8 0a1.5 1.5 0 1 1-.001 3.001A1.5 1.5 0 0 1 16 17z" />
          </svg>
          <span className="nav-cart__count">{cartCount}</span>
          {cartCount > 0 && <span className="nav-cart__total">${cartTotal}</span>}
        </button>
        <NavAuthButton />
      </div>
    </nav>
  );
}

/* ============ Hero ============ */
function Hero({ featured }: { featured: Char }) {
  const y = useScrollY();
  const stageT = `translateY(${y * 0.18}px) scale(${1 + Math.min(y, 600) * 0.0003})`;
  const titleT = `translateY(${y * -0.08}px)`;

  return (
    <header className="hero" id="top">
      <div className="hero__copy" style={{ transform: titleT }}>
        <div className="hero__meta">
          <span className="chip">VOL. 04 / SEASON OF THE GREEN BELT</span>
          <span className="chip">10 DOKKAEBI / 3 FACTIONS</span>
        </div>
        <h1 className="hero__title h-display">
          <span className="glyph">SPACE</span>
          <br />
          <span className="glyph glyph--alt">KKABBI</span>
        </h1>
        <p className="hero__sub">
          A universe of plastic-bright Korean spirits at the edge of the broadcast belt.
          Ten dokkaebi, three factions, one long broadcast nobody quite remembers turning on.
        </p>
        <div className="hero__cta-row">
          <a className="btn btn--primary" href="#codex">Open the Codex <span>↗</span></a>
          <a className="btn btn--ghost" href="#world">Read the Lore</a>
        </div>
      </div>

      <div className="hero__stage" style={{ transform: stageT }}>
        <div className="hero__stage-frame" />
        <div className="hero__stage-inner" />
        <div className="hero__stage-pill">FEATURED — {featured.faction}</div>
        <div className="hero__stage-tag">
          <span>NO. {featured.num}</span>
          <span className="name">{featured.name}</span>
          <span className="role">— {featured.role}</span>
        </div>
        <div className="orbit orbit--01">VOL 04</div>
        <div className="orbit orbit--02">★ 04 / 10</div>
        <div className="orbit orbit--03">LIVE</div>
      </div>
    </header>
  );
}

/* ============ Marquee bar ============ */
function MarqueeBar({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="divider-bar">
      <span className="dot" />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div className="marquee-track">
          {doubled.map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <span style={{ color: "var(--cyan)" }}>BROADCAST</span>
    </div>
  );
}

/* ============ World ============ */
function World() {
  return (
    <section className="section world" id="world">
      <div className="shell">
        <div className="world__intro">
          <div className="reveal">
            <span className="h-eyebrow">THE WORLD</span>
            <h2 className="world__h">
              Three<br />
              factions,<br />
              one signal.
            </h2>
          </div>
          <div className="world__body reveal">
            <p>The Spacekkabbi universe runs on a single fragile broadcast — a hum that started long before anyone remembered turning it on, and won&apos;t stop until someone admits why it began.</p>
            <p>Between the lacquered masks of old Sambo and the chrome rigs of the outer belts, ten dokkaebi keep the broadcast alive. Some sing into it. Some fight inside it. Some pretend they can hear what comes next.</p>
            <p>This is their codex.</p>
          </div>
        </div>

        <div className="lore-panels">
          {LORE.map((l, i) => (
            <article
              key={l.idx}
              className="lore-panel reveal"
              style={
                {
                  "--accent": l.accent,
                  transitionDelay: `${i * 80}ms`,
                } as React.CSSProperties
              }
            >
              <div className="lore-panel__index">{l.idx}</div>
              <h3 className="lore-panel__title">{l.title}</h3>
              <p className="lore-panel__text">{l.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Codex ============ */
function CharCard({ c, onPick }: { c: Char; onPick: (c: Char) => void }) {
  return (
    <button
      className="char-card"
      style={{ "--accent": c.color } as React.CSSProperties}
      onClick={() => onPick(c)}
    >
      <div className="char-card__visual" />
      <span className="char-card__number h-mono">NO. {c.num}</span>
      <span
        className="char-card__faction"
        style={{ color: c.color, borderColor: c.color + "55" }}
      >
        {FACTIONS[c.faction].tag}
      </span>
      <div className="char-card__meta">
        <h3 className="char-card__name">{c.name}</h3>
        <span className="char-card__role" style={{ color: c.color }}>
          {c.role}
        </span>
      </div>
    </button>
  );
}

function Codex({ onPick }: { onPick: (c: Char) => void }) {
  const [q, setQ] = useState("");
  const [activeFaction, setActiveFaction] = useState<"ALL" | FactionKey>("ALL");

  const filtered = CHARACTERS.filter((c) => {
    if (activeFaction !== "ALL" && c.faction !== activeFaction) return false;
    if (q && !`${c.name} ${c.role} ${c.element} ${c.homeworld}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="section" id="codex">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">04 / CODEX</div>
            <h2>Meet the<br />Dokkaebi.</h2>
          </div>
          <div className="section-head__right">
            Ten dokkaebi across three factions. Click any to open their dossier — stats, artifacts, signature lines, and the trouble they carry.
          </div>
        </div>

        <div className="codex__filter reveal">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, element, or homeworld…"
          />
          <button
            className={activeFaction === "ALL" ? "is-on" : ""}
            onClick={() => setActiveFaction("ALL")}
          >
            All
          </button>
          {(Object.entries(FACTIONS) as [FactionKey, typeof FACTIONS[FactionKey]][]).map(([key, f]) => (
            <button
              key={key}
              className={activeFaction === key ? "is-on" : ""}
              style={
                activeFaction === key
                  ? { background: f.color, borderColor: f.color, color: "#08001E" }
                  : {}
              }
              onClick={() => setActiveFaction(key)}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="codex__count">
          {String(filtered.length).padStart(2, "0")} / {String(CHARACTERS.length).padStart(2, "0")} dokkaebi shown
        </div>

        <div className="codex-grid reveal">
          {filtered.map((c) => (
            <CharCard key={c.id} c={c} onPick={onPick} />
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                opacity: 0.6,
                gridColumn: "1 / -1",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.2em",
              }}
            >
              [ NO DOKKAEBI MATCH — TRY A DIFFERENT FREQUENCY ]
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ Modal ============ */
function Modal({
  character,
  onClose,
  onPick,
}: {
  character: Char;
  onClose: () => void;
  onPick: (c: Char) => void;
}) {
  const factionInfo = FACTIONS[character.faction];
  const idx = CHARACTERS.findIndex((c) => c.id === character.id);
  const prev = CHARACTERS[(idx - 1 + CHARACTERS.length) % CHARACTERS.length];
  const next = CHARACTERS[(idx + 1) % CHARACTERS.length];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPick(prev);
      if (e.key === "ArrowRight") onPick(next);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [character, onClose, onPick, prev, next]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ "--accent": character.color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal__body">
          <div className="modal__visual">
            <span className="modal__num">DOSSIER · NO. {character.num}</span>
          </div>
          <div className="modal__info">
            <div className="modal__faction" style={{ color: character.color }}>
              {factionInfo.name} · {character.element}
            </div>
            <h2 className="modal__name">{character.name}</h2>
            <div className="modal__role">{character.role}</div>
            <p className="modal__bio">{character.bio}</p>
            <blockquote className="modal__quote">&ldquo;{character.quote}&rdquo;</blockquote>

            <div className="stats">
              {Object.entries(character.stats).map(([k, v]) => (
                <div className="stat" key={k}>
                  <span className="stat__label">{k}</span>
                  <span className="stat__bar">
                    <span className="stat__bar-fill" style={{ width: `${v}%` }} />
                  </span>
                  <span className="stat__val">{String(v).padStart(2, "0")}</span>
                </div>
              ))}
            </div>

            <div className="specs">
              <div className="specs__item"><span className="l">Homeworld</span><span className="v">{character.homeworld}</span></div>
              <div className="specs__item"><span className="l">Artifact</span><span className="v">{character.artifact}</span></div>
              <div className="specs__item"><span className="l">Element</span><span className="v">{character.element}</span></div>
              <div className="specs__item"><span className="l">Debut</span><span className="v">{character.debut}</span></div>
            </div>

            <div className="modal__nav">
              <button onClick={() => onPick(prev)}>← {prev.name}</button>
              <button onClick={() => onPick(next)}>{next.name} →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Constellation ============ */
function Constellation({ onPick }: { onPick: (c: Char) => void }) {
  const edgeColor = (type: string) => {
    if (type === "duet") return "#FF2BD6";
    if (type === "oath") return "#7BFF52";
    if (type === "pact") return "#52F0FF";
    if (type === "rival") return "#FF3D6E";
    return "#ffffff";
  };
  const edgeDash = (type: string) => (type === "rival" ? "4 6" : "");

  return (
    <section className="section" id="constellation">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">05 / BONDS</div>
            <h2>The Spacekkabbi<br />Constellation.</h2>
          </div>
          <div className="section-head__right">
            Faction-mates lock arms. Rivals trade looks across the void. Hover any node to surface its name; click to open the dossier.
          </div>
        </div>

        <div className="constellation reveal">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            {RELATIONSHIPS.map((e, i) => {
              const a = CONST_POSITIONS[e.a];
              const b = CONST_POSITIONS[e.b];
              if (!a || !b) return null;
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={edgeColor(e.type)}
                  strokeOpacity="0.55"
                  strokeWidth="0.22"
                  strokeDasharray={edgeDash(e.type)}
                />
              );
            })}
            <circle cx="73" cy="46" r="22" fill="#FF2BD6" opacity="0.06" />
            <circle cx="19" cy="79" r="20" fill="#7BFF52" opacity="0.05" />
            <circle cx="28" cy="48" r="26" fill="#52F0FF" opacity="0.05" />
          </svg>

          {CHARACTERS.map((c) => {
            const p = CONST_POSITIONS[c.id];
            if (!p) return null;
            return (
              <div
                key={c.id}
                className="const-node"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  "--accent": c.color,
                } as React.CSSProperties}
                onClick={() => onPick(c)}
              >
                <div className="const-node__dot">{c.num}</div>
                <div className="const-node__name">{c.name}</div>
              </div>
            );
          })}

          <div className="const-legend">
            <span style={{ "--c": "#FF2BD6" } as React.CSSProperties}>Duet</span>
            <span style={{ "--c": "#7BFF52" } as React.CSSProperties}>Oath</span>
            <span style={{ "--c": "#52F0FF" } as React.CSSProperties}>Pact</span>
            <span style={{ "--c": "#FF3D6E" } as React.CSSProperties}>Rival</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Shop ============ */
function Shop({ onAdd }: { onAdd: (p: Product) => void }) {
  const cats = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => set.add(p.cat));
    return ["ALL", ...Array.from(set)];
  }, []);
  const [active, setActive] = useState("ALL");
  const list = PRODUCTS.filter((p) => active === "ALL" || p.cat === active);

  return (
    <section className="section" id="shop">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">06 / GOODS</div>
            <h2>Take the<br />belt home.</h2>
          </div>
          <div className="section-head__right">
            Limited drops, character charms, codex prints. Most pieces are single-runs — once they&apos;re gone they&apos;re gone.
          </div>
        </div>

        <div className="shop__filter reveal">
          <div className="shop__cats">
            {cats.map((c) => (
              <button
                key={c}
                className={active === c ? "is-on" : ""}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="shop__note">FREE SHIP @ ★ 80+</span>
        </div>

        <div className="shop-grid reveal">
          {list.map((p) => (
            <article
              key={p.id}
              className="product"
              style={{ "--accent": p.color } as React.CSSProperties}
            >
              <div className="product__visual">
                {p.badge && <span className="product__badge">{p.badge}</span>}
                <span className="product__cat">{p.cat}</span>
              </div>
              <div className="product__body">
                <span className="product__char">{p.char}</span>
                <h3 className="product__name">{p.name}</h3>
                <p className="product__blurb">{p.blurb}</p>
                <div className="product__foot">
                  <span className="product__price">${p.price}</span>
                  <button className="product__add" onClick={() => onAdd(p)}>
                    Add <span style={{ fontSize: 14 }}>+</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Cart ============ */
type CartItem = { id: string; qty: number };

function CartDrawer({
  open,
  items,
  onClose,
  onInc,
  onDec,
  onRemove,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [guestEmail, setGuestEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;
  const rows = items
    .map((it) => {
      const p = PRODUCTS.find((x) => x.id === it.id);
      return p ? { ...it, p } : null;
    })
    .filter((x): x is { id: string; qty: number; p: Product } => x !== null);
  const subtotal = rows.reduce((s, r) => s + r.p.price * r.qty, 0);

  const checkout = async () => {
    setError(null);
    setBusy(true);
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: items.map((it) => ({ productId: it.id, qty: it.qty })),
        email: session?.user?.email ? undefined : guestEmail || undefined,
      }),
    }).catch(() => null);
    if (!r) {
      setError("Network error. Try again.");
      setBusy(false);
      return;
    }
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.url) {
      setError(data.error ?? "Checkout failed");
      setBusy(false);
      return;
    }
    window.location.href = data.url;
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart" onClick={(e) => e.stopPropagation()}>
        <header className="cart__head">
          <div>
            <span className="h-eyebrow">YOUR CART</span>
            <h3>Belt<br />Manifest</h3>
          </div>
          <button className="cart__close" onClick={onClose}>✕</button>
        </header>

        {rows.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-glyph">○</span>
            <p>Empty Belt</p>
            <span>Add something cosmic</span>
          </div>
        ) : (
          <div className="cart__list">
            {rows.map((r) => (
              <div
                key={r.id}
                className="cart-row"
                style={{ "--accent": r.p.color } as React.CSSProperties}
              >
                <div className="cart-row__thumb" />
                <div>
                  <div className="cart-row__name">{r.p.name}</div>
                  <div className="cart-row__meta">{r.p.char} · {r.p.cat}</div>
                  <div className="cart-row__qty">
                    <button onClick={() => onDec(r.id)}>–</button>
                    <span>{r.qty}</span>
                    <button onClick={() => onInc(r.id)}>+</button>
                  </div>
                </div>
                <div className="cart-row__price">
                  <span>${r.p.price * r.qty}</span>
                  <button className="cart-row__remove" onClick={() => onRemove(r.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="cart__foot">
          <div className="cart__line"><span>Subtotal</span><span>${subtotal}</span></div>
          <div className="cart__line"><span>Shipping</span><span>{subtotal >= 80 ? "FREE" : "$8"}</span></div>
          <div className="cart__line cart__line--total">
            <span>Total</span>
            <span>${subtotal + (subtotal >= 80 || subtotal === 0 ? 0 : 8)}</span>
          </div>

          {!session?.user && rows.length > 0 && (
            <label className="cart__guest">
              <span>Guest email (or sign in)</span>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@orbit.belt"
                disabled={busy}
              />
            </label>
          )}

          {error && <div className="cart__error">[!] {error}</div>}

          <button
            className="btn btn--primary cart__checkout"
            disabled={rows.length === 0 || busy || (!session?.user && !guestEmail)}
            onClick={checkout}
          >
            {busy ? "Tuning in…" : "Tune in to checkout"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ============ Fanart ============ */
function FanartGallery() {
  const slots = [
    { id: "fa-01", h: 320, artist: "@nebulapaint",  like: "1.4k", color: "#FF2BD6" },
    { id: "fa-02", h: 220, artist: "@kkomafanclub", like: "880",  color: "#7BFF52" },
    { id: "fa-03", h: 380, artist: "@voidcat",      like: "2.1k", color: "#9D4DFF" },
    { id: "fa-04", h: 260, artist: "@momoluvr",     like: "612",  color: "#FFB1C8" },
    { id: "fa-05", h: 300, artist: "@hojusword",    like: "930",  color: "#FF8A1F" },
    { id: "fa-06", h: 200, artist: "@bitprayer",    like: "450",  color: "#52F0FF" },
    { id: "fa-07", h: 340, artist: "@runarings",    like: "1.7k", color: "#A4D6FF" },
    { id: "fa-08", h: 280, artist: "@dok2heavy",    like: "720",  color: "#FF6A2C" },
    { id: "fa-09", h: 360, artist: "@saemitide",    like: "1.1k", color: "#52F0FF" },
  ];

  return (
    <section className="section" id="fanart">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">07 / FAN GALLERY</div>
            <h2>Drawn by<br />the belt.</h2>
          </div>
          <div className="section-head__right">
            A rotating wall of community submissions. Drop your own piece by tagging{" "}
            <strong style={{ color: "#FF2BD6" }}>#spacekkabbi</strong>. Featured artists rotate monthly.
          </div>
        </div>

        <div className="fanart reveal">
          {slots.map((s) => (
            <div
              className="fanart__item"
              key={s.id}
              style={{ "--accent": s.color } as React.CSSProperties}
            >
              <div className="fanart__visual" style={{ height: s.h }} />
              <div className="fanart__caption">
                <span className="a">{s.artist}</span>
                <span className="l">♥ {s.like}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ News ============ */
function NewsList() {
  return (
    <section className="section" id="news">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">08 / TRANSMISSIONS</div>
            <h2>Latest<br />from the belt.</h2>
          </div>
          <div className="section-head__right">
            Drops, lore additions, live events, and goods. All times in Belt Standard.
          </div>
        </div>

        <div className="news-list reveal">
          {NEWS.map((n) => (
            <article className="news-row" key={n.date + n.title}>
              <span className="news-row__date">{n.date}</span>
              <span className="news-row__tag">{n.tag}</span>
              <span className="news-row__title">{n.title}</span>
              <span className="news-row__arrow">→</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ ============ */
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="shell">
        <div className="section-head reveal">
          <div className="section-head__left">
            <div className="eyebrow">09 / FAQ</div>
            <h2>Questions<br />from the belt.</h2>
          </div>
          <div className="section-head__right">
            New here? Start with these. Anything else, drop into the Discord and ask the broadcast.
          </div>
        </div>

        <div className="faq reveal">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className={`faq__item ${open === i ? "is-open" : ""}`}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <div className="faq__q">
                <span>{f.q}</span>
                <span className="plus">+</span>
              </div>
              <div className="faq__a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Join ============ */
function Join() {
  return (
    <section className="join" id="join">
      <div className="shell">
        <span className="h-eyebrow">10 / JOIN THE BELT</span>
        <h2 className="join__title">Tune<br />in.</h2>
        <p className="join__sub">
          The broadcast is open. Bring fanart, bring questions, bring trouble. The Spacekkabbi community runs across Discord, Twitter, and a small but loud subreddit.
        </p>
        <div className="join__channels">
          <a className="channel" href="#">
            <svg className="ic" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 12H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg>
            Discord
          </a>
          <a className="channel" href="#">
            <svg className="ic" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter / X
          </a>
          <a className="channel" href="#">
            <svg className="ic" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 14.9c0 .6-.5 1.1-1.1 1.1H7.6c-.6 0-1.1-.5-1.1-1.1V9.1c0-.6.5-1.1 1.1-1.1h8.8c.6 0 1.1.5 1.1 1.1v5.8z"/></svg>
            Reddit
          </a>
          <a className="channel" href="#shop">
            <svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
            Store
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============ Footer ============ */
function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer__brand">SPACEKKABBI</div>
        <div style={{ marginTop: 8 }}>© 25 Belt Broadcast — Tune carefully.</div>
      </div>
      <div>Codex / Bonds / Lore / Goods</div>
      <div>v 0.04 / patch.kkb-04</div>
    </footer>
  );
}

/* ============ App ============ */
export default function SpacekkabbiApp() {
  const [activeChar, setActiveChar] = useState<Char | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useReveal();

  const featured = CHARACTERS[0];
  const count = cart.reduce((s, it) => s + it.qty, 0);
  const total = cart.reduce((s, it) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, qty: 1 }];
    });
    setCartOpen(true);
  };

  const incQty = (id: string) =>
    setCart((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const decQty = (id: string) =>
    setCart((p) =>
      p
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  const removeItem = (id: string) =>
    setCart((p) => p.filter((x) => x.id !== id));

  return (
    <AuthProvider>
      <Loader />

      <div className="cosmos-bg" />
      <div className="grain" />
      <div className="scanlines" />

      <Nav
        cartCount={count}
        cartTotal={total}
        onCartOpen={() => setCartOpen(true)}
      />
      <MusicPlayer />
      <NicknameModal />
      <Hero featured={featured} />

      <MarqueeBar
        items={[
          "★ SPACEKKABBI VOL. 04",
          "BROADCAST LIVE — BELT STANDARD",
          "10 DOKKAEBI / 3 FACTIONS",
          "TUNE IN AT 17:00 BST",
          "◐ NEW DROP — TIGER TEA SET",
        ]}
      />

      <World />
      <Codex onPick={setActiveChar} />
      <Constellation onPick={setActiveChar} />
      <Shop onAdd={addToCart} />
      <FanartGallery />
      <NewsList />
      <FAQ />
      <Join />
      <Footer />

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={incQty}
        onDec={decQty}
        onRemove={removeItem}
      />

      {activeChar && (
        <Modal
          character={activeChar}
          onClose={() => setActiveChar(null)}
          onPick={setActiveChar}
        />
      )}
    </AuthProvider>
  );
}
