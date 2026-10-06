// Cenário do Pântano (Fase 2): água escura, poças de lama da fase, juncos, vitórias-régias e troncos.
import { ARENA } from '../data/config';
import type { MudTerrain, StageDef } from '../data/stages';

const TAU = Math.PI * 2;
const { width: W, height: H, center } = ARENA;

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type SwampProp = { kind: 'reeds' | 'lily' | 'log' | 'stump'; x: number; y: number; size: number; tilt: number };

function inPool(pools: MudTerrain['pools'], x: number, y: number, margin = 1.15): boolean {
  return pools.some((p) => ((x - p.x) / (p.rx * margin)) ** 2 + ((y - p.y) / (p.ry * margin)) ** 2 <= 1);
}

type Pt = { x: number; y: number };
type World = { width: number; height: number };

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

function buildProps(stage: StageDef, world: World, nexus: Pt): SwampProp[] {
  const pools = (stage.terrain?.kind === 'mud' ? stage.terrain.pools : []);
  const rand = seeded(11);
  const props: SwampProp[] = [];
  const target = Math.round((26 * world.width * world.height) / (W * H));
  for (let i = 0; props.length < target && i < 4000; i++) {
    const x = 16 + rand() * (world.width - 32);
    const y = 16 + rand() * (world.height - 26);
    // longe do Nexus, das poças, do rio e das trilhas
    if (Math.hypot((x - nexus.x) / 1.3, y - nexus.y) < 105 || inPool(pools, x, y)) continue;
    if (stage.decor?.river && distToLine(stage.decor.river.path, x, y) < stage.decor.river.width * 0.6) continue;
    if ((stage.entrances ?? []).some((e) => distToLine(e.path, x, y) < 22)) continue;
    const roll = rand();
    const kind = roll < 0.45 ? 'reeds' : roll < 0.75 ? 'lily' : roll < 0.9 ? 'stump' : 'log';
    props.push({ kind, x, y, size: 0.8 + rand() * 0.5, tilt: (rand() - 0.5) * 0.6 });
  }
  return props.sort((a, b) => a.y - b.y);
}

/** Parte estática do Pântano (vai para o cache do cenário). */
export function paintSwampStatic(ctx: CanvasRenderingContext2D, stage: StageDef, world: World = { width: W, height: H }, nexus: Pt = center): void {
  const pools = stage.terrain?.kind === 'mud' ? stage.terrain.pools : [];
  const ground = ctx.createRadialGradient(nexus.x, nexus.y, 30, nexus.x, nexus.y, Math.max(world.width, world.height) * 0.6);
  ground.addColorStop(0, '#24321f');
  ground.addColorStop(0.55, '#16241a');
  ground.addColorStop(1, '#0a120c');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, world.width, world.height);

  // água parada nas bordas
  const rand = seeded(5);
  for (let i = 0; i < 14; i++) {
    const a = rand() * TAU;
    const x = nexus.x + Math.cos(a) * (world.width * 0.42 + rand() * 60);
    const y = nexus.y + Math.sin(a) * (world.height * 0.42 + rand() * 40);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 50);
    g.addColorStop(0, '#1a3a3a88');
    g.addColorStop(1, '#1a3a3a00');
    ctx.fillStyle = g;
    ctx.fillRect(x - 50, y - 50, 100, 100);
  }
  // musgo e pedrinhas
  for (let i = 0; i < Math.round((380 * world.width * world.height) / (W * H)); i++) {
    ctx.fillStyle = rand() < 0.5 ? '#5a8a3a14' : '#00000030';
    ctx.beginPath();
    ctx.arc(rand() * world.width, rand() * world.height, 0.6 + rand() * 1.6, 0, TAU);
    ctx.fill();
  }

  // rio
  const river = stage.decor?.river;
  if (river) {
    for (const [color, w] of [
      ['#0f2a2a', river.width + 10],
      ['#163a3c', river.width],
      ['#1e4a4a', river.width * 0.55],
    ] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      river.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    // reflexos
    ctx.strokeStyle = '#6ab0a822';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const t = rand();
      const seg = Math.min(river.path.length - 2, Math.floor(t * (river.path.length - 1)));
      const p = river.path[seg]!;
      const q = river.path[seg + 1]!;
      const f = t * (river.path.length - 1) - seg;
      const x = p.x + (q.x - p.x) * f;
      const y = p.y + (q.y - p.y) * f + (rand() - 0.5) * river.width * 0.6;
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x + 6, y);
      ctx.stroke();
    }
  }

  // trilhas de terra batida
  for (const e of stage.entrances ?? []) {
    if (river && e.path.every((p) => distToLine(river.path, p.x, p.y) < river.width)) continue;
    ctx.strokeStyle = '#3a3220';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    e.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = '#4a4028';
    ctx.lineWidth = 12;
    ctx.stroke();
  }

  // ilha firme ao redor do Nexus
  const island = ctx.createRadialGradient(nexus.x, nexus.y, 10, nexus.x, nexus.y, 120);
  island.addColorStop(0, '#3a4a2e');
  island.addColorStop(0.75, '#2a3824');
  island.addColorStop(1, '#2a382400');
  ctx.fillStyle = island;
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y, 130, 100, 0, 0, TAU);
  ctx.fill();

  // poças de lama (regra do mapa)
  for (const p of pools) {
    const mud = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, Math.max(p.rx, p.ry));
    mud.addColorStop(0, '#4a3a22');
    mud.addColorStop(0.7, '#3a2e1a');
    mud.addColorStop(1, '#2a2214');
    ctx.fillStyle = mud;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#6a5a34aa';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = '#5a4a2a66';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(p.x - p.rx * 0.15, p.y - p.ry * 0.1, p.rx * 0.6, p.ry * 0.5, 0, 0, TAU);
    ctx.stroke();
  }

  for (const prop of buildProps(stage, world, nexus)) paintProp(ctx, prop);
}

function paintProp(ctx: CanvasRenderingContext2D, p: SwampProp): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.size, p.size);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#08100a';
  ctx.lineWidth = 1.1;
  switch (p.kind) {
    case 'reeds':
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = '#08100a';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(i * 2, 0);
        ctx.quadraticCurveTo(i * 2 + p.tilt * 6, -9, i * 3 + p.tilt * 8, -16 - Math.abs(i) * -2);
        ctx.stroke();
        ctx.strokeStyle = i % 2 ? '#5a7a3a' : '#6a8a44';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.fillStyle = '#6a4a2a';
      ctx.beginPath();
      ctx.ellipse(1 + p.tilt * 8, -14, 1.2, 3, p.tilt, 0, TAU);
      ctx.fill();
      ctx.stroke();
      break;
    case 'lily':
      ctx.fillStyle = '#3a6a3a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.ellipse(0, 0, 7, 3.6, 0, 0.3, TAU - 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (p.tilt > 0.1) {
        ctx.fillStyle = '#f0a0c8';
        ctx.beginPath();
        ctx.arc(1.5, -1.2, 1.8, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case 'log':
      ctx.rotate(p.tilt);
      ctx.fillStyle = '#4a3420';
      ctx.beginPath();
      ctx.roundRect(-12, -3.5, 24, 7, 3.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6a5034';
      ctx.beginPath();
      ctx.ellipse(12, 0, 2, 3.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5a8a3a';
      ctx.beginPath();
      ctx.ellipse(-4, -3.2, 5, 1.4, 0, 0, TAU);
      ctx.fill();
      break;
    case 'stump':
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.moveTo(-6, 1);
      ctx.lineTo(-5, -12);
      ctx.lineTo(-2, -16);
      ctx.lineTo(1, -11);
      ctx.lineTo(4, -15);
      ctx.lineTo(5, -6);
      ctx.lineTo(7, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/** Bolhas na lama e vagalumes (animados, por cima do cache). */
export function drawSwampLife(ctx: CanvasRenderingContext2D, time: number, terrain: MudTerrain | undefined, world: World = { width: W, height: H }): void {
  for (const [i, p] of (terrain?.pools ?? []).entries()) {
    for (let k = 0; k < 3; k++) {
      const t = (time * 0.45 + k / 3 + i * 0.27) % 1;
      const a = (k * 2.1 + i) % TAU;
      const x = p.x + Math.cos(a) * p.rx * 0.5;
      const y = p.y + Math.sin(a) * p.ry * 0.5;
      ctx.strokeStyle = `rgba(150, 128, 80, ${0.6 * (1 - t)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 1 + t * 3.5, 0, TAU);
      ctx.stroke();
    }
  }
  const flies = Math.round((14 * world.width * world.height) / (W * H));
  for (let i = 0; i < flies; i++) {
    const x = (i * 97 + Math.sin(time * 0.4 + i) * 30 + world.width) % world.width;
    const y = (i * 53 + Math.cos(time * 0.5 + i * 1.7) * 20 + world.height) % world.height;
    const glow = 0.4 + 0.6 * Math.max(0, Math.sin(time * 2.5 + i * 1.3));
    ctx.fillStyle = `rgba(200, 255, 120, ${0.65 * glow})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.1, 0, TAU);
    ctx.fill();
  }
}
