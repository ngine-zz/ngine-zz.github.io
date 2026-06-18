# Changelog

## 2026-06-18 — 프로젝트 git 초기화 및 commit 스킬 설정

### 변경사항
- `git init` 및 초기 커밋 (58개 파일: Angular 22 + Phaser 4 소스, OMC 기획 문서)
- 전역 `commit` 스킬 생성 (`~/.claude/skills/commit/SKILL.md`)
  - 커밋 지시 시 자동으로 변경 내역 문서화 → changelog 업데이트 → 메모리 갱신 → 커밋 실행
- `run-website` 스킬 생성 후 사용자 지시로 삭제

### 이슈 / 결정사항
- Angular CLI 22는 TTY 전용 출력: 에이전트 환경에서 `ng serve` stdout/stderr 캡처 불가 → 포트 polling으로 준비 확인
- Node.js 기본값 v22.18.0이 Angular 22 미지원 → nvm v24.16.0 필수
- 첫 `ng build` 소요 시간 527초 (Phaser 4 번들 7MB)
