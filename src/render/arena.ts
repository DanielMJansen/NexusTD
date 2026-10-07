import { drawDesertLife, paintDesertStatic } from './arenaDesert';
import { drawTundraLife, paintTundraStatic } from './arenaTundra';
import { NEXUS_MODELS, type NexusModelId, type NexusPalette } from '../data/nexusSkins';
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

type Pt = { x: number; y: number };

/** Distância de um ponto à trilha mais próxima (para não pôr túmulos no caminho). */
function distToPaths(stage: StageDef, x: number, y: number): number {
  let best = Infinity;
  for (const e of stage.entrances ?? []) {
    for (let i = 1; i < e.path.length; i++) {
      const a = e.path[i - 1]!;
      const b = e.path[i]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)));
    }
  }
  return best;
}

interface GraveyardLayout {
  props: Prop[];
  specks: { x: number; y: number; r: number; light: boolean }[];
  candles: { x: number; y: number; phase: number }[];
}

const layouts = new Map<string, GraveyardLayout>();

/** Lápides, cruzes, pedras e árvores espalhadas pelo mundo, longe do Nexus e das alamedas. */
function graveyardLayout(stage: StageDef, world: { width: number; height: number }, nexus: Pt): GraveyardLayout {
  const key = `${stage.id}:${world.width}x${world.height}`;
  const cached = layouts.get(key);
  if (cached) return cached;
  const rand = seeded(7);
  const area = (world.width * world.height) / (W * H);
  const props: Prop[] = [];
  for (let tries = 0; props.length < Math.round(26 * area) && tries < 4000; tries++) {
    const x = 30 + rand() * (world.width - 60);
    const y = 30 + rand() * (world.height - 44);
    if (Math.hypot(x - nexus.x, (y - nexus.y) * 1.3) < 140) continue;
    if (distToPaths(stage, x, y) < 34) continue;
    if (props.some((p) => Math.hypot(p.x - x, p.y - y) < 34)) continue;
    const roll = rand();
    props.push({ kind: roll < 0.5 ? 'tomb' : roll < 0.75 ? 'cross' : 'rock', x, y, size: 0.8 + rand() * 0.5, tilt: (rand() - 0.5) * 0.3 });
  }
  // árvores secas nos cantos
  for (const [fx, fy, size] of [
    [0.06, 0.19, 1.3],
    [0.95, 0.18, 1.2],
    [0.06, 0.89, 1.1],
    [0.94, 0.88, 1.25],
  ] as const) {
    props.push({ kind: 'tree', x: fx * world.width, y: fy * world.height, size, tilt: 0 });
  }
  props.sort((p, q) => p.y - q.y);
  const specks = Array.from({ length: Math.round(420 * area) }, () => ({ x: rand() * world.width, y: rand() * world.height, r: 0.4 + rand() * 1.6, light: rand() < 0.5 }));
  const candles = Array.from({ length: 6 }, (_, i) => {
    const t = (i / 6) * TAU + 0.5;
    return { x: nexus.x + Math.cos(t) * 96, y: nexus.y + Math.sin(t) * 74, phase: rand() * 10 };
  });
  const layout = { props, specks, candles };
  layouts.set(key, layout);
  return layout;
}

const rand = seeded(11);
const fog = Array.from({ length: 7 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 80 + rand() * 90,
  speed: 4 + rand() * 6,
}));

let cache: HTMLCanvasElement | null = null;
let cacheBiome = '';

/** Chão, props estáticos e névoa do bioma. A parte estática é desenhada uma vez em cache. */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  time: number,
  stage: StageDef,
  world: { width: number; height: number } = { width: W, height: H },
  nexus: Pt = center,
): void {
  // cache do mundo inteiro na resolução da tela; desenhado no espaço do mundo (a câmera já está no contexto)
  const pxPerUnit = ctx.canvas.width / W;
  const cw = Math.round(world.width * pxPerUnit);
  const ch = Math.round(world.height * (ctx.canvas.height / H));
  if (!cache || cache.width !== cw || cache.height !== ch || cacheBiome !== stage.id) {
    cacheBiome = stage.id;
    cache = document.createElement('canvas');
    cache.width = cw;
    cache.height = ch;
    const c = cache.getContext('2d')!;
    c.setTransform(cw / world.width, 0, 0, ch / world.height, 0, 0);
    if (stage.biome === 'swamp') paintSwampStatic(c, stage, world, nexus);
    else if (stage.biome === 'tundra') paintTundraStatic(c, stage, world, nexus);
    else if (stage.biome === 'desert') paintDesertStatic(c, stage, world, nexus);
    else paintStatic(c, stage, world, nexus);
  }
  ctx.drawImage(cache, 0, 0, world.width, world.height);

  if (stage.biome === 'swamp') drawSwampLife(ctx, time, stage.terrain?.kind === 'mud' ? stage.terrain : undefined, world);
  if (stage.biome === 'tundra') drawTundraLife(ctx, time, world);
  if (stage.biome === 'desert') drawDesertLife(ctx, time, world);
  drawRuneCircle(ctx, time, nexus);
  if (stage.biome === 'graveyard') for (const candle of graveyardLayout(stage, world, nexus).candles) drawCandle(ctx, candle.x, candle.y, time + candle.phase);
}

/** Névoa e vinheta por cima de tudo. */
export function drawAtmosphere(ctx: CanvasRenderingContext2D, time: number, bright = false): void {
  if (bright) {
    // fases claras: só uma vinheta leve e azulada
    drawCachedVignette(ctx, '#1a2a4a55', 0.45, 0.7);
    return;
  }
  for (const f of fog) {
    const x = ((f.x + time * f.speed) % (W + 2 * f.r)) - f.r;
    const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r);
    g.addColorStop(0, '#b9a6e012');
    g.addColorStop(1, '#b9a6e000');
    ctx.fillStyle = g;
    ctx.fillRect(x - f.r, f.y - f.r, f.r * 2, f.r * 2);
  }
  drawCachedVignette(ctx, '#05020bcc', 0.35, 0.62);
}

let vignette: { canvas: HTMLCanvasElement; key: string } | null = null;

/** Vinheta escura (ou clara) desenhada uma vez por tamanho de tela e só colada a cada quadro. */
function drawCachedVignette(ctx: CanvasRenderingContext2D, color: string, inner: number, outer: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const key = `${w}x${h}:${color}`;
  if (!vignette || vignette.key !== key) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext('2d')!;
    const sx = w / W;
    const sy = h / H;
    c.setTransform(sx, 0, 0, sy, 0, 0);
    const v = c.createRadialGradient(center.x, center.y, H * inner, center.x, center.y, W * outer);
    v.addColorStop(0, '#00000000');
    v.addColorStop(1, color);
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);
    vignette = { canvas, key };
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(vignette.canvas, 0, 0);
  ctx.restore();
}

function paintStatic(ctx: CanvasRenderingContext2D, stage: StageDef, world: { width: number; height: number }, nexus: Pt): void {
  const layout = graveyardLayout(stage, world, nexus);
  const ground = ctx.createRadialGradient(nexus.x, nexus.y, 30, nexus.x, nexus.y, Math.max(world.width, world.height) * 0.6);
  ground.addColorStop(0, '#2b2140');
  ground.addColorStop(0.5, '#1c1630');
  ground.addColorStop(1, '#0d0a18');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, world.width, world.height);

  for (const s of layout.specks) {
    ctx.fillStyle = s.light ? '#ffffff0a' : '#00000030';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fill();
  }

  // alamedas de pedra seguindo as trilhas
  for (const e of stage.entrances ?? []) {
    for (const [color, width] of [
      ['#2e2648', 30],
      ['#3a3058', 22],
    ] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      e.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.lineTo(nexus.x, nexus.y);
      ctx.stroke();
    }
    // lajes
    const slab = seeded(e.path.length * 31 + Math.round(e.path[0]!.x));
    ctx.fillStyle = '#4a4068';
    for (let i = 1; i < e.path.length; i++) {
      const p = e.path[i - 1]!;
      const q = e.path[i]!;
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      for (let d = 8; d < len; d += 16) {
        const t = d / len;
        ctx.beginPath();
        ctx.ellipse(p.x + (q.x - p.x) * t + (slab() - 0.5) * 8, p.y + (q.y - p.y) * t + (slab() - 0.5) * 8, 4.5, 3, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  // pátio de pedras ao redor do Nexus
  const plaza = ctx.createRadialGradient(nexus.x, nexus.y, 10, nexus.x, nexus.y, 120);
  plaza.addColorStop(0, '#3a2d58');
  plaza.addColorStop(0.75, '#2a2142');
  plaza.addColorStop(1, '#2a214200');
  ctx.fillStyle = plaza;
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y, 130, 100, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#120c20aa';
  ctx.lineWidth = 1;
  for (let ring = 30; ring <= 90; ring += 20) {
    ctx.beginPath();
    ctx.ellipse(nexus.x, nexus.y + 4, ring * 1.25, ring, 0, 0, TAU);
    ctx.stroke();
    const stones = Math.round(ring / 4);
    for (let i = 0; i < stones; i++) {
      const t = (i / stones) * TAU + ring;
      ctx.beginPath();
      ctx.moveTo(nexus.x + Math.cos(t) * ring * 1.25, nexus.y + 4 + Math.sin(t) * ring);
      ctx.lineTo(nexus.x + Math.cos(t) * (ring + 20) * 1.25, nexus.y + 4 + Math.sin(t) * (ring + 20));
      ctx.stroke();
    }
  }

  for (const prop of layout.props) paintProp(ctx, prop);
  if (stage.decor?.walls) paintWalls(ctx, stage, world);
}

/** Muro de pedra ao redor do cemitério, com portões onde as trilhas entram. */
function paintWalls(ctx: CanvasRenderingContext2D, stage: StageDef, world: { width: number; height: number }): void {
  const inset = 14;
  const gates = (stage.entrances ?? []).map((e) => e.path[1] ?? e.path[0]!);
  const gap = 34;
  const segment = (x1: number, y1: number, x2: number, y2: number) => {
    // corta o muro onde há portão
    const horizontal = y1 === y2;
    const cuts = gates
      .filter((g) => (horizontal ? Math.abs(g.y - y1) < 60 : Math.abs(g.x - x1) < 60))
      .map((g) => (horizontal ? g.x : g.y))
      .sort((p, q) => p - q);
    let from = horizontal ? x1 : y1;
    const to = horizontal ? x2 : y2;
    const pieces: [number, number][] = [];
    for (const c of cuts) {
      if (c - gap / 2 > from) pieces.push([from, c - gap / 2]);
      from = c + gap / 2;
    }
    if (from < to) pieces.push([from, to]);
    for (const [p, q] of pieces) {
      ctx.fillStyle = '#3a3450';
      ctx.strokeStyle = '#0a0612';
      ctx.lineWidth = 1.2;
      const rect = horizontal ? [p, y1 - 5, q - p, 10] : [x1 - 5, p, 10, q - p];
      ctx.fillRect(rect[0]!, rect[1]!, rect[2]!, rect[3]!);
      ctx.strokeRect(rect[0]!, rect[1]!, rect[2]!, rect[3]!);
      // ameias
      ctx.fillStyle = '#4a4262';
      for (let k = p + 6; k < q - 4; k += 14) {
        if (horizontal) ctx.fillRect(k, y1 - 8, 6, 4);
        else ctx.fillRect(x1 - 8, k, 4, 6);
      }
    }
    // pilares dos portões
    for (const c of cuts) {
      for (const side of [-1, 1]) {
        const px = horizontal ? c + side * (gap / 2 + 3) : x1;
        const py = horizontal ? y1 : c + side * (gap / 2 + 3);
        ctx.fillStyle = '#5a5274';
        ctx.strokeStyle = '#0a0612';
        ctx.fillRect(px - 5, py - 12, 10, 16);
        ctx.strokeRect(px - 5, py - 12, 10, 16);
        ctx.fillStyle = '#ffb34a88';
        ctx.beginPath();
        ctx.arc(px, py - 14, 2, 0, TAU);
        ctx.fill();
      }
    }
  };
  segment(inset, inset, world.width - inset, inset);
  segment(inset, world.height - inset, world.width - inset, world.height - inset);
  segment(inset, inset, inset, world.height - inset);
  segment(world.width - inset, inset, world.width - inset, world.height - inset);
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

function drawRuneCircle(ctx: CanvasRenderingContext2D, time: number, at: Pt = center): void {
  ctx.save();
  ctx.translate(at.x, at.y + 4);
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
/** Aparência resolvida do Nexus (modelo e paleta já definidos para esta fase). */
export interface NexusAppearance {
  model: NexusModelId;
  palette: NexusPalette;
  /** Aurora: matiz girando com o tempo. */
  animated?: boolean;
}

export const DEFAULT_NEXUS: NexusAppearance = { model: 'crystal', palette: NEXUS_MODELS.crystal.palette };

/** Nexus inteiro (luz no chão, modelo, barra de vida). Ferido/com pouca vida, as cores puxam para o vermelho. */
export function drawNexus(
  ctx: CanvasRenderingContext2D,
  hp: number,
  maxHp: number,
  time: number,
  hurt: number,
  look: NexusAppearance = DEFAULT_NEXUS,
  at: { x: number; y: number } = center,
): void {
  const ratio = Math.max(0, hp / maxHp);
  const lowHp = ratio < 0.3;
  const { x, y } = at;
  const float = Math.sin(time * 2) * 3;
  const top = drawNexusModel(ctx, x, y, time, look, hurt, lowHp, float);
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

/** Desenha só o modelo do Nexus (também usado na prévia do menu). Devolve o topo do desenho. */
export function drawNexusModel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  look: NexusAppearance,
  hurt = 0,
  lowHp = false,
  float = Math.sin(time * 2) * 3,
): number {
  const base = look.palette;
  const p: NexusPalette = lowHp
    ? { dark: '#b0304a', mid: '#e05068', light: '#ff9aa8', glow: '#ff4a5a', accent: '#ff6a7a' }
    : base;
  ctx.save();
  if (look.animated && !lowHp) ctx.filter = `hue-rotate(${Math.round((time * 40) % 360)}deg)`;

  // luz no chão
  const pool = ctx.createRadialGradient(x, y + 12, 4, x, y + 12, 60);
  pool.addColorStop(0, hurt > 0 ? `rgba(255, 80, 90, ${0.35 + hurt * 0.3})` : p.glow + '55');
  pool.addColorStop(1, p.glow + '00');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 60, 30, 0, 0, TAU);
  ctx.fill();

  const top =
    look.model === 'lotus'
      ? drawLotus(ctx, x, y, time, p, hurt, float)
      : look.model === 'glacier'
        ? drawGlacier(ctx, x, y, time, p, hurt, float)
        : look.model === 'obelisk'
          ? drawObelisk(ctx, x, y, time, p, hurt, float)
          : drawCrystal(ctx, x, y, time, p, hurt, float);
  ctx.restore();
  return top;
}

function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, p: NexusPalette, hurt: number, float: number): number {
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

  // estilhaços orbitando (os de trás primeiro)
  for (let i = 0; i < 3; i++) {
    const a = time * 1.4 + (i / 3) * TAU;
    if (Math.sin(a) < 0) drawShard(ctx, x + Math.cos(a) * 24, y - 14 + float + Math.sin(a) * 7, 3.2, p.accent);
  }

  const cy = y - 16 + float;
  const top = cy - 26;
  const bottom = cy + 18;
  ctx.save();
  ctx.shadowColor = hurt > 0 ? '#ff4a5a' : p.glow;
  ctx.shadowBlur = 26 + Math.sin(time * 3) * 6;
  const faces: [string, number[]][] = [
    [p.dark, [x, top, x - 14, cy, x, bottom]],
    [p.mid, [x, top, x + 14, cy, x, bottom]],
    [p.light, [x, top, x + 14, cy, x + 3, cy - 2]],
    [p.accent, [x, top, x - 14, cy, x - 2, cy - 4]],
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
    if (Math.sin(a) >= 0) drawShard(ctx, x + Math.cos(a) * 24, y - 14 + float + Math.sin(a) * 7, 3.2, p.accent);
  }
  return top;
}

/** Lótus Ancestral: folha de vitória-régia, pétalas em camadas e um orbe de luz no miolo. */
function drawLotus(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, p: NexusPalette, hurt: number, float: number): number {
  // folha
  ctx.fillStyle = '#2f6a3a';
  ctx.strokeStyle = '#0a1a10';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.ellipse(x, y + 10, 24, 9, 0, 0.25, TAU - 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#4a8a4a';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) {
    const a = 0.6 + i * 0.95;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + Math.cos(a) * 20, y + 10 + Math.sin(a) * 7);
    ctx.stroke();
  }

  const breathe = Math.sin(time * 1.6) * 0.06;
  const cy = y - 2 + float * 0.4;
  const petal = (angle: number, length: number, width: number, color: string) => {
    ctx.save();
    ctx.translate(x, cy);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#3a0c24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-width, -length * 0.55, 0, -length);
    ctx.quadraticCurveTo(width, -length * 0.55, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  ctx.save();
  ctx.shadowColor = hurt > 0 ? '#ff4a5a' : p.glow;
  ctx.shadowBlur = 20 + Math.sin(time * 3) * 5;
  // camada de trás (abertas), do meio e da frente (fechadas)
  for (const a of [-1.25, -0.75, 0.75, 1.25]) petal(a * (1 + breathe), 20, 7, p.dark);
  for (const a of [-0.85, -0.3, 0.3, 0.85]) petal(a * (1 + breathe), 24, 7.5, p.mid);
  for (const a of [-0.4, 0, 0.4]) petal(a * (1 + breathe), 18, 6, p.light);
  ctx.restore();
  if (hurt > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${hurt * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(x, cy - 10, 18, 14, 0, 0, TAU);
    ctx.fill();
  }

  // orbe flutuante no miolo
  const orbY = cy - 26 + float;
  const glow = ctx.createRadialGradient(x, orbY, 1, x, orbY, 14);
  glow.addColorStop(0, '#ffffff');
  glow.addColorStop(0.35, p.accent);
  glow.addColorStop(1, p.accent + '00');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, orbY, 14, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fffbe8';
  ctx.beginPath();
  ctx.arc(x, orbY, 4, 0, TAU);
  ctx.fill();

  // pólen de luz girando
  for (let i = 0; i < 5; i++) {
    const a = time * 1.1 + (i / 5) * TAU;
    ctx.fillStyle = p.accent;
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 4 + i);
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 22, orbY + 10 + Math.sin(a) * 6, 1.4, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return orbY - 12;
}

function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color = '#c9a8ff'): void {
  ctx.fillStyle = color;
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

/** Pináculo Glacial: agulha de gelo sobre rochas nevadas, com um anel de flocos girando. */
function drawGlacier(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, p: NexusPalette, hurt: number, float: number): number {
  // base de rochas com neve
  ctx.fillStyle = '#7a8a9e';
  ctx.strokeStyle = '#2a3446';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 22, 8, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f2f8ff';
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 7, 16, 4.5, 0, 0, TAU);
  ctx.fill();
  const cy = y - 6 + float * 0.5;
  const top = cy - 44;
  ctx.save();
  ctx.shadowColor = hurt > 0 ? '#ff4a5a' : p.glow;
  ctx.shadowBlur = 22 + Math.sin(time * 3) * 6;
  // agulha central e lascas laterais
  const spike = (bx: number, h: number, w: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bx - w, cy + 10);
    ctx.lineTo(bx, cy + 10 - h);
    ctx.lineTo(bx + w, cy + 10);
    ctx.closePath();
    ctx.fill();
  };
  spike(x - 11, 28, 5, p.dark);
  spike(x + 11, 24, 5, p.dark);
  spike(x, 54, 9, p.mid);
  ctx.restore();
  ctx.fillStyle = p.light;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x + 3, cy + 6);
  ctx.lineTo(x - 2, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1a3450';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 9, cy + 10);
  ctx.lineTo(x, top);
  ctx.lineTo(x + 9, cy + 10);
  ctx.stroke();
  if (hurt > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${hurt * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(x - 9, cy + 10);
    ctx.lineTo(x, top);
    ctx.lineTo(x + 9, cy + 10);
    ctx.closePath();
    ctx.fill();
  }
  // anel de flocos girando
  for (let i = 0; i < 6; i++) {
    const a = time * 1.2 + (i / 6) * TAU;
    const fx = x + Math.cos(a) * 22;
    const fy = cy - 22 + Math.sin(a) * 6;
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const b = (k / 3) * Math.PI;
      ctx.moveTo(fx - Math.cos(b) * 2.5, fy - Math.sin(b) * 2.5);
      ctx.lineTo(fx + Math.cos(b) * 2.5, fy + Math.sin(b) * 2.5);
    }
    ctx.stroke();
  }
  return top;
}

/** Obelisco Solar: agulha de arenito com hieróglifos e um sol de ouro girando no topo. */
function drawObelisk(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, p: NexusPalette, hurt: number, float: number): number {
  // base em degraus
  ctx.fillStyle = '#c8a070';
  ctx.strokeStyle = '#6a4a20';
  ctx.lineWidth = 1.2;
  for (const [w, h, dy] of [
    [26, 6, 12],
    [20, 5, 7],
  ] as const) {
    ctx.beginPath();
    ctx.rect(x - w / 2, y + dy - h, w, h);
    ctx.fill();
    ctx.stroke();
  }
  // agulha de arenito
  const top = y - 50;
  const body = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
  body.addColorStop(0, '#f0d498');
  body.addColorStop(1, '#b8844a');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 2);
  ctx.lineTo(x - 4.5, top + 8);
  ctx.lineTo(x, top);
  ctx.lineTo(x + 4.5, top + 8);
  ctx.lineTo(x + 7, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // hieróglifos que brilham com a cor do Nexus
  ctx.strokeStyle = hurt > 0 ? '#ff4a5a' : p.mid;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const gy = y - 6 - i * 9;
    ctx.beginPath();
    if (i % 2) {
      ctx.arc(x, gy, 1.8, 0, TAU);
    } else {
      ctx.moveTo(x - 2.5, gy);
      ctx.lineTo(x + 2.5, gy);
      ctx.moveTo(x, gy - 2.5);
      ctx.lineTo(x, gy + 2.5);
    }
    ctx.stroke();
  }
  if (hurt > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${hurt * 0.5})`;
    ctx.fillRect(x - 7, top, 14, y - top);
  }
  // sol de ouro flutuando no topo, com raios girando
  const sy = top - 12 + float * 0.6;
  const glow = ctx.createRadialGradient(x, sy, 2, x, sy, 22);
  glow.addColorStop(0, p.glow + 'cc');
  glow.addColorStop(1, p.glow + '00');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, sy, 22, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(x, sy);
  ctx.rotate(time * 0.8);
  ctx.fillStyle = p.accent;
  for (let i = 0; i < 8; i++) {
    ctx.rotate(TAU / 8);
    ctx.beginPath();
    ctx.moveTo(-1.6, -7);
    ctx.lineTo(0, -13);
    ctx.lineTo(1.6, -7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = p.light;
  ctx.strokeStyle = p.dark;
  ctx.beginPath();
  ctx.arc(x, sy, 6.5, 0, TAU);
  ctx.fill();
  ctx.stroke();
  return sy - 14;
}

const thumbnails = new Map<string, HTMLCanvasElement>();

/** Miniatura do mapa da fase (cenário + Nexus do mapa), pintada uma vez e reaproveitada. */
export function paintStageThumbnail(target: HTMLCanvasElement, stage: StageDef): void {
  const world = stage.map ?? { width: W, height: H, nexus: center };
  const key = `${stage.id}:${target.width}x${target.height}`;
  let image = thumbnails.get(key);
  if (!image) {
    image = document.createElement('canvas');
    image.width = target.width;
    image.height = target.height;
    const c = image.getContext('2d')!;
    // enquadra o mundo inteiro mantendo a proporção (centralizado)
    const s = Math.min(image.width / world.width, image.height / world.height);
    c.fillStyle = '#07040d';
    c.fillRect(0, 0, image.width, image.height);
    c.setTransform(s, 0, 0, s, (image.width - world.width * s) / 2, (image.height - world.height * s) / 2);
    const nexus = world.nexus;
    if (stage.biome === 'swamp') paintSwampStatic(c, stage, world, nexus);
    else if (stage.biome === 'tundra') paintTundraStatic(c, stage, world, nexus);
    else if (stage.biome === 'desert') paintDesertStatic(c, stage, world, nexus);
    else paintStatic(c, stage, world, nexus);
    // segundo Nexus (pontos vitais gêmeos)
    for (const g of stage.guards ?? []) if (g.twin) drawNexusModel(c, g.x, g.y, 0, { model: stage.nexusModel, palette: NEXUS_MODELS[stage.nexusModel].palette });
    drawNexusModel(c, nexus.x, nexus.y, 0, { model: stage.nexusModel, palette: NEXUS_MODELS[stage.nexusModel].palette });
    thumbnails.set(key, image);
  }
  target.getContext('2d')!.drawImage(image, 0, 0);
}
