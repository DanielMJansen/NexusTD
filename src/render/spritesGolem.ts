// Raça Golem: Muralha, Cristal, Magma e o herói Colosso.
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

/** Bloco de pedra com contorno e uma rachadura. */
function rock(ctx: Ctx, x: number, y: number, w: number, h: number, light: string, dark: string, r = 3): void {
  shape(ctx, vertical(ctx, y, y + h, light, dark), () => ctx.roundRect(x, y, w, h, r));
}

/** Muralha: golem quadrado de blocos. A: Fortaleza (ameias de torre e escudo de pedra); B: Avalanche (neve e punhos com espinhos). */
export function drawWall(ctx: Ctx, p: Pose): void {
  const fort = formA(p);
  const snow = formB(p);
  const light = snow ? '#c8d4e4' : '#9a9488';
  const dark = snow ? '#6a7a90' : '#56504a';
  const slam = p.attack;
  // pernas grossas
  rock(ctx, -9, 7, 7, 7, light, dark, 2);
  rock(ctx, 2, 7, 7, 7, light, dark, 2);
  // tronco de blocos
  rock(ctx, -11, -9, 22, 17, light, dark, 4);
  ctx.strokeStyle = '#3a342e';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-11, -1);
  ctx.lineTo(11, -1);
  ctx.moveTo(0, -9);
  ctx.lineTo(0, -1);
  ctx.moveTo(-5, -1);
  ctx.lineTo(-5, 8);
  ctx.stroke();
  // braços (punho desce no golpe)
  for (const side of [-1, 1]) {
    rock(ctx, side > 0 ? 11 : -16, -6 + (side > 0 ? slam * 5 : 0), 5, 12, light, dark, 2);
    if (snow) {
      for (let i = 0; i < 3; i++) {
        const x = (side > 0 ? 13.5 : -13.5) + (i - 1) * 1.6;
        const y = 6 + (side > 0 ? slam * 5 : 0);
        shape(ctx, '#e8f4ff', () => poly(ctx, [x - 0.8, y, x, y + 3, x + 0.8, y]), 0.4);
      }
    }
  }
  // cabeça pequena com olhos
  rock(ctx, -6, -18, 12, 9, light, dark, 3);
  glowingEye(ctx, -2, -14, 1.3, snow ? '#9fdcff' : '#ffb84a');
  glowingEye(ctx, 2.5, -14, 1.3, snow ? '#9fdcff' : '#ffb84a');
  if (fort) {
    // ameias de torre e escudo de pedra
    for (let i = 0; i < 3; i++) rock(ctx, -6 + i * 4.5, -22, 3, 4, light, dark, 0.5);
    shape(ctx, vertical(ctx, -6, 10, '#c8c0b0', '#7a7266'), () => {
      ctx.moveTo(-15, -6);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-6, 4);
      ctx.quadraticCurveTo(-10, 10, -15, 4);
      ctx.closePath();
    });
  }
  if (snow) {
    // neve no topo
    shape(ctx, '#ffffff', () => {
      ctx.moveTo(-7, -17);
      ctx.quadraticCurveTo(0, -22, 7, -17);
      ctx.lineTo(5, -15.5);
      ctx.lineTo(2, -17);
      ctx.lineTo(-2, -15.5);
      ctx.lineTo(-5, -17);
      ctx.closePath();
    }, 0.6);
  }
  // Formas Supremas: Montanha Viva (A, musgo e pinheiros no alto) e Terremoto (B, pedras orbitando à frente)
  if (p.supreme && formA(p)) {
    shape(ctx, '#3a8a3a', () => ellipse(ctx, 0, -17, 12, 3), 0.6);
    for (const [x, h] of [[-7, 9], [0, 12], [7, 8]] as const) {
      shape(ctx, '#2a6a3a', () => poly(ctx, [x - 3.5, -17, x, -17 - h, x + 3.5, -17]), 0.7);
      shape(ctx, '#5a3a1a', () => ctx.rect(x - 0.6, -17, 1.2, 2), 0);
    }
  }
  if (p.supreme && formB(p)) {
    for (let i = 0; i < 4; i++) {
      const a = p.time * 1.2 + (i * TAU) / 4;
      shape(ctx, '#8a8a9a', () => ctx.roundRect(Math.cos(a) * 18 - 2.5, -6 + Math.sin(a) * 7 - 2.5, 5, 5, 1.2), 0.7);
    }
  }
}

/** Facetas de cristal: losango com brilho. */
function crystal(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, glow: string): void {
  shape(ctx, vertical(ctx, y - h, y + h, glow, color), () => poly(ctx, [x, y - h, x + w, y, x, y + h, x - w, y]), 0.9);
  ctx.strokeStyle = '#ffffff88';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}

/** Cristal: golem de cristais violeta. A: Prisma (cabeça-prisma com arco-íris); B: Amplificador (anéis de cristal girando). */
export function drawCrystalGolem(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Caleidoscópio (A, cristais coloridos girando) e Ressonância (B, diapasão de cristal vibrando)
  if (p.supreme && formA(p)) {
    const colors = ['#ff7a9a', '#ffe66a', '#7ae8a0', '#7ac8ff', '#b08aff'];
    colors.forEach((color, i) => {
      const a = p.time * 1.5 + (i * TAU) / colors.length;
      const x = Math.cos(a) * 17;
      const y = -8 + Math.sin(a) * 7;
      shape(ctx, color, () => poly(ctx, [x, y - 3.5, x + 2, y, x, y + 3.5, x - 2, y]), 0.5);
    });
  }
  const prism = formA(p);
  const amp = formB(p);
  const color = amp ? '#3a8ad8' : '#8a4ad8';
  const glow = amp ? '#bfeaff' : '#e0c0ff';
  // pernas e corpo
  crystal(ctx, -4, 10, 3, 5, color, glow);
  crystal(ctx, 4, 10, 3, 5, color, glow);
  crystal(ctx, 0, -1, 9, 10, color, glow);
  crystal(ctx, -10, -2, 3, 6, color, glow);
  crystal(ctx, 10, -2 - p.attack * 2, 3, 6, color, glow);
  // núcleo pulsante
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8 + Math.sin(p.time * 4) * 3 + p.attack * 8;
  shape(ctx, '#ffffff', () => circle(ctx, 0, -1, 2.4), 0.5);
  ctx.restore();
  // cabeça
  if (prism) {
    shape(ctx, vertical(ctx, -24, -12, '#ffffff', '#c8b8ff'), () => poly(ctx, [0, -25, 6, -13, -6, -13]), 0.9);
    const colors = ['#ff6a6a', '#ffd25a', '#6af06a', '#5ab0ff', '#c86aff'];
    colors.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(3, -18);
      ctx.lineTo(10 + i * 0.5, -21 + i * 1.6);
      ctx.stroke();
    });
  } else {
    crystal(ctx, 0, -17, 5, 6, color, glow);
  }
  glowingEye(ctx, -1.5, -17, 1, '#ffffff');
  glowingEye(ctx, 1.8, -17, 1, '#ffffff');
  if (amp) {
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.strokeStyle = '#bfeaffaa';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, -2, 15 + i * 3, 4 + i, p.time * (i ? -1.5 : 1.2), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (p.supreme && formB(p)) {
    // diapasão de cristal acima, com ondas de vibração
    shape(ctx, vertical(ctx, -36, -22, '#e8f8ff', '#5ab0ff'), () => {
      ctx.moveTo(-4, -36);
      ctx.lineTo(-2.4, -36);
      ctx.lineTo(-2.4, -27);
      ctx.lineTo(2.4, -27);
      ctx.lineTo(2.4, -36);
      ctx.lineTo(4, -36);
      ctx.lineTo(4, -25);
      ctx.lineTo(1, -25);
      ctx.lineTo(1, -21);
      ctx.lineTo(-1, -21);
      ctx.lineTo(-1, -25);
      ctx.lineTo(-4, -25);
      ctx.closePath();
    }, 0.6);
    for (let i = 0; i < 2; i++) {
      const t = (p.time * 1.5 + i / 2) % 1;
      ctx.strokeStyle = 'rgba(122, 200, 255, ' + (1 - t) * 0.8 + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -31, 6 + t * 10, -2.6, -0.5);
      ctx.stroke();
    }
  }
}

/** Magma: rocha escura com rachaduras de lava. A: Vulcão (cratera fumegante na cabeça); B: Lava Viva (lava escorrendo). */
export function drawMagmaGolem(ctx: Ctx, p: Pose): void {
  const volcano = formA(p);
  const living = formB(p);
  const glowPulse = 0.5 + Math.sin(p.time * 3) * 0.3;
  const body = living ? '#5a2a1a' : '#3a2a2a';
  const bodyDark = living ? '#2a0e08' : '#140c0c';
  rock(ctx, -8, 7, 6, 7, body, bodyDark, 2);
  rock(ctx, 2, 7, 6, 7, body, bodyDark, 2);
  shape(ctx, radial(ctx, 0, -1, 13, body, bodyDark), () => ellipse(ctx, 0, -1, 11, 11));
  // rachaduras de lava
  ctx.save();
  ctx.shadowColor = '#ff6a1a';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = `rgba(255, ${120 + Math.round(glowPulse * 80)}, 40, 1)`;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-6, -7);
  ctx.lineTo(-2, -2);
  ctx.lineTo(-5, 3);
  ctx.moveTo(3, -8);
  ctx.lineTo(5, -2);
  ctx.lineTo(2, 4);
  ctx.lineTo(5, 8);
  ctx.stroke();
  ctx.restore();
  // braços
  line(ctx, body, 4, () => {
    ctx.moveTo(-9, -3);
    ctx.lineTo(-14, 4);
    ctx.moveTo(9, -3);
    ctx.lineTo(14, 3 - p.attack * 4);
  });
  // cabeça
  const hy = -15;
  shape(ctx, radial(ctx, 0, hy, 7, body, bodyDark), () => circle(ctx, 0, hy, 6.5));
  glowingEye(ctx, -2, hy, 1.4, '#ffb03a');
  glowingEye(ctx, 2.6, hy, 1.4, '#ffb03a');
  if (volcano) {
    shape(ctx, '#2a1a18', () => poly(ctx, [-5, hy - 4, -3, hy - 10, 3, hy - 10, 5, hy - 4]), 0.9);
    ctx.save();
    ctx.shadowColor = '#ff6a1a';
    ctx.shadowBlur = 8;
    shape(ctx, '#ff8a2a', () => ellipse(ctx, 0, hy - 10, 3, 1), 0);
    ctx.restore();
    ctx.fillStyle = '#5a5050aa';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.8 + i / 3) % 1;
      ctx.beginPath();
      circle(ctx, Math.sin(ph * 6 + i) * 2, hy - 12 - ph * 12, 1.5 + ph * 2.5);
      ctx.fill();
    }
  }
  if (living) {
    ctx.fillStyle = '#ff8a2a';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.7 + i / 3) % 1;
      ctx.beginPath();
      ellipse(ctx, -6 + i * 6, 2 + ph * 12, 1.2, 1.8);
      ctx.fill();
    }
  }
  if (p.supreme && formA(p)) {
    // erupção: fumaça e brasas saindo da cratera da cabeça
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.7 + i / 4) % 1;
      ctx.fillStyle = 'rgba(70, 60, 70, ' + (1 - t) * 0.6 + ')';
      ctx.beginPath();
      circle(ctx, Math.sin(t * 5 + i) * 3, -26 - t * 16, 3 + t * 5);
      ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 1.3 + i / 3) % 1;
      shape(ctx, '#ffb040', () => circle(ctx, -4 + i * 4 + t * (i - 1) * 6, -25 - Math.sin(t * Math.PI) * 14, 1.2), 0);
    }
  }
  if (p.supreme && formB(p)) {
    // corpo derretendo: gotas de lava escorrendo
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.9 + i / 4) % 1;
      shape(ctx, '#ff7a1a', () => ellipse(ctx, -7 + i * 4.5, 4 + t * 10, 1.2, 1.8 + t), 0.4);
    }
    shape(ctx, '#ff5a1a88', () => ellipse(ctx, 0, 14, 12, 2.5), 0);
  }
}

/** Herói Colosso: gigante de pedra coberto de musgo, com runas no peito. */
export function drawColossus(ctx: Ctx, p: Pose): void {
  const stone = skin(p, 'stone', '#8a8478');
  const stoneDark = skin(p, 'stoneDark', '#4a463e');
  const moss = skin(p, 'moss', '#5a9a3a');
  const rune = skin(p, 'rune', '#7affd8');
  const step = p.moving ? Math.sin(p.time * 6) : 0;
  rock(ctx, -10 + step, 6, 8, 8, stone, stoneDark, 2);
  rock(ctx, 2 - step, 6, 8, 8, stone, stoneDark, 2);
  shape(ctx, radial(ctx, 0, -2, 15, stone, stoneDark), () => ctx.roundRect(-12, -12, 24, 20, 7));
  // musgo nos ombros
  for (const side of [-1, 1]) {
    shape(ctx, moss, () => ellipse(ctx, side * 9, -11, 5, 2.5, side * 0.3), 0.7);
  }
  // runa brilhando no peito
  ctx.save();
  ctx.shadowColor = rune;
  ctx.shadowBlur = 8 + p.attack * 8;
  ctx.strokeStyle = rune;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-3, -2);
  ctx.lineTo(3, -2);
  ctx.lineTo(0, 4);
  ctx.stroke();
  ctx.restore();
  // braços enormes (soco no ataque)
  rock(ctx, -18, -9, 6, 15, stone, stoneDark, 3);
  ctx.save();
  ctx.translate(15, -6);
  ctx.rotate(-0.3 - p.attack * 1.1);
  rock(ctx, -3, 0, 6, 15, stone, stoneDark, 3);
  ctx.restore();
  // cabeça pequena
  rock(ctx, -5, -20, 10, 9, stone, stoneDark, 3);
  shape(ctx, moss, () => ellipse(ctx, 0, -20, 5, 1.6), 0.5);
  glowingEye(ctx, -1.5, -15.5, 1.2, rune);
  glowingEye(ctx, 2.5, -15.5, 1.2, rune);
}
