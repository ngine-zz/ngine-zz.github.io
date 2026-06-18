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

## Workspace

- Primary directory: `/Users/marc/workspace/Website`
- State files: `.omc/` — OMC orchestration state, do not modify manually
