// Cenário do Deserto (Fase 4): areia dourada, dunas, estrada de caravana e dois oásis (um em cada Obelisco).
import type { SandTerrain, StageDef } from '../data/stages';

const TAU = Math.PI * 2;
type Pt = { x: number; y: number };
type World = { width: number; height: number };

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function distToLine(path: Pt[], x: number, y: number): number {
  let best = Infinity;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)));
  }
  return best;
}

/** Palmeira: tronco curvo e folhas em leque. */
function palm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lean: number): void {
  ctx.fillStyle = '#3a240833';
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y + 2, 14 * s, 3.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7a5428';
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 6 * s, y - 14 * s, x + lean * 4 * s, y - 26 * s);
  ctx.stroke();
  // anéis do tronco
  ctx.strokeStyle = '#5a3a18';
  ctx.lineWidth = 0.8;
  for (let k = 1; k < 5; k++) {
    const t = k / 5;
    const px = x + lean * 6 * s * 2 * t * (1 - t) + lean * 4 * s * t * t;
    const py = y - 26 * s * t;
    ctx.beginPath();
    ctx.moveTo(px - 1.5 * s, py);
    ctx.lineTo(px + 1.5 * s, py);
    ctx.stroke();
  }
  const tx = x + lean * 4 * s;
  const ty = y - 26 * s;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.62;
    ctx.fillStyle = i % 2 ? '#3a8a3a' : '#2e7a34';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a - 0.3) * 10 * s, ty + Math.sin(a - 0.3) * 8 * s - 4 * s, tx + Math.cos(a) * 16 * s, ty + Math.sin(a) * 10 * s + 3 * s);
    ctx.quadraticCurveTo(tx + Math.cos(a + 0.3) * 8 * s, ty + Math.sin(a + 0.3) * 6 * s, tx, ty);
    ctx.fill();
  }
  ctx.fillStyle = '#6a4a20';
  for (const [dx, dy] of [[-1.5, 2], [1.5, 2.5]] as const) {
    ctx.beginPath();
    ctx.arc(tx + dx * s, ty + dy * s, 1.6 * s, 0, TAU);
    ctx.fill();
  }
}

/** Cacto de braços. */
function cactus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#3a240822';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 6 * s, 2 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#4a8a4a';
  ctx.strokeStyle = '#2a5a2a';
  ctx.lineWidth = 1;
  const arm = (ax: number, ay: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.roundRect(ax, ay, w, h, w / 2);
    ctx.fill();
    ctx.stroke();
  };
  arm(x - 2.5 * s, y - 16 * s, 5 * s, 16 * s);
  arm(x - 7 * s, y - 11 * s, 3.5 * s, 7 * s);
  arm(x + 3.5 * s, y - 13 * s, 3.5 * s, 7 * s);
}

/** Pedra de arenito. */
function sandstone(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number): void {
  ctx.fillStyle = '#3a240822';
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * s, 9 * s, 2.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rand() < 0.5 ? '#b8784a' : '#a86a3e';
  ctx.strokeStyle = '#6a3a1a';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y + 2 * s);
  ctx.lineTo(x - 6 * s, y - 5 * s);
  ctx.lineTo(x + 1 * s, y - 8 * s);
  ctx.lineTo(x + 7 * s, y - 3 * s);
  ctx.lineTo(x + 8 * s, y + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#d8a070';
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, y - 3 * s);
  ctx.lineTo(x + 5 * s, y - 4 * s);
  ctx.stroke();
}

/** Ossada de animal meio enterrada. */
function bones(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#f0e8d4';
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(x, y, 4 * s, 3 * s, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 6 * s + i * 3 * s, y + 1 * s, 1 * s, 3 * s, 0.3, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

/** Oásis: lagoa com borda de grama, pedras e palmeiras em volta (o Obelisco fica numa ilhota no meio). */
function oasis(ctx: CanvasRenderingContext2D, o: { x: number; y: number; r: number }, rand: () => number): void {
  // grama ao redor
  const grass = ctx.createRadialGradient(o.x, o.y, o.r * 0.3, o.x, o.y, o.r * 1.15);
  grass.addColorStop(0, '#5aa04a');
  grass.addColorStop(0.75, '#6ab05a99');
  grass.addColorStop(1, '#6ab05a00');
  ctx.fillStyle = grass;
  ctx.beginPath();
  ctx.ellipse(o.x, o.y, o.r * 1.15, o.r * 0.8, 0, 0, TAU);
  ctx.fill();
  // lagoa em anel em volta da ilhota
  const water = ctx.createRadialGradient(o.x, o.y + 4, o.r * 0.2, o.x, o.y + 4, o.r * 0.78);
  water.addColorStop(0, '#5ad0e8');
  water.addColorStop(1, '#2a8ab8');
  ctx.fillStyle = water;
  ctx.strokeStyle = '#d8c898';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(o.x, o.y + 4, o.r * 0.78, o.r * 0.5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // reflexos
  ctx.strokeStyle = '#ffffff66';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const x = o.x - o.r * 0.5 + rand() * o.r;
    const y = o.y - o.r * 0.25 + rand() * o.r * 0.5 + 6;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.stroke();
  }
  // ilhota de pedra no centro (base do Obelisco)
  ctx.fillStyle = '#d8b878';
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(o.x, o.y + 8, 26, 12, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // palmeiras em volta
  for (let i = 0; i < 5; i++) {
    const a = -2.6 + i * 0.95 + rand() * 0.2;
    const x = o.x + Math.cos(a) * o.r * 1.0;
    const y = o.y + Math.sin(a) * o.r * 0.68 + 6;
    palm(ctx, x, y, 1 + rand() * 0.25, Math.cos(a) > 0 ? 1 : -1);
  }
}

export function paintDesertStatic(ctx: CanvasRenderingContext2D, stage: StageDef, world: World, nexus: Pt): void {
  const rand = seeded(4242);
  const sand = stage.terrain?.kind === 'sand' ? (stage.terrain as SandTerrain) : null;
  // nada vaza para fora do mundo (miniatura e bordas)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, world.width, world.height);
  ctx.clip();
  // areia com luz de sol
  const base = ctx.createLinearGradient(0, 0, 0, world.height);
  base.addColorStop(0, '#f0d498');
  base.addColorStop(1, '#dcb070');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, world.width, world.height);
  // dunas: faixas onduladas claras e sombras
  for (let i = 0; i < 16; i++) {
    const x = rand() * world.width;
    const y = rand() * world.height;
    const w = 90 + rand() * 160;
    const h = 22 + rand() * 30;
    ctx.fillStyle = '#c89a5a44';
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 6, w, h, -0.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#f8e2b066';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, -0.1, 0, TAU);
    ctx.fill();
  }
  // marcas de vento na areia
  ctx.strokeStyle = '#c8985a55';
  ctx.lineWidth = 1;
  for (let i = 0; i < 70; i++) {
    const x = rand() * world.width;
    const y = rand() * world.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - 3, x + 22, y);
    ctx.stroke();
  }
  // trilhas das entradas (areia batida)
  for (const entrance of stage.entrances ?? []) {
    ctx.strokeStyle = '#c8986088';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    entrance.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = '#a87a4a55';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    entrance.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y - 8) : ctx.moveTo(p.x, p.y - 8)));
    ctx.stroke();
    ctx.beginPath();
    entrance.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + 8) : ctx.moveTo(p.x, p.y + 8)));
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // decoração longe das trilhas e dos oásis
  const paths = (stage.entrances ?? []).map((e) => e.path);
  const free = (x: number, y: number) =>
    paths.every((p) => distToLine(p, x, y) > 34) &&
    (sand?.oases ?? []).every((o) => Math.hypot(x - o.x, (y - o.y) * 1.3) > o.r * 1.3) &&
    Math.hypot(x - nexus.x, y - nexus.y) > 60;
  for (let i = 0; i < 70; i++) {
    const x = 20 + rand() * (world.width - 40);
    const y = 20 + rand() * (world.height - 40);
    if (!free(x, y)) continue;
    const roll = rand();
    if (roll < 0.45) sandstone(ctx, x, y, 0.8 + rand() * 0.9, rand);
    else if (roll < 0.8) cactus(ctx, x, y, 0.8 + rand() * 0.5);
    else bones(ctx, x, y, 0.9 + rand() * 0.4);
  }
  for (const o of sand?.oases ?? []) oasis(ctx, o, rand);
  ctx.restore();
}

/** Areia levantada pelo vento (partículas finas atravessando o mapa). */
export function drawDesertLife(ctx: CanvasRenderingContext2D, time: number, world: World): void {
  ctx.fillStyle = '#fff4d066';
  for (let i = 0; i < 26; i++) {
    const x = (i * 197 + time * (30 + (i % 5) * 12)) % (world.width + 40) - 20;
    const y = (i * 131.7) % world.height + Math.sin(time * 1.5 + i) * 6;
    ctx.fillRect(x, y, 2.2, 1);
  }
}
