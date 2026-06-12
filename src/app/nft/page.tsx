import Link from "next/link";
import { CHARACTERS, FACTIONS, type FactionKey } from "@/components/spacekkabbi-data";

// NFT 갤러리 — 세계관 코덱스와 OpenSea SpaceKkabbi 컬렉션을 잇는 페이지 (M4 / A1·A2)
// 지갑·서명·민팅 없음: 읽기 전용 쇼케이스 + OpenSea 링크 (PRD의 안전 원칙)
const OPENSEA = "https://opensea.io/SpaceKkabbi";

export const metadata = { title: "NFT — SpaceKkabbi Collection" };

export default function NftPage() {
  const factions = Object.keys(FACTIONS) as FactionKey[];

  return (
    <main className="min-h-dvh bg-[#08001E] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-10 flex items-center justify-between text-sm">
          <Link href="/" className="font-bold tracking-widest text-[#52F0FF] hover:opacity-80">← SPACEKKABBI</Link>
          <Link href="/world" className="text-[#FF2BD6] hover:opacity-80">🎮 까비 월드 →</Link>
        </nav>

        <header className="mb-12">
          <p className="mb-2 text-xs tracking-[0.3em] text-zinc-400">ON-CHAIN DOKKAEBI</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            SpaceKkabbi <span className="bg-gradient-to-r from-[#FF2BD6] to-[#7BFF52] bg-clip-text text-transparent">NFT</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            방송 벨트의 도깨비들이 온체인에 산다. 아래 코덱스의 캐릭터들이 곧 컬렉션의 주인공 —
            게임(까비 월드)의 커스텀 까비도 같은 트레이트 언어를 쓴다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/gallery"
              className="inline-block rounded-xl bg-gradient-to-r from-[#52F0FF] to-[#C9B8FF] px-6 py-3 font-bold text-[#0a0612] transition hover:opacity-90"
            >
              🖼 3D 메타버스 전시관 입장
            </Link>
            <a
              href={OPENSEA}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-xl bg-gradient-to-r from-[#FF2BD6] to-[#7BFF52] px-6 py-3 font-bold text-[#0a0612] transition hover:opacity-90"
            >
              OpenSea에서 컬렉션 보기 ↗
            </a>
          </div>
        </header>

        {factions.map((key) => {
          const faction = FACTIONS[key];
          const members = CHARACTERS.filter((c) => c.faction === key);
          return (
            <section key={key} className="mb-12">
              <h2 className="mb-1 text-lg font-bold" style={{ color: faction.color }}>
                {faction.name} <span className="text-xs text-zinc-500">/ {members.length} DOKKAEBI</span>
              </h2>
              <p className="mb-4 text-xs text-zinc-500">{faction.blurb}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((c) => (
                  <a
                    key={c.id}
                    href={OPENSEA}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07]"
                    style={{ boxShadow: `inset 0 1px 0 ${c.color}22` }}
                  >
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="font-mono text-xs text-zinc-500">NO. {c.num}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${c.color}22`, color: c.color }}>
                        {c.element}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold" style={{ color: c.color }}>{c.name}</h3>
                    <p className="text-xs text-zinc-400">{c.role} · {c.homeworld}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">{c.bio}</p>
                    <div className="mt-3 space-y-1">
                      {Object.entries(c.stats).slice(0, 3).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="w-14">{k}</span>
                          <div className="h-1 flex-1 overflow-hidden rounded bg-white/10">
                            <div className="h-full rounded" style={{ width: `${v}%`, background: c.color }} />
                          </div>
                          <span className="w-6 text-right font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-right text-[11px] text-zinc-500 transition group-hover:text-[#52F0FF]">
                      OpenSea에서 보기 ↗
                    </p>
                  </a>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-zinc-500">
          💡 까비 월드의 <Link href="/world" className="text-[#7BFF52] underline">커스텀 까비 빌더</Link>는
          이 컬렉션과 같은 트레이트 구조(Hair·Face·Outfit·Item·Shoes·Aura)를 쓴다 — 게임과 NFT가 같은 언어로 말한다.
        </footer>
      </div>
    </main>
  );
}
