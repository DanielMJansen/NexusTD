// Raça Górgona: Arqueira Serpente, Medusa, Basilisco e a heroína Rainha Górgona.
import {
  halo,
  circle,
  ellipse,
  eye,
  formA,
  formB,
  glowingEye,
  GOLD,
  line,
  poly,
  radial,
  shape,
  skin,
  vertical,
  type Ctx,
  type Pose,
} from './spriteKit';

/** Cauda de serpente no lugar das pernas (corpo de naga). */
function nagaTail(ctx: Ctx, t: number, color: string, dark: string): void {
  const wave = Math.sin(t * 3) * 2;
  shape(ctx, vertical(ctx, 0, 14, color, dark), () => {
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-9, 10, -2, 13);
    ctx.quadraticCurveTo(8, 15 + wave, 14, 10 + wave);
    ctx.quadraticCurveTo(9, 11, 2, 9);
    ctx.quadraticCurveTo(4, 4, 5, 0);
    ctx.closePath();
  });
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (const x of [-2, 2, 6]) {
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 2, 12);
  }
  ctx.stroke();
}

/** Cabelo de serpentes que se mexem. */
function snakeHair(ctx: Ctx, hy: number, t: number, color: string, count = 5): void {
  for (let i = 0; i < count; i++) {
    const a = -2.6 + (i / (count - 1)) * 2.2;
    const x0 = 1 + Math.cos(a) * 5;
    const y0 = hy + Math.sin(a) * 5;
    const wig = Math.sin(t * 5 + i) * 2;
    line(ctx, color, 1.4, () => {
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + Math.cos(a) * 5 + wig, y0 + Math.sin(a) * 5, x0 + Math.cos(a) * 8, y0 + Math.sin(a) * 8 + wig);
    });
    ctx.fillStyle = '#ff3a3a';
    ctx.beginPath();
    circle(ctx, x0 + Math.cos(a) * 8, y0 + Math.sin(a) * 8 + wig, 0.5);
    ctx.fill();
  }
}

/** Domadora de Serpentes: naga com flauta e uma cobra que dá o bote. A: Víbora (roxa, veneno forte); B: Naja (capuz de naja, cospe em leque). */
export function drawSerpentArcher(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Rainha das Víboras (A, serpente enorme enrolada) e Hidra Menor (B, três serpentes na mão)
  if (p.supreme && formA(p)) {
    const sway = Math.sin(p.time * 2) * 2;
    line(ctx, '#3a1a5a', 6, () => {
      ctx.moveTo(-14, 13);
      ctx.bezierCurveTo(-22, 2, -6, -4, -14, -16 + sway);
    });
    line(ctx, '#8a4ac8', 4, () => {
      ctx.moveTo(-14, 13);
      ctx.bezierCurveTo(-22, 2, -6, -4, -14, -16 + sway);
    }, false);
    shape(ctx, '#8a4ac8', () => ellipse(ctx, -12, -19 + sway, 4.5, 3, 0.4), 0.7);
    glowingEye(ctx, -10.5, -20 + sway, 0.9, '#ffe060');
  }
  const viper = formA(p);
  const cobra = formB(p);
  const scale = viper ? '#8a4ad8' : cobra ? '#c8a03a' : '#4ab86a';
  const dark = viper ? '#3a1a6a' : cobra ? '#5a4010' : '#1e5a2e';
  nagaTail(ctx, p.time, '#5a8a5a', '#24402a');
  shape(ctx, vertical(ctx, -10, 2, '#e8dcc0', '#a89878'), () => poly(ctx, [-5, -10, 5, -10, 6, 2, -6, 2]));
  shape(ctx, scale, () => ctx.rect(-5.5, -4, 11, 1.6), 0.5);
  const hy = -15;
  snakeHair(ctx, hy, p.time, '#5ab85a', 4);
  shape(ctx, radial(ctx, 1, hy, 6, '#d8f0c8', '#8ab878'), () => circle(ctx, 1, hy, 6));
  glowingEye(ctx, 0.5, hy, 1.1, '#ffd23a');
  glowingEye(ctx, 4, hy, 1.1, '#ffd23a');
  // flauta
  line(ctx, '#8a5a2e', 1.4, () => {
    ctx.moveTo(4, hy + 3);
    ctx.lineTo(11, hy + 6);
  });
  // a serpente companheira: enrolada à frente, ergue-se e dá o bote no ataque
  const strike = p.attack;
  const sway = Math.sin(p.time * 3) * 1.5;
  const headX = 12 + strike * 8;
  const headY = -6 - (1 - strike) * 4 + sway * (1 - strike);
  shape(ctx, dark, () => ellipse(ctx, 10, 10, 6, 2.5), 0.8);
  line(ctx, scale, 2.6, () => {
    ctx.moveTo(8, 9);
    ctx.quadraticCurveTo(14, 4, 11, -1);
    ctx.quadraticCurveTo(9 + strike * 4, -5, headX, headY);
  });
  if (cobra) {
    // capuz de naja
    shape(ctx, vertical(ctx, headY - 5, headY + 4, '#e8c060', '#7a5a1a'), () => ellipse(ctx, headX - 1, headY, 3.6, 4.6), 0.7);
  }
  shape(ctx, scale, () => ellipse(ctx, headX + 1.5, headY, 3, 2.1), 0.8);
  ctx.fillStyle = viper ? '#ff6aff' : '#ffd23a';
  ctx.beginPath();
  circle(ctx, headX + 2, headY - 0.8, 0.6);
  ctx.fill();
  if (strike > 0.2) {
    // língua bífida no bote
    ctx.strokeStyle = '#e0243a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(headX + 4.4, headY + 0.4);
    ctx.lineTo(headX + 6.5, headY - 0.6);
    ctx.moveTo(headX + 4.4, headY + 0.4);
    ctx.lineTo(headX + 6.5, headY + 1.4);
    ctx.stroke();
  }
  if (p.supreme && formB(p)) {
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.5 + Math.sin(p.time * 4 + i) * 0.1;
      const x = 9 + Math.cos(a) * 9;
      const y = -4 + Math.sin(a) * 9;
      line(ctx, '#c8a83a', 2, () => {
        ctx.moveTo(8, -2);
        ctx.quadraticCurveTo(10 + i * 2, -6, x, y);
      });
      shape(ctx, '#f0c35a', () => ellipse(ctx, x, y, 2.6, 1.8, a), 0.6);
      glowingEye(ctx, x + 0.6, y - 0.4, 0.5, '#3a1a1a');
    }
  }
}

/** Medusa: serpentes no cabelo e olhar que brilha. A: Olhar Pétreo (olhos dourados intensos); B: Górgona Ancestral (coroa antiga, olhos vermelhos). */
export function drawMedusa(ctx: Ctx, p: Pose): void {
  const stone = formA(p);
  const ancient = formB(p);
  nagaTail(ctx, p.time, '#6a9a5a', '#2a4a24');
  shape(ctx, vertical(ctx, -10, 2, '#e8e0c8', '#a8a08a'), () => poly(ctx, [-5, -10, 5, -10, 6, 2, -6, 2]));
  shape(ctx, GOLD, () => ctx.rect(-5.5, -3, 11, 1.4), 0.5);
  const hy = -15;
  snakeHair(ctx, hy, p.time, ancient ? '#4a7a3a' : '#5ab85a', 7);
  shape(ctx, radial(ctx, 1, hy, 6.4, '#e0f0d8', '#98b890'), () => circle(ctx, 1, hy, 6.3));
  const gaze = 1 + p.attack * 0.8;
  const eyes = ancient ? '#ff3a3a' : stone ? '#ffd25a' : '#c8ff6a';
  ctx.save();
  ctx.shadowColor = eyes;
  ctx.shadowBlur = 6 + p.attack * 10;
  glowingEye(ctx, 0, hy, 1.4 * gaze, eyes);
  glowingEye(ctx, 4, hy, 1.4 * gaze, eyes);
  ctx.restore();
  if (p.attack > 0.2) {
    // raio do olhar
    ctx.strokeStyle = eyes + '88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, hy);
    ctx.lineTo(18, hy + 3);
    ctx.stroke();
  }
  if (ancient) {
    shape(ctx, vertical(ctx, hy - 12, hy - 5, '#e8d090', '#8a6a2a'), () =>
      poly(ctx, [-4.5, hy - 5, -5, hy - 10, -2, hy - 7, 1, hy - 12, 4, hy - 7, 7, hy - 10, 6.5, hy - 5]),
    );
  }
  if (stone) {
    // pedrinhas girando (estátuas em miniatura)
    for (let i = 0; i < 2; i++) {
      const a = p.time * 1.5 + i * Math.PI;
      shape(ctx, '#9a9a9a', () => ctx.roundRect(Math.cos(a) * 13 - 1.5, -4 + Math.sin(a) * 4, 3, 4, 0.8), 0.5);
    }
  }
  if (p.supreme && formA(p)) {
    // cabelo de serpentes erguido e olhar brilhando
    for (let i = 0; i < 6; i++) {
      const x = -7 + i * 2.8;
      const h = 9 + Math.sin(p.time * 5 + i) * 2;
      line(ctx, '#3a9a6a', 1.6, () => {
        ctx.moveTo(x, -20);
        ctx.quadraticCurveTo(x - 2 + Math.sin(p.time * 3 + i) * 2, -20 - h * 0.6, x + 1, -20 - h);
      });
      shape(ctx, '#5ad88a', () => circle(ctx, x + 1, -20 - h, 1.3), 0.4);
    }
    halo(ctx, 2, -15, 8, '#e8ff6a', 0.5 + p.attack * 0.4);
  }
  if (p.supreme && formB(p)) {
    // coroa de cobras douradas
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 3;
      shape(ctx, '#f0c35a', () => poly(ctx, [x - 1.2, -21, x, -28 - (i % 2) * 2, x + 1.2, -21]), 0.6);
      shape(ctx, '#ff3a3a', () => circle(ctx, x, -27.5 - (i % 2) * 2, 0.6), 0);
    }
  }
}

/** Basilisco: lagarto-serpente de crista. A: Basilisco Rei (crista coroada); B: Cuspidor (baba ácida verde). */
export function drawBasilisk(ctx: Ctx, p: Pose): void {
  const king = formA(p);
  const spitter = formB(p);
  const body = king ? '#4a7a3a' : spitter ? '#5a8a2a' : '#5a6a3a';
  const dark = king ? '#1e3a14' : spitter ? '#2a4a10' : '#2a321a';
  const stride = p.moving ? Math.sin(p.time * 8) : 0;
  // cauda e corpo baixo
  shape(ctx, dark, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 6, -19, 0);
    ctx.quadraticCurveTo(-14, 4, -6, 9);
    ctx.closePath();
  });
  for (const [x, ph] of [[-6, 0], [4, Math.PI]] as const) {
    shape(ctx, dark, () => ctx.roundRect(x + Math.sin(p.time * 8 + ph) * stride, 8, 3.5, 6, 1.2), 0.8);
  }
  shape(ctx, radial(ctx, 0, 3, 11, body, dark), () => ellipse(ctx, 0, 3, 11, 7));
  shape(ctx, '#c8d0a0', () => ellipse(ctx, 2, 6, 6, 3), 0.6);
  // crista nas costas
  for (let i = 0; i < 4; i++) {
    shape(ctx, king ? GOLD : '#c84a3a', () => poly(ctx, [-8 + i * 4, -3, -6 + i * 4, -8 - (i % 2) * 2, -4 + i * 4, -3]), 0.6);
  }
  // cabeça e boca (abre no ataque)
  const open = p.attack * 3;
  shape(ctx, radial(ctx, 11, -3, 6, body, dark), () => ellipse(ctx, 11, -3, 6, 4.5));
  shape(ctx, dark, () => ellipse(ctx, 13, 1 + open * 0.5, 5, 1.6 + open * 0.4), 0.8);
  eye(ctx, 11, -5, 1.6, '#ffd23a', 0.4);
  if (king) {
    shape(ctx, vertical(ctx, -12, -6, '#ffe07a', '#c8901a'), () => poly(ctx, [7, -7, 7.5, -12, 9.5, -9, 11, -13, 12.5, -9, 14.5, -12, 14.5, -7]), 0.6);
  }
  if (spitter) {
    ctx.fillStyle = '#9aff3a';
    for (let i = 0; i < 2; i++) {
      const ph = (p.time * 1.4 + i / 2) % 1;
      ctx.beginPath();
      ellipse(ctx, 15 + i, 2 + ph * 8, 0.9, 1.4);
      ctx.fill();
    }
  }
  if (p.supreme && formA(p)) {
    // cristas e chifres de pedra
    for (let i = 0; i < 4; i++) shape(ctx, vertical(ctx, -22, -8, '#c8c0b0', '#6a6258'), () => poly(ctx, [-8 + i * 4, -8, -6 + i * 4, -20 + (i % 2) * 3, -4 + i * 4, -8]), 0.7);
  }
  if (p.supreme && formB(p)) {
    // glândulas ácidas brilhando e poça sob o corpo
    shape(ctx, '#9aff3a55', () => ellipse(ctx, 0, 13, 16, 3.5), 0);
    for (const [x, y] of [[-6, -2], [0, 0], [6, -3]] as const) halo(ctx, x, y, 4, '#9aff3a', 0.7 + Math.sin(p.time * 4 + x) * 0.2);
  }
}

/** Heroína Rainha Górgona: naga dourada com coroa e cabelo de serpentes. */
export function drawGorgonQueen(ctx: Ctx, p: Pose): void {
  const scales = skin(p, 'scales', '#3a9a6a');
  const scalesDark = skin(p, 'scalesDark', '#14402a');
  const armor = skin(p, 'armor', GOLD);
  nagaTail(ctx, p.time, scales, scalesDark);
  shape(ctx, vertical(ctx, -11, 2, scales, scalesDark), () => ctx.roundRect(-5, -11, 10, 13, 3));
  shape(ctx, armor, () => poly(ctx, [-5, -10, 5, -10, 3, -5, -3, -5]), 0.7);
  // lança-serpente
  ctx.save();
  ctx.translate(8, 0);
  ctx.rotate(0.35 + p.attack * 0.6);
  line(ctx, armor, 1.4, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  shape(ctx, scales, () => poly(ctx, [-2, -16, 0, -22, 2, -16]), 0.6);
  ctx.restore();
  const hy = -16;
  snakeHair(ctx, hy, p.time, scales, 7);
  shape(ctx, radial(ctx, 1, hy, 6.5, '#e0f0d8', '#98b890'), () => circle(ctx, 1, hy, 6.5));
  ctx.save();
  ctx.shadowColor = armor;
  ctx.shadowBlur = 6 + p.attack * 10;
  glowingEye(ctx, 0, hy, 1.4, armor);
  glowingEye(ctx, 4, hy, 1.4, armor);
  ctx.restore();
  shape(ctx, vertical(ctx, hy - 13, hy - 6, '#fff0a0', '#c8901a'), () =>
    poly(ctx, [-4.5, hy - 6, -5, hy - 11, -2, hy - 8, 1, hy - 13, 4, hy - 8, 7, hy - 11, 6.5, hy - 6]),
  );
}
