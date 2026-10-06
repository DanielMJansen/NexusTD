// Raça Necromante: Guerreiro Esqueleto, Ceifador, Drenador e o herói Senhor dos Mortos.
// O esqueleto aliado erguido (inimigo 'boneWarrior') usa o desenho do Guerreiro Esqueleto.
import {
  circle,
  ellipse,
  formA,
  formB,
  glowingEye,
  line,
  poly,
  radial,
  shape,
  skin,
  TAU,
  vertical,
  type Ctx,
  type Pose,
} from './spriteKit';

const BONE = '#ece4cc';
const BONE_DARK = '#a89c80';

function skullHead(ctx: Ctx, x: number, y: number, r: number, eyes: string): void {
  shape(ctx, radial(ctx, x, y, r, '#fffaf0', BONE_DARK), () => circle(ctx, x, y, r));
  shape(ctx, BONE, () => ctx.roundRect(x - r * 0.45, y + r * 0.55, r * 1.1, r * 0.55, 1), 0.9);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.05, y, r * 0.3, r * 0.34), 0);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.62, y, r * 0.24, r * 0.32), 0);
  glowingEye(ctx, x + r * 0.08, y + 0.2, r * 0.14, eyes);
  glowingEye(ctx, x + r * 0.62, y + 0.2, r * 0.12, eyes);
}

/** Guerreiro Esqueleto: ossos, escudo redondo e espada. A: Cavaleiro da Morte (armadura negra com chifres); B: Legião de Ossos (estandarte de ossos). */
export function drawSkeletonWarrior(ctx: Ctx, p: Pose, ally = false): void {
  const knight = formA(p);
  const legion = formB(p);
  const step = p.moving ? Math.sin(p.time * 9) : 0;
  const eyes = ally ? '#7affb0' : knight ? '#7affb0' : legion ? '#c86aff' : '#7affb0';
  line(ctx, BONE, 1.8, () => {
    ctx.moveTo(-2, 5);
    ctx.lineTo(-3 + step * 2, 14);
    ctx.moveTo(2, 5);
    ctx.lineTo(3 - step * 2, 14);
  });
  if (knight) {
    shape(ctx, vertical(ctx, -10, 6, '#3a3a48', '#121218'), () => ctx.roundRect(-6, -10, 12, 16, 3));
    shape(ctx, '#5adca0', () => ctx.rect(-6, -2, 12, 1.4), 0);
  } else {
    line(ctx, BONE, 1.6, () => {
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 5);
    });
    ctx.strokeStyle = BONE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const y of [-6, -3, 0]) {
      ctx.moveTo(-4, y);
      ctx.quadraticCurveTo(0, y - 2, 4, y);
    }
    ctx.stroke();
  }
  // escudo redondo atrás
  shape(ctx, radial(ctx, -7, -1, 6, knight ? '#5a5a6a' : '#8a6a3a', knight ? '#1a1a22' : '#4a3018'), () => circle(ctx, -7, -1, 5.5));
  shape(ctx, knight ? '#5adca0' : '#c8c0a0', () => circle(ctx, -7, -1, 1.4), 0.5);
  // espada (golpe de cima para baixo)
  ctx.save();
  ctx.translate(5, -4);
  ctx.rotate(-1.2 + p.attack * 2);
  line(ctx, knight ? '#9affd0' : '#d0d8e4', 1.6, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -15);
  });
  shape(ctx, '#5a3a1a', () => ctx.rect(-2.5, -1, 5, 1.6), 0.6);
  ctx.restore();
  skullHead(ctx, 1, -16, 5, eyes);
  if (knight) {
    shape(ctx, '#121218', () => poly(ctx, [-4, -20, -4.5, -27, 0, -21]), 0.8);
    shape(ctx, '#121218', () => poly(ctx, [5, -21, 8, -27, 6.5, -20]), 0.8);
  }
  if (legion) {
    // estandarte de ossos nas costas
    line(ctx, '#5a3a1a', 1.2, () => {
      ctx.moveTo(-9, 10);
      ctx.lineTo(-9, -24);
    });
    shape(ctx, vertical(ctx, -24, -12, '#6a2a8a', '#2a0a3a'), () => poly(ctx, [-9, -24, 1, -22, -2, -18, 1, -14, -9, -13]), 0.8);
    skullHead(ctx, -4.5, -18.5, 2, '#c86aff');
  }
}

/** Ceifador: manto com capuz e foice. A: Ceifador Sombrio (chamas roxas, foice maior); B: Colhedor de Almas (lanterna de almas). */
export function drawReaper(ctx: Ctx, p: Pose): void {
  const dark = formA(p);
  const souls = formB(p);
  const float = Math.sin(p.time * 2) * 1.2;
  ctx.translate(0, float - 2);
  const robe = dark ? '#2a1a3a' : '#2a2a30';
  shape(ctx, vertical(ctx, -12, 14, robe, '#08060c'), () => {
    ctx.moveTo(-6, -11);
    ctx.lineTo(6, -11);
    ctx.quadraticCurveTo(10, 4, 8, 14 + Math.sin(p.time * 4) * 1.5);
    ctx.lineTo(0, 11);
    ctx.lineTo(-8, 14 + Math.sin(p.time * 4 + 1) * 1.5);
    ctx.quadraticCurveTo(-10, 4, -6, -11);
    ctx.closePath();
  });
  // foice (corta de cima no ataque)
  ctx.save();
  ctx.translate(6, -2);
  ctx.rotate(-0.4 + p.attack * 1.3);
  line(ctx, '#3a2a1a', 1.6, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  const big = dark ? 1.35 : 1;
  if (dark) {
    ctx.shadowColor = '#b86aff';
    ctx.shadowBlur = 8;
  }
  shape(ctx, vertical(ctx, -18, -8, '#e8ecf4', '#8a92a8'), () => {
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(-12 * big, -20 * big, -16 * big, -9 * big);
    ctx.quadraticCurveTo(-9 * big, -14 * big, 0, -12);
    ctx.closePath();
  });
  ctx.restore();
  // capuz com rosto na sombra
  shape(ctx, vertical(ctx, -27, -8, dark ? '#3a2050' : '#3a3a44', '#0a080e'), () => poly(ctx, [-8, -8, -6, -22, 0, -27, 7, -21, 8, -8]));
  shape(ctx, '#05030a', () => ellipse(ctx, 1.5, -15, 4.5, 5), 0);
  glowingEye(ctx, 0, -15.5, 1, dark ? '#c86aff' : '#ff3a4a');
  glowingEye(ctx, 3.4, -15.5, 1, dark ? '#c86aff' : '#ff3a4a');
  if (dark) {
    ctx.save();
    ctx.shadowColor = '#b86aff';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 3; i++) {
      const h = 4 + Math.sin(p.time * 9 + i * 2) * 1.5;
      shape(ctx, '#c88aff', () => poly(ctx, [-6 + i * 4, 13, -4 + i * 4, 13 - h, -2 + i * 4, 13]), 0);
    }
    ctx.restore();
  }
  if (souls) {
    // lanterna com almas verdes
    line(ctx, '#5a4a3a', 0.8, () => {
      ctx.moveTo(-6, -4);
      ctx.lineTo(-9, 1);
    });
    ctx.save();
    ctx.shadowColor = '#7affb0';
    ctx.shadowBlur = 10;
    shape(ctx, '#3a3a2a', () => ctx.roundRect(-12, 1, 6, 7, 1.5), 0.8);
    shape(ctx, '#9affc8', () => circle(ctx, -9, 4.5, 1.8), 0);
    ctx.restore();
    for (let i = 0; i < 2; i++) {
      const a = p.time * 2 + i * Math.PI;
      shape(ctx, '#9affc8aa', () => circle(ctx, -9 + Math.cos(a) * 7, -6 + Math.sin(a) * 4, 1.4), 0);
    }
  }
}

/** Drenador: cultista curvado com garras de energia. A: Sanguessuga (gavinhas vermelhas); B: Corruptor (corrupção verde-ácida). */
export function drawDrainer(ctx: Ctx, p: Pose): void {
  const leech = formA(p);
  const corrupt = formB(p);
  const energy = leech ? '#ff3a5a' : corrupt ? '#9aff3a' : '#b86aff';
  const robe = leech ? '#4a1420' : corrupt ? '#1e3a14' : '#2a1a40';
  ctx.rotate(0.08);
  shape(ctx, vertical(ctx, -9, 14, robe, '#08060c'), () => poly(ctx, [-6, -8, 5, -9, 9, 14, -9, 14]));
  // mãos estendidas puxando energia
  line(ctx, robe, 2.4, () => {
    ctx.moveTo(3, -5);
    ctx.lineTo(11, -3);
  });
  ctx.save();
  ctx.strokeStyle = energy;
  ctx.shadowColor = energy;
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(11, -3);
    const reach = 6 + p.attack * 8;
    for (let k = 1; k <= 4; k++) {
      ctx.lineTo(11 + (reach * k) / 4, -3 + Math.sin(p.time * 8 + i * 2 + k) * 2 + (i - 1) * 2);
    }
    ctx.stroke();
  }
  ctx.restore();
  // capuz e máscara
  shape(ctx, vertical(ctx, -26, -8, robe, '#08060c'), () => poly(ctx, [-8, -8, -7, -21, 0, -25, 7, -20, 8, -8]));
  shape(ctx, corrupt ? '#9aa88a' : '#d8ccc0', () => ellipse(ctx, 1.5, -15, 4, 4.6), 0.8);
  glowingEye(ctx, 0, -16, 1.1, energy);
  glowingEye(ctx, 3.4, -16, 1.1, energy);
  if (leech) {
    // gotas de sangue subindo
    ctx.fillStyle = '#ff3a5a';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.9 + i / 3) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      circle(ctx, -6 + i * 5, 6 - ph * 16, 1.2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (corrupt) {
    // poça ácida aos pés e gotas
    shape(ctx, '#7ac83a88', () => ellipse(ctx, 0, 14, 10, 2.5), 0);
    ctx.fillStyle = '#9aff3a';
    for (let i = 0; i < 2; i++) {
      const ph = (p.time + i / 2) % 1;
      ctx.beginPath();
      circle(ctx, -4 + i * 7, -2 + ph * 14, 1);
      ctx.fill();
    }
  }
}

/** Herói Senhor dos Mortos: necromante alto com coroa de ossos, foice e chamas verdes. */
export function drawDeathLord(ctx: Ctx, p: Pose): void {
  const robe = skin(p, 'robe', '#1e2e28');
  const robeDark = skin(p, 'robeDark', '#060a08');
  const fire = skin(p, 'fire', '#7affb0');
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  shape(ctx, vertical(ctx, -10, 14, robe, robeDark), () =>
    poly(ctx, [-6, -10, 6, -10, 9 + step, 14, 3, 12, -2, 14, -9 - step, 14]),
  );
  shape(ctx, fire, () => ctx.rect(-6, 0, 12, 1.4), 0.4);
  // ombreiras de crânio
  for (const side of [-1, 1]) skullHead(ctx, side * 6.5 - 1.5, -9, 2.6, fire);
  // foice longa
  ctx.save();
  ctx.translate(8, 0);
  ctx.rotate(-0.25 + p.attack * 1.2);
  line(ctx, '#2a1e14', 1.8, () => {
    ctx.moveTo(0, 13);
    ctx.lineTo(0, -19);
  });
  ctx.shadowColor = fire;
  ctx.shadowBlur = 8;
  shape(ctx, vertical(ctx, -22, -10, '#e8fff4', '#6aa890'), () => {
    ctx.moveTo(0, -19);
    ctx.quadraticCurveTo(-13, -24, -17, -11);
    ctx.quadraticCurveTo(-9, -17, 0, -15);
    ctx.closePath();
  });
  ctx.restore();
  // rosto cadavérico, capuz e coroa de ossos
  const hy = -17;
  shape(ctx, vertical(ctx, hy - 9, hy + 9, robe, robeDark), () => poly(ctx, [-8, hy + 8, -7, hy - 4, 1, hy - 9, 8, hy - 4, 8, hy + 8]));
  shape(ctx, radial(ctx, 1, hy + 1, 5, '#d8e8d8', '#8aa898'), () => ellipse(ctx, 1.5, hy + 1.5, 4.4, 5), 0.8);
  glowingEye(ctx, 0, hy + 0.5, 1.2, fire);
  glowingEye(ctx, 3.4, hy + 0.5, 1.2, fire);
  for (let i = 0; i < 5; i++) {
    const x = -3 + i * 2;
    shape(ctx, BONE, () => poly(ctx, [x - 0.8, hy - 6, x, hy - 10 - (i % 2) * 2, x + 0.8, hy - 6]), 0.5);
  }
  ctx.save();
  ctx.shadowColor = fire;
  ctx.shadowBlur = 10;
  for (let i = 0; i < 2; i++) {
    const a = p.time * 2 + i * Math.PI;
    shape(ctx, fire, () => circle(ctx, Math.cos(a) * 12, -2 + Math.sin(a) * 5, 1.4), 0);
  }
  ctx.restore();
  void TAU;
}
