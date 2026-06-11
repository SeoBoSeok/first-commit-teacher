# 기술 결정 — SpaceKkabbi 공식 홈

## 1. 현재 스택 (유지)

| 기술 | 역할 | 판정 |
|------|------|------|
| Next.js 16 (App Router) | 프레임워크 | ✅ 유지 — `AGENTS.md`의 동봉 문서 우선 규칙 준수 |
| next-auth + bcryptjs | 인증 | ✅ 유지 — 이미 동작, @auth/prisma-adapter로 M1과 자연 연결 |
| Stripe | 결제 (테스트 모드) | ✅ 유지 — 국내 PG(토스 등)는 사업자 등록이 필요해 수업엔 Stripe 테스트 모드가 정답 |
| Resend | 인증 메일 | ✅ 유지 — 무료 티어 충분 |
| zod | 입력 검증 | ✅ 유지 — 모든 API 입구에 일관 적용으로 확대 |
| React Three Fiber | 3D | ✅ 유지 — 모바일 성능만 관찰 |

## 2. 핵심 결정: 데이터 저장소 (M1)

### 후보 비교
| 후보 | 장점 | 단점 | 판정 |
|------|------|------|------|
| 파일 JSON (현재) | 설치 0, 로컬 개발 쉬움 | **Vercel 배포 불가**(파일 쓰기 안 됨), 동시성 없음 | 졸업 대상 |
| **Prisma + Postgres (Neon)** | 학생이 이미 깔아둔 @auth/prisma-adapter와 직결, store.ts가 "Prisma 복귀" 전제로 설계됨, Vercel 마켓플레이스 원클릭 | 스키마·마이그레이션 학습 필요 | ✅ **채택** |
| Supabase | 무료, 까비 월드 Phase 2(실시간)와 시너지 | next-auth 어댑터 경로가 한 단계 더 김 | 차선 — 월드 방명록 단계에서 재평가 |

### 결정 이유
1. **학생의 원래 설계 존중**: `store.ts` 주석에 "Prisma로 재구현 전제, 호출부 무변경" — 본인이 이미 좋은 전환 설계를 해뒀다. 선생님 버전은 그 설계를 실행으로 증명한다.
2. **전환 방법이 곧 수업**: 함수 표면(시그니처)을 고정하고 내부만 교체 — "인터페이스를 지키면 구현은 갈아끼울 수 있다"는 소프트웨어 공학의 핵심 체험.
3. Neon은 Vercel 마켓플레이스에서 무료로 붙고 환경변수가 자동 주입된다.

## 3. 까비 월드 임베드 (M4)

first-teacher [비전 문서 §5](https://github.com/SeoBoSeok/first-teacher/blob/main/docs/05-vision-kkabbi-world.md)와 같은 결정:
- `/world` 페이지에서 **iframe**으로 까비 월드(GitHub Pages)를 임베드 — 두 저장소의 배포 주기 독립
- 홈 로그인 세션의 닉네임을 **postMessage**로 월드에 전달 → 월드 채팅 닉네임 자동 설정
- 월드 쪽 수신 코드는 first-teacher에서 구현 (양쪽 선생님 버전의 협업 지점)

## 4. NFT 갤러리 (M4)

- OpenSea SpaceKkabbi 컬렉션을 **읽기 전용**으로 표시 (OpenSea API 또는 단순 임베드/링크)
- 지갑 연결·서명·민팅은 하지 않는다 (비전 문서의 안전 원칙과 동일)

## 5. 배포 (M3)

- **Vercel** — 이 수업 LMS와 같은 플랫폼이라 배운 것 재사용 (환경변수, 빌드, 도메인)
- 환경변수 체크리스트: `STRIPE_SECRET_KEY` `STRIPE_WEBHOOK_SECRET` `RESEND_API_KEY` `EMAIL_FROM` `AUTH_URL` `AUTH_SECRET` `DATABASE_URL` (+Discord 키)
- 웹훅 엔드포인트는 배포 후 Stripe 대시보드에 등록 → 서명 키 갱신
