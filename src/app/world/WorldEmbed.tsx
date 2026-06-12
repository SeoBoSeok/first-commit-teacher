"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const WORLD_URL = "https://seoboseok.github.io/first-teacher/kkabbi-world.html";
const WORLD_ORIGIN = new URL(WORLD_URL).origin;

export default function WorldEmbed({ nickname }: { nickname: string | null }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // 로그인 닉네임을 월드로 전달 — 월드 쪽(js/world/main.js)이 'kkabbi:nick' 메시지를 받는다.
  // 게임 로드 타이밍을 알 수 없으므로 잠시 간격을 두고 몇 번 보낸다 (받는 쪽은 멱등).
  useEffect(() => {
    if (!nickname) return;
    const send = () =>
      frameRef.current?.contentWindow?.postMessage({ type: "kkabbi:nick", nick: nickname }, WORLD_ORIGIN);
    const timers = [800, 2000, 4000].map((ms) => setTimeout(send, ms));
    return () => timers.forEach(clearTimeout);
  }, [nickname]);

  return (
    <div className="flex h-dvh flex-col bg-black text-white">
      <header className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
        <Link href="/" className="font-bold tracking-widest text-[#52F0FF] hover:opacity-80">
          ← SPACEKKABBI
        </Link>
        <p className="truncate text-zinc-400">
          🌍 까비 월드{" "}
          {nickname ? (
            <span className="text-zinc-200">
              — <b className="text-[#FF2BD6]">{nickname}</b> 님으로 입장 중
            </span>
          ) : (
            <span>— 로그인하면 닉네임이 자동 적용돼요</span>
          )}
        </p>
        <a href={WORLD_URL} target="_blank" rel="noreferrer" className="whitespace-nowrap text-zinc-500 hover:text-zinc-300">
          새 창 ↗
        </a>
      </header>
      <iframe
        ref={frameRef}
        src={WORLD_URL}
        title="까비 월드"
        className="min-h-0 w-full flex-1 border-0"
        allow="autoplay"
      />
    </div>
  );
}
