// Mini ilustrações animadas dos tutoriais das telas do menu (quadro da 1ª visita).
import { VARIANT_TIERS, VARIANTS } from '../data/altar';
import { NEXUS_MODEL_IDS, NEXUS_MODELS } from '../data/nexusSkins';
import { RELIC_IDS, RELICS } from '../data/relics';
import { drawNexusModel } from './arena';
import { circle, drawLayered, GOLD, halo, type Ctx } from './spriteKit';
import { drawSprite, type SpriteId } from './sprites';
import { fitSmallCanvas } from './viewport';

/** Cena de referência: 300 × 120, centralizada no canvas. */
const W = 300;
const H = 120;

const sprite = (ctx: Ctx, id: SpriteId, x: number, y: number, scale: number, time: number, extra: { level?: number; filter?: string; silhouette?: boolean } = {}) =>
  drawLayered(ctx, x, y - 6 * scale, 30 * scale, { filter: extra.silhouette ? 'brightness(0)' : extra.filter }, (c) =>
    drawSprite(c, id, x, y, scale, { time, level: extra.level ?? 1, branch: 0, palette: {} }),
  );

function star(ctx: Ctx, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

const label = (ctx: Ctx, text: string, x: number, y: number, color = '#e8dcff', size = 11) => {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Cinzel, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
};

const DEMOS: Record<string, (ctx: Ctx, t: number) => void> = {
  // Essência sobe pela árvore e acende os talentos; o herói fica mais forte
  talents(ctx, t) {
    const cycle = (t % 4) / 4;
    const nodes = [
      [130, 60],
      [190, 35],
      [190, 85],
      [250, 60],
    ] as const;
    ctx.strokeStyle = '#4a3a6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, 60);
    ctx.lineTo(190, 35);
    ctx.lineTo(250, 60);
    ctx.moveTo(130, 60);
    ctx.lineTo(190, 85);
    ctx.lineTo(250, 60);
    ctx.stroke();
    nodes.forEach(([x, y], i) => {
      const lit = cycle * 5 > i + 0.5;
      if (lit) halo(ctx, x, y, 16, '#b48cff', 0.7);
      ctx.fillStyle = lit ? '#b48cff' : '#2a1e40';
      ctx.strokeStyle = '#b48cff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      circle(ctx, x, y, 9);
      ctx.fill();
      ctx.stroke();
    });
    // partícula de Essência percorrendo
    const k = Math.min(3, Math.floor(cycle * 5));
    const [ax, ay] = nodes[Math.max(0, k - 1)]!;
    const [bx, by] = nodes[k]!;
    const f = (cycle * 5) % 1;
    label(ctx, '✦', ax + (bx - ax) * f, ay + (by - ay) * f + 4, '#e8d4ff', 14);
    halo(ctx, 55, 70, 22 + cycle * 14, '#b48cff', 0.25 + cycle * 0.4);
    sprite(ctx, 'knight', 55, 78, 1.9, t);
  },
  // conquista acesa libera uma skin nova do herói
  achievements(ctx, t) {
    const pulse = 0.5 + Math.sin(t * 3) * 0.2;
    halo(ctx, 100, 60, 30, GOLD, pulse);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(86, 38);
    ctx.lineTo(114, 38);
    ctx.quadraticCurveTo(114, 66, 100, 70);
    ctx.quadraticCurveTo(86, 66, 86, 38);
    ctx.fill();
    ctx.fillRect(97, 70, 6, 10);
    ctx.fillRect(90, 80, 20, 5);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(84, 48, 6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(116, 48, 6, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    label(ctx, '→', 150, 66, '#e8dcff', 18);
    const hue = Math.floor(t / 1.5) % 4;
    sprite(ctx, 'knight', 210, 80, 1.9, t, { filter: hue ? `hue-rotate(${hue * 90}deg) saturate(1.3)` : undefined });
  },
  // inimigos novos saem da silhueta para a ficha
  codex(ctx, t) {
    const enemies: SpriteId[] = ['zombie', 'bat', 'ogre', 'spider', 'frostWolf', 'mummy'];
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(40, 30, 70, 62);
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(44, 34, 30, 54);
    ctx.fillRect(76, 34, 30, 54);
    ctx.strokeStyle = '#9a8a6a';
    ctx.lineWidth = 1;
    for (let y = 42; y < 84; y += 7) {
      ctx.beginPath();
      ctx.moveTo(48, y);
      ctx.lineTo(70, y);
      ctx.moveTo(80, y);
      ctx.lineTo(102, y);
      ctx.stroke();
    }
    const i = Math.floor(t / 2) % enemies.length;
    const seen = (t % 2) > 0.8;
    if (seen) halo(ctx, 200, 62, 28, '#8ad0ff', 0.4);
    sprite(ctx, enemies[i]!, 200, 72, 1.8, t, { silhouette: !seen });
    if (!seen) label(ctx, '?', 200, 40, '#8ad0ff', 18);
  },
  // estrelas sobem até o Despertar
  sanctuary(ctx, t) {
    const cycle = t % 5;
    const stars = Math.min(5, Math.floor(cycle) + 1);
    const awake = cycle > 4.2;
    if (awake) halo(ctx, 150, 60, 40, '#6af0d0', 0.6);
    sprite(ctx, 'archer', 150, 82, 2, t, { level: stars >= 3 ? 3 : 1 });
    for (let k = 0; k < 5; k++) star(ctx, 110 + k * 20, 18, 7, k < stars ? (awake ? '#6af0d0' : GOLD) : '#3a2e50');
  },
  // modelos do Nexus se alternando
  nexus(ctx, t) {
    const model = NEXUS_MODEL_IDS[Math.floor(t / 2.5) % NEXUS_MODEL_IDS.length]!;
    ctx.save();
    ctx.translate(150, 84);
    ctx.scale(1.25, 1.25);
    drawNexusModel(ctx, 0, 0, t, { model, palette: NEXUS_MODELS[model].palette });
    ctx.restore();
  },
  // a mesma criatura trocando de variante no altar
  altar(ctx, t) {
    const tier = VARIANT_TIERS[Math.floor(t / 1.6) % (VARIANT_TIERS.length + 1) - 1];
    const look = tier ? VARIANTS[tier] : undefined;
    ctx.fillStyle = '#3a2a4a';
    ctx.beginPath();
    ctx.ellipse(150, 96, 46, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    if (look) halo(ctx, 150, 60, 36, look.color, 0.5);
    sprite(ctx, 'fireDragon', 150, 84, 2, t, { filter: look?.filter });
    label(ctx, look?.name ?? 'Original', 150, 114, look?.color ?? '#e8dcff');
  },
  // Relíquias girando em volta do herói
  relics(ctx, t) {
    halo(ctx, 150, 62, 34, GOLD, 0.35);
    sprite(ctx, 'knight', 150, 80, 1.8, t);
    const shown = [0, 1, 2, 3, 4].map((k) => RELICS[RELIC_IDS[(k + Math.floor(t / 3)) % RELIC_IDS.length]!].icon);
    shown.forEach((icon, k) => {
      const a = t * 0.9 + (k * Math.PI * 2) / shown.length;
      const x = 150 + Math.cos(a) * 80;
      const y = 60 + Math.sin(a) * 30;
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(icon, x, y + 7);
    });
  },
};

/** Desenha a ilustração `id` no canvas (tamanho CSS do próprio elemento). */
export function drawFeatureDemo(canvas: HTMLCanvasElement, id: string, time: number): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const demo = DEMOS[id];
  if (!width || !height || !demo) return;
  const ctx = canvas.getContext('2d')!;
  fitSmallCanvas(canvas, ctx);
  ctx.clearRect(0, 0, width, height);
  const s = Math.min(width / W, height / H);
  ctx.save();
  ctx.translate((width - W * s) / 2, (height - H * s) / 2);
  ctx.scale(s, s);
  demo(ctx, time);
  ctx.restore();
}
