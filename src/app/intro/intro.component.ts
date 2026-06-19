import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { PLANT_SPRITES } from './plant-sprites';

type TimeOfDay      = 'dawn' | 'morning' | 'day' | 'golden' | 'sunset' | 'dusk' | 'night';
type Season         = 'spring' | 'summer' | 'autumn' | 'winter';
type Weather        = 'sunny' | 'cloudy' | 'rain' | 'heavy-rain' | 'snow' | 'thunder';
type ButterflyPhase = 'hidden' | 'flying-in' | 'sitting' | 'flying-out';

// 하늘 색상 — 이미지 실제 픽셀값 기반 단색
// 낮: #d0f3f7 (이미지 하늘 원색), 시간대별 블렌딩
const SKY: Record<TimeOfDay, string> = {
  dawn:    '#6b3a5a',
  morning: '#d0f3f7',
  day:     '#d0f3f7',
  golden:  '#d0c4a0',
  sunset:  '#6b3a5a',
  dusk:    '#1a1a3a',
  night:   '#08080f',
};

// 풍경은 항상 원본 유지. 시간대 광원은 ambient 오버레이만으로 처리.
const AMBIENT: Record<TimeOfDay, string> = {
  dawn:    'rgba(30,10,0,0.42)',
  morning: 'rgba(255,210,120,0.08)',
  day:     'transparent',
  golden:  'rgba(255,180,60,0.18)',
  sunset:  'rgba(200,80,60,0.18)',
  dusk:    'rgba(10,5,40,0.58)',
  night:   'rgba(0,0,18,0.75)',
};

const SEASON_TINT: Record<Season, string> = {
  spring: 'rgba(255,220,235,0.18)',
  summer: 'transparent',
  autumn: 'rgba(255,140,0,0.22)',
  winter: 'rgba(180,210,255,0.38)',
};

const WEATHER_SKY_FILTER: Record<Weather, string> = {
  sunny:        'none',
  cloudy:       'brightness(0.88) saturate(0.75)',
  rain:         'brightness(0.75) saturate(0.6)',
  'heavy-rain': 'brightness(0.6) saturate(0.5)',
  snow:         'brightness(1.1) saturate(0.35)',
  thunder:      'brightness(0.55) saturate(0.4)',
};

const CLOUD_COLOR: Record<Weather, string> = {
  sunny:        'rgba(255,255,255,0.92)',
  cloudy:       'rgba(180,190,200,0.88)',
  rain:         'rgba(75,85,105,0.92)',
  'heavy-rain': 'rgba(60,70,90,0.95)',
  snow:         'rgba(220,230,242,0.95)',
  thunder:      'rgba(55,60,80,0.95)',
};

const WEATHER_POOLS: Record<Season, Weather[]> = {
  spring: ['sunny', 'sunny', 'cloudy', 'rain', 'thunder'],
  summer: ['sunny', 'sunny', 'sunny', 'cloudy', 'rain'],
  autumn: ['sunny', 'cloudy', 'cloudy', 'rain', 'thunder'],
  winter: ['snow', 'snow', 'cloudy', 'rain', 'sunny'],
};

// ── SVG Scene Data ──────────────────────────────────────────────
// Polygon silhouettes extracted pixel-by-pixel from v10_AA.png (400×172)
// viewBox="0 0 400 172" preserveAspectRatio="none" → fills any screen

const SCENE_PATHS = {
  // Blue-gray far mountains
  mountain: '0,72 2,72 4,72 6,73 8,67 10,67 12,69 14,68 16,71 18,72 20,74 22,76 24,72 26,75 28,76 30,77 32,78 34,77 36,78 38,78 40,82 42,84 44,84 46,80 48,78 50,79 52,83 54,83 56,85 58,84 60,86 62,87 64,90 66,89 68,92 70,84 72,84 74,80 76,79 78,78 80,77 82,77 84,76 86,75 88,74 90,74 92,73 94,73 96,73 98,72 100,72 102,73 104,70 106,68 108,68 110,68 112,67 114,65 116,64 118,63 120,62 122,61 124,59 126,59 128,58 130,56 132,54 134,56 136,55 138,53 140,54 142,53 144,54 146,54 148,54 150,54 152,55 154,54 156,55 158,53 160,52 162,51 164,49 166,49 168,49 170,48 172,49 174,50 176,49 178,51 180,50 182,51 184,50 186,51 188,49 190,48 192,48 194,50 196,48 198,47 200,41 202,45 204,44 206,41 208,40 210,40 212,40 214,37 216,36 218,34 220,32 222,32 224,29 226,28 228,25 230,24 232,24 234,22 236,24 238,24 240,26 242,27 244,29 246,32 248,31 250,33 252,34 254,36 256,37 258,38 260,36 262,40 264,41 266,38 268,40 270,39 272,43 274,42 276,40 278,40 280,40 282,40 284,40 286,40 288,40 290,39 292,38 294,39 296,38 298,37 300,39 302,39 304,40 306,41 308,40 310,40 312,39 314,39 316,38 318,37 320,37 322,36 324,35 326,33 328,32 330,31 332,30 334,31 336,32 338,33 340,34 342,36 344,39 346,39 348,43 350,43 352,46 354,45 356,49 358,52 360,52 362,65 364,61 366,59 368,55 370,52 372,54 374,53 376,53 378,172 380,172 382,63 384,49 386,48 388,47 390,48 392,49 394,51 396,48 398,47 399,49 399,172 0,172',
  // Dark forest silhouette
  forest:   '0,107 2,107 4,68 6,92 8,92 10,98 12,99 14,102 16,103 18,106 20,70 22,172 24,103 26,172 28,112 30,75 32,104 34,105 36,99 38,172 40,80 42,80 44,75 46,111 48,172 50,172 52,120 54,117 56,101 58,109 60,110 62,114 64,113 66,86 68,84 70,90 72,172 74,172 76,122 78,111 80,108 82,116 84,172 86,94 88,118 90,121 92,172 94,92 96,172 98,172 100,172 102,129 104,113 106,94 108,124 110,124 112,120 114,95 116,99 118,109 120,172 122,87 124,100 126,97 128,115 130,89 132,98 134,138 136,104 138,135 140,112 142,97 144,96 146,103 148,116 150,104 152,101 154,104 156,104 158,172 160,107 162,107 164,110 166,123 168,102 170,102 172,103 174,110 176,103 178,104 180,172 182,102 184,104 186,104 188,104 190,103 192,103 194,103 196,103 198,103 200,103 202,172 204,172 206,103 208,172 210,116 212,134 214,172 216,172 218,172 220,109 222,106 224,114 226,114 228,114 230,106 232,115 234,117 236,116 238,114 240,104 242,102 244,90 246,111 248,106 250,86 252,109 254,107 256,91 258,88 260,96 262,95 264,91 266,86 268,95 270,99 272,94 274,96 276,93 278,90 280,87 282,93 284,93 286,86 288,84 290,97 292,84 294,98 296,98 298,102 300,81 302,131 304,97 306,83 308,80 310,104 312,78 314,80 316,78 318,120 320,77 322,172 324,73 326,85 328,172 330,67 332,94 334,83 336,75 338,69 340,107 342,62 344,83 346,60 348,172 350,65 352,63 354,63 356,61 358,59 360,66 362,79 364,105 366,109 368,111 370,172 372,99 374,172 376,172 378,60 380,85 382,50 384,91 386,90 388,91 390,92 392,46 394,98 396,101 398,172 399,90 399,172 0,172',
  // Warm yellow-green hill
  hill:     '0,121 2,121 4,124 6,121 8,121 10,124 12,120 14,121 16,122 18,125 20,124 22,125 24,125 26,126 28,124 30,126 32,133 34,127 36,128 38,128 40,128 42,128 44,128 46,129 48,127 50,129 52,129 54,130 56,129 58,131 60,131 62,131 64,172 66,132 68,129 70,131 72,134 74,172 76,135 78,134 80,172 82,132 84,132 86,142 88,135 90,136 92,136 94,136 96,135 98,138 100,138 102,137 104,138 106,139 108,138 110,137 112,96 114,172 116,93 118,139 120,93 122,91 124,92 126,94 128,92 130,140 132,90 134,91 136,146 138,89 140,141 142,141 144,121 146,121 148,120 150,120 152,120 154,121 156,119 158,119 160,100 162,102 164,117 166,117 168,116 170,116 172,101 174,102 176,120 178,120 180,103 182,121 184,113 186,113 188,111 190,112 192,111 194,111 196,109 198,108 200,108 202,108 204,108 206,107 208,106 210,104 212,104 214,104 216,103 218,102 220,101 222,102 224,100 226,100 228,100 230,99 232,97 234,97 236,96 238,95 240,96 242,95 244,131 246,132 248,129 250,140 252,93 254,132 256,92 258,91 260,130 262,130 264,129 266,135 268,128 270,127 272,127 274,126 276,126 278,91 280,91 282,91 284,122 286,90 288,139 290,137 292,88 294,119 296,117 298,86 300,94 302,94 304,135 306,93 308,93 310,92 312,92 314,98 316,83 318,81 320,172 322,93 324,89 326,89 328,89 330,78 332,78 334,130 336,87 338,88 340,76 342,74 344,74 346,73 348,75 350,76 352,127 354,73 356,74 358,126 360,125 362,123 364,122 366,124 368,124 370,74 372,123 374,123 376,121 378,123 380,122 382,121 384,117 386,172 388,120 390,121 392,120 394,120 396,120 398,172 399,172 399,172 0,172',
  // Green ground base
  ground:   '0,172 2,126 4,146 6,127 8,135 10,132 12,137 14,129 16,137 18,136 20,130 22,133 24,127 26,131 28,134 30,130 32,131 34,132 36,136 38,132 40,136 42,133 44,131 46,138 48,135 50,132 52,136 54,138 56,158 58,136 60,137 62,135 64,140 66,138 68,134 70,137 72,138 74,136 76,142 78,142 80,142 82,138 84,142 86,137 88,143 90,143 92,139 94,142 96,139 98,134 100,140 102,140 104,142 106,144 108,143 110,143 112,147 114,141 116,142 118,145 120,121 122,122 124,122 126,122 128,122 130,123 132,129 134,122 136,127 138,128 140,128 142,125 144,124 146,124 148,124 150,124 152,124 154,125 156,125 158,125 160,125 162,129 164,126 166,129 168,128 170,129 172,126 174,126 176,126 178,126 180,127 182,130 184,128 186,131 188,129 190,131 192,129 194,128 196,128 198,128 200,128 202,128 204,129 206,129 208,129 210,129 212,129 214,129 216,132 218,130 220,131 222,130 224,130 226,149 228,132 230,136 232,131 234,132 236,112 238,132 240,132 242,133 244,133 246,93 248,138 250,150 252,149 254,143 256,137 258,146 260,143 262,131 264,137 266,147 268,137 270,142 272,142 274,137 276,145 278,146 280,139 282,142 284,139 286,142 288,114 290,145 292,140 294,141 296,142 298,140 300,138 302,137 304,109 306,139 308,136 310,138 312,140 314,137 316,140 318,136 320,134 322,135 324,137 326,134 328,136 330,133 332,135 334,132 336,133 338,132 340,132 342,136 344,132 346,133 348,131 350,132 352,132 354,132 356,131 358,131 360,133 362,129 364,129 366,130 368,133 370,128 372,130 374,125 376,157 378,127 380,132 382,125 384,122 386,134 388,126 390,122 392,124 394,127 396,128 398,172 399,131 399,172 0,172',
};


@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent implements OnInit, OnDestroy {
  readonly timeOfDay = signal<TimeOfDay>('day');
  readonly season    = signal<Season>('summer');
  readonly weather   = signal<Weather>('sunny');

  // Derived signals
  readonly skyGradient      = computed(() => SKY[this.timeOfDay()]);
  readonly ambientColor     = computed(() => AMBIENT[this.timeOfDay()]);
  readonly seasonTint       = computed(() => SEASON_TINT[this.season()]);
  readonly weatherSkyFilter = computed(() => WEATHER_SKY_FILTER[this.weather()]);
  readonly cloudColor       = computed(() => CLOUD_COLOR[this.weather()]);
  readonly showRain         = computed(() => ['rain', 'heavy-rain', 'thunder'].includes(this.weather()));
  readonly showSnow         = computed(() => this.weather() === 'snow');
  readonly showLightning    = computed(() => this.weather() === 'thunder');
  readonly showStars        = computed(() => ['night', 'dusk'].includes(this.timeOfDay()));

  // SVG landscape data
  readonly scenePaths           = SCENE_PATHS;
  readonly plantSprites         = PLANT_SPRITES;

  // 송아지 걷기 애니메이션 (9프레임)
  readonly calfWalkFrame = signal(0);
  readonly calfFrameSrc  = computed(() =>
    `/assets/intro-bg/cow/calf-graze-south-east-${this.calfWalkFrame()}.png`
  );
  readonly calfFrameSrc2 = computed(() =>
    `/assets/intro-bg/cow/calf-graze-north-west-${(this.calfWalkFrame() + 4) % 9}.png`
  );
  private calfTimer?: ReturnType<typeof setInterval>;

  // 잠자는 소 애니메이션 (9프레임 z Z Z)
  readonly sleepingCowFrame    = signal(0);
  readonly sleepingCowFrameSrc = computed(() =>
    `/assets/intro-bg/cow/sleeping-cow-sw-${this.sleepingCowFrame()}.png`
  );
  private sleepingCowTimer?: ReturnType<typeof setInterval>;

  // 나비 시퀀스
  readonly butterflyPhase    = signal<ButterflyPhase>('hidden');
  readonly butterflyFrame    = signal(0);
  readonly sittingFlap       = signal(false);
  readonly butterflyFrameSrc = computed(() =>
    `/assets/intro-bg/butterfly/fly-sw-${this.butterflyFrame()}.png`
  );
  private butterflyFlyTimer?: ReturnType<typeof setInterval>;
  private butterflySeqTimer?: ReturnType<typeof setTimeout>;
  private sittingIdleTimers: ReturnType<typeof setTimeout>[] = [];

  // Weather particles
  readonly rainDrops = Array.from({ length: 120 }, () => ({
    left:     Math.random() * 100,
    delay:    Math.random() * 2,
    duration: 0.4 + Math.random() * 0.4,
  }));

  readonly snowFlakes = Array.from({ length: 60 }, () => ({
    left:     Math.random() * 100,
    delay:    Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size:     2 + Math.floor(Math.random() * 3) * 2,
  }));

  // Stars
  readonly stars = Array.from({ length: 80 }, () => ({
    x:     Math.random() * 100,
    y:     Math.random() * 55,
    delay: Math.random() * 4,
    large: Math.random() > 0.75,
  }));

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.timeOfDay.set('day'); // TODO: syncTime()으로 교체
    this.season.set('summer');
    this.weather.set('sunny');
    // this.syncTime();
    // this.timer = setInterval(() => this.syncTime(), 60_000);
    this.calfTimer = setInterval(() => {
      this.calfWalkFrame.update(f => (f + 1) % 9);
    }, 220);
    this.sleepingCowTimer = setInterval(() => {
      this.sleepingCowFrame.update(f => (f + 1) % 9);
    }, 200);
    this.butterflySeqTimer = setTimeout(() => this.runButterflySequence(), 2000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearInterval(this.calfTimer);
    clearInterval(this.sleepingCowTimer);
    clearInterval(this.butterflyFlyTimer);
    clearTimeout(this.butterflySeqTimer);
    this.clearSittingIdle();
  }

  private runButterflySequence() {
    this.butterflyPhase.set('flying-in');
    this.startWingFlap();

    this.butterflySeqTimer = setTimeout(() => {
      this.stopWingFlap();
      this.butterflyPhase.set('sitting');
      this.startSittingIdle();

      this.butterflySeqTimer = setTimeout(() => {
        this.clearSittingIdle();
        this.sittingFlap.set(false);
        this.butterflyPhase.set('flying-out');
        this.startWingFlap();

        this.butterflySeqTimer = setTimeout(() => {
          this.stopWingFlap();
          this.butterflyPhase.set('hidden');
          this.butterflySeqTimer = setTimeout(() => this.runButterflySequence(), 5000);
        }, 6000);
      }, 5000);
    }, 14000);
  }

  private startWingFlap() {
    clearInterval(this.butterflyFlyTimer);
    this.butterflyFlyTimer = setInterval(() => {
      this.butterflyFrame.update(f => (f + 1) % 9);
    }, 50);
  }

  private stopWingFlap() {
    clearInterval(this.butterflyFlyTimer);
  }

  private startSittingIdle() {
    this.clearSittingIdle();

    // 착지 직후: 바로 날개짓 → 450ms 후 정지
    this.sittingFlap.set(true);
    this.startWingFlap();
    const t1 = setTimeout(() => {
      this.stopWingFlap();
      this.sittingFlap.set(false);
    }, 450);
    this.sittingIdleTimers.push(t1);

    // 이륙 직전 450ms: 다시 날개짓 시작 (flying-out으로 자연스럽게 이어짐)
    const t2 = setTimeout(() => {
      this.sittingFlap.set(true);
      this.startWingFlap();
    }, 4550);
    this.sittingIdleTimers.push(t2);
  }

  private clearSittingIdle() {
    this.sittingIdleTimers.forEach(t => clearTimeout(t));
    this.sittingIdleTimers = [];
  }

  private syncTime() {
    const now = new Date();
    this.timeOfDay.set(this.calcTimeOfDay(now.getHours()));
    this.season.set(this.calcSeason(now.getMonth() + 1));
    this.weather.set(this.pickWeather());
  }

  private calcTimeOfDay(h: number): TimeOfDay {
    if (h >= 5  && h < 7)  return 'dawn';
    if (h >= 7  && h < 10) return 'morning';
    if (h >= 10 && h < 16) return 'day';
    if (h >= 16 && h < 18) return 'golden';
    if (h >= 18 && h < 20) return 'sunset';
    if (h >= 20 && h < 22) return 'dusk';
    return 'night';
  }

  private calcSeason(m: number): Season {
    if (m >= 3 && m <= 5)  return 'spring';
    if (m >= 6 && m <= 8)  return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  private pickWeather(): Weather {
    const pool = WEATHER_POOLS[this.season()];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
