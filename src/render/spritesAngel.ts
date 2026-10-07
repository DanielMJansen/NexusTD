// Raça Anjo: Querubim, Valquíria, Guardião e o herói Arcanjo.
import {
  halo as glow,
  circle,
  ellipse,
  eye,
  formA,
  formB,
  GOLD,
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

/** Asas de penas brancas (pares extras para o Serafim). */
function featherWings(ctx: Ctx, t: number, color: string, size: number, y: number, pairs = 1): void {
  const flap = Math.sin(t * 5) * 0.2;
  for (let k = 0; k < pairs; k++) {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-1, y + k * 5);
      ctx.scale(side, 1);
      ctx.rotate(-0.3 + flap + k * 0.35);
      shape(ctx, vertical(ctx, -10 * size, 4 * size, '#ffffff', color), () => {
        ctx.moveTo(1, 0);
        ctx.quadraticCurveTo(8 * size, -10 * size, 15 * size, -7 * size);
        ctx.lineTo(12 * size, -3 * size);
        ctx.lineTo(14 * size, -1 * size);
        ctx.lineTo(10 * size, 1 * size);
        ctx.lineTo(11 * size, 3 * size);
        ctx.quadraticCurveTo(5 * size, 4 * size, 1, 2);
        ctx.closePath();
      }, 0.8);
      ctx.restore();
    }
  }
}

function halo(ctx: Ctx, x: number, y: number, r: number, color = '#ffe48a'): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** Querubim: anjinho com arco de luz. A: Serafim (três pares de asas douradas); B: Arauto (trombeta). */
export function drawCherub(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Seis Asas (A, quatro asas extras com olhos) e Trombeta do Juízo (B, trombeta dourada)
  if (p.supreme && formA(p)) {
    for (const [dy, s] of [[-12, 1.1], [4, 0.9]] as const) {
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 3, dy);
        ctx.scale(side, 1);
        ctx.rotate(-0.3 + Math.sin(p.time * 6 + dy) * 0.15);
        shape(ctx, '#fff8e8', () => ellipse(ctx, 9 * s, 0, 9 * s, 3.5 * s), 0.6);
        shape(ctx, '#3a6ad8', () => circle(ctx, 10 * s, 0, 1.1), 0.3);
        ctx.restore();
      }
    }
  }
  const seraph = formA(p);
  const herald = formB(p);
  ctx.translate(0, -4 + Math.sin(p.time * 3) * 1.6);
  featherWings(ctx, p.time * 1.4, seraph ? '#ffd25a' : '#d8e4ff', 0.75, -3, seraph ? 3 : 1);
  shape(ctx, radial(ctx, 0, 2, 7, '#fff0e0', '#f0c0a8'), () => ellipse(ctx, 0, 2, 5.5, 6.5));
  shape(ctx, '#ffffff', () => poly(ctx, [-5, 3, 5, 3, 4, 8, -4, 8]), 0.6);
  const hy = -8;
  shape(ctx, radial(ctx, 0.5, hy, 6, '#fff0e0', '#f0c0a8'), () => circle(ctx, 0.5, hy, 5.8));
  shape(ctx, '#ffe08a', () => {
    for (let i = 0; i < 4; i++) {
      const x = -4 + i * 2.6;
      ctx.moveTo(x + 1.5, hy - 4);
      ctx.arc(x, hy - 4, 1.6, 0, TAU);
    }
  }, 0.5);
  eye(ctx, -0.6, hy + 0.6, 1.5, '#3a8ad8', 0.4);
  eye(ctx, 2.8, hy + 0.6, 1.5, '#3a8ad8', 0.4);
  halo(ctx, 0.5, hy - 8, 4.5);
  if (herald) {
    // trombeta dourada
    ctx.save();
    ctx.translate(5, -4);
    ctx.rotate(-0.4 - p.attack * 0.3);
    shape(ctx, GOLD, () => poly(ctx, [0, -0.8, 9, -1.6, 13, -4, 13, 4, 9, 1.6, 0, 0.8]), 0.7);
    ctx.restore();
  } else {
    // arco de luz
    line(ctx, seraph ? GOLD : '#fff6c0', 1.4, () => ctx.arc(5, 0, 7, -1.2, 1.2));
  }
  if (p.supreme && formB(p)) {
    ctx.save();
    ctx.translate(6, -8);
    ctx.rotate(-0.3 - p.attack * 0.3);
    shape(ctx, vertical(ctx, -2, 2, '#fff2b0', '#c8901a'), () => poly(ctx, [0, -0.8, 12, -3.5, 12, 3.5, 0, 0.8]), 0.6);
    glow(ctx, 12, 0, 6, '#ffe9a8', 0.5 + p.attack * 0.5);
    ctx.restore();
  }
}

/** Valquíria: guerreira alada de lança. A: Matadora de Reis (armadura dourada); B: Lança Celeste (lança azul brilhante). */
export function drawValkyrie(ctx: Ctx, p: Pose): void {
  const slayer = formA(p);
  const celestial = formB(p);
  const armor = slayer ? '#f0c35a' : '#c8d2e6';
  const armorDark = slayer ? '#8a6418' : '#6a7896';
  featherWings(ctx, p.time, '#c8d8ff', 0.95, -9);
  shape(ctx, '#4a5068', () => ctx.roundRect(-4.5, 6, 4, 8, 1.5));
  shape(ctx, '#4a5068', () => ctx.roundRect(0.5, 6, 4, 8, 1.5));
  shape(ctx, vertical(ctx, -10, 8, armor, armorDark), () => ctx.roundRect(-6, -10, 12, 17, [4, 4, 2, 2]));
  shape(ctx, '#5a6ab0', () => poly(ctx, [-5, 4, 5, 4, 6, 10, -6, 10]), 0.8);
  // lança (estocada)
  const thrust = p.attack * 6;
  if (celestial) {
    ctx.save();
    ctx.shadowColor = '#9fdcff';
    ctx.shadowBlur = 8;
  }
  line(ctx, celestial ? '#bfe8ff' : '#8a6a3a', 1.6, () => {
    ctx.moveTo(-4 + thrust, 0);
    ctx.lineTo(18 + thrust, -6);
  });
  shape(ctx, celestial ? '#ffffff' : '#e8f0ff', () => poly(ctx, [17 + thrust, -8.5, 24 + thrust, -7.5, 18 + thrust, -4]), 0.8);
  if (celestial) ctx.restore();
  // cabeça com elmo alado e tranças
  const hy = -15;
  shape(ctx, '#ffd88a', () => {
    ctx.moveTo(-5.5, hy);
    ctx.quadraticCurveTo(-9, hy + 8, -6, hy + 12);
    ctx.lineTo(-3, hy + 3);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 6, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6));
  shape(ctx, vertical(ctx, hy - 8, hy - 1, armor, armorDark), () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-5, hy - 8, 1, hy - 8);
    ctx.quadraticCurveTo(7, hy - 8, 7, hy - 1);
    ctx.closePath();
  });
  for (const side of [-1, 1]) shape(ctx, '#ffffff', () => poly(ctx, [1 + side * 5, hy - 5, 1 + side * 10, hy - 10, 1 + side * 6, hy - 3]), 0.6);
  eye(ctx, 1, hy + 0.8, 1.5, '#3a6ad8', 0.4);
  eye(ctx, 4.4, hy + 0.8, 1.5, '#3a6ad8', 0.4);
  if (slayer) {
    shape(ctx, vertical(ctx, hy - 13, hy - 8, '#fff0a0', '#c8901a'), () => poly(ctx, [-2, hy - 8, -2.5, hy - 12, 0, hy - 10, 1, hy - 13, 2, hy - 10, 4.5, hy - 12, 4, hy - 8]), 0.5);
  }
  if (p.supreme && formA(p)) {
    // elmo alado e espada de luz
    for (const side of [-1, 1]) shape(ctx, '#ffffff', () => poly(ctx, [1 + side * 4, -22, 1 + side * 11, -28, 1 + side * 8, -20]), 0.6);
    glow(ctx, 10, -10, 9, '#fff6c0', 0.6);
    ctx.save();
    ctx.translate(9, -2);
    ctx.rotate(-0.7 + p.attack);
    shape(ctx, vertical(ctx, -22, 0, '#ffffff', '#ffe9a8'), () => poly(ctx, [-1.4, 0, 0, -22, 1.4, 0]), 0.6);
    ctx.restore();
  }
  if (p.supreme && formB(p)) {
    // lança gigante dourada
    ctx.save();
    ctx.translate(-6, 6);
    ctx.rotate(-0.9 + p.attack * 0.4);
    line(ctx, '#c8901a', 2, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -38);
    });
    shape(ctx, vertical(ctx, -48, -36, '#ffffff', '#ffd25a'), () => poly(ctx, [-3, -37, 0, -48, 3, -37]), 0.6);
    glow(ctx, 0, -42, 7, '#fff6c0', 0.6);
    ctx.restore();
  }
}

/** Guardião Celestial: anjo alto com escudo grande. A: Égide Celeste (escudo dourado com sol); B: Juiz (espada e balança). */
export function drawGuardianAngel(ctx: Ctx, p: Pose): void {
  const aegis = formA(p);
  const judge = formB(p);
  ctx.translate(0, -2 + Math.sin(p.time * 2) * 1.2);
  featherWings(ctx, p.time * 0.8, judge ? '#a8b0c8' : '#e0e8ff', 1.15, -8);
  shape(ctx, vertical(ctx, -10, 14, judge ? '#d8dce8' : '#ffffff', judge ? '#6a7090' : '#c8d0e8'), () =>
    poly(ctx, [-5, -10, 5, -10, 8, 14, -8, 14]),
  );
  shape(ctx, GOLD, () => ctx.rect(-6, 2, 12, 1.4), 0.5);
  if (judge) {
    // espada erguida e balança
    line(ctx, '#e8f0ff', 1.6, () => {
      ctx.moveTo(-6, 0);
      ctx.lineTo(-8, -20);
    });
    shape(ctx, GOLD, () => ctx.rect(-9.5, -3, 4, 1.4), 0.5);
    line(ctx, GOLD, 0.9, () => {
      ctx.moveTo(6, -6);
      ctx.lineTo(12, -6);
      ctx.moveTo(9, -9);
      ctx.lineTo(9, -6);
    });
    const tilt = Math.sin(p.time * 2) * 1.2;
    shape(ctx, GOLD, () => ellipse(ctx, 6, -2 + tilt, 2, 0.8), 0.4);
    shape(ctx, GOLD, () => ellipse(ctx, 12, -2 - tilt, 2, 0.8), 0.4);
  } else {
    // escudo grande
    shape(ctx, vertical(ctx, -8, 10, aegis ? '#fff0b0' : '#e8f0ff', aegis ? '#c8901a' : '#8aa0c8'), () => {
      ctx.moveTo(4, -8);
      ctx.lineTo(13, -8);
      ctx.lineTo(13, 2);
      ctx.quadraticCurveTo(13, 8, 8.5, 11);
      ctx.quadraticCurveTo(4, 8, 4, 2);
      ctx.closePath();
    });
    if (aegis) {
      ctx.save();
      ctx.shadowColor = '#ffe9a8';
      ctx.shadowBlur = 8;
      shape(ctx, '#fff6c0', () => circle(ctx, 8.5, 0, 2.4), 0.5);
      ctx.restore();
    } else {
      shape(ctx, '#5a8ad8', () => poly(ctx, [8, -5, 9, -5, 9, -1, 11.5, -1, 11.5, 0.2, 9, 0.2, 9, 7, 8, 7, 8, 0.2, 5.5, 0.2, 5.5, -1, 8, -1]), 0.4);
    }
  }
  const hy = -16;
  shape(ctx, radial(ctx, 1, hy, 6, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6));
  shape(ctx, judge ? '#c8ccd8' : '#fff0a0', () => {
    ctx.moveTo(-6, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(6.5, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10, -6.5, hy - 3);
    ctx.closePath();
  }, 0.7);
  eye(ctx, 1, hy + 0.8, 1.5, judge ? '#5a5a7a' : '#3a8ad8', 0.4);
  eye(ctx, 4.4, hy + 0.8, 1.5, judge ? '#5a5a7a' : '#3a8ad8', 0.4);
  halo(ctx, 1, hy - 9, 5.5, judge ? '#bfe8ff' : '#ffe48a');
  if (p.supreme && formA(p)) {
    // escudo de luz enorme à frente
    glow(ctx, 8, -4, 16, '#fff6c0', 0.5);
    shape(ctx, vertical(ctx, -18, 10, '#ffffffcc', '#ffd25a88'), () => {
      ctx.moveTo(1, -16);
      ctx.lineTo(15, -16);
      ctx.lineTo(15, 0);
      ctx.quadraticCurveTo(15, 8, 8, 11);
      ctx.quadraticCurveTo(1, 8, 1, 0);
      ctx.closePath();
    }, 0.8);
  }
  if (p.supreme && formB(p)) {
    // balança dourada flutuando acima
    const y = -36 + Math.sin(p.time * 2) * 1.5;
    const tilt = Math.sin(p.time * 1.5) * 2;
    line(ctx, '#c8901a', 1, () => {
      ctx.moveTo(0, y - 4);
      ctx.lineTo(0, y + 2);
      ctx.moveTo(-8, y + tilt);
      ctx.lineTo(8, y - tilt);
    }, false);
    for (const side of [-1, 1]) {
      const yy = y - side * tilt;
      line(ctx, '#c8901a', 0.6, () => {
        ctx.moveTo(side * 8, yy);
        ctx.lineTo(side * 8, yy + 5);
      }, false);
      shape(ctx, '#ffd25a', () => ellipse(ctx, side * 8, yy + 5.5, 3, 1), 0.5);
    }
    glow(ctx, 0, y, 10, '#ffe9a8', 0.4);
  }
}

/** Herói Arcanjo: grandes asas, armadura dourada e espada de luz. */
export function drawArchangel(ctx: Ctx, p: Pose): void {
  const wing = skin(p, 'wing', '#d8e4ff');
  const armor = skin(p, 'armor', '#f0c35a');
  const armorDark = skin(p, 'armorDark', '#8a6418');
  const glow = skin(p, 'glow', '#fff6c0');
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  featherWings(ctx, p.time * 0.7, wing, 1.35, -10);
  shape(ctx, '#5a5068', () => ctx.roundRect(-5 + step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, '#5a5068', () => ctx.roundRect(0.5 - step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, vertical(ctx, -11, 8, armor, armorDark), () => ctx.roundRect(-7, -11, 14, 18, [5, 5, 3, 3]));
  shape(ctx, '#ffffff', () => poly(ctx, [-6, 3, 6, 3, 7, 10, -7, 10]), 0.8);
  // espada de luz
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(0.5 + p.attack * 1.2);
  line(ctx, armorDark, 1.6, () => {
    ctx.moveTo(0, 3);
    ctx.lineTo(0, -1);
  });
  shape(ctx, armor, () => ctx.rect(-3, -1.6, 6, 1.4), 0.5);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  shape(ctx, vertical(ctx, -20, -1, '#ffffff', glow), () => poly(ctx, [-1.5, -1.5, 1.5, -1.5, 0.5, -20, -0.5, -20]), 0.5);
  ctx.restore();
  const hy = -17;
  shape(ctx, radial(ctx, 1, hy, 6.5, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6.4));
  shape(ctx, '#fff0a0', () => {
    ctx.moveTo(-6.5, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(6.5, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10.5, -7, hy - 3);
    ctx.closePath();
  }, 0.7);
  eye(ctx, 1, hy + 0.8, 1.6, '#3a8ad8', 0.4);
  eye(ctx, 4.6, hy + 0.8, 1.6, '#3a8ad8', 0.4);
  halo(ctx, 1, hy - 10, 6);
}
