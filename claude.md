# SpaceKkabbi 공식 홈 — 선생님 버전 (first-commit-teacher)

학생B 웹앱(sooktday-bot/first-commit)의 fork. 클로드코드를 소프트웨어 공학적으로 모범 사용하는 시범 저장소다.
까비 NFT IP의 공식 홈 — 세계관·회원·결제(테스트 모드)·까비 월드 관문.

## 프로젝트 구조

- `src/app/` — 페이지·API 라우트 (App Router). 인증 `api/auth/*`, 결제 `api/checkout`·`api/webhooks/stripe`
- `src/components/SpacekkabbiApp.tsx` — 메인 화면 (934줄 — 건드리는 부분만 점진 분리)
- `src/lib/store.ts` — 데이터 저장 (현재 파일 JSON, **M1에서 함수 표면 유지한 채 Prisma로 교체**)
- `src/components/spacekkabbi-data.ts` — 세계관 데이터 (팩션·캐릭터)
- `docs/` — **모든 작업의 기준 문서. 기능 작업 전 반드시 읽을 것** (PRD → 기능/시나리오 → 기술 결정 → 노하우)

## 실행·확인

```bash
npm run dev      # http://localhost:3000
npm run build    # 머지 전 필수 통과
npm run lint
```
- 변경 후 반드시 브라우저에서 실행 확인. 확인 전 다음 작업 금지
- Next.js 16: 학습 데이터와 다를 수 있음 — `node_modules/next/dist/docs/` 동봉 문서 우선 (AGENTS.md 규칙)

## 작업 규칙

1. **PRD 우선**: docs/01-PRD.md 범위 밖이면 만들지 말고 먼저 알릴 것. "하지 않을 것" 준수 (실결제 절대 금지)
2. **한 번에 한 기능**: 마일스톤(M1 DB → M2 회원·결제 → M3 배포 → M4 생태계) 순서
3. **보안**:
   - 비밀키·토큰을 코드나 커밋에 절대 넣지 않는다. 새 환경변수는 `.env.example`에 키 이름만 추가
   - Stripe 웹훅은 서명 검증 없이 처리 금지, 금액은 서버가 결정
   - 모든 API 입력은 zod로 검증
4. **돈·인증 코드는 Plan Mode**: 결제·인증 변경은 계획 검토 후 진행
5. **store.ts 전환(M1)**: 함수 시그니처 변경 금지 — 내부 구현만 교체
6. **컴포넌트 분리**: 전면 리팩토링 금지, 건드리는 섹션만 추출. "use client"는 잎으로
7. **커밋**: 동작·빌드 통과하는 최소 단위, 한국어 "무엇을 왜" 형식

## 스타일

- TypeScript strict, 서버 컴포넌트 기본값, 주석은 "왜"만
- 기존 코드의 패턴(zod 스키마 위치, API 응답 형태)을 따른다
