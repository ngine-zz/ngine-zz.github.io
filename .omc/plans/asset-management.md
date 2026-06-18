# 에셋 관리 가이드

> 이 문서만 수정해 에셋 관리 방식을 변경합니다.  
> 마지막 수정: 2026-06-18

---

## 1. 폴더 구조

```
public/assets/
│
├── _source_gifs/          ← PixelLab에서 받은 원본 GIF 보관 (절대 삭제 금지)
│   ├── player/
│   │   ├── idle/
│   │   └── walk/
│   ├── npcs/
│   │   └── employee_01/
│   ├── animals/
│   │   ├── cow/
│   │   ├── duck/
│   │   └── pig/
│   └── objects/
│       └── products/
│
├── sprites/               ← 변환된 스프라이트시트 (자동 생성, git 제외 가능)
│   ├── player/
│   │   ├── idle/
│   │   │   ├── mascot_idle_n.png    ← 스프라이트시트
│   │   │   ├── mascot_idle_n.json   ← Phaser 메타데이터
│   │   │   └── ...
│   │   ├── walk/
│   │   └── interact/
│   ├── npcs/
│   │   └── employee_01/
│   │       ├── idle/
│   │       └── walk/
│   ├── animals/
│   │   ├── cow/
│   │   ├── duck/
│   │   └── pig/
│   └── objects/
│       ├── products/
│       └── signs/
│
├── tilesets/              ← 배경 타일 PNG (Tiled에서 참조)
├── tilemaps/              ← Tiled 맵 파일 (.tmj)
├── ui/                    ← HUD, 대화창, 조이스틱 이미지
└── audio/                 ← BGM, 효과음
```

---

## 2. 네이밍 컨벤션

**규칙**: `{캐릭터}_{액션}_{방향}.{확장자}`

| 토큰 | 값 |
|---|---|
| 캐릭터 | `mascot`, `emp01`, `emp02`, `cow`, `duck`, `pig` |
| 액션 | `idle`, `walk`, `interact`, `bounce` |
| 방향 | `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw` (4방향은 `n/s/e/w`) |

**예시**:
```
mascot_walk_ne.gif        ← 원본 GIF
mascot_walk_ne.png        ← 변환된 스프라이트시트
mascot_walk_ne.json       ← Phaser 메타데이터
emp01_idle_s.gif
cow_walk_r.gif            ← 동물은 l/r (좌/우)
sausage_bounce.gif        ← 오브젝트
```

---

## 3. PixelLab → 프로젝트 파이프라인

```
1. PixelLab에서 GIF 생성
        ↓
2. public/assets/_source_gifs/{분류}/{파일명}.gif 로 저장
        ↓
3. 자동 감지 (watch 모드) 또는 npm run assets 실행
        ↓
4. public/assets/sprites/ 에 .png + .json 자동 생성
   public/assets/_source_gifs/.registry.json 자동 갱신
        ↓
5. Phaser BootScene에서 JSON 읽어 로드
```

---

## 4. 에셋 관리 스크립트

**위치**: `scripts/assets.js`

| 명령어 | 동작 |
|---|---|
| `npm run assets` | 신규 GIF 변환 + 레지스트리 갱신 |
| `npm run assets:status` | 현황 리포트 (변환 없음) |
| `npm run assets:watch` | 파일 추가 감지 → 자동 변환 |
| `npm run assets:force` | 전체 재변환 (기존 파일 덮어쓰기) |

**레지스트리 파일**: `_source_gifs/.registry.json`
- 자동 생성·갱신 — 직접 편집하지 않습니다
- `pixellabId` 필드만 예외적으로 수동 입력 가능 (한 번 입력하면 재갱신 시 유지됨)

---

## 5. Phaser에서 로딩

변환된 JSON 메타데이터를 읽어 spritesheet로 등록합니다.

```typescript
// BootScene.ts
preload() {
  // JSON 메타 자동 읽기 유틸 함수 사용
  loadSprite(this, 'mascot_idle_n',  'player/idle');
  loadSprite(this, 'mascot_walk_n',  'player/walk');
  loadSprite(this, 'emp01_idle_s',   'npcs/employee_01/idle');
}

// 유틸 함수
function loadSprite(scene: Phaser.Scene, key: string, dir: string) {
  const meta = require(`../../public/assets/sprites/${dir}/${key}.json`);
  scene.load.spritesheet(key, `assets/sprites/${dir}/${key}.png`, {
    frameWidth: meta.frameWidth,
    frameHeight: meta.frameHeight,
  });
}
```

---

## 6. Git 관리 정책

| 폴더 | Git 포함 여부 | 이유 |
|---|---|---|
| `_source_gifs/` | ✅ 포함 | 원본 에셋, 재생성 불가 |
| `sprites/` (변환본) | ⬜ 선택 | 자동 생성 가능 → 용량 절약 위해 제외 가능 |
| `tilesets/`, `tilemaps/` | ✅ 포함 | 수동 제작 원본 |
| `audio/` | ✅ 포함 | 원본 |

`sprites/` 제외 시 `.gitignore`에 추가:
```
public/assets/sprites/
```
→ 새 개발자는 `npm run assets`로 재생성
