// Selos de raça (interface): disco na cor da raça com um símbolo desenhado em código.
import { circle, ellipse, poly, type Ctx } from './spriteKit';

/** Cor de cada raça nos selos. */
export const RACE_COLORS: Record<string, string> = {
  Humano: '#4a7ad8',
  Vampiro: '#b0283a',
  Dragão: '#e0702a',
  Lobisomem: '#8a6a4a',
  Fantasma: '#6ab8c8',
  Bruxa: '#7a3aa8',
  Fada: '#d860b8',
  Golem: '#7a7a6a',
  Necromante: '#4a8a4a',
  Anjo: '#d8b040',
  Demônio: '#c8401a',
  Górgona: '#3a9a6a',
  Unicórnio: '#b080e8',
};

const INK = '#fff8ec';

/** Símbolo da raça num quadrado de −10 a 10 (branco sobre o disco). */
function glyph(ctx: Ctx, race: string): void {
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const fill = (build: () => void) => {
    ctx.beginPath();
    build();
    ctx.fill();
  };
  const stroke = (build: () => void) => {
    ctx.beginPath();
    build();
    ctx.stroke();
  };
  switch (race) {
    case 'Humano':
      // escudo com cruz
      fill(() => {
        ctx.moveTo(-6, -7);
        ctx.lineTo(6, -7);
        ctx.lineTo(6, 0);
        ctx.quadraticCurveTo(5, 6, 0, 8);
        ctx.quadraticCurveTo(-5, 6, -6, 0);
        ctx.closePath();
      });
      ctx.strokeStyle = RACE_COLORS.Humano!;
      stroke(() => {
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.moveTo(-4, -1.5);
        ctx.lineTo(4, -1.5);
      });
      break;
    case 'Vampiro':
      // morcego
      fill(() => poly(ctx, [0, -2, -3, -5, -4, -2, -9, -5, -7, 1, -5, 0, -3, 3, 0, 1, 3, 3, 5, 0, 7, 1, 9, -5, 4, -2, 3, -5]));
      break;
    case 'Dragão':
      // chama
      fill(() => {
        ctx.moveTo(0, -9);
        ctx.quadraticCurveTo(7, -2, 5, 4);
        ctx.quadraticCurveTo(3, 9, 0, 8);
        ctx.quadraticCurveTo(-5, 8, -6, 3);
        ctx.quadraticCurveTo(-6, -1, -2, -3);
        ctx.quadraticCurveTo(-3, 1, 0, 2);
        ctx.quadraticCurveTo(2, -3, 0, -9);
        ctx.closePath();
      });
      break;
    case 'Lobisomem':
      // três garras
      ctx.lineWidth = 2.2;
      stroke(() => {
        for (const x of [-5, 0, 5]) {
          ctx.moveTo(x - 2, -7);
          ctx.quadraticCurveTo(x + 2, 0, x - 1, 8);
        }
      });
      break;
    case 'Fantasma':
      // lençol com olhos
      fill(() => {
        ctx.moveTo(-6, 8);
        ctx.lineTo(-6, -2);
        ctx.arc(0, -2, 6, Math.PI, 0);
        ctx.lineTo(6, 8);
        ctx.lineTo(3, 5.5);
        ctx.lineTo(0, 8);
        ctx.lineTo(-3, 5.5);
        ctx.closePath();
      });
      ctx.fillStyle = RACE_COLORS.Fantasma!;
      fill(() => {
        ellipse(ctx, -2.3, -2, 1.3, 1.8);
        ellipse(ctx, 2.3, -2, 1.3, 1.8);
      });
      break;
    case 'Bruxa':
      // chapéu pontudo
      fill(() => {
        ctx.moveTo(-9, 6);
        ctx.lineTo(9, 6);
        ctx.lineTo(4, 3);
        ctx.lineTo(1, -4);
        ctx.lineTo(5, -9);
        ctx.lineTo(-2, -6);
        ctx.lineTo(-4, 3);
        ctx.closePath();
      });
      break;
    case 'Fada':
      // asas de borboleta
      fill(() => {
        ellipse(ctx, -4, -3, 4, 5, -0.5);
        ellipse(ctx, 4, -3, 4, 5, 0.5);
        ellipse(ctx, -3, 4, 3, 3.4, 0.4);
        ellipse(ctx, 3, 4, 3, 3.4, -0.4);
      });
      ctx.fillStyle = RACE_COLORS.Fada!;
      fill(() => ctx.roundRect(-0.8, -6, 1.6, 12, 0.8));
      break;
    case 'Golem':
      // pedra facetada
      fill(() => poly(ctx, [-3, -8, 4, -7, 8, -1, 6, 6, -2, 8, -8, 3, -7, -4]));
      ctx.strokeStyle = RACE_COLORS.Golem!;
      ctx.lineWidth = 1.2;
      stroke(() => {
        ctx.moveTo(-3, -8);
        ctx.lineTo(0, -1);
        ctx.lineTo(8, -1);
        ctx.moveTo(0, -1);
        ctx.lineTo(-2, 8);
      });
      break;
    case 'Necromante':
      // caveira
      fill(() => {
        ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
        ctx.roundRect(-3.5, 2, 7, 6, 1.5);
      });
      ctx.fillStyle = RACE_COLORS.Necromante!;
      fill(() => {
        circle(ctx, -2.5, -2, 1.8);
        circle(ctx, 2.5, -2, 1.8);
      });
      break;
    case 'Anjo':
      // auréola sobre asas
      ctx.lineWidth = 1.6;
      stroke(() => ellipse(ctx, 0, -6, 5, 1.8));
      fill(() => {
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-6, -4, -9, 0);
        ctx.quadraticCurveTo(-7, 5, 0, 6);
        ctx.quadraticCurveTo(7, 5, 9, 0);
        ctx.quadraticCurveTo(6, -4, 0, 0);
        ctx.closePath();
      });
      break;
    case 'Demônio':
      // chifres
      fill(() => {
        ctx.moveTo(-3, 6);
        ctx.quadraticCurveTo(-9, 2, -7, -8);
        ctx.quadraticCurveTo(-5, -2, -1, 1);
        ctx.closePath();
        ctx.moveTo(3, 6);
        ctx.quadraticCurveTo(9, 2, 7, -8);
        ctx.quadraticCurveTo(5, -2, 1, 1);
        ctx.closePath();
      });
      break;
    case 'Górgona':
      // olho de serpente
      fill(() => {
        ctx.moveTo(-9, 0);
        ctx.quadraticCurveTo(0, -8, 9, 0);
        ctx.quadraticCurveTo(0, 8, -9, 0);
        ctx.closePath();
      });
      ctx.fillStyle = RACE_COLORS.Górgona!;
      fill(() => ellipse(ctx, 0, 0, 1.6, 4.5));
      break;
    case 'Unicórnio':
      // chifre espiral
      fill(() => poly(ctx, [-3, 8, 3, 8, 0, -9]));
      ctx.strokeStyle = RACE_COLORS.Unicórnio!;
      ctx.lineWidth = 1;
      stroke(() => {
        for (const y of [4, 0, -4]) {
          ctx.moveTo(-2 + (4 - y) * 0.12, y + 1.5);
          ctx.lineTo(2 - (4 - y) * 0.12, y - 0.5);
        }
      });
      break;
    default:
      fill(() => circle(ctx, 0, 0, 4));
  }
}

/** Pinta o selo da raça no canvas (tamanho do próprio elemento, nítido em HiDPI). */
export function paintRaceBadge(canvas: HTMLCanvasElement, race: string): void {
  const size = canvas.clientWidth || 16;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(size * ratio);
  canvas.height = Math.round(size * ratio);
  const ctx = canvas.getContext('2d')!;
  const s = (canvas.width / 2) / 12;
  ctx.setTransform(s, 0, 0, s, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#170c24';
  ctx.beginPath();
  circle(ctx, 0, 0, 12);
  ctx.fill();
  ctx.fillStyle = RACE_COLORS[race] ?? '#6a5a8a';
  ctx.beginPath();
  circle(ctx, 0, 0, 10.6);
  ctx.fill();
  ctx.save();
  ctx.scale(0.78, 0.78);
  glyph(ctx, race);
  ctx.restore();
}
