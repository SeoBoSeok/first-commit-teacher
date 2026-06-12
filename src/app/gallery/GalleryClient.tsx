"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Character } from "@/components/spacekkabbi-data";

// R3F 씬은 브라우저 전용(WebGL) — SSR 제외하고 동적 로드
const GalleryScene = dynamic(() => import("./GalleryScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
      전시관 불 켜는 중…
    </div>
  ),
});

const OPENSEA = "https://opensea.io/SpaceKkabbi";

export default function GalleryClient() {
  const [focused, setFocused] = useState<Character | null>(null);

  return (
    <div className="relative h-dvh bg-[#04010f] text-white">
      <GalleryScene onFocus={setFocused} />

      {/* 상단 바 */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 text-sm">
        <Link href="/" className="pointer-events-auto font-bold tracking-widest text-[#52F0FF] hover:opacity-80">
          ← SPACEKKABBI
        </Link>
        <p className="rounded-full bg-black/50 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur">
          🖼 메타버스 전시관 — 클릭으로 시점 잠금 · <b>WASD/방향키</b> 이동 · 액자를 바라보면 정보 표시
        </p>
        <Link href="/nft" className="pointer-events-auto text-zinc-400 hover:text-zinc-200">
          2D 갤러리 →
        </Link>
      </header>

      {/* 바라보는 액자 정보 HUD */}
      {focused && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <a
            href={OPENSEA}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/65 px-5 py-3 backdrop-blur transition hover:border-white/40"
            style={{ boxShadow: `0 0 24px ${focused.color}33` }}
          >
            <span className="font-mono text-xs text-zinc-500">NO. {focused.num}</span>
            <span className="text-lg font-extrabold" style={{ color: focused.color }}>{focused.name}</span>
            <span className="text-xs text-zinc-400">{focused.role}</span>
            <span className="text-xs text-[#52F0FF]">OpenSea에서 보기 ↗</span>
          </a>
        </div>
      )}
    </div>
  );
}
