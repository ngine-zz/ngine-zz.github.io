# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 문서 관리 원칙

**이 파일에는 핵심 요약만 기록한다. 세부 사항은 모두 `.omc/plans/` 하위 마크다운 문서로 관리한다.**

| 문서 | 내용 |
|---|---|
| `.omc/plans/project-overview.md` | 전체 프로젝트 구조 (메인 웹사이트 + Pixel Village 관계) |
| `.omc/plans/ia-main-website.md` | 메인 웹사이트 IA (페이지 구조, 내비게이션) |
| `.omc/plans/ia-pixel-village.md` | Pixel Village IA (구역, 상호작용, 맵 구조) |
| `.omc/plans/sfood-pixel-website.md` | Pixel Village 기술 기획 (아키텍처, 맵 사이즈 등) |
| `.omc/plans/tech-stack.md` | 기술 스택 및 핵심 수치 |
| `.omc/plans/dev-principles.md` | 개발 원칙 |
| `.omc/plans/asset-management.md` | 에셋 관리 방식 (폴더 구조, 파이프라인) |
| `.omc/plans/asset-specs.md` | 에셋 요구 스펙 (종류, 크기, 우선순위) |
| `.omc/plans/seo-aeo-geo-checklist.md` | SEO · AEO · GEO 구현 체크리스트 |
| `.omc/plans/tiled-map-design.md` | Pixel Village Tiled 맵 설계 (구역 좌표, 레이어, NPC 스폰) |

---

## 프로젝트 개요

에쓰푸드(S-Food) 외부 공개용 웹사이트. 두 가지 경험으로 구성된다.

1. **메인 웹사이트** — 일반 반응형 웹사이트 (기획 예정)
2. **Pixel Village** — 픽셀아트 인터랙티브 경험 (Angular + Phaser 4)

---

## 에셋 관리 명령어

```bash
npm run assets          # GIF 변환 + 레지스트리 갱신
npm run assets:status   # 현황 리포트
npm run assets:watch    # 파일 감지 자동 변환
```

---

## 웹사이트 품질 최우선 원칙

### 크로스브라우저 & 반응형
- 지원 브라우저: Safari, Chrome, Edge — 세 브라우저에서 동일한 사용자 경험 제공
- 모바일 · 태블릿 · 데스크탑 완전 반응형
- 모든 기능적 요소는 화면 크기와 무관하게 작동
- 레이아웃, 폰트, 이미지 사이즈는 화면 크기에 따라 가변 적용

### 언어 전환
- GNB에서 수동 전환(KOR/ENG) 지원
- 최초 접속 시 `navigator.language`로 브라우저 언어 자동 감지 후 적용
- 사용자 선택 언어는 `localStorage`에 저장하여 재방문 시 유지
- 다국어 구현: `ngx-translate` (런타임 전환)

### 환경 변수 & 보안
- 환경 파일(`.env`, `.env.*`), API 키 등은 소스에 포함하지 않는다.
- `.gitignore`에 반드시 포함하여 별도 관리한다.
- 환경별 값은 `.env.example`에 키 목록만 기재한다.

### 디자인 Tone & Manner
- 디자인 T&M은 `design.md`를 따른다.

### 통계 & 분석
- Google Analytics 사용 (UA 제외, GA4 기준)

### 검색 최적화
- SEO (Search Engine Optimization), AEO (Answer Engine Optimization), GEO (Generative Engine Optimization) 최우선 적용
- 검색엔진 및 AI 봇이 콘텐츠를 올바르게 크롤링·인덱싱할 수 있도록 구현

---

## Workspace

- Primary directory: `/Users/marc/workspace/Website`
- State files: `.omc/` — OMC orchestration state, do not modify manually
