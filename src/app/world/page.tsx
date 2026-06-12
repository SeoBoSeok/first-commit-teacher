import { auth } from "@/auth";
import WorldEmbed from "./WorldEmbed";

// 까비 월드(학생A 게임, GitHub Pages) 임베드 — M4 예고편
// 공식 홈이 "관문"이 되는 페이지: 로그인 닉네임이 월드 채팅 닉네임으로 자동 전달된다
export default async function WorldPage() {
  const session = await auth();
  const nickname = session?.user?.nickname ?? session?.user?.name ?? null;

  return <WorldEmbed nickname={nickname} />;
}
