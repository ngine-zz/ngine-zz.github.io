# Intro 씬 애니메이션 시스템

## 개요

`src/app/intro/intro.component`는 S-Food 웹사이트의 진입 화면이다.
원본 픽셀아트 이미지(`v10_AA.png`, 400×172px)를 레이어로 분해하여
하늘·구름·지형·식물 애니메이션을 구현한다.

---

## 1. 레이어 구조

DOM 순서(위→아래 = 앞→뒤):

| 레이어 | Element | 설명 |
|---|---|---|
| 1 | `.sky` | CSS 단색 배경, 시간대별 색상 전환 |
| 2 | `.stars` | 별 (밤·황혼만 표시) |
| 3 | `.clouds-layer` | 구름 애니메이션 스트립 |
| 4 | `.white-flowers-layer` | 흰꽃 SVG 독립 레이어 |
| 5 | `.landscape` | 지형 PNG + 풀·꽃 SVG 오버레이 |
| 6 | `.rain / .snow / .lightning` | 날씨 파티클 |

`.landscape`가 `.clouds-layer` 뒤에 위치하므로
지형 PNG의 투명 하늘 영역을 통해 구름이 비쳐 보인다.

---

## 2. 지형 PNG 추출

**파일:** `src/assets/intro-bg/v10_AA_terrain.png`

원본 이미지에서 하늘 영역을 투명화하여 생성한다.

### 2-1. 하늘 픽셀 투명화 (Flood-fill)

```python
# 상단 10행에서 하늘 팔레트 수집
SKY = set()  # #d0f3f7, #daf0f6, #e3f4f9, #e7f1f3, #f1f7fa, #fafbfa

# 상단 가장자리에서 연결된 하늘 픽셀 Flood-fill → 투명화
```

단순 색상 비교가 아닌 **연결성(connectivity)** 기반으로 처리하여
산 능선 근처의 경계선 아티팩트를 방지한다.

### 2-2. 식물 픽셀 투명화

풀잎·꽃·흰꽃 픽셀을 SVG 오버레이로 이관하면서 지형 PNG에서 제거한다.

| 제거 색상 | 설명 |
|---|---|
| `#e4e6d4`, `#f1ebdb`, `#f7f2e0`, `#f9f4eb`, `#ebefe6`, `#eaddc6` | 흰꽃 꽃잎 |
| `#f9f4eb`, `#e7f1f3`, `#fafbfa`, `#f1f7fa` | Sky-like 잔여 픽셀 |
| `#f2ecca`, `#dce7ed` | 크림색 꽃잎 2차 |
| `#e4c94b`, `#dfc552` 등 (복합 꽃 위치만) | 노란 꽃술 |

---

## 3. 구름 애니메이션

### 3-1. 스프라이트 추출

원본에서 구름 픽셀만 크롭:

| 파일 | 원본 좌표 | 크기 |
|---|---|---|
| `cloud1.png` | x=0~186, y=3~64 | 187×62px |
| `cloud2.png` | x=273~399, y=2~51 | 127×50px |

구름 색상: `#fafbfa`, `#e3f4f9`, `#f1f7fa`, `#daf0f6`, `#e7f1f3`
나머지 픽셀은 투명화.

### 3-2. 심리스 타일 생성

```
cloud1-seamless.png = [cloud1.png | h-flip(cloud1.png)]  → 374×62px
cloud2-seamless.png = [cloud2.png | h-flip(cloud2.png)]  → 254×50px
```

좌우 반전 이미지를 나란히 붙이면 타일 경계가 자연스럽게 이어진다.

### 3-3. CSS 스트립 배치

각 구름 타입별 3겹 레이어, 각 레이어마다 다른 속도:

```
              opacity   bottom    속도
cloud-strip--1a  1.0   23.5vw   312s  ─┐
cloud-strip--1b  0.75  25vw     430s   │ 사선 드리프트
cloud-strip--1c  0.5   26.5vw  600s  ─┘ translate(-X, -Y)

cloud-strip--2a  1.0   27vw    295s
cloud-strip--2b  0.75  28vw    410s
cloud-strip--2c  0.5   29vw    560s
```

**원칙:**
- `width: 300vw` — element가 뷰포트 오른쪽 끝에서 잘리지 않도록
- `background-repeat: repeat-x` + `background-size: auto 100%`
- 애니메이션: `translate(-N×tile_width, -Yvw)` — 정확한 타일 배수만큼 이동 시 seamless loop

### 3-4. 타일 폭 계산

```
cloud1-seamless: 374/400 × 100vw = 93.5vw → drift-1: translate(-93.5vw, -4vw)
cloud2-seamless: 254/400 × 100vw = 63.5vw → 2타일 = 127vw → drift-2: translate(-127vw, -3vw)
```

---

## 4. 지형 좌표계

- 이미지: 400×172px
- CSS: `aspect-ratio: 400/172` → 높이 = `43vw`
- 변환: `bottom = (172 - image_y) / 172 × 43vw`
- 1 SVG unit = `100vw / 400 = 0.25vw`

---

## 5. 식물 바람 애니메이션

### 5-1. SVG 오버레이 구조

```html
<div class="landscape">
  <!-- 복합 꽃(흰꽃+노란꽃술) 전용 SVG -->
  <svg class="grass-overlay" viewBox="0 0 400 172" preserveAspectRatio="none">
    <g class="flower-dot" ...>
      <rect fill="rgba(249,244,235,0.92)" .../>  <!-- 흰 꽃잎 3×3 -->
      <rect fill="#e4c94b" .../>                 <!-- 노란 꽃술 1×1 -->
    </g>
  </svg>

  <!-- 풀잎 + 노란꽃 + 흰꽃 SVG -->
  <svg class="grass-overlay" viewBox="0 0 400 172" preserveAspectRatio="none">
    <rect class="blade" .../>        <!-- 풀잎: width=1, height=h -->
    <line class="flower-dot" .../>   <!-- 노란꽃: stroke 세로선 -->
    <!-- 흰꽃은 white-flowers-layer에서 렌더링 -->
  </svg>
</div>

<!-- 흰꽃 독립 레이어 (landscape 외부) -->
<div class="white-flowers-layer">
  <svg viewBox="0 0 400 172" preserveAspectRatio="none">
    <rect class="flower-dot" .../>  <!-- 2×2 흰꽃 -->
  </svg>
</div>
```

### 5-2. 데이터 소스

| 상수 | 요소 수 | 추출 방법 |
|---|---|---|
| `SCENE_GRASS` | 86 | 수동 추출 (픽셀 좌표) |
| `SCENE_FLOWERS` | 51 | 수동 추출 (노란색 계열) |
| `SCENE_WHITE_FLOWERS` | ~60 | Python 클러스터링, brightness>235 + 주변 녹색 + 가장자리(x<90 or x>300) |
| `SCENE_COMPOUND_FLOWERS` | 8 | 노란 픽셀 주변 흰 픽셀 탐색 |

### 5-3. 애니메이션

`rotateZ` 대신 `translateX` 사용 — SVG `transform-box` 의존성 없이 안정 동작:

```scss
@keyframes sway-blade {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(1px); }
  75%       { transform: translateX(-1px); }
}

@keyframes sway-flower {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(1px); }
  75%       { transform: translateX(-1px); }
}
```

- 풀잎: 4s 사이클, 각 딜레이 0~2s
- 꽃: 5s 사이클, 각 딜레이 0~2.5s
- `alternate` 미사용 — 완전한 사이클 키프레임으로 끊김 없는 `infinite` 루프

### 5-4. 흰꽃 레이어 반응형

```scss
.white-flowers-layer {
  @media (max-width: 640px) { display: none; }
}
```

---

## 6. 하늘·날씨 시스템

### 6-1. 하늘 색상

이미지 실제 픽셀값 기반 단색 (`linear-gradient` 미사용):

| 시간대 | 색상 |
|---|---|
| day / morning | `#d0f3f7` |
| golden | `#d0c4a0` |
| dawn / sunset | `#6b3a5a` |
| dusk | `#1a1a3a` |
| night | `#08080f` |

### 6-2. 날씨 효과

| 날씨 | 효과 |
|---|---|
| rain / heavy-rain / thunder | `.drop` 파티클 120개 |
| snow | `.flake` 파티클 60개 |
| thunder | `.lightning` 플래시 레이어 |
| cloudy 이상 | `filter: brightness() saturate()` on `.sky` |

---

## 7. 에셋 목록

```
src/assets/intro-bg/
  v10_AA.png              원본 픽셀아트 (수정 금지)
  v10_AA_terrain.png      하늘·식물 투명화 버전 (생성)
  cloud1.png              cloud1 스프라이트 (생성)
  cloud2.png              cloud2 스프라이트 (생성)
  cloud1-seamless.png     cloud1 심리스 타일 (생성)
  cloud2-seamless.png     cloud2 심리스 타일 (생성)
```

**재생성 방법:** Python + Pillow 스크립트 (이 문서 §2, §3 참조)

---

## 8. 알려진 제약

- `preserveAspectRatio="none"` 사용으로 SVG가 컨테이너 비율에 맞게 비균등 스케일될 수 있으나, `.landscape`가 `aspect-ratio: 400/172`를 유지하므로 실제로는 균등 스케일
- 구름 `width: 300vw` 설정으로 DOM에서 뷰포트 밖 영역이 생성됨 — `overflow: hidden`이 `.scene`에 있으므로 시각적 영향 없음
- `SCENE_WHITE_FLOWERS`의 중앙 위치(x=100~300)는 의도적으로 제외 — 지형 노이즈 픽셀과 구분 어려움
