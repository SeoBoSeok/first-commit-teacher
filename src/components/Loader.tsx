"use client";

import { useEffect, useState } from "react";

const BOOT_DURATION = 2400; // ms total before dismiss
const EXIT_DELAY = 280; // hold completed state briefly, then fade

const LOG_LINES: { tag: string; text: string; tone?: "ok" | "warn" | "info" }[] = [
  { tag: "SYS",  text: "Initializing belt receiver...", tone: "info" },
  { tag: "NET",  text: "Carrier signal locked · 88.4 MHz", tone: "ok" },
  { tag: "LORE", text: "Decrypting folk strata · vol.04", tone: "info" },
  { tag: "DEX",  text: "Ten dokkaebi identified", tone: "warn" },
  { tag: "OK",   text: "Broadcast online", tone: "ok" },
];

function clock(): string {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}

export default function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    setTime(clock());
    const ti = setInterval(() => setTime(clock()), 1000);
    return () => clearInterval(ti);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / BOOT_DURATION);
      // ease-out for the bar so it dwells near 100
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(eased * 100);
      setLineCount(Math.min(LOG_LINES.length, Math.floor(t * (LOG_LINES.length + 0.5))));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), EXIT_DELAY);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // unmount fully after exit transition
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setMounted(false), 900);
    return () => clearTimeout(t);
  }, [done]);
  if (!mounted) return null;

  const pct = Math.floor(progress).toString().padStart(2, "0");
  const status = progress < 100 ? "TUNING" : "LOCKED";

  return (
    <div className={`loader ${done ? "is-done" : ""}`} aria-hidden={done}>
      {/* Corner brackets */}
      <span className="loader__corner loader__corner--tl" />
      <span className="loader__corner loader__corner--tr" />
      <span className="loader__corner loader__corner--bl" />
      <span className="loader__corner loader__corner--br" />

      {/* Top + bottom rails */}
      <div className="loader__rail loader__rail--top">
        <span className="loader__dot" /> KKB-04 · SECURE LINK
        <span className="loader__rail-spacer" />
        STATUS · {status}
        <span className="loader__rail-spacer" />
        BST {time}
      </div>
      <div className="loader__rail loader__rail--bottom">
        <span>COORDS 23.5N · 142E</span>
        <span className="loader__rail-spacer" />
        <span>v 0.04 / patch.kkb-04</span>
        <span className="loader__rail-spacer" />
        <span className="loader__live">● LIVE</span>
      </div>

      <div className="loader__main">
        <div className="loader__radar">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#7BFF52" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#7BFF52" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#radar-glow)" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#52F0FF" strokeOpacity="0.55" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#52F0FF" strokeOpacity="0.35" strokeWidth="0.22" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#52F0FF" strokeOpacity="0.28" strokeWidth="0.2" />
            <line x1="2"  y1="50" x2="98" y2="50" stroke="#52F0FF" strokeOpacity="0.22" strokeWidth="0.15" />
            <line x1="50" y1="2"  x2="50" y2="98" stroke="#52F0FF" strokeOpacity="0.22" strokeWidth="0.15" />
            {/* faint angle ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1="50" y1="2" x2="50" y2="5"
                stroke="#52F0FF" strokeOpacity="0.6" strokeWidth="0.4"
                transform={`rotate(${a} 50 50)`}
              />
            ))}
            {/* blips */}
            <circle cx="68" cy="34" r="1.2" fill="#FF2BD6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="68" r="1.0" fill="#7BFF52">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite" />
            </circle>
            <circle cx="74" cy="56" r="0.8" fill="#52F0FF">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="2.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="28" cy="42" r="1.4" fill="#FF2BD6" opacity="0.7">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.9s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="1.6" fill="#F4EEFF" />
          </svg>
          <div className="loader__sweep" />
        </div>

        <div className="loader__title-wrap">
          <div className="loader__eyebrow">★ BROADCAST TUNING ★</div>
          <h1 className="loader__title" data-text="SPACEKKABBI">SPACEKKABBI</h1>
          <div className="loader__sub">/ ten dokkaebi / three factions / one signal /</div>
        </div>

        <div className="loader__progress">
          <div className="loader__progress-row">
            <span>SIGNAL LOCK</span>
            <span className="loader__progress-pct">{pct}%</span>
          </div>
          <div className="loader__progress-bar">
            <div className="loader__progress-fill" style={{ width: `${progress}%` }} />
            <div className="loader__progress-track-ticks" />
          </div>
        </div>

        <div className="loader__log">
          {LOG_LINES.slice(0, lineCount).map((l, i) => (
            <div key={l.tag} className={`loader__log-line loader__log-line--${l.tone || "info"}`} style={{ animationDelay: `${i * 40}ms` }}>
              <span className="loader__log-tag">[{l.tag.padEnd(4)}]</span>
              <span className="loader__log-text">{l.text}</span>
              <span className="loader__log-mark">{l.tone === "ok" ? "✓" : l.tone === "warn" ? "!" : "·"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
