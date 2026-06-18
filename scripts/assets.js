#!/usr/bin/env node
/**
 * assets.js — 에셋 자동 관리 CLI
 *
 * GIF를 _source_gifs/ 폴더에 넣기만 하면 자동으로 감지·변환·레지스트리 갱신이 됩니다.
 *
 * Usage:
 *   npm run assets              GIF 스캔 + 변환 + 레지스트리 갱신
 *   npm run assets:status       현황 리포트 (변환 없음)
 *   npm run assets:watch        파일 추가 감지 → 자동 변환
 *   npm run assets:force        전체 재변환 (기존 파일 덮어쓰기)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve('public/assets/_source_gifs');
const SPRITES_DIR = path.resolve('public/assets/sprites');
const REGISTRY_FILE = path.join(SOURCE_DIR, '.registry.json');

// ── 파일명 파싱 ──────────────────────────────────────────────────
// 규칙: {character}_{action}_{direction}.gif
// 예:  mascot_idle_n.gif → { character:'mascot', action:'idle', direction:'n' }
//      sausage_bounce.gif → { character:'sausage', action:'bounce', direction:'' }
function parseName(stem) {
  const tokens = stem.split('_');
  if (tokens.length >= 3) {
    return {
      direction: tokens[tokens.length - 1],
      action: tokens[tokens.length - 2],
      character: tokens.slice(0, -2).join('_'),
    };
  }
  return { character: tokens[0], action: tokens[1] ?? '', direction: '' };
}

// ── GIF 경로 → 레지스트리 엔트리 ────────────────────────────────
function entryFromPath(gifPath) {
  const rel = path.relative(SOURCE_DIR, gifPath).replace(/\\/g, '/'); // player/idle/mascot_idle_n.gif
  const id = rel.replace(/\.gif$/, '');                                // player/idle/mascot_idle_n
  const category = rel.split('/')[0];                                  // player | npcs | animals | objects
  const stem = path.basename(gifPath, '.gif');                         // mascot_idle_n
  const { character, action, direction } = parseName(stem);

  return { id, category, character, action, direction };
}

// ── 스프라이트시트 출력 경로 계산 ────────────────────────────────
function outPaths(gifPath) {
  const rel = path.relative(SOURCE_DIR, gifPath).replace(/\\/g, '/');
  const base = path.join(SPRITES_DIR, rel.replace(/\.gif$/, ''));
  return { png: base + '.png', json: base + '.json' };
}

// ── GIF → 가로 스프라이트시트 변환 ──────────────────────────────
async function convertGif(gifPath, { force = false } = {}) {
  const { png, json } = outPaths(gifPath);

  if (!force && fs.existsSync(png)) return null; // 이미 변환됨

  fs.mkdirSync(path.dirname(png), { recursive: true });

  const img = sharp(gifPath, { animated: true });
  const meta = await img.metadata();
  const frameCount = meta.pages ?? 1;
  const fw = meta.width;
  const fh = meta.pageHeight ?? meta.height;

  const frames = await Promise.all(
    Array.from({ length: frameCount }, (_, i) =>
      sharp(gifPath, { page: i }).png().toBuffer()
    )
  );

  await sharp({
    create: { width: fw * frameCount, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(frames.map((buf, i) => ({ input: buf, left: i * fw, top: 0 })))
    .png()
    .toFile(png);

  const sheetMeta = { frameWidth: fw, frameHeight: fh, frameCount, sheetWidth: fw * frameCount, sheetHeight: fh };
  fs.writeFileSync(json, JSON.stringify(sheetMeta, null, 2));
  return sheetMeta;
}

// ── _source_gifs/ 재귀 스캔 ──────────────────────────────────────
function scanGifs() {
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.gif')) results.push(full);
    }
  }
  walk(SOURCE_DIR);
  return results;
}

// ── 레지스트리 갱신 ──────────────────────────────────────────────
// GIF 스캔 결과 + 스프라이트시트 존재 여부를 합산해 .registry.json 생성
function syncRegistry() {
  const prev = loadRegistry();
  const prevMap = Object.fromEntries(prev.assets.map(a => [a.id, a]));

  const assets = scanGifs().map(gifPath => {
    const entry = entryFromPath(gifPath);
    const { png, json } = outPaths(gifPath);
    const sheetExists = fs.existsSync(png);
    const sheetMeta = sheetExists && fs.existsSync(json)
      ? JSON.parse(fs.readFileSync(json, 'utf8'))
      : {};

    return {
      ...entry,
      status: sheetExists ? 'done' : 'pending',
      frameCount: sheetMeta.frameCount ?? null,
      frameWidth: sheetMeta.frameWidth ?? null,
      frameHeight: sheetMeta.frameHeight ?? null,
      pixellabId: prevMap[entry.id]?.pixellabId ?? '', // 기존 값 유지
      updatedAt: new Date().toISOString(),
    };
  });

  const done = assets.filter(a => a.status === 'done').length;
  const registry = {
    generatedAt: new Date().toISOString(),
    summary: { total: assets.length, done, pending: assets.length - done },
    assets,
  };

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
  return registry;
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) return { assets: [] };
  try { return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8')); }
  catch { return { assets: [] }; }
}

// ── 커맨드: status ───────────────────────────────────────────────
function cmdStatus() {
  const reg = syncRegistry();
  const { total, done, pending } = reg.summary;

  const bar = (n, t) => '█'.repeat(Math.round((n / (t || 1)) * 20)).padEnd(20, '░');

  console.log('\n📦  에셋 현황\n');
  console.log(`  [${bar(done, total)}] ${done}/${total}  (⏳ ${pending}개 대기)\n`);

  const byCategory = reg.assets.reduce((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  for (const [cat, list] of Object.entries(byCategory)) {
    const catDone = list.filter(a => a.status === 'done').length;
    console.log(`  ${cat}  ${catDone}/${list.length}`);
    for (const a of list) {
      const icon = a.status === 'done' ? '✅' : '⏳';
      const dim = a.frameCount ? `  ${a.frameWidth}×${a.frameHeight}px ×${a.frameCount}f` : '';
      console.log(`    ${icon}  ${a.id}${dim}`);
    }
    console.log();
  }
}

// ── 커맨드: sync ─────────────────────────────────────────────────
async function cmdSync({ force = false } = {}) {
  const gifs = scanGifs();
  if (gifs.length === 0) {
    console.log('\n⚠️  _source_gifs/ 에 GIF가 없습니다.\n');
    return;
  }

  console.log(`\n🔄  ${gifs.length}개 GIF 처리 중...\n`);
  let converted = 0;

  for (const gifPath of gifs) {
    const rel = path.relative(SOURCE_DIR, gifPath);
    const meta = await convertGif(gifPath, { force });
    if (meta) {
      console.log(`  ✅  ${rel}  (${meta.frameCount}프레임, ${meta.frameWidth}×${meta.frameHeight}px)`);
      converted++;
    } else {
      console.log(`  ⏭   ${rel}  (스킵)`);
    }
  }

  const reg = syncRegistry();
  console.log(`\n✨  완료: ${converted}개 변환  |  전체 ${reg.summary.done}/${reg.summary.total} 완료\n`);
}

// ── 커맨드: watch ────────────────────────────────────────────────
function cmdWatch() {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  console.log('\n👁   _source_gifs/ 감시 중... (GIF를 폴더에 넣으면 자동 변환됩니다)\n');

  let timer;
  const queue = new Set();

  fs.watch(SOURCE_DIR, { recursive: true }, (_, filename) => {
    if (!filename?.endsWith('.gif')) return;
    const full = path.join(SOURCE_DIR, filename);
    queue.add(full);
    clearTimeout(timer);
    timer = setTimeout(async () => {
      for (const gifPath of queue) {
        if (!fs.existsSync(gifPath)) continue;
        const rel = path.relative(SOURCE_DIR, gifPath);
        console.log(`\n📥  감지: ${rel}`);
        const meta = await convertGif(gifPath).catch(e => { console.error('  ❌', e.message); return null; });
        if (meta) {
          console.log(`  ✅  변환 완료 (${meta.frameCount}프레임)`);
          syncRegistry();
        }
      }
      queue.clear();
    }, 400);
  });
}

// ── CLI 진입점 ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const cmd = args.find(a => !a.startsWith('--')) ?? 'sync';
const force = args.includes('--force');

({ status: cmdStatus, sync: () => cmdSync({ force }), watch: cmdWatch }[cmd] ?? (() => {
  console.log(`\n사용법:
  node scripts/assets.js status          현황 리포트
  node scripts/assets.js sync            변환 + 레지스트리 갱신
  node scripts/assets.js sync --force    전체 재변환
  node scripts/assets.js watch           파일 감지 자동 변환\n`);
}))();
