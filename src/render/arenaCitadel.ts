// Cenário da Cidadela Celeste (Fase 5): plataforma de mármore flutuando sobre as nuvens, colunas quebradas,
// friso dourado em volta do Nexus e círculos rúnicos onde os portais podem abrir.
import type { StageDef } from '../data/stages';

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

/** Nuvem fofa: vários círculos brancos com sombra lilás embaixo. */
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number, alpha = 1): void {
  ctx.globalAlpha = alpha;
  const puffs = 5 + Math.floor(rand() * 3);
  ctx.fillStyle = '#b8a8e0';
  for (let i = 0; i < puffs; i++) {
    ctx.beginPath();
    ctx.arc(x + (i - puffs / 2) * 16 * s, y + 6 * s, (14 + rand() * 8) * s, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < puffs; i++) {
    ctx.beginPath();
    ctx.arc(x + (i - puffs / 2) * 16 * s, y - (rand() * 8) * s, (14 + rand() * 9) * s, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Coluna de mármore quebrada (com caneluras), opcionalmente caída de lado. */
function column(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, height: number, rand: () => number): void {
  ctx.fillStyle = '#4a40703a';
  ctx.beginPath();
  ctx.ellipse(x + 6 * s, y + 2 * s, 14 * s, 4 * s, 0, 0, TAU);
  ctx.fill();
  // base
  ctx.fillStyle = '#d8d2ea';
  ctx.strokeStyle = '#7a7498';
  ctx.lineWidth = 1;
  ctx.fillRect(x - 10 * s, y - 4 * s, 20 * s, 5 * s);
  ctx.strokeRect(x - 10 * s, y - 4 * s, 20 * s, 5 * s);
  // fuste com topo quebrado em zigue-zague
  const top = y - 4 * s - height * s;
  const body = ctx.createLinearGradient(x - 7 * s, 0, x + 7 * s, 0);
  body.addColorStop(0, '#fbf8ff');
  body.addColorStop(1, '#b8b0d0');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - 7 * s, y - 4 * s);
  ctx.lineTo(x - 7 * s, top + 3 * s);
  ctx.lineTo(x - 3 * s, top - (rand() * 4 + 2) * s);
  ctx.lineTo(x + 1 * s, top + 2 * s);
  ctx.lineTo(x + 4 * s, top - (rand() * 3) * s);
  ctx.lineTo(x + 7 * s, top + 4 * s);
  ctx.lineTo(x + 7 * s, y - 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#9a94b866';
  for (const dx of [-3.5, 0, 3.5]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * s, y - 5 * s);
    ctx.lineTo(x + dx * s, top + 5 * s);
    ctx.stroke();
  }
}

/** Círculo rúnico gravado no chão (ponto onde um portal pode abrir). */
function runeCircle(ctx: CanvasRenderingContext2D, p: Pt): void {
  ctx.strokeStyle = '#8a70d855';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 26, 11, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 19, 8, 0, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(a) * 19, p.y + Math.sin(a) * 8);
    ctx.lineTo(p.x + Math.cos(a) * 26, p.y + Math.sin(a) * 11);
    ctx.stroke();
  }
}

export function paintCitadelStatic(ctx: CanvasRenderingContext2D, stage: StageDef, world: World, nexus: Pt): void {
  const rand = seeded(5150);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, world.width, world.height);
  ctx.clip();
  // céu
  const sky = ctx.createLinearGradient(0, 0, 0, world.height);
  sky.addColorStop(0, '#7a9ae0');
  sky.addColorStop(0.55, '#b4a8e8');
  sky.addColorStop(1, '#e8c8e8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, world.width, world.height);
  // nuvens ao fundo, nas bordas
  for (let i = 0; i < 26; i++) {
    const edge = i % 4;
    const t = rand();
    const x = edge === 0 ? t * world.width : edge === 1 ? t * world.width : edge === 2 ? rand() * 120 : world.width - rand() * 120;
    const y = edge === 0 ? rand() * 70 : edge === 1 ? world.height - rand() * 70 : t * world.height;
    cloud(ctx, x, y, 0.9 + rand() * 0.8, rand, 0.9);
  }
  // pedras flutuando entre as nuvens
  for (let i = 0; i < 7; i++) {
    const x = rand() < 0.5 ? 40 + rand() * 120 : world.width - 160 + rand() * 120;
    const y = 120 + rand() * (world.height - 240);
    ctx.fillStyle = '#8a82a8';
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x + 4, y + 16);
    ctx.lineTo(x - 6, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e4e0f0';
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 5, 0, 0, TAU);
    ctx.fill();
  }
  // a grande plataforma: borda inferior (espessura), depois o tampo
  const rx = 540;
  const ry = 318;
  ctx.fillStyle = '#7a72a0';
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y + 18, rx, ry, 0, 0, TAU);
  ctx.fill();
  const floor = ctx.createRadialGradient(nexus.x, nexus.y - 40, 40, nexus.x, nexus.y, rx);
  floor.addColorStop(0, '#eee8fa');
  floor.addColorStop(0.6, '#d8cef0');
  floor.addColorStop(1, '#b8aad8');
  ctx.fillStyle = floor;
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#9a90c0';
  ctx.lineWidth = 2;
  ctx.stroke();
  // lajotas (anéis e raios)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y, rx - 4, ry - 4, 0, 0, TAU);
  ctx.clip();
  ctx.strokeStyle = '#9a8cc070';
  ctx.lineWidth = 1;
  for (let r = 70; r < rx; r += 64) {
    ctx.beginPath();
    ctx.ellipse(nexus.x, nexus.y, r, r * (ry / rx), 0, 0, TAU);
    ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i * TAU) / 24;
    ctx.beginPath();
    ctx.moveTo(nexus.x + Math.cos(a) * 70, nexus.y + Math.sin(a) * 70 * (ry / rx));
    ctx.lineTo(nexus.x + Math.cos(a) * rx, nexus.y + Math.sin(a) * ry);
    ctx.stroke();
  }
  // rachaduras
  ctx.strokeStyle = '#8a80b050';
  for (let i = 0; i < 18; i++) {
    let x = nexus.x + (rand() - 0.5) * rx * 1.6;
    let y = nexus.y + (rand() - 0.5) * ry * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (rand() - 0.5) * 26;
      y += (rand() - 0.5) * 14;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  // friso dourado em volta do Nexus
  ctx.strokeStyle = '#e8c060';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y + 4, 118, 70, 0, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(nexus.x, nexus.y + 4, 108, 63, 0, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12;
    ctx.fillStyle = '#e8c060';
    ctx.beginPath();
    ctx.arc(nexus.x + Math.cos(a) * 113, nexus.y + 4 + Math.sin(a) * 66.5, 2.2, 0, TAU);
    ctx.fill();
  }
  // pontos de portal
  for (const p of stage.portals?.spots ?? []) runeCircle(ctx, p);
  // colunas quebradas espalhadas (longe do Nexus e dos portais)
  const spots = stage.portals?.spots ?? [];
  let placed = 0;
  for (let tries = 0; tries < 200 && placed < 14; tries++) {
    const a = rand() * TAU;
    const r = 0.45 + rand() * 0.5;
    const x = nexus.x + Math.cos(a) * rx * r;
    const y = nexus.y + Math.sin(a) * ry * r;
    if (Math.hypot(x - nexus.x, (y - nexus.y) * 1.7) < 190) continue;
    if (spots.some((p) => Math.hypot(p.x - x, p.y - y) < 60)) continue;
    column(ctx, x, y, 0.9 + rand() * 0.4, 14 + rand() * 30, rand);
    placed++;
  }
  ctx.restore();
}

/** Fiapos de nuvem atravessando devagar e brilhos no ar. */
export function drawCitadelLife(ctx: CanvasRenderingContext2D, time: number, world: World): void {
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const speed = 8 + i * 3;
    const x = ((time * speed + i * 260) % (world.width + 300)) - 150;
    const y = 60 + ((i * 113) % (world.height - 120));
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 14, 0, 0, TAU);
    ctx.fill();
  }
  for (let i = 0; i < 14; i++) {
    const t = (time * 0.3 + i * 0.37) % 1;
    const x = (i * 97) % world.width;
    const y = world.height - t * world.height;
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.7;
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
