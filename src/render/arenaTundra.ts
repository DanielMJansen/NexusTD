// Cenário da Tundra (Fase 3): neve clara, lago congelado com ilha de pedra, montanhas com passagens e pinheiros.
import type { IceTerrain, StageDef } from '../data/stages';

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

const inLake = (ice: IceTerrain, x: number, y: number, margin = 1) =>
  ((x - ice.lake.x) / (ice.lake.rx * margin)) ** 2 + ((y - ice.lake.y) / (ice.lake.ry * margin)) ** 2 <= 1;

/** Pinheiro nevado. */
function pine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.fillStyle = '#0a1a2a33';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 10 * s, 3 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5a3a24';
  ctx.fillRect(x - 1.5 * s, y - 4 * s, 3 * s, 6 * s);
  for (let k = 0; k < 3; k++) {
    const w = (12 - k * 3) * s;
    const top = y - (8 + k * 8) * s;
    ctx.fillStyle = k % 2 ? '#2a5a4a' : '#24504a';
    ctx.strokeStyle = '#10241e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - w, top + 9 * s);
    ctx.lineTo(x, top - 4 * s);
    ctx.lineTo(x + w, top + 9 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // neve nos galhos
    ctx.fillStyle = '#f4faff';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, top + 5 * s);
    ctx.lineTo(x, top - 3 * s);
    ctx.lineTo(x + w * 0.6, top + 5 * s);
    ctx.quadraticCurveTo(x, top + 2 * s, x - w * 0.6, top + 5 * s);
    ctx.fill();
  }
}

/** Rocha da montanha (bordas do mapa). */
function rock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number): void {
  ctx.fillStyle = '#6a7a90';
  ctx.strokeStyle = '#2a3446';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 22 * s, y + 10 * s);
  ctx.lineTo(x - 14 * s, y - (16 + rand() * 10) * s);
  ctx.lineTo(x - 2 * s, y - (26 + rand() * 12) * s);
  ctx.lineTo(x + 12 * s, y - (14 + rand() * 8) * s);
  ctx.lineTo(x + 22 * s, y + 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // topo nevado
  ctx.fillStyle = '#f0f6ff';
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y - 14 * s);
  ctx.lineTo(x - 2 * s, y - 24 * s);
  ctx.lineTo(x + 8 * s, y - 12 * s);
  ctx.quadraticCurveTo(x, y - 16 * s, x - 10 * s, y - 14 * s);
  ctx.fill();
}

export function paintTundraStatic(ctx: CanvasRenderingContext2D, stage: StageDef, world: World, nexus: Pt): void {
  const ice = stage.terrain?.kind === 'ice' ? stage.terrain : null;
  const rand = seeded(23);
  // neve
  const ground = ctx.createRadialGradient(nexus.x, nexus.y, 40, nexus.x, nexus.y, Math.max(world.width, world.height) * 0.7);
  ground.addColorStop(0, '#f2f8ff');
  ground.addColorStop(0.6, '#dde9f6');
  ground.addColorStop(1, '#bccde2');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, world.width, world.height);
  for (let i = 0; i < (world.width * world.height) / 900; i++) {
    ctx.fillStyle = rand() < 0.5 ? '#ffffffaa' : '#a8bcd420';
    ctx.beginPath();
    ctx.arc(rand() * world.width, rand() * world.height, 0.6 + rand() * 1.8, 0, TAU);
    ctx.fill();
  }
  // trilhas de neve pisada
  for (const e of stage.entrances ?? []) {
    ctx.strokeStyle = '#c4d4e6';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    e.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = '#d4e2f0';
    ctx.lineWidth = 16;
    ctx.stroke();
  }
  // lago congelado
  if (ice) {
    const { lake, island } = ice;
    const glaze = ctx.createLinearGradient(lake.x - lake.rx, lake.y - lake.ry, lake.x + lake.rx, lake.y + lake.ry);
    glaze.addColorStop(0, '#bfe4fa');
    glaze.addColorStop(0.5, '#a6d6f2');
    glaze.addColorStop(1, '#8cc4e8');
    ctx.fillStyle = glaze;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(lake.x, lake.y, lake.rx, lake.ry, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // reflexos e veios do gelo
    ctx.strokeStyle = '#ffffff88';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const a = rand() * TAU;
      const r = rand() * 0.8;
      const x = lake.x + Math.cos(a) * lake.rx * r;
      const y = lake.y + Math.sin(a) * lake.ry * r;
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 6);
      ctx.lineTo(x + 14, y - 6);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7ab0d433';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const x = lake.x + (rand() - 0.5) * lake.rx * 1.6;
      const y = lake.y + (rand() - 0.5) * lake.ry * 1.6;
      if (!inLake(ice, x, y, 0.95)) continue;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 40, y + (rand() - 0.5) * 20);
      ctx.stroke();
    }
    // ilha de pedra
    ctx.fillStyle = '#8a98aa';
    ctx.strokeStyle = '#4a586c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(island.x, island.y, island.r * 1.3, island.r, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#eef4fb';
    ctx.beginPath();
    ctx.ellipse(island.x - 4, island.y - 6, island.r * 1.1, island.r * 0.75, 0, 0, TAU);
    ctx.fill();
  }
  // montanhas nas bordas (abertas nas passagens) e pinheiros
  const gates = (stage.entrances ?? []).map((e) => e.path[1] ?? e.path[0]!);
  const ridge = (x: number, y: number) => gates.every((g) => Math.hypot(g.x - x, g.y - y) > 90);
  for (let x = 20; x < world.width; x += 38) {
    if (ridge(x, 20)) rock(ctx, x, 30 + rand() * 10, 1 + rand() * 0.4, rand);
    if (ridge(x, world.height - 10)) rock(ctx, x, world.height - 4 - rand() * 6, 1 + rand() * 0.4, rand);
  }
  for (let y = 60; y < world.height - 30; y += 40) {
    if (ridge(10, y)) rock(ctx, 16, y + 10, 1 + rand() * 0.3, rand);
    if (ridge(world.width - 10, y)) rock(ctx, world.width - 16, y + 10, 1 + rand() * 0.3, rand);
  }
  const trees: Pt[] = [];
  for (let tries = 0; trees.length < (world.width * world.height) / 22000 && tries < 3000; tries++) {
    const x = 60 + rand() * (world.width - 120);
    const y = 70 + rand() * (world.height - 120);
    if (ice && inLake(ice, x, y, 1.12)) continue;
    if (Math.hypot(x - nexus.x, y - nexus.y) < 160) continue;
    if ((stage.entrances ?? []).some((e) => distToLine(e.path, x, y) < 30)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 36)) continue;
    trees.push({ x, y });
  }
  trees.sort((a, b) => a.y - b.y);
  for (const t of trees) pine(ctx, t.x, t.y, 0.9 + rand() * 0.5);
}

/** Flocos caindo devagar (animado, por cima do cache). */
export function drawTundraLife(ctx: CanvasRenderingContext2D, time: number, world: World): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const flakes = Math.round((world.width * world.height) / 9000);
  for (let i = 0; i < flakes; i++) {
    const x = (i * 131.7 + Math.sin(time * 0.7 + i) * 18 + time * 8) % world.width;
    const y = (i * 71.3 + time * (14 + (i % 5) * 4)) % world.height;
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + (i % 3) * 0.4, 0, TAU);
    ctx.fill();
  }
}
