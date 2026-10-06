// Inimigos e chefes do Pântano (Fase 2): Sapo-Boi, Sanguessuga, Bruxa do Brejo, Crocodilo, Fogo-fátuo,
// Rei Sapo, Crocodilo Ancião e Hidra.
import { circle, ellipse, glowingEye, halo, line, poly, radial, shape, TAU, vertical, type Ctx, type Pose } from './spriteKit';

/** Sapo grande e verrugoso; agacha antes do salto e abre a boca no ataque. */
export function drawToad(ctx: Ctx, p: Pose, king = false): void {
  const crouch = Math.sin(p.time * 3) * 0.8;
  const skin = king ? '#6a8a2a' : '#5a7a3a';
  const belly = king ? '#e8d890' : '#d8d0a0';
  // patas traseiras
  for (const side of [-1, 1]) {
    shape(ctx, skin, () => ellipse(ctx, side * 9, 9 + crouch * 0.3, 6, 4.5, side * 0.4));
    shape(ctx, skin, () => ellipse(ctx, side * 12, 13, 4, 1.8));
  }
  // corpo
  shape(ctx, radial(ctx, 0, 0 + crouch, 14, king ? '#9aba4a' : '#8aaa5a', skin), () => ellipse(ctx, 0, 1 + crouch, 13, 10.5));
  shape(ctx, belly, () => ellipse(ctx, 1.5, 5 + crouch, 8, 5.5), 0);
  // verrugas
  ctx.fillStyle = king ? '#4a6a1a' : '#3e5a2a';
  for (const [x, y] of [[-7, -3], [-3, -6], [5, -5], [-9, 3], [8, 1]] as const) {
    ctx.beginPath();
    circle(ctx, x, y + crouch, 1.1);
    ctx.fill();
  }
  // patas da frente
  shape(ctx, skin, () => ellipse(ctx, 6, 11, 3, 2));
  shape(ctx, skin, () => ellipse(ctx, -4, 11, 3, 2));
  // boca (abre no ataque)
  const open = p.attack * 4;
  shape(ctx, '#7a2a3a', () => ellipse(ctx, 4, 0 + crouch + open * 0.4, 8, 1.2 + open), 1);
  if (open > 0.5) shape(ctx, '#e86a8a', () => ellipse(ctx, 6 + open, 0 + crouch + open * 0.5, 3 + open, 1.2), 0.8);
  // olhos saltados
  for (const x of [-4, 6]) {
    shape(ctx, skin, () => circle(ctx, x, -8 + crouch, 3.6));
    shape(ctx, '#ffd84a', () => circle(ctx, x + 0.5, -8.5 + crouch, 2.4), 0.6);
    ctx.fillStyle = '#12081c';
    ctx.fillRect(x - 0.5, -9.3 + crouch, 2.2, 1.4);
  }
  if (king) {
    // coroa de junco e vitória-régia
    shape(ctx, '#f0c35a', () => poly(ctx, [-6, -11, -4, -16, -1.5, -12, 1, -17, 3.5, -12, 6, -16, 8, -11]), 1);
    shape(ctx, '#ff6ab0', () => circle(ctx, 1, -14.5, 1.2), 0.6);
  }
}

/** Sanguessuga: verme escuro e brilhante que ondula, com ventosa cheia de dentes. */
export function drawLeech(ctx: Ctx, p: Pose): void {
  const wave = p.time * 8;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) pts.push([-9 + i * 3, Math.sin(wave + i * 0.9) * 1.6 + 4]);
  line(ctx, '#3a1a2a', 6, () => {
    ctx.moveTo(pts[0]![0], pts[0]![1]);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
  });
  line(ctx, '#7a2a4a', 2, () => {
    ctx.moveTo(pts[0]![0], pts[0]![1] - 1.2);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y - 1.2);
  }, false);
  // ventosa
  const head = pts[6]!;
  const bite = p.attack * 1.5;
  shape(ctx, '#5a1a3a', () => circle(ctx, head[0] + 1 + bite, head[1], 3.6));
  shape(ctx, '#e04a6a', () => circle(ctx, head[0] + 2 + bite, head[1], 1.8), 0.6);
  ctx.fillStyle = '#ffe0e8';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU;
    ctx.fillRect(head[0] + 2 + bite + Math.cos(a) * 1.6 - 0.3, head[1] + Math.sin(a) * 1.6 - 0.3, 0.7, 0.7);
  }
}

/** Bruxa do Brejo: velha corcunda coberta de musgo, com cajado de raiz e lanterna verde. */
export function drawBogHag(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.4) * 0.8;
  // manto de musgo
  shape(ctx, vertical(ctx, -12, 14, '#4a5a3a', '#26301e'), () => {
    ctx.moveTo(-5, -10);
    ctx.quadraticCurveTo(-11, 2, -9, 14);
    ctx.lineTo(9, 14);
    ctx.quadraticCurveTo(10, 0, 5, -10);
    ctx.closePath();
  });
  ctx.strokeStyle = '#6a8a4a';
  ctx.lineWidth = 0.9;
  for (const x of [-6, -2, 3, 7]) {
    ctx.beginPath();
    ctx.moveTo(x, 9);
    ctx.quadraticCurveTo(x + 1, 12, x, 15);
    ctx.stroke();
  }
  // capuz e rosto
  shape(ctx, '#3a4a2e', () => ellipse(ctx, 0 + sway, -12, 7, 7));
  shape(ctx, '#9aa080', () => ellipse(ctx, 1.5 + sway, -11, 4.2, 4.5));
  shape(ctx, '#8a9070', () => poly(ctx, [4 + sway, -11, 8.5 + sway, -8.5, 4.5 + sway, -9]), 0.8);
  glowingEye(ctx, 0.2 + sway, -12.5, 1, '#aaff5a');
  glowingEye(ctx, 3.2 + sway, -12.5, 1, '#aaff5a');
  // cajado de raiz na frente, com lanterna
  ctx.save();
  ctx.translate(8, -2);
  ctx.rotate(-0.15 + p.attack * 0.6);
  line(ctx, '#5a3a1e', 1.8, () => {
    ctx.moveTo(0, 16);
    ctx.quadraticCurveTo(-1.5, 2, 1, -12);
  });
  halo(ctx, 1.5, -13, 7 + p.attack * 5, '#9aff4a', 0.8);
  shape(ctx, '#caff8a', () => circle(ctx, 1.5, -13, 2.4), 0.8);
  ctx.restore();
  // mão
  shape(ctx, '#9aa080', () => circle(ctx, 8.5, 0, 1.8), 0.9);
}

/** Crocodilo: comprido e blindado; anda rente ao chão e morde no ataque. */
export function drawCrocodile(ctx: Ctx, p: Pose, elder = false): void {
  const walk = Math.sin(p.time * 6) * 1.2;
  const body = elder ? '#3a5a3a' : '#4a6a3a';
  const scales = elder ? '#2a4028' : '#36502a';
  // cauda
  shape(ctx, body, () => {
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-18, 2 + walk, -24, 6 - walk);
    ctx.quadraticCurveTo(-16, 8, -8, 8);
    ctx.closePath();
  });
  // patas
  for (const x of [-5, 6]) {
    shape(ctx, body, () => ellipse(ctx, x + walk * 0.5, 10, 2.6, 2));
    shape(ctx, body, () => ellipse(ctx, x - walk * 0.5, 9, 2.4, 1.8));
  }
  // corpo
  shape(ctx, radial(ctx, 0, 2, 12, elder ? '#5a7a4a' : '#6a8a4a', body), () => ellipse(ctx, 0, 4, 12, 5.5));
  // placas nas costas
  for (let i = -3; i <= 3; i++) shape(ctx, scales, () => poly(ctx, [i * 3 - 1.2, 0, i * 3, -2.5 - (elder ? 1 : 0), i * 3 + 1.2, 0]), 0.6);
  // cabeça com mandíbula (abre no ataque)
  const jaw = p.attack * 0.45;
  ctx.save();
  ctx.translate(10, 3);
  shape(ctx, body, () => ctx.roundRect(0, -3, 12, 4, 2));
  ctx.rotate(jaw);
  shape(ctx, elder ? '#4a6a40' : '#5a7a44', () => ctx.roundRect(0, 0, 12, 3, 1.5));
  ctx.fillStyle = '#f4f0dc';
  for (let x = 2; x < 12; x += 2.4) ctx.fillRect(x, -0.3, 0.9, 1.2);
  ctx.restore();
  glowingEye(ctx, 12, 0, 1.1, elder ? '#ff9a3a' : '#ffd84a');
  if (elder) {
    // cicatrizes e musgo
    line(ctx, '#c8b890', 0.8, () => {
      ctx.moveTo(-3, 1);
      ctx.lineTo(2, 6);
    }, false);
    shape(ctx, '#6a8a3a', () => ellipse(ctx, -4, -2, 4, 1.4), 0.6);
  }
}

/** Fogo-fátuo: chama fantasmagórica azul-esverdeada com rosto. */
export function drawWisp(ctx: Ctx, p: Pose): void {
  const flick = Math.sin(p.time * 9) * 1.5;
  halo(ctx, 0, -4, 16, '#7affe0', 0.7);
  shape(ctx, radial(ctx, 0, -2, 8, '#ffffff', '#5adcc8'), () => {
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-7, -8, -1, -13 - flick);
    ctx.quadraticCurveTo(1, -8, 3, -11 + flick);
    ctx.quadraticCurveTo(7, -6, 6, 0);
    ctx.quadraticCurveTo(0, 5, -6, 0);
    ctx.closePath();
  }, 0);
  ctx.fillStyle = '#1a4a48';
  ctx.beginPath();
  ellipse(ctx, -1.8, -3, 1, 1.4);
  ellipse(ctx, 1.8, -3, 1, 1.4);
  ctx.fill();
  ctx.beginPath();
  ellipse(ctx, 0, 0 + p.attack, 1.4, 0.7 + p.attack);
  ctx.fill();
  // brasas que sobem
  ctx.fillStyle = '#c8fff0';
  for (let i = 0; i < 3; i++) {
    const t = (p.time * 1.3 + i / 3) % 1;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    circle(ctx, Math.sin(i * 2 + p.time * 3) * 3, -6 - t * 12, 0.8);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Hidra: corpo de serpente no pântano e uma cabeça por cabeça viva (pose.level = cabeças). */
export function drawHydra(ctx: Ctx, p: Pose): void {
  const heads = Math.max(1, Math.min(5, p.level || 3));
  // corpo
  shape(ctx, radial(ctx, 0, 6, 16, '#4a8a6a', '#1e4a3a'), () => ellipse(ctx, 0, 8, 15, 7.5));
  for (let i = -2; i <= 2; i++) shape(ctx, '#2a5a44', () => poly(ctx, [i * 5 - 1.5, 2, i * 5, -1, i * 5 + 1.5, 2]), 0.6);
  shape(ctx, '#bada9a', () => ellipse(ctx, 2, 11, 8, 2.6), 0);
  // pescoços e cabeças em leque
  for (let h = 0; h < heads; h++) {
    const spread = heads === 1 ? 0 : (h / (heads - 1) - 0.5) * 2;
    const sway = Math.sin(p.time * 2.2 + h * 1.3) * 2;
    const hx = spread * 13 + sway;
    const hy = -16 - (1 - Math.abs(spread)) * 6 + Math.cos(p.time * 2 + h) * 1.5 - p.attack * 3;
    line(ctx, '#3a7a5a', 4.2, () => {
      ctx.moveTo(spread * 6, 2);
      ctx.quadraticCurveTo(spread * 10 - sway, -6, hx, hy + 3);
    });
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(spread * 0.35);
    shape(ctx, '#4a9a6a', () => ellipse(ctx, 0, 0, 4.6, 3.6));
    shape(ctx, '#3a7a5a', () => poly(ctx, [-2, -3, -1, -6.5, 0.5, -3.2]), 0.6);
    shape(ctx, '#3a7a5a', () => poly(ctx, [1.5, -3, 3, -6, 3.2, -2.6]), 0.6);
    // boca com ácido
    shape(ctx, '#2a1a1a', () => ellipse(ctx, 2.8, 1.6, 2.2, 0.8 + p.attack * 1.2), 0.6);
    if (p.attack > 0.3) halo(ctx, 4, 2.5, 4, '#b8ff4a', p.attack);
    ctx.restore();
    glowingEye(ctx, hx + 1.2, hy - 0.8, 0.9, '#ffd84a');
  }
}
