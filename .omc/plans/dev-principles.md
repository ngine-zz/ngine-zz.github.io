# 개발 원칙

> 이 문서만 수정해 개발 원칙을 변경합니다.  
> 작성일: 2026-06-18

---

## Angular + Phaser 통합

- Angular 컴포넌트 안에서 Phaser 인스턴스를 관리한다.
- Phaser 캔버스는 `ngOnInit` / `ngOnDestroy` 생명주기에 맞춰 초기화·정리한다.
- 게임 로직은 Phaser Scene 단위로 분리하고, UI/라우팅은 Angular가 담당한다.

## 문서 관리

- 세부 기획 변경 시 `CLAUDE.md`가 아닌 해당 `.omc/plans/` 문서를 수정한다.
- `CLAUDE.md`에는 핵심 요약과 문서 색인만 기록한다.

## 에셋 관리

- 원본 GIF는 `public/assets/_source_gifs/` 에 보관하고 절대 삭제하지 않는다.
- 변환된 스프라이트시트는 `npm run assets` 로 자동 생성한다.
- 에셋 추가 시 레지스트리(`.registry.json`)는 자동 갱신되므로 수동 편집하지 않는다.
