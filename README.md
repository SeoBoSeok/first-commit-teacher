# SpaceKkabbi 공식 홈 — 선생님 버전 🛸

[sooktday-bot/first-commit](https://github.com/sooktday-bot/first-commit) (학생B 버전)의 fork.
금요일반 클로드코드 수업에서 **"같은 웹 서비스를 운영 가능한 수준까지 끌고 가면 어떻게 되는가"**를 보여주는 참고 구현이다.

**SpaceKkabbi**(까비 NFT IP)의 공식 홈: 세계관(팩션·캐릭터) 소개, 회원(이메일 인증·Discord),
Stripe 결제(테스트 모드), 그리고 [까비 월드](https://github.com/SeoBoSeok/first-teacher)(학생A의 게임)로 들어가는 관문.

## 실행

```bash
npm install
cp .env.example .env.local   # 키 값 채우기 (절대 커밋 금지)
npm run dev                  # http://localhost:3000
```

## 문서 (코드보다 먼저)

1. [PRD — 비전·마일스톤 M1~M4·하지 않을 것](docs/01-PRD.md)
2. [기능 리스트 & 시나리오 (실패 케이스 포함)](docs/02-features-scenarios.md)
3. [기술 결정 — 스토어 전환·임베드·배포](docs/03-tech-decisions.md)
4. [선생님 노하우 — 돈이 오가는 코드의 3원칙 등](docs/04-teacher-notes.md)

## 학생 버전과 다른 점

기능이 아니라 **과정**이 다르다: 실패 시나리오를 먼저 설계하고, 돈·인증 코드는 계획부터 검토하고,
인터페이스를 고정한 채 구현을 교체한다. 자세한 규칙은 [claude.md](claude.md).

까비 생태계: 까비 월드(학생A) = 팬들이 노는 본진 · 공식 홈(이 프로젝트) = IP의 공식 창구.
