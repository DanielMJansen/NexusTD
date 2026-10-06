// Inimigos e chefes da Tundra (Fase 3): Lobo Gélido, Golem de Neve, Bola de Neve, Espírito do Gelo,
// Troll da Geleira, Kobold Escavador, Yeti Ancião e Wyrm de Gelo.
import { circle, ellipse, glowingEye, halo, line, poly, radial, shape, vertical, type Ctx, type Pose } from './spriteKit';

/** Lobo de pelo branco-azulado, magro e rápido; morde no ataque. */
export function drawFrostWolf(ctx: Ctx, p: Pose): void {
  const run = Math.sin(p.time * 12);
  const fur = '#dfeefa';
  const shade = '#9ab8d4';
  for (const [x, phase] of [[-6, 0], [-3, 1.5], [5, 0.8], [8, 2.3]] as const) {
    line(ctx, shade, 2, () => {
      ctx.moveTo(x, 5);
      ctx.lineTo(x + Math.sin(p.time * 12 + phase) * 2.5, 12);
    });
  }
  shape(ctx, fur, () => {
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(-16, -6 + run, -19, -3);
    ctx.quadraticCurveTo(-15, 1, -11, 4);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 0, 0, 12, '#ffffff', fur), () => ellipse(ctx, -1, 2, 11, 5.5));
  shape(ctx, shade, () => ellipse(ctx, -2, 5, 8, 2), 0);
  // cabeça e focinho (abre no ataque)
  ctx.save();
  ctx.translate(10, -2);
  shape(ctx, fur, () => ellipse(ctx, 0, 0, 5.5, 4.5));
  shape(ctx, fur, () => poly(ctx, [-3, -3, -1, -9, 1, -3]), 1);
  shape(ctx, fur, () => poly(ctx, [1, -3, 4, -8, 4.5, -2]), 1);
  ctx.rotate(p.attack * 0.4);
  shape(ctx, '#c8dcee', () => ctx.roundRect(3, -1, 6, 3, 1.5), 1);
  ctx.restore();
  glowingEye(ctx, 11.5, -3, 0.9, '#7ad8ff');
  ctx.fillStyle = '#20304a';
  ctx.beginPath();
  circle(ctx, 18.5, -1.5, 1);
  ctx.fill();
}

/** Golem de Neve: três bolas empilhadas, galhos de braço e olhos de carvão. */
export function drawSnowGolem(ctx: Ctx, p: Pose): void {
  const wobble = Math.sin(p.time * 3) * 0.6;
  shape(ctx, radial(ctx, -2, 4, 13, '#ffffff', '#c8dcf0'), () => circle(ctx, 0, 6, 10));
  shape(ctx, radial(ctx, -2, -6, 9, '#ffffff', '#c8dcf0'), () => circle(ctx, wobble, -6, 7.5));
  shape(ctx, radial(ctx, -1, -16, 6, '#ffffff', '#c8dcf0'), () => circle(ctx, wobble * 1.5, -16, 5.5));
  // braços de galho
  for (const side of [-1, 1]) {
    line(ctx, '#6a4a2a', 1.4, () => {
      ctx.moveTo(side * 6, -7);
      ctx.lineTo(side * (13 + p.attack * 3), -11 + p.attack * (side > 0 ? -4 : 0));
      ctx.moveTo(side * 10, -9);
      ctx.lineTo(side * 12, -14);
    });
  }
  ctx.fillStyle = '#1a1a24';
  for (const [x, y] of [[-2, -17], [2.5, -17], [0, -5], [0, -2], [0, 1.5]] as const) {
    ctx.beginPath();
    circle(ctx, x + wobble * 1.5, y, 1);
    ctx.fill();
  }
  shape(ctx, '#ff8a3a', () => poly(ctx, [0.5 + wobble * 1.5, -15.5, 5 + wobble * 1.5, -14.5, 0.5 + wobble * 1.5, -13.8]), 0.6);
  // gorro de gelo
  shape(ctx, '#8ad0ff', () => poly(ctx, [-5 + wobble, -20, 5 + wobble, -20, wobble, -27]), 0.8);
}

/** Bola de neve rolando. */
export function drawSnowball(ctx: Ctx, p: Pose): void {
  ctx.save();
  ctx.translate(0, 4);
  ctx.rotate(p.time * 8);
  shape(ctx, radial(ctx, -2, -2, 7, '#ffffff', '#c8dcf0'), () => circle(ctx, 0, 0, 6));
  ctx.strokeStyle = '#a8c4e0';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0.3, 2.2);
  ctx.stroke();
  ctx.restore();
}

/** Espírito do Gelo: cristal flutuante com rosto e véu de neblina. */
export function drawIceSpirit(ctx: Ctx, p: Pose): void {
  const bob = Math.sin(p.time * 3) * 2;
  halo(ctx, 0, -6 + bob, 16, '#9adcff', 0.6);
  ctx.save();
  ctx.translate(0, bob);
  shape(ctx, vertical(ctx, -18, 6, '#ffffff', '#7ac8ff'), () => poly(ctx, [0, -18, 8, -6, 4, 6, -4, 6, -8, -6]), 1);
  shape(ctx, '#d8f2ff', () => poly(ctx, [0, -18, 3, -6, 0, 4, -3, -6]), 0);
  ctx.fillStyle = '#204a6a';
  ctx.beginPath();
  ellipse(ctx, -2.5, -7, 1, 1.5);
  ellipse(ctx, 2.5, -7, 1, 1.5);
  ctx.fill();
  // fiapos de neblina
  ctx.strokeStyle = '#d8f2ff99';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-4 + i * 4, 6);
    ctx.quadraticCurveTo(-6 + i * 4 + Math.sin(p.time * 4 + i) * 3, 11, -3 + i * 4, 15);
    ctx.stroke();
  }
  ctx.restore();
}

/** Troll da Geleira: enorme, pele azul-acinzentada, cristais de gelo nas costas e clava de gelo. */
export function drawGlacierTroll(ctx: Ctx, p: Pose): void {
  const step = Math.sin(p.time * 4);
  const skin = '#7a90a8';
  shape(ctx, skin, () => ctx.roundRect(-8 + step, 8, 6, 7, 2));
  shape(ctx, skin, () => ctx.roundRect(2 - step, 8, 6, 7, 2));
  shape(ctx, radial(ctx, -2, -2, 14, '#9ab0c4', '#5a6c84'), () => ellipse(ctx, 0, 0, 12, 11));
  // cristais nas costas
  for (const [x, h] of [[-9, 8], [-5, 11], [-1, 9]] as const) shape(ctx, '#bfe8ff', () => poly(ctx, [x - 2, -6, x, -6 - h, x + 2, -6]), 0.8);
  shape(ctx, '#5a6c84', () => ctx.roundRect(-7, 3, 14, 4, 2), 0.8);
  // cabeça
  shape(ctx, skin, () => ellipse(ctx, 4, -10, 6, 5));
  shape(ctx, '#e8f0f8', () => poly(ctx, [5, -6, 6, -3, 7, -6]), 0.6);
  glowingEye(ctx, 3, -11.5, 1, '#8ad8ff');
  glowingEye(ctx, 6.5, -11.5, 1, '#8ad8ff');
  // clava de gelo
  ctx.save();
  ctx.translate(10, -1);
  ctx.rotate(0.5 + p.attack * 1.3);
  line(ctx, '#6a4a2a', 2, () => {
    ctx.moveTo(0, 2);
    ctx.lineTo(0, -12);
  });
  shape(ctx, vertical(ctx, -20, -10, '#ffffff', '#8acfff'), () => poly(ctx, [-3.5, -11, 0, -21, 3.5, -11, 0, -8]), 1);
  ctx.restore();
}

/** Kobold Escavador: pequeno, com picareta e lanterna no capacete. */
export function drawKobold(ctx: Ctx, p: Pose): void {
  const step = Math.sin(p.time * 9) * 1.5;
  shape(ctx, '#8a5a3a', () => ctx.roundRect(-4 + step, 6, 3, 6, 1));
  shape(ctx, '#8a5a3a', () => ctx.roundRect(1 - step, 6, 3, 6, 1));
  shape(ctx, '#a86a42', () => ellipse(ctx, 0, 1, 6, 6.5));
  shape(ctx, '#6a4a32', () => ctx.roundRect(-5, 2, 10, 3, 1), 0.8);
  shape(ctx, '#b87a4a', () => ellipse(ctx, 2, -7, 5.5, 4.5));
  shape(ctx, '#d4a070', () => poly(ctx, [5, -7, 10, -6, 5, -4.5]), 0.8);
  // capacete com lanterna
  shape(ctx, '#d0a030', () => ellipse(ctx, 1, -10.5, 5.5, 3));
  halo(ctx, 5, -11, 6, '#ffe08a', 0.8);
  shape(ctx, '#fff4c0', () => circle(ctx, 5, -11, 1.4), 0.6);
  glowingEye(ctx, 3.5, -7.5, 0.8, '#ffd84a');
  // picareta
  ctx.save();
  ctx.translate(5, 0);
  ctx.rotate(-0.4 + p.attack * 1.4);
  line(ctx, '#6a4a2a', 1.2, () => {
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -10);
  });
  shape(ctx, '#b8c4d0', () => {
    ctx.moveTo(-5, -9);
    ctx.quadraticCurveTo(0, -13, 5, -9);
    ctx.lineTo(0, -10.5);
    ctx.closePath();
  }, 0.8);
  ctx.restore();
}

/** Yeti Ancião: massa de pelo branco, chifres e uma bola de neve na mão. */
export function drawYeti(ctx: Ctx, p: Pose): void {
  const breathe = Math.sin(p.time * 2) * 0.8;
  shape(ctx, '#d8e4ee', () => ctx.roundRect(-9, 8, 7, 7, 3));
  shape(ctx, '#d8e4ee', () => ctx.roundRect(2, 8, 7, 7, 3));
  shape(ctx, radial(ctx, -2, -2, 15, '#ffffff', '#bccbd8'), () => ellipse(ctx, 0, 0, 13, 12 + breathe));
  // tufos de pelo
  ctx.strokeStyle = '#a8b8c8';
  ctx.lineWidth = 0.9;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 3.5, 6);
    ctx.lineTo(i * 3.5 + 1, 10);
    ctx.stroke();
  }
  // rosto azul e chifres
  shape(ctx, '#ffffff', () => ellipse(ctx, 1, -12, 8, 7));
  shape(ctx, '#7a9ab8', () => ellipse(ctx, 2, -10.5, 5, 4), 0.8);
  for (const side of [-1, 1]) shape(ctx, '#d0c0a0', () => poly(ctx, [side * 5, -17, side * 9, -24, side * 7, -16]), 0.8);
  glowingEye(ctx, 0, -12, 1, '#3ac0ff');
  glowingEye(ctx, 4, -12, 1, '#3ac0ff');
  shape(ctx, '#2a3a4a', () => ellipse(ctx, 2, -8.5, 2.5, 0.8 + p.attack * 1.5), 0.6);
  // braço erguido com bola de neve
  ctx.save();
  ctx.translate(11, -4);
  ctx.rotate(-0.6 - p.attack * 1.2);
  shape(ctx, '#e8f0f6', () => ctx.roundRect(-2.5, -11, 5, 12, 2.5));
  shape(ctx, '#f8fcff', () => circle(ctx, 0, -14, 4), 0.8);
  ctx.restore();
}

/** Wyrm de Gelo: serpente-dragão de escamas azuis com crista de cristais (só a parte que sai do gelo). */
export function drawFrostWyrm(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2);
  // corpo em arco saindo do gelo
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = -16 + t * 26;
    const y = 6 - Math.sin(t * Math.PI) * 14 + sway * t;
    shape(ctx, radial(ctx, x - 1, y - 2, 7, '#bfe4ff', '#4a7aa8'), () => circle(ctx, x, y, 6.5 - t * 1.2));
    if (i > 0 && i < 5) shape(ctx, '#e8f8ff', () => poly(ctx, [x - 2, y - 5, x, y - 11, x + 2, y - 5]), 0.6);
  }
  // cabeça
  ctx.save();
  ctx.translate(12, -6 + sway);
  ctx.rotate(-0.2 - p.attack * 0.3);
  shape(ctx, radial(ctx, 0, -2, 8, '#d0ecff', '#4a7aa8'), () => ellipse(ctx, 3, 0, 9, 6));
  shape(ctx, '#2a4a6a', () => ellipse(ctx, 9, 2, 3, 1 + p.attack * 2.5), 0.6);
  for (const k of [-1, 1]) shape(ctx, '#e8f8ff', () => poly(ctx, [-2, -4 * k, -9, -7 * k, -3, -1 * k]), 0.7);
  ctx.restore();
  glowingEye(ctx, 17, -9 + sway, 1.2, '#7affff');
  if (p.attack > 0.3) halo(ctx, 24, -4 + sway, 8, '#bff4ff', p.attack);
  // gelo rachado na base
  ctx.strokeStyle = '#9ad0f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.lineTo(-14, 8);
  ctx.lineTo(-8, 11);
  ctx.moveTo(8, 9);
  ctx.lineTo(16, 7);
  ctx.lineTo(22, 10);
  ctx.stroke();
}
