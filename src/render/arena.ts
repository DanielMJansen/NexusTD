import type { StageDef } from '../data/stages';
import { drawSwampLife, paintSwampStatic } from './arenaSwamp';
import { ARENA } from '../data/config';

const TAU = Math.PI * 2;
const { width: W, height: H, center } = ARENA;

/** Gerador com semente: o cenário fica igual a cada carregamento. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Prop {
  kind: 'tomb' | 'cross' | 'tree' | 'rock';
  x: number;
  y: number;
  size: number;
  tilt: number;
}

const rand = seeded(7);
const props: Prop[] = [];
// Lápides, cruzes e pedras espalhadas, longe do Nexus.
while (props.length < 26) {
  const x = 20 + rand() * (W - 40);
  const y = 20 + rand() * (H - 30);
  if (Math.hypot(x - center.x, (y - center.y) * 1.3) < 140) continue;
  if (props.some((p) => Math.hypot(p.x - x, p.y - y) < 34)) continue;
  const roll = rand();
  props.push({
    kind: roll < 0.5 ? 'tomb' : roll < 0.75 ? 'cross' : 'rock',
    x,
    y,
    size: 0.8 + rand() * 0.5,
    tilt: (rand() - 0.5) * 0.3,
  });
}
// Árvores secas nos cantos.
for (const [x, y, size] of [
  [36, 70, 1.3],
  [606, 64, 1.2],
  [40, 320, 1.1],
  [600, 316, 1.25],
] as const) {
  props.push({ kind: 'tree', x, y, size, tilt: 0 });
}
props.sort((a, b) => a.y - b.y);

const groundSpecks = Array.from({ length: 420 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 0.4 + rand() * 1.6,
  light: rand() < 0.5,
}));

const candles = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * TAU + 0.5;
  return { x: center.x + Math.cos(a) * 96, y: center.y + Math.sin(a) * 74, phase: rand() * 10 };
});

const fog = Array.from({ length: 7 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 80 + rand() * 90,
  speed: 4 + rand() * 6,
}));

let cache: HTMLCanvasElement | null = null;
let cacheBiome = '';

/** Chão, props estáticos e névoa do bioma. A parte estática é desenhada uma vez em cache. */
export function drawBackground(ctx: CanvasRenderingContext2D, time: number, stage: StageDef): void {
  const target = ctx.canvas;
  if (!cache || cache.width !== target.width || cache.height !== target.height || cacheBiome !== stage.biome) {
    cacheBiome = stage.biome;
    cache = document.createElement('canvas');
    cache.width = target.width;
    cache.height = target.height;
    const c = cache.getContext('2d')!;
    c.setTransform(target.width / W, 0, 0, target.height / H, 0, 0);
    if (stage.biome === 'swamp') paintSwampStatic(c, stage.terrain);
    else paintStatic(c);
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(cache, 0, 0);
  ctx.restore();

  if (stage.biome === 'swamp') drawSwampLife(ctx, time, stage.terrain);
  drawRuneCircle(ctx, time);
  if (stage.biome === 'graveyard') for (const candle of candles) drawCandle(ctx, candle.x, candle.y, time + candle.phase);
}

/** Névoa e vinheta por cima de tudo. */
export function drawAtmosphere(ctx: CanvasRenderingContext2D, time: number): void {
  for (const f of fog) {
    const x = ((f.x + time * f.speed) % (W + 2 * f.r)) - f.r;
    const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r);
    g.addColorStop(0, '#b9a6e012');
    g.addColorStop(1, '#b9a6e000');
    ctx.fillStyle = g;
    ctx.fillRect(x - f.r, f.y - f.r, f.r * 2, f.r * 2);
  }
  const v = ctx.createRadialGradient(center.x, center.y, H * 0.35, center.x, center.y, W * 0.62);
  v.addColorStop(0, '#00000000');
  v.addColorStop(1, '#05020bcc');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function paintStatic(ctx: CanvasRenderingContext2D): void {
  const ground = ctx.createRadialGradient(center.x, center.y, 30, center.x, center.y, W * 0.6);
  ground.addColorStop(0, '#2b2140');
  ground.addColorStop(0.5, '#1c1630');
  ground.addColorStop(1, '#0d0a18');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, W, H);

  for (const s of groundSpecks) {
    ctx.fillStyle = s.light ? '#ffffff0a' : '#00000030';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fill();
  }

  // pátio de pedras ao redor do Nexus
  const plaza = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 120);
  plaza.addColorStop(0, '#3a2d58');
  plaza.addColorStop(0.75, '#2a2142');
  plaza.addColorStop(1, '#2a214200');
  ctx.fillStyle = plaza;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, 130, 100, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#120c20aa';
  ctx.lineWidth = 1;
  for (let ring = 30; ring <= 90; ring += 20) {
    ctx.beginPath();
    ctx.ellipse(center.x, center.y + 4, ring * 1.25, ring, 0, 0, TAU);
    ctx.stroke();
    const stones = Math.round(ring / 4);
    for (let i = 0; i < stones; i++) {
      const a = (i / stones) * TAU + ring;
      ctx.beginPath();
      ctx.moveTo(center.x + Math.cos(a) * ring * 1.25, center.y + 4 + Math.sin(a) * ring);
      ctx.lineTo(center.x + Math.cos(a) * (ring + 20) * 1.25, center.y + 4 + Math.sin(a) * (ring + 20));
      ctx.stroke();
    }
  }

  for (const prop of props) paintProp(ctx, prop);
}

function paintProp(ctx: CanvasRenderingContext2D, p: Prop): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = '#05020a66';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * p.size, 3 * p.size, 0, 0, TAU);
  ctx.fill();
  ctx.scale(p.size, p.size);
  ctx.rotate(p.tilt);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 1.2;
  switch (p.kind) {
    case 'tomb': {
      const g = ctx.createLinearGradient(-7, -16, 7, 0);
      g.addColorStop(0, '#5a5274');
      g.addColorStop(1, '#2c2640');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(-7, -16, 14, 17, [7, 7, 1, 1]);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#1a1428';
      ctx.beginPath();
      ctx.moveTo(-3, -9);
      ctx.lineTo(3, -9);
      ctx.moveTo(-3, -6);
      ctx.lineTo(2, -6);
      ctx.stroke();
      ctx.fillStyle = '#3f6a3a';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 4, 1.6, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cross':
      ctx.fillStyle = '#4a4262';
      ctx.beginPath();
      ctx.rect(-1.8, -19, 3.6, 20);
      ctx.rect(-6.5, -14, 13, 3.4);
      ctx.fill();
      ctx.stroke();
      break;
    case 'rock':
      ctx.fillStyle = '#3a3450';
      ctx.beginPath();
      ctx.ellipse(0, -3, 7, 4.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff12';
      ctx.beginPath();
      ctx.ellipse(-2, -5, 3, 1.5, 0, 0, TAU);
      ctx.fill();
      break;
    case 'tree':
      ctx.strokeStyle = '#120b1e';
      ctx.lineCap = 'round';
      for (const [w, path] of [
        [6, [0, 0, 0, -26]],
        [3.4, [0, -14, -12, -26]],
        [3, [0, -20, 11, -32]],
        [2.4, [0, -26, -4, -38]],
        [1.8, [-8, -22, -16, -24]],
        [1.6, [7, -27, 15, -28]],
        [1.4, [-12, -26, -14, -34]],
      ] as const) {
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(path[0], path[1]);
        ctx.lineTo(path[2], path[3]);
        ctx.stroke();
      }
      break;
  }
  ctx.restore();
}

function drawRuneCircle(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.save();
  ctx.translate(center.x, center.y + 4);
  ctx.scale(1.25, 1);
  for (const [radius, speed, count] of [
    [58, 0.15, 10],
    [86, -0.1, 14],
  ] as const) {
    ctx.strokeStyle = '#8a5cff44';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + time * speed;
      const glow = 0.45 + 0.35 * Math.sin(time * 2 + i * 1.7);
      ctx.save();
      ctx.rotate(a);
      ctx.translate(radius, 0);
      ctx.strokeStyle = `rgba(190, 150, 255, ${glow})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // runa: pequenas hastes que variam com o índice
      ctx.moveTo(-2.5, -3);
      ctx.lineTo(-2.5, 3);
      if (i % 2) {
        ctx.moveTo(-2.5, -3);
        ctx.lineTo(2, 0);
        ctx.lineTo(-2.5, 3);
      } else {
        ctx.moveTo(2, -3);
        ctx.lineTo(2, 3);
        ctx.moveTo(-2.5, 0);
        ctx.lineTo(2, i % 3 ? -2 : 2);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawCandle(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  const flicker = 0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 17) * 0.07;
  const halo = ctx.createRadialGradient(x, y - 9, 0, x, y - 9, 26 * flicker);
  halo.addColorStop(0, '#ffb34a40');
  halo.addColorStop(1, '#ffb34a00');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y - 9, 26 * flicker, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#e8dcc0';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(x - 2, y - 7, 4, 8, 1);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd77a';
  ctx.beginPath();
  ctx.ellipse(x, y - 10, 1.6 * flicker, 3 * flicker, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.ellipse(x, y - 9.5, 0.7, 1.4, 0, 0, TAU);
  ctx.fill();
}

/** Cristal flutuante do Nexus, com brilho que avermelha quando ferido. `hurt` = 1 logo após levar dano. */
export function drawNexus(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, time: number, hurt: number): void {
  const ratio = Math.max(0, hp / maxHp);
  const float = Math.sin(time * 2) * 3;
  const { x, y } = center;

  // luz no chão
  const pool = ctx.createRadialGradient(x, y + 12, 4, x, y + 12, 60);
  pool.addColorStop(0, hurt > 0 ? `rgba(255, 80, 90, ${0.35 + hurt * 0.3})` : '#a070ff55');
  pool.addColorStop(1, '#a070ff00');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 60, 30, 0, 0, TAU);
  ctx.fill();

  // pedestal
  ctx.fillStyle = '#2a2240';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 18, 7, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a3058';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 14, 5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // estilhaços orbitando
  for (let i = 0; i < 3; i++) {
    const a = time * 1.4 + (i / 3) * TAU;
    const ox = x + Math.cos(a) * 24;
    const oy = y - 14 + float + Math.sin(a) * 7;
    if (Math.sin(a) < 0) drawShard(ctx, ox, oy, 3.2);
  }

  const cy = y - 16 + float;
  const top = cy - 26;
  const bottom = cy + 18;
  const lowHp = ratio < 0.3;
  ctx.save();
  ctx.shadowColor = hurt > 0 || lowHp ? '#ff4a5a' : '#b36bff';
  ctx.shadowBlur = 26 + Math.sin(time * 3) * 6;
  // faces do cristal
  const faces: [string, number[]][] = [
    [lowHp ? '#b0304a' : '#7a3cf0', [x, top, x - 14, cy, x, bottom]],
    [lowHp ? '#e05068' : '#a26bff', [x, top, x + 14, cy, x, bottom]],
    [lowHp ? '#ff9aa8' : '#dcc4ff', [x, top, x + 14, cy, x + 3, cy - 2]],
    [lowHp ? '#ff6a7a' : '#b98cff', [x, top, x - 14, cy, x - 2, cy - 4]],
  ];
  for (const [color, pts] of faces) {
    ctx.fillStyle = color;
    ctx.beginPath();
    poly(ctx, pts);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#1a0c30';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  poly(ctx, [x, top, x + 14, cy, x, bottom, x - 14, cy]);
  ctx.stroke();
  if (hurt > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${hurt * 0.6})`;
    ctx.beginPath();
    poly(ctx, [x, top, x + 14, cy, x, bottom, x - 14, cy]);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffffcc';
  ctx.beginPath();
  poly(ctx, [x + 2, top + 8, x + 6, cy - 6, x + 3, cy - 4]);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const a = time * 1.4 + (i / 3) * TAU;
    if (Math.sin(a) >= 0) drawShard(ctx, x + Math.cos(a) * 24, y - 14 + float + Math.sin(a) * 7, 3.2);
  }

  // barra de vida
  const bw = 54;
  const by = top - 14;
  ctx.fillStyle = '#07040dcc';
  ctx.strokeStyle = '#0a0612';
  ctx.beginPath();
  ctx.roundRect(x - bw / 2 - 1, by - 1, bw + 2, 7, 3.5);
  ctx.fill();
  ctx.stroke();
  const bar = ctx.createLinearGradient(0, by, 0, by + 5);
  bar.addColorStop(0, lowHp ? '#ff8a8a' : '#8af5bc');
  bar.addColorStop(1, lowHp ? '#c62c3a' : '#2fae6a');
  ctx.fillStyle = bar;
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, by, bw * ratio, 5, 2.5);
  ctx.fill();
}

function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#c9a8ff';
  ctx.strokeStyle = '#1a0c30';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  poly(ctx, [x, y - s * 1.6, x + s, y, x, y + s * 1.6, x - s, y]);
  ctx.fill();
  ctx.stroke();
}

function poly(ctx: CanvasRenderingContext2D, pts: number[]): void {
  ctx.moveTo(pts[0]!, pts[1]!);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i]!, pts[i + 1]!);
  ctx.closePath();
}
