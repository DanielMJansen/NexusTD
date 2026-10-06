// Raça Demônios: Diabrete, Súcubo, Infernal e o herói Arquidemônio.
import {
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

/** Chifres curvos. */
function horns(ctx: Ctx, x: number, y: number, size: number, color: string): void {
  for (const side of [-1, 1]) {
    shape(ctx, color, () => {
      ctx.moveTo(x + side * 2 * size, y);
      ctx.quadraticCurveTo(x + side * 6 * size, y - 3 * size, x + side * 5 * size, y - 8 * size);
      ctx.quadraticCurveTo(x + side * 4 * size, y - 3 * size, x + side * 0.5 * size, y + 1);
      ctx.closePath();
    }, 0.8);
  }
}

/** Asas de morcego demoníacas. */
function demonWings(ctx: Ctx, t: number, color: string, size: number, y: number): void {
  const flap = Math.sin(t * 6) * 3;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    shape(ctx, color, () => {
      ctx.moveTo(2, y);
      ctx.lineTo(13 * size, y - 9 * size - flap);
      ctx.lineTo(11 * size, y - 2 * size);
      ctx.lineTo(9 * size, y + 2 * size - flap * 0.3);
      ctx.lineTo(5 * size, y + 2 * size);
      ctx.closePath();
    }, 0.8);
    ctx.restore();
  }
}

/** Cauda com ponta de seta. */
function demonTail(ctx: Ctx, t: number, color: string): void {
  const w = Math.sin(t * 3) * 3;
  line(ctx, color, 1.4, () => {
    ctx.moveTo(-3, 6);
    ctx.quadraticCurveTo(-12, 8 + w, -14, 0 + w);
  });
  shape(ctx, color, () => poly(ctx, [-14, -3 + w, -16, 1 + w, -12, 1 + w]), 0.6);
}

/** Diabrete: diabinho vermelho com tridente. A: Diabrete Flamejante (em chamas); B: Diabrete Ladino (capuz e saco de moedas). */
export function drawImp(ctx: Ctx, p: Pose): void {
  const flame = formA(p);
  const thief = formB(p);
  const skinColor = thief ? '#a83a3a' : '#e04a3a';
  ctx.translate(0, -3 + Math.sin(p.time * 5) * 1.5);
  demonWings(ctx, p.time * 1.5, '#5a1a1a', 0.8, -4);
  demonTail(ctx, p.time, skinColor);
  shape(ctx, radial(ctx, 0, 0, 7, skinColor, '#6a1010'), () => ellipse(ctx, 0, 1, 5.5, 7));
  line(ctx, '#6a1010', 1.4, () => {
    ctx.moveTo(-2, 7);
    ctx.lineTo(-2.5, 12);
    ctx.moveTo(2, 7);
    ctx.lineTo(2.5, 12);
  });
  // tridente
  ctx.save();
  ctx.translate(6, 0);
  ctx.rotate(-0.4 + p.attack * 0.9);
  line(ctx, '#3a2a2a', 1.2, () => {
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -10);
  });
  shape(ctx, '#c8ccd8', () => poly(ctx, [-3, -10, -3, -14, -2, -11, 0, -15, 2, -11, 3, -14, 3, -10]), 0.5);
  ctx.restore();
  const hy = -9;
  shape(ctx, radial(ctx, 1, hy, 6, skinColor, '#8a1a1a'), () => circle(ctx, 1, hy, 5.5));
  horns(ctx, 1, hy - 3, 0.7, '#2a1a1a');
  eye(ctx, 0, hy, 1.5, '#ffd23a', 0.4);
  eye(ctx, 3.4, hy, 1.5, '#ffd23a', 0.4);
  ctx.strokeStyle = '#2a0808';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-0.5, hy + 2.5);
  ctx.quadraticCurveTo(2, hy + 4.5, 4.5, hy + 2);
  ctx.stroke();
  if (flame) {
    ctx.save();
    ctx.shadowColor = '#ffb040';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 3; i++) {
      const h = 4 + Math.sin(p.time * 12 + i * 2) * 1.5;
      shape(ctx, '#ffb040', () => poly(ctx, [-3 + i * 3, hy - 4, -1.5 + i * 3, hy - 4 - h, i * 3, hy - 4]), 0);
    }
    ctx.restore();
  }
  if (thief) {
    shape(ctx, '#2a2a36', () => poly(ctx, [-6, hy + 1, -5, hy - 6, 1, hy - 8, 7, hy - 5, 6, hy + 1, 3, hy - 3, -2, hy - 3]), 0.7);
    shape(ctx, '#8a6a3a', () => circle(ctx, -7, 4, 3), 0.7);
    shape(ctx, GOLD, () => circle(ctx, -7, 1, 1.1), 0.4);
  }
}

/** Súcubo: demônia roxa com asas e chicote. A: Sedutora (aura de corações); B: Tormento (correntes e chicote de espinhos). */
export function drawSuccubus(ctx: Ctx, p: Pose): void {
  const lure = formA(p);
  const torment = formB(p);
  const skinColor = '#b86ad8';
  ctx.translate(0, -2 + Math.sin(p.time * 2.5) * 1.2);
  demonWings(ctx, p.time, torment ? '#2a0a1a' : '#5a1a5a', 1.1, -6);
  demonTail(ctx, p.time, '#7a2a8a');
  shape(ctx, vertical(ctx, -9, 12, torment ? '#2a0a14' : '#3a1440', '#0e0410'), () =>
    poly(ctx, [-4, -9, 4, -9, 7, 12, -7, 12]),
  );
  // chicote (estala no ataque)
  const crack = p.attack;
  line(ctx, torment ? '#3a3a44' : '#7a2a5a', 1.1, () => {
    ctx.moveTo(5, -3);
    ctx.quadraticCurveTo(12 + crack * 6, -10 - crack * 2, 18 + crack * 6, -2 + Math.sin(p.time * 8) * 2);
  });
  if (torment) {
    for (let i = 1; i <= 3; i++) shape(ctx, '#c8ccd8', () => circle(ctx, 5 + i * 4 + crack * 2, -6 + i, 0.8), 0.3);
    ctx.strokeStyle = '#8a8a96';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-10, 6);
    ctx.lineTo(-7, 10);
    ctx.stroke();
  }
  const hy = -15;
  shape(ctx, '#2a0a2a', () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-11, hy + 9, -6, hy + 12);
    ctx.lineTo(-3, hy + 2);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 6, '#e0b0f0', skinColor), () => circle(ctx, 1, hy, 6));
  horns(ctx, 1, hy - 4, 0.8, '#1a0a1a');
  glowingEye(ctx, 0, hy, 1.2, torment ? '#ff3a4a' : '#ff8ad0');
  glowingEye(ctx, 3.5, hy, 1.2, torment ? '#ff3a4a' : '#ff8ad0');
  if (lure) {
    ctx.fillStyle = '#ff8ad0';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.7 + i / 3) % 1;
      const x = -8 + i * 8;
      const y = -4 - ph * 16;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      ctx.moveTo(x, y + 1.5);
      ctx.bezierCurveTo(x - 2.5, y - 1, x - 1, y - 2.5, x, y - 1);
      ctx.bezierCurveTo(x + 1, y - 2.5, x + 2.5, y - 1, x, y + 1.5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/** Infernal: brutamontes de rocha em chamas. A: Senhor do Abismo (coroa de chifres); B: Berserker (fúria vermelha e machado). */
export function drawInfernal(ctx: Ctx, p: Pose): void {
  const lord = formA(p);
  const rage = formB(p);
  const body = rage ? '#8a1a14' : '#4a2a2a';
  const bodyDark = rage ? '#3a0606' : '#1a0c0c';
  const fire = rage ? '#ff3a1a' : '#ff8a2a';
  const stomp = Math.sin(p.time * 4) * 0.8;
  shape(ctx, bodyDark, () => ctx.roundRect(-9, 7, 7, 7, 2));
  shape(ctx, bodyDark, () => ctx.roundRect(2, 7, 7, 7, 2));
  shape(ctx, radial(ctx, 0, -1, 14, body, bodyDark), () => ellipse(ctx, 0, -1 + stomp, 12, 11));
  ctx.save();
  ctx.shadowColor = fire;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = fire;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 5);
  ctx.moveTo(4, -7);
  ctx.lineTo(2, 2);
  ctx.stroke();
  ctx.restore();
  // braço erguendo uma bola de fogo (lança no ataque)
  line(ctx, body, 4, () => {
    ctx.moveTo(8, -4);
    ctx.lineTo(13, -12 + p.attack * 6);
  });
  ctx.save();
  ctx.shadowColor = fire;
  ctx.shadowBlur = 12;
  shape(ctx, radial(ctx, 14, -15 + p.attack * 6, 5, '#fff2c0', fire), () => circle(ctx, 14, -15 + p.attack * 6, 3.5 + Math.sin(p.time * 8) * 0.5), 0);
  ctx.restore();
  if (rage) {
    // machado na outra mão
    line(ctx, '#3a2a1a', 1.6, () => {
      ctx.moveTo(-9, -2);
      ctx.lineTo(-14, 8);
    });
    shape(ctx, '#c8ccd8', () => poly(ctx, [-12, 4, -18, 2, -17, 8]), 0.6);
  }
  const hy = -14 + stomp;
  shape(ctx, radial(ctx, 0, hy, 7, body, bodyDark), () => circle(ctx, 0, hy, 6.5));
  horns(ctx, 0, hy - 3, lord ? 1.3 : 1, lord ? GOLD : '#1a0a0a');
  glowingEye(ctx, -2, hy, 1.4, '#ffd23a');
  glowingEye(ctx, 2.5, hy, 1.4, '#ffd23a');
  if (lord) {
    shape(ctx, vertical(ctx, hy - 14, hy - 6, '#ffe07a', '#c8901a'), () => poly(ctx, [-4, hy - 6, -3, hy - 11, 0, hy - 8, 3, hy - 11, 4, hy - 6]), 0.6);
  }
}

/** Herói Arquidemônio: demônio alto com chifres, capa de fogo e espada flamejante. */
export function drawArchdemon(ctx: Ctx, p: Pose): void {
  const skinColor = skin(p, 'skin', '#c83a2a');
  const skinDark = skin(p, 'skinDark', '#5a0e0a');
  const cape = skin(p, 'cape', '#1a0808');
  const fire = skin(p, 'fire', '#ff8a2a');
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  demonWings(ctx, p.time * 0.8, cape, 1.25, -8);
  shape(ctx, skinDark, () => ctx.roundRect(-5 + step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, skinDark, () => ctx.roundRect(0.5 - step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, radial(ctx, 0, -2, 11, skinColor, skinDark), () => ctx.roundRect(-7, -11, 14, 18, [5, 5, 3, 3]));
  shape(ctx, '#2a1010', () => ctx.rect(-7, 3, 14, 2.4), 0.6);
  // espada flamejante
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(-1 + p.attack * 1.8);
  line(ctx, '#2a1a1a', 1.6, () => {
    ctx.moveTo(0, 3);
    ctx.lineTo(0, -1);
  });
  ctx.shadowColor = fire;
  ctx.shadowBlur = 10;
  shape(ctx, vertical(ctx, -18, -1, '#fff2c0', fire), () => poly(ctx, [-1.6, -1, 1.6, -1, 0.6, -18, -0.6, -18]), 0.6);
  ctx.restore();
  const hy = -17;
  shape(ctx, radial(ctx, 1, hy, 7, skinColor, skinDark), () => circle(ctx, 1, hy, 6.5));
  horns(ctx, 1, hy - 4, 1.2, '#1a0a0a');
  glowingEye(ctx, -0.5, hy, 1.4, fire);
  glowingEye(ctx, 3.5, hy, 1.4, fire);
  ctx.strokeStyle = '#2a0808';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-0.5, hy + 3);
  ctx.lineTo(4.5, hy + 2.6);
  ctx.stroke();
}
