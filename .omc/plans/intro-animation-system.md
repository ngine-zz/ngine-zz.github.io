# Intro 씬 애니메이션 시스템

## 개요

`src/app/intro/intro.component`는 SFood 웹사이트의 진입 화면이다.
원본 픽셀아트 이미지(`v10_AA.png`, 400×172px)를 레이어로 분해하여
하늘·구름·지형·식물 애니메이션을 구현한다.

기획 요구사항은 [`intro-screen-requirements.md`](intro-screen-requirements.md)에서 관리한다.
이 문서는 레이어 구조, 에셋 처리, 좌표계, 애니메이션 방식 등 구현 상세만 다룬다.

---

## 1. 레이어 구조

DOM 순서(위→아래 = 앞→뒤):

| z-index | Element | 설명 |
|---|---|---|
| 1 | `.sky` | CSS 단색 배경, 시간대별 색상 전환 |
| 2 | `.stars` | 별 (밤·황혼만 표시) |
| 3 | `.clouds-layer` | 구름 애니메이션 스트립 |
| 4 | `.landscape` | 지형 PNG |
| 5 | `.flowers-yellow-static` | 노란 풀꽃 정적 PNG |
| 6 | `.plant-sprites` | 흰 꽃잎/꽃술 SVG 스프라이트 |
| 6 | `.cow-adult-wrap` | 어미 소 (NW 정지) |
| 6 | `.cow-calf-wrap` (근거리/원거리) | 송아지 풀 뜯기 애니메이션 |
| 6 | `.cow-sleeping-wrap` | 잠자는 소 SW z Z Z 애니메이션 |
| 7 | `.cow-sitting-wrap` | 앉은 소 SE 정지 |
| 8 | `.flowers-left` / `.flowers-right` | 좌·우 흰꽃 PNG 레이어 |
| 8 | `.rain` / `.snow` / `.lightning` | 날씨 파티클 |
| 9 | `.butterfly-stage` | 나비 시퀀스 |
| 10 | `.content` | 브랜드 문구·CTA (현재 주석 처리) |

Z-index 기준 `.landscape`가 `.clouds-layer` 위에 위치하여 구름이 지형을 덮지 않도록 한다.
흰꽃 레이어(z-index 8)는 소 레이어(z-index 6~7) 위에 위치하여 전경 꽃이 소를 자연스럽게 가린다.
나비(z-index 9)는 흰꽃·날씨 레이어 위에서 자유롭게 이동한다.

각 레이어는 `.scene` 안에서 독립 absolute 레이어로 배치한다. 하늘/구름은 하단 지형과 같은 transform에 묶지 않고, 지형/식물/날씨도 서로 다른 기준점과 애니메이션을 가진다.

---

## 2. 지형 PNG 추출

**파일:** `src/assets/intro-bg/v10_AA_terrain.png`

원본 이미지에서 하늘 영역을 투명화하여 생성한다.
흰꽃 묶음(흰/크림 꽃잎, 꽃에 붙은 짙은 녹색/연두색 줄기와 잎)은 `v10_AA_whiteflowers_left.png`, `v10_AA_whiteflowers_right.png` 투명 PNG 스프라이트 레이어로 분리하고 지형 PNG에서는 주변 잔디 패턴을 샘플링해 메운다. 노란꽃 계열과 어두운 배경색 계열은 흰꽃 스프라이트에서 제외한다.

### 2-1. 하늘 픽셀 투명화 (Flood-fill)

```python
# 상단 10행에서 하늘 팔레트 수집
SKY = set()  # #d0f3f7, #daf0f6, #e3f4f9, #e7f1f3, #f1f7fa, #fafbfa

# 상단 가장자리에서 연결된 하늘 픽셀 Flood-fill → 투명화
```

단순 색상 비교가 아닌 **연결성(connectivity)** 기반으로 처리하여
산 능선 근처의 경계선 아티팩트를 방지한다.

### 2-2. 흰꽃 묶음 분리와 배경 메움

작은 점 SVG 오버레이는 사용하지 않는다.
하단 전경의 좌우 가장자리 흰꽃 묶음을 좌우 PNG 레이어로 분리하고, 지형 PNG의 해당 자리는 주변 녹색 잔디 픽셀을 좌표 기반으로 샘플링해 메워 단색 패치처럼 보이지 않게 한다. 중앙의 노란 풀꽃과 잔디 사이 영역은 원본 지형을 유지한다.

| 추출 색상/영역 | 설명 |
|---|---|
| `#e4e6d4`, `#f1ebdb`, `#f7f2e0`, `#f9f4eb`, `#ebefe6`, `#eaddc6` | 흰꽃 꽃잎 |
| `#f2ecca`, `#dce7ed` | 크림색 꽃잎 2차 |
| `#dfcd6c`, `#e3c967`, `#e4c94b`, `#dfc552` 등 | 노란꽃 계열. 흰꽃 레이어에서 제외 |
| `#1d3a44`, `#272b1f`, `#3c422b` 계열 | 어두운 배경색. 흰꽃 레이어에서 제외 |
| 짙은 녹색/연두색 근접 픽셀 | 꽃에 붙은 줄기와 잎. 사각형 블럭이 보이지 않도록 꽃 주변 타원형/줄기형 마스크만 사용 |

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

4분면 방식으로 수평 seamless + 높이 2배를 동시에 달성:

```
cloud1-seamless.png:
  [ cloud1.png       | h-flip(cloud1.png) ]   → 상단 62px
  [ h-flip(cloud1.png) | cloud1.png       ]   → 하단 62px
  최종: 374×124px

cloud2-seamless.png: 동일 방식 → 254×100px  (참고용 보존, 현재 미사용)
```

- 수평 seamless: 각 row가 `[orig|hflip]` 또는 `[hflip|orig]` 구조라 타일 경계 자연스러움
- 높이 2배: 구름이 상하 대칭으로 더 볼륨감 있게 보임

### 3-3. CSS 스트립 배치

cloud1 단일 그룹, 3겹 레이어:

```
              opacity   bottom   height   속도
cloud-strip--1a  1.0    3vw     31vw    312s  ─┐
cloud-strip--1b  0.45   9.5vw   31vw    430s   │ 사선 드리프트
cloud-strip--1c  0.25   11vw    31vw    600s  ─┘ translate(-X, -Y)
```

**원칙:**
- `width: 300vw` — element가 뷰포트 오른쪽 끝에서 잘리지 않도록
- `background-repeat: repeat-x` + `background-size: auto 100%`
- 애니메이션: `translate(-N×tile_width, -Yvw)` — 정확한 타일 배수만큼 이동 시 seamless loop
- bottom 값: 원래 구름(상단 절반)의 시각적 위치를 기준으로 `bottom = 원래top - height` 계산
- cloud2 그룹(2a/2b/2c) 및 `drift-2` keyframe 제거됨

### 3-4. 타일 폭 계산

```
cloud1-seamless: 374/400 × 100vw = 93.5vw → drift-1: translate(-93.5vw, -4vw)
(cloud2-seamless: 254/400 × 100vw = 63.5vw → 미사용)
```

---

## 4. 지형 좌표계

- 이미지: 400×172px
- CSS: `aspect-ratio: 400/172` → 높이 = `43vw`
- 변환: `bottom = (172 - image_y) / 172 × 43vw`
- 1 SVG unit = `100vw / 400 = 0.25vw`
흰꽃은 지형과 같은 원본 좌표를 사용하고, 지형과 동일한 비율 스케일만 따른다. 별도 수평 spread나 transform 이동은 적용하지 않는다.

---

## 5. 전경 식물 레이어

### 5-1. 레이어 구조

```html
<div class="landscape">
  <div class="season-tint"></div>
</div>

<!-- 좌측 흰꽃 독립 PNG 레이어 (브라우저 왼쪽 기준) -->
<div class="flowers-left"></div>

<!-- 우측 흰꽃 독립 PNG 레이어 (브라우저 오른쪽 기준) -->
<div class="flowers-right"></div>
```

### 5-2. 데이터 소스

| 산출물 | 기준 | 추출 방법 |
|---|---|---|
| `v10_AA_whiteflowers_left.png` | 스크린샷 `2026-06-19 14.16.59` 계열의 좌측 하단 전경 흰꽃 군집 | `v10_AA.png` 하단 전경 좌측 가장자리 영역에서 흰/크림 꽃잎과 꽃술을 제외한 주변 짙은 녹색/연두색 줄기/잎 연결 마스크 |
| `v10_AA_whiteflowers_right.png` | 스크린샷 `2026-06-19 14.17.05` 계열의 우측 하단 전경 흰꽃 군집 | `v10_AA.png` 하단 전경 우측 가장자리 영역에서 흰/크림 꽃잎과 꽃술을 제외한 주변 짙은 녹색/연두색 줄기/잎 연결 마스크 |
| `v10_AA_yellowflowers.png` | 하단 전경의 노란 풀꽃 정적 베이스 | `v10_AA.png` 하단 전경 영역의 노란 꽃 픽셀 마스크 |
| `plant-sprites.ts` | 흰 꽃잎/꽃술 + 일부 노란 풀꽃 조각 | 원본 픽셀 색상별 path 조각을 가진 SVG 스프라이트 데이터. 각 스프라이트는 서로 다른 delay/duration/amplitude를 가진다. |
| `v10_AA_terrain.png` | 원본 지형에서 흰꽃 묶음과 노란 풀꽃이 제거된 배경 | 추출된 식물 픽셀 자리를 주변 잔디 패턴 샘플링으로 대체 |

### 5-3. 식물 흔들림 레이어

작은 점 꽃 SVG 레이어는 사용하지 않는다.
흰꽃 줄기/잎과 노란 풀꽃 전체 형태는 PNG 베이스 레이어로 정지 상태를 유지한다.
흰 꽃잎/꽃술과 하단 전경의 일부 노란 풀꽃 조각은 `plant-sprites.ts`의 SVG 스프라이트로 렌더링하고, 일부 스프라이트에만 `petal-sway` 흔들림 애니메이션을 적용한다.
노란 풀꽃 전경선은 좌우가 높고 중앙이 낮으므로 단일 y값 대신 x 위치별 곡선형 하한선(`yellow_foreground_min_y`)으로 후보를 나눈다.
언덕/중경의 노란 지형·풀꽃 영역은 흔들림 후보에서 제외한다.
각 스프라이트는 생성 시점에 결정된 지연 시간, 지속 시간, 좌우 진폭, 상하 진폭, 회전각을 가진다.
레이어 전체를 한꺼번에 움직이는 애니메이션은 사용하지 않는다.
`prefers-reduced-motion: reduce` 환경에서는 식물 흔들림을 비활성화한다.

### 5-4. 흰꽃 레이어 반응형

흰꽃은 원본 배경 이미지에서 픽셀을 추출한 투명 PNG를 좌/우 레이어로 분리하여 각각 브라우저 가장자리를 기준으로 배치한다.

```
left image layer    = v10_AA_whiteflowers_left.png  (123×172px)
right image layer   = v10_AA_whiteflowers_right.png (126×172px)
layer height        = 43vw
left layer width    = 43vw × 123 / 172 = 30.75vw
right layer width   = 43vw × 126 / 172 = 31.5vw
left anchor         = left: 0
right anchor        = right: 0
left position       = left: 0
right position      = right: 0
movement            = none
```

- 좌/우 PNG는 400×172 전체 투명 캔버스가 아니라 실제 흰꽃 가로 범위만 crop한 이미지여야 한다.
- 좌측/우측 cropped PNG 레이어는 각각 브라우저 왼쪽/오른쪽에 붙인 상태로 지형과 같은 비율만 따른다.
- 좁은 화면과 넓은 화면 모두 별도 좌우 이동을 적용하지 않는다.
- 흰꽃 묶음 자체는 DOM 점으로 재작성하지 않고 원본 이미지 픽셀을 사용한다.
- 흰꽃 배경 PNG 레이어의 반응형 위치는 `transform` 애니메이션이 아니라 `left/right` 위치값으로 조정한다.
- 모바일 폭에서도 흰꽃 레이어를 숨기지 않는다. 겹침은 반응형 연출의 일부다.

---

## 6. 소·나비 레이어

### 6-1. 소 레이어 구성

| 요소 | 에셋 | 위치 | z-index | 설명 |
|---|---|---|---|---|
| 어미 소 | `cow/adult-north-west.png` | left 52%, bottom 10vw | 6 | 정지 이미지 |
| 근거리 송아지 | `cow/calf-graze-south-east-{0..8}.png` | left 57%, bottom 10.3vw | 6 | 9프레임 풀 뜯기, 220ms 간격 |
| 원거리 송아지 | `cow/calf-graze-north-west-{0..8}.png` | left 38%, bottom 12vw | 5 (하단 수정 필요) | 9프레임, 근거리와 4프레임 오프셋 |
| 앉은 소 | `cow/sitting-cow-south-east.png` | left 31%, bottom 7.5vw | 7 | 정지 이미지 |
| 잠자는 소 | `cow/sleeping-cow-sw-{0..8}.png` | left 73%, bottom 4vw | 6 | 9프레임 z Z Z 애니메이션, 200ms 간격, size 14vw |

### 6-2. 잠자는 소 애니메이션

PixelLab 오브젝트(ID: `4174afc9-13ce-499f-a12f-37ef0d8ac81a`)의 SW 방향 9프레임 애니메이션.
소 머리 위로 z → Z → Z 텍스트가 점점 나타났다 사라지는 루프.

```typescript
sleepingCowTimer = setInterval(() => {
  sleepingCowFrame.update(f => (f + 1) % 9);
}, 200);
```

### 6-3. 나비 시퀀스

PixelLab 오브젝트의 SW 방향 fly/sit 에셋 사용.

**상태 머신:** `hidden → flying-in → sitting → flying-out → hidden → (반복)`

| 상태 | 에셋 | 시간 | 설명 |
|---|---|---|---|
| `flying-in` | `butterfly/fly-sw-{0..8}.png` | 14s | 우측 화면 밖 → 착지점, 날개짓 50ms |
| `sitting` | `butterfly/sit-sw.png` | 5s | 착지 직후·이륙 직전 각 450ms 날개짓 |
| `flying-out` | `butterfly/fly-sw-{0..8}.png` | 6s | 착지점 → 좌측 화면 밖, 날개짓 50ms |
| `hidden` | — | 5s | 다음 시퀀스 대기 |

**착지점:** `left: 21.5%, bottom: 4.5vw` (z-index: 9)

**sitting 날개짓 타이밍:**
- 0ms: 날개짓 시작 (착지 settle)
- 450ms: 정지 → `sit-sw.png`
- 4550ms: 날개짓 재시작 (이륙 warmup, flying-out으로 자연 연결)
- 5000ms: `flying-out` 전환

**CSS 애니메이션:** `data-phase` 어트리뷰트 기반으로 Angular 컴포넌트 스타일에서 phase별 keyframe 적용.

---

## 7. 하늘·날씨 시스템

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

## 8. 에셋 목록

```
src/assets/intro-bg/
  v10_AA.png                       원본 픽셀아트 (수정 금지)
  v10_AA_terrain.png               하늘 투명 + 식물 제거 자리 잔디 패턴 메움 버전
  v10_AA_whiteflowers_left.png     좌측 흰꽃 줄기/잎 정적 베이스 PNG
  v10_AA_whiteflowers_right.png    우측 흰꽃 줄기/잎 정적 베이스 PNG
  v10_AA_yellowflowers.png         노란 풀꽃 정적 베이스 투명 PNG
  cloud1.png                       cloud1 스프라이트
  cloud1-seamless.png              cloud1 심리스 타일 (374×124px)
  cloud2-seamless.png              cloud2 심리스 타일 (참고용, 미사용)

  cow/
    adult-north-west.png           어미 소 NW 정지
    sitting-cow-south-east.png     앉은 소 SE 정지
    calf-graze-south-east-{0..8}.png  근거리 송아지 풀 뜯기 9프레임
    calf-graze-north-west-{0..8}.png  원거리 송아지 풀 뜯기 9프레임
    sleeping-cow-south-west.png    잠자는 소 SW 정적 (참고용)
    sleeping-cow-sw-{0..8}.png     잠자는 소 SW z Z Z 애니메이션 9프레임

  butterfly/
    fly-sw-{0..8}.png              나비 SW 날개짓 9프레임
    sit-sw.png                     나비 SW 앉은 정지 이미지
```

**소·나비 에셋 출처:** PixelLab (https://pixellab.ai) — MCP 도구로 다운로드.

**재생성 방법:** `python3 scripts/extract_intro_white_flowers.py` 및 Python + Pillow 스크립트 (이 문서 §2, §3 참조). 이 스크립트는 `src/app/intro/plant-sprites.ts`도 함께 갱신한다.

---

## 9. 알려진 제약

- `preserveAspectRatio="none"` 사용으로 SVG가 컨테이너 비율에 맞게 비균등 스케일될 수 있으나, `.landscape`가 `aspect-ratio: 400/172`를 유지하므로 실제로는 균등 스케일
- 구름 `width: 300vw` 설정으로 DOM에서 뷰포트 밖 영역이 생성됨 — `overflow: hidden`이 `.scene`에 있으므로 시각적 영향 없음
