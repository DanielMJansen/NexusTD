// Inimigos e chefes da Cidadela Celeste (Fase 5): Harpia, Sentinela de Mármore, Anjo Caído, Elemental do Vento,
// Corvo da Tempestade, Grifo Real e Serafim Corrompido.
import { circle, ellipse, glowingEye, GOLD, halo, line, poly, radial, shape, vertical, type Ctx, type Pose } from './spriteKit';

/** Asa emplumada (lado -1 ou 1), batendo com `flap` (−1..1). */
function featherWing(ctx: Ctx, side: number, x: number, y: number, span: number, flap: number, fill: string, edge: string): void {
  const tipY = y - span * 0.45 - flap * span * 0.35;
  shape(ctx, vertical(ctx, tipY, y + span * 0.3, fill, edge), () => {
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + side * span * 0.55, tipY - 2, x + side * span, tipY);
    // penas arredondadas na borda de baixo, da ponta para o corpo
    let px = x + side * span;
    let py = tipY;
    for (let i = 3; i >= 0; i--) {
      const t = i / 4;
      const nx = x + side * span * (0.2 + t * 0.8);
      const ny = y + span * 0.1 * (1 - t) + (tipY - y) * t;
      ctx.quadraticCurveTo((px + nx) / 2 + side * 1.5, Math.max(py, ny) + span * 0.18, nx, ny);
      px = nx;
      py = ny;
    }
    ctx.quadraticCurveTo((px + x) / 2, Math.max(py, y) + span * 0.12, x, y + 2);
    ctx.closePath();
  }, 1.1);
}

/** Harpia: mulher-pássaro de asas castanhas, garras e cabelo selvagem. */
export function drawHarpy(ctx: Ctx, p: Pose): void {
  const flap = Math.sin(p.time * 14);
  for (const side of [-1, 1]) featherWing(ctx, side, side * 3, -4, 15, flap, '#c88a5a', '#6a3a1a');
  // corpo emplumado
  shape(ctx, radial(ctx, 0, -2, 7, '#e8b880', '#8a5a30'), () => ellipse(ctx, 0, 0, 5, 7));
  // pernas com garras
  for (const side of [-1, 1]) {
    line(ctx, '#d8a040', 1.4, () => {
      ctx.moveTo(side * 2, 6);
      ctx.lineTo(side * 3, 10 + p.attack * 2);
    });
    shape(ctx, '#2a1a0a', () => poly(ctx, [side * 1.5, 10 + p.attack * 2, side * 5, 11 + p.attack * 2, side * 3, 12.5 + p.attack * 2]), 0.4);
  }
  // cabeça: rosto pálido, cabelo em penas
  shape(ctx, '#6a3a1a', () => {
    ctx.moveTo(-6, -9);
    ctx.quadraticCurveTo(-8, -18, 0, -17);
    ctx.quadraticCurveTo(8, -18, 6, -9);
    ctx.lineTo(4, -6);
    ctx.lineTo(-4, -6);
    ctx.closePath();
  }, 1);
  shape(ctx, '#f0d0b0', () => ellipse(ctx, 0, -11, 4, 4.5), 0.9);
  glowingEye(ctx, -1.5, -11.5, 0.8, '#ffcc33');
  glowingEye(ctx, 1.5, -11.5, 0.8, '#ffcc33');
  shape(ctx, '#d8a040', () => poly(ctx, [-1, -9.5, 1, -9.5, 0, -7.5]), 0.4);
}

/** Sentinela de Mármore: estátua de guerreiro com elmo, escudo redondo e um olho de luz no peito. */
export function drawMarbleSentinel(ctx: Ctx, p: Pose): void {
  const step = Math.sin(p.time * 3) * 0.8;
  const stone = '#e8e4f0';
  const shade = '#9a94b4';
  // pedestal quebrado sob os pés
  shape(ctx, shade, () => ctx.roundRect(-9, 10, 18, 4, 1), 1);
  // pernas
  shape(ctx, vertical(ctx, 2, 11, stone, shade), () => ctx.roundRect(-6 + step, 2, 5, 9, 1), 1);
  shape(ctx, vertical(ctx, 2, 11, stone, shade), () => ctx.roundRect(1 - step, 2, 5, 9, 1), 1);
  // torso com dobras de toga
  shape(ctx, vertical(ctx, -13, 4, '#fbf8ff', shade), () => ctx.roundRect(-8, -12, 16, 16, 4), 1.2);
  ctx.strokeStyle = shade;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-5, -10);
  ctx.quadraticCurveTo(-2, -2, -4, 3);
  ctx.moveTo(2, -10);
  ctx.quadraticCurveTo(5, -3, 3, 3);
  ctx.stroke();
  // olho de luz no peito (brilha ao atirar)
  halo(ctx, 0, -5, 6 + p.attack * 6, '#fff2a8', 0.6 + p.attack * 0.4);
  shape(ctx, '#fff8d8', () => circle(ctx, 0, -5, 2), 0.6);
  // escudo redondo
  shape(ctx, radial(ctx, -11, -4, 7, '#ffffff', shade), () => circle(ctx, -11, -4, 6.5), 1.1);
  shape(ctx, GOLD, () => circle(ctx, -11, -4, 1.6), 0.5);
  // cabeça com elmo de crista
  shape(ctx, vertical(ctx, -22, -12, '#ffffff', shade), () => ctx.roundRect(-4.5, -21, 9, 9, 3), 1.1);
  shape(ctx, '#2a2440', () => ctx.roundRect(-3, -17.5, 6, 1.6, 0.6), 0);
  shape(ctx, '#c8b8e8', () => poly(ctx, [-1, -21, 1, -21, 4, -27, -4, -27]), 0.8);
  // rachaduras
  line(ctx, '#7a7498', 0.6, () => {
    ctx.moveTo(4, -11);
    ctx.lineTo(6, -7);
    ctx.lineTo(5, -4);
  }, false);
}

/** Anjo Caído: asas negras rasgadas, auréola quebrada e túnica escura. */
export function drawFallenAngel(ctx: Ctx, p: Pose): void {
  const flap = Math.sin(p.time * 5);
  const float = Math.sin(p.time * 2.4) * 1.2;
  for (const side of [-1, 1]) featherWing(ctx, side, side * 3, -6 + float, 17, flap * 0.6, '#3a2a4a', '#120a1a');
  // túnica
  shape(ctx, vertical(ctx, -10, 10, '#6a5a8a', '#2a1a3a'), () => {
    ctx.moveTo(-5, -9 + float);
    ctx.lineTo(5, -9 + float);
    ctx.lineTo(7, 10 + float);
    ctx.lineTo(3, 8 + float);
    ctx.lineTo(0, 11 + float);
    ctx.lineTo(-3, 8 + float);
    ctx.lineTo(-7, 10 + float);
    ctx.closePath();
  });
  // cabeça e cabelo
  shape(ctx, '#d8d0e8', () => ellipse(ctx, 0, -13 + float, 4.2, 4.5), 1);
  shape(ctx, '#1a1028', () => {
    ctx.moveTo(-4.5, -13 + float);
    ctx.quadraticCurveTo(-5, -19 + float, 0, -18.5 + float);
    ctx.quadraticCurveTo(5, -19 + float, 4.5, -13 + float);
    ctx.lineTo(5, -7 + float);
    ctx.lineTo(3.5, -12 + float);
    ctx.lineTo(-3.5, -12 + float);
    ctx.lineTo(-5, -7 + float);
    ctx.closePath();
  }, 0.6);
  glowingEye(ctx, -1.5, -13 + float, 0.8, '#c87aff');
  glowingEye(ctx, 1.5, -13 + float, 0.8, '#c87aff');
  // auréola rachada (brilha na égide)
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -21 + float, 5, 1.6, 0, 0.3, Math.PI * 1.7);
  ctx.stroke();
  if (p.attack > 0.1) halo(ctx, 0, -21 + float, 8, '#ffe8a0', p.attack);
}

/** Elemental do Vento: redemoinho translúcido com olhos e braços de vento. */
export function drawWindElemental(ctx: Ctx, p: Pose): void {
  const spin = p.time * 6;
  halo(ctx, 0, -2, 16, '#bfe8f0', 0.35);
  // funil de fitas de vento
  for (let i = 0; i < 6; i++) {
    const y = 10 - i * 4.5;
    const w = 3 + i * 1.6;
    ctx.strokeStyle = i % 2 ? '#e8faff' : '#8ad0e0';
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(Math.sin(spin * 0.4 + i) * 1.5, y, w, w * 0.32, 0, spin + i, spin + i + Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // braços de vento
  for (const side of [-1, 1]) {
    line(ctx, '#bfe8f0', 1.6, () => {
      ctx.moveTo(side * 6, -10);
      ctx.quadraticCurveTo(side * 12, -14 - p.attack * 4, side * 14, -8);
    }, false);
  }
  // rosto
  shape(ctx, '#e8faff99', () => ellipse(ctx, 0, -14, 6, 4.5), 0);
  glowingEye(ctx, -2, -14.5, 0.9, '#ffffff');
  glowingEye(ctx, 2, -14.5, 0.9, '#ffffff');
}

/** Corvo da Tempestade: corvo negro com olhos elétricos e faíscas nas penas. */
export function drawStormCrow(ctx: Ctx, p: Pose): void {
  const flap = Math.sin(p.time * 16);
  for (const side of [-1, 1]) featherWing(ctx, side, side * 2, -3, 12, flap, '#3a3a5a', '#0a0a1a');
  shape(ctx, radial(ctx, -1, -2, 7, '#5a5a7a', '#14142a'), () => ellipse(ctx, 0, 0, 5.5, 6.5));
  // cauda
  shape(ctx, '#14142a', () => poly(ctx, [-2, 5, 2, 5, 3, 11, 0, 9, -3, 11]), 0.8);
  // cabeça e bico
  shape(ctx, '#2a2a44', () => circle(ctx, 2, -7, 4), 1);
  shape(ctx, '#3a3a4a', () => poly(ctx, [5, -8, 10 + p.attack * 2, -6.5, 5, -5.5]), 0.6);
  glowingEye(ctx, 3, -8, 0.9, '#8ae8ff');
  // faísca
  if (Math.sin(p.time * 9) > 0.5) {
    line(ctx, '#bff0ff', 0.8, () => {
      ctx.moveTo(-4, -4);
      ctx.lineTo(-6, -1);
      ctx.lineTo(-5, -1);
      ctx.lineTo(-7, 2);
    }, false);
  }
}

/** Grifo Real: cabeça e asas de águia dourada, corpo de leão, garras dianteiras. */
export function drawGriffin(ctx: Ctx, p: Pose): void {
  const flap = Math.sin(p.time * 4);
  const fur = '#d8a84a';
  const dark = '#6a4a18';
  for (const side of [-1, 1]) featherWing(ctx, side, side * 2, -8, 22, flap * 0.7, '#f0d8a0', '#8a5a20');
  // cauda de leão
  line(ctx, fur, 2, () => {
    ctx.moveTo(-9, 2);
    ctx.quadraticCurveTo(-16, 0 + Math.sin(p.time * 3) * 2, -15, -6);
  });
  shape(ctx, dark, () => circle(ctx, -15, -7, 1.8), 0.5);
  // corpo de leão
  shape(ctx, radial(ctx, -2, 0, 11, '#f0c870', dark), () => ellipse(ctx, -1, 2, 10, 6.5), 1.2);
  // patas traseiras e dianteiras com garras de águia
  for (const [x, claw] of [[-7, false], [-3, false], [5, true], [8, true]] as const) {
    line(ctx, claw ? '#e8c050' : fur, 2.2, () => {
      ctx.moveTo(x, 6);
      ctx.lineTo(x + (claw ? p.attack * 2 : 0), 11);
    });
    if (claw) shape(ctx, '#2a1a0a', () => poly(ctx, [x - 1, 11, x + 3, 12, x + 1, 13.5]), 0.4);
  }
  // peito e cabeça de águia branca
  shape(ctx, '#fff8e8', () => ellipse(ctx, 7, -3, 5, 6), 1);
  shape(ctx, '#fffaf0', () => circle(ctx, 9, -10, 5), 1.1);
  shape(ctx, '#e8a020', () => {
    ctx.moveTo(12.5, -11);
    ctx.quadraticCurveTo(18, -10, 16, -6.5 + p.attack);
    ctx.lineTo(13, -8);
    ctx.closePath();
  }, 0.8);
  glowingEye(ctx, 10, -11, 1, '#ffb020');
  // coroa de penas douradas
  shape(ctx, GOLD, () => poly(ctx, [5, -13, 6, -18, 8, -14, 9.5, -19, 11, -14, 12.5, -17, 13, -12.5]), 0.6);
}

/** Serafim Corrompido: seis asas, rosto de máscara dourada rachada, chamas violetas e lança de luz. */
export function drawSeraph(ctx: Ctx, p: Pose): void {
  const flap = Math.sin(p.time * 2.5);
  const float = Math.sin(p.time * 1.8) * 1.4;
  halo(ctx, 0, -6 + float, 26, '#c8a0ff', 0.4 + Math.sin(p.time * 3) * 0.1);
  // três pares de asas: alto, meio, baixo (brancas manchadas de violeta)
  for (const [y, span, f] of [
    [-14, 18, 0.5],
    [-6, 22, 0.8],
    [2, 15, 0.4],
  ] as const) {
    for (const side of [-1, 1]) featherWing(ctx, side, side * 2, y + float, span, flap * f, '#f4ecff', '#7a4ac8');
  }
  // túnica longa
  shape(ctx, vertical(ctx, -10, 12, '#ffffff', '#b8a0e0'), () => {
    ctx.moveTo(-5, -9 + float);
    ctx.lineTo(5, -9 + float);
    ctx.lineTo(8, 12 + float);
    ctx.lineTo(-8, 12 + float);
    ctx.closePath();
  });
  shape(ctx, GOLD, () => ctx.roundRect(-5, -3 + float, 10, 1.8, 0.8), 0.4);
  // máscara dourada rachada com olhos violeta
  shape(ctx, radial(ctx, 0, -15 + float, 6, '#ffe9a0', '#c8901a'), () => ellipse(ctx, 0, -15 + float, 4.8, 5.4), 1);
  line(ctx, '#5a3a0a', 0.7, () => {
    ctx.moveTo(1, -20 + float);
    ctx.lineTo(-0.5, -16 + float);
    ctx.lineTo(1.5, -12 + float);
  }, false);
  glowingEye(ctx, -1.8, -15.5 + float, 1, '#c87aff');
  glowingEye(ctx, 1.8, -15.5 + float, 1, '#c87aff');
  // auréola de chamas violeta
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI;
    const h = 3 + Math.sin(p.time * 8 + i) * 1.2;
    const x = Math.cos(a) * 7;
    const y = -18 + float + Math.sin(a) * 4;
    shape(ctx, i % 2 ? '#e8b0ff' : '#9a4aff', () => poly(ctx, [x - 1.4, y, x, y - h, x + 1.4, y]), 0);
  }
  // lança de luz (ergue ao atacar)
  ctx.save();
  ctx.translate(13, -2 + float);
  ctx.rotate(0.1 - p.attack * 0.5);
  line(ctx, GOLD, 1.4, () => {
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -16);
  });
  halo(ctx, 0, -18, 6 + p.attack * 4, '#fff2c0', 0.7);
  shape(ctx, '#fffaf0', () => poly(ctx, [-2, -15, 0, -22, 2, -15]), 0.5);
  ctx.restore();
}
