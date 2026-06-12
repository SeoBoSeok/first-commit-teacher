// store.ts 스모크 테스트 — M1 완료 기준 검증
// "서버를 재시작해도(=새 프로세스) 회원이 남아 있는가" + 핵심 함수 왕복
// 실행: node scripts/store-smoke.mjs  (2번 연속 실행해 영속성 확인)
import { readFileSync } from "fs";
// .env.local 간단 로드 (외부 의존성 없이)
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const { PrismaClient, Prisma } = await import("@prisma/client");
const prisma = new PrismaClient();

const TAG = "smoke-test@kkabbi.local";
const found = await prisma.user.findFirst({ where: { email: TAG } });

if (found) {
  // 두 번째 실행 = "재시작 후"에 해당 — 데이터가 살아 있어야 한다
  console.log("✅ 영속성 확인: 이전 실행에서 만든 회원이 살아 있음 →", found.id);
  const orders = await prisma.order.findMany({ where: { email: TAG } });
  console.log(`✅ 주문 ${orders.length}건 유지 (status: ${orders.map(o => o.status).join(",")})`);
  // 정리
  await prisma.order.deleteMany({ where: { email: TAG } });
  await prisma.user.delete({ where: { id: found.id } });
  console.log("🧹 테스트 데이터 정리 완료");
} else {
  // 첫 실행: 생성
  const u = await prisma.user.create({ data: { email: TAG, nickname: "스모크까비", passwordHash: "x" } });
  console.log("① 회원 생성:", u.id);
  await prisma.token.create({ data: { token: "smoke-token", userId: u.id, identifier: TAG, purpose: "email_verification", expiresAt: new Date(Date.now() + 60000) } });
  // 같은 용도 토큰 교체 정책(@@unique) 확인: 두 번째 생성 시도 → 교체 로직 없이 직접 create면 충돌해야 정상
  let uniqueEnforced = false;
  try {
    await prisma.token.create({ data: { token: "smoke-token-2", userId: u.id, identifier: TAG, purpose: "email_verification", expiresAt: new Date(Date.now() + 60000) } });
  } catch (e) { uniqueEnforced = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"; }
  console.log(uniqueEnforced ? "② DB 제약 확인: 같은 용도 토큰 중복을 DB가 거부 (P2002)" : "② ⚠️ unique 제약 미동작");
  await prisma.order.create({ data: { id: "ord_smoke1", userId: u.id, email: TAG, nickname: "스모크까비", items: [{ productId: "p1", name: "테스트 굿즈", unitPrice: 1200, qty: 2 }], subtotal: 2400, shipping: 0, total: 2400, currency: "usd", status: "paid", shippingAddress: Prisma.JsonNull } });
  console.log("③ 주문 생성: ord_smoke1");
  console.log("→ 이제 이 스크립트를 한 번 더 실행하세요 (새 프로세스 = 서버 재시작 시뮬레이션)");
}
await prisma.$disconnect();
