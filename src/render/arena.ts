import { ARENA } from '../data/config';

const TAU = Math.PI * 2;
const { width: W, height: H, center } = ARENA;

// Cenário sorteado uma vez por carregamento da página.
const stars = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H }));
const tombstones = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: Math.random() * H })).filter(
  (t) => Math.hypot(t.x - center.x, t.y - center.y) > 70,
);

/** Fundo, estrelas, lápides e os anéis rúnicos girando ao redor do Nexus. */
export function drawBackground(ctx: CanvasRenderingContext2D, time: number): void {
  const gradient = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, 300);
  gradient.addColorStop(0, '#2a1c4a');
  gradient.addColorStop(1, '#07050f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffffff30';
  for (const s of stars) ctx.fillRect(s.x, s.y, 1.5, 1.5);

  ctx.fillStyle = '#1a1230';
  for (const t of tombstones) {
    ctx.beginPath();
    ctx.roundRect(t.x, t.y, 10, 14, [5, 5, 0, 0]);
    ctx.fill();
  }

  ctx.strokeStyle = '#5a4690';
  ctx.lineDashOffset = -time * 8;
  ctx.setLineDash([4, 6]);
  for (const radius of [110, 60]) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, TAU);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** Cristal pulsante do Nexus e sua barra de vida. */
export function drawNexus(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, time: number): void {
  const pulse = 1 + Math.sin(time * 3) * 0.08;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.shadowColor = '#b36bff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#8a4fff';
  ctx.beginPath();
  ctx.moveTo(0, -24 * pulse);
  ctx.lineTo(14, 0);
  ctx.lineTo(0, 24 * pulse);
  ctx.lineTo(-14, 0);
  ctx.fill();
  ctx.fillStyle = '#dcbfff';
  ctx.beginPath();
  ctx.moveTo(0, -24 * pulse);
  ctx.lineTo(14, 0);
  ctx.lineTo(0, 5);
  ctx.fill();
  ctx.restore();

  const ratio = hp / maxHp;
  ctx.fillStyle = '#000a';
  ctx.fillRect(center.x - 24, center.y - 38, 48, 6);
  ctx.fillStyle = ratio > 0.3 ? '#4d8' : '#e44';
  ctx.fillRect(center.x - 24, center.y - 38, 48 * Math.max(0, ratio), 6);
}
