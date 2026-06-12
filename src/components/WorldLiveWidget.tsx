"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 까비 월드 라이브 위젯 — 서버 없이 "지금 누가 있는지"를 보여준다.
// 원리: 이 컴포넌트가 월드의 P2P 방에 '관전자(observer)'로 조용히 접속해 인원만 센다.
// 관전자는 월드 쪽에서 플레이어로 집계되지 않는다 (hello에 observer 플래그).
const APP_ID = "kkabbi-world-v2"; // first-teacher/js/world/chat.js와 동일해야 함
const ROOM = "global";
// 변수로 두는 이유: 문자열 리터럴이면 TS·번들러가 URL 모듈을 해석하려다 빌드가 깨진다 (런타임 CDN 임포트)
const TRYSTERO_URL = "https://esm.run/trystero@0.25.2";

export default function WorldLiveWidget() {
  const [players, setPlayers] = useState<string[] | null>(null); // null = 연결 중

  useEffect(() => {
    let room: { leave: () => void } | null = null;
    let alive = true;
    const nicks = new Map<string, string>();

    (async () => {
      try {
        const { joinRoom } = await import(/* webpackIgnore: true */ TRYSTERO_URL);
        if (!alive) return;
        const r = joinRoom({ appId: APP_ID }, ROOM);
        room = r;
        const hello = r.makeAction("hello");
        const sync = () => alive && setPlayers([...new Set(nicks.values())]);

        r.onPeerJoin = (id: string) => hello.send({ nick: "공식 홈", observer: true }, id);
        r.onPeerLeave = (id: string) => { nicks.delete(id); sync(); };
        hello.onMessage = (d: { nick?: string; observer?: boolean }, meta: { peerId?: string }) => {
          const id = meta?.peerId ?? String(meta);
          if (d?.observer) return; // 다른 관전자는 세지 않음
          nicks.set(id, String(d?.nick ?? "까비").slice(0, 12));
          sync();
        };
        setTimeout(() => alive && setPlayers((p) => p ?? []), 6000); // 발견 대기 후 0명 확정
      } catch {
        if (alive) setPlayers([]);
      }
    })();

    return () => { alive = false; room?.leave(); };
  }, []);

  const count = players?.length ?? 0;

  return (
    <Link
      href="/world"
      className="group mt-5 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur transition hover:border-[#7BFF52]/60 hover:bg-white/10"
    >
      <span className="relative flex h-2.5 w-2.5">
        {count > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7BFF52] opacity-60" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${count > 0 ? "bg-[#7BFF52]" : "bg-zinc-500"}`} />
      </span>
      <span className="text-sm">
        {players === null ? (
          <span className="text-zinc-400">까비 월드 연결 중…</span>
        ) : count > 0 ? (
          <>
            <b className="text-[#7BFF52]">LIVE</b>{" "}
            <span className="text-zinc-200">지금 월드에 {count}명</span>{" "}
            <span className="text-zinc-400">— {players!.slice(0, 3).join(", ")}{count > 3 ? " …" : ""}</span>
          </>
        ) : (
          <span className="text-zinc-300">지금 마을이 조용해요 — 첫 까비가 되어보세요</span>
        )}
      </span>
      <span className="text-sm text-[#FF2BD6] transition group-hover:translate-x-0.5">입장 →</span>
    </Link>
  );
}
