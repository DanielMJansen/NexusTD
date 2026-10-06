// Raça Fada: Encantadora, Travessa, Lumina e a heroína Rainha Fada.
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
  TAU,
  vertical,
  type Ctx,
  type Pose,
} from './spriteKit';

/** Par de asas de libélula translúcidas batendo. */
function faeWings(ctx: Ctx, t: number, color: string, size = 1.35, y = -6): void {
  const flap = Math.sin(t * 14) * 0.35;
  ctx.save();
  ctx.globalAlpha *= 0.9;
  for (const side of [-1, 1]) {
    for (const [w, h, dy, rot] of [
      [10, 5, -2, -0.5],
      [8, 4, 3, 0.4],
    ] as const) {
      ctx.save();
      ctx.translate(-2, y + dy);
      ctx.scale(side, 1);
      ctx.rotate(rot + flap * (dy < 0 ? 1 : -1));
      shape(ctx, color, () => ellipse(ctx, w * size * 0.55, 0, w * size * 0.55, h * size * 0.5), 0.6);
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Corpinho de fada flutuando: vestido, rosto, cabelo. Devolve a altura da cabeça. */
function faeBody(ctx: Ctx, p: Pose, dress: string, dressDark: string, hair: string, eyes: string): number {
  const hy = -15;
  shape(ctx, vertical(ctx, -9, 10, dress, dressDark), () => {
    ctx.moveTo(-3.5, -9);
    ctx.lineTo(3.5, -9);
    ctx.quadraticCurveTo(9, 4, 7, 9 + Math.sin(p.time * 5) * 1.2);
    ctx.lineTo(-7, 9 + Math.sin(p.time * 5 + 1) * 1.2);
    ctx.quadraticCurveTo(-9, 4, -3.5, -9);
    ctx.closePath();
  });
  // perninhas penduradas
  line(ctx, '#ffe6cf', 1.3, () => {
    ctx.moveTo(-1.5, 9);
    ctx.lineTo(-2, 13);
    ctx.moveTo(1.5, 9);
    ctx.lineTo(2, 12.5);
  });
  shape(ctx, hair, () => {
    ctx.moveTo(-6.5, hy);
    ctx.quadraticCurveTo(-9, hy + 7, -5, hy + 9);
    ctx.lineTo(-3, hy + 2);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 6, '#fff0e0', '#f0c0a8'), () => circle(ctx, 1, hy, 6));
  shape(ctx, hair, () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-2, hy - 8, 6.5, hy - 2.5);
    ctx.lineTo(6, hy - 5);
    ctx.quadraticCurveTo(0, hy - 9, -6.5, hy - 3);
    ctx.closePath();
  }, 0.8);
  eye(ctx, 1, hy + 0.5, 1.6, eyes, 0.4);
  eye(ctx, 4.4, hy + 0.5, 1.6, eyes, 0.4);
  // orelhas pontudas
  shape(ctx, '#f8d4bc', () => poly(ctx, [-4.5, hy - 1, -9, hy - 4, -5, hy + 1.5]), 0.6);
  return hy;
}

/** Encantadora: vestido rosa e varinha de flor. A: Rainha das Flores (coroa de flores, asas maiores); B: Fada Guerreira (armadura e lança). */
export function drawEnchantress(ctx: Ctx, p: Pose): void {
  const bloom = formA(p);
  const warrior = formB(p);
  ctx.translate(0, -1 + Math.sin(p.time * 3) * 1.5);
  faeWings(ctx, p.time, warrior ? '#ffd8a0' : '#ffc8f0', bloom ? 1.75 : 1.35);
  const hy = faeBody(ctx, p, warrior ? '#c8cede' : '#ff8ad0', warrior ? '#6a7290' : '#b03a8a', '#ffe08a', '#c03a9a');
  if (warrior) {
    // peitoral e lança de luz
    shape(ctx, vertical(ctx, -9, 0, '#f0f4ff', '#8a96b8'), () => ctx.roundRect(-4, -9, 8, 8, 2), 0.8);
    ctx.save();
    ctx.translate(7, -2);
    ctx.rotate(0.9 + p.attack * 0.5);
    line(ctx, GOLD, 1.4, () => {
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -16);
    });
    shape(ctx, '#fff6c0', () => poly(ctx, [-2, -16, 0, -22, 2, -16]), 0.6);
    ctx.restore();
    shape(ctx, '#c8cede', () => poly(ctx, [-4, hy - 4, 0, hy - 9, 5, hy - 4]), 0.8);
    return;
  }
  // varinha com flor que brilha ao lançar
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(0.45 + p.attack * 0.6);
  line(ctx, '#6ad87a', 1.2, () => {
    ctx.moveTo(0, 5);
    ctx.lineTo(0, -9);
  });
  ctx.shadowColor = '#ffb8f0';
  ctx.shadowBlur = 6 + p.attack * 8;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + p.time;
    shape(ctx, '#ffd0f4', () => circle(ctx, Math.cos(a) * 2, -10 + Math.sin(a) * 2, 1.4), 0.3);
  }
  shape(ctx, GOLD, () => circle(ctx, 0, -10, 1), 0);
  ctx.restore();
  if (bloom) {
    for (let i = 0; i < 5; i++) {
      const x = -4 + i * 2.5;
      shape(ctx, i % 2 ? '#ff8ad0' : '#ffe08a', () => circle(ctx, x, hy - 6.5 - (i % 2) * 0.8, 1.5), 0.4);
    }
  }
}

/** Travessa: fada verde de sorriso maroto e gorro. A: Pregadora de Peças (gorro de bobo com guizos); B: Ladra de Ouro (máscara e saco de moedas). */
export function drawTrickster(ctx: Ctx, p: Pose): void {
  const jester = formA(p);
  const thief = formB(p);
  ctx.translate(0, -1 + Math.sin(p.time * 4) * 2);
  ctx.rotate(Math.sin(p.time * 2) * 0.08);
  faeWings(ctx, p.time * 1.3, thief ? '#c8c0a0' : '#b8ffb0', 1.2);
  const hy = faeBody(ctx, p, thief ? '#3a3a4a' : '#5ac85a', thief ? '#16161e' : '#2a6a2a', '#e86a2a', '#3a8a3a');
  // sorriso maroto
  ctx.strokeStyle = '#3a1a10';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0.5, hy + 3);
  ctx.quadraticCurveTo(3, hy + 5, 5.5, hy + 2.5);
  ctx.stroke();
  if (thief) {
    shape(ctx, '#16161e', () => ctx.roundRect(-1.5, hy - 1, 8.5, 3, 1.4), 0.6);
    eye(ctx, 1, hy + 0.5, 1.3, '#ffd25a', 0.4);
    eye(ctx, 4.4, hy + 0.5, 1.3, '#ffd25a', 0.4);
    // saco de moedas
    shape(ctx, '#8a6a3a', () => circle(ctx, -8, 3, 3.6), 0.8);
    shape(ctx, GOLD, () => circle(ctx, -8, -0.5, 1.4), 0.5);
  }
  // gorro (de bobo com guizos, na vertente A)
  const hat = jester ? '#c03a9a' : thief ? '#2a2a36' : '#3a9a3a';
  shape(ctx, hat, () => poly(ctx, [-6, hy - 3, 6, hy - 3, 2, hy - 9, -2, hy - 12]), 0.8);
  if (jester) {
    shape(ctx, '#ffd25a', () => poly(ctx, [2, hy - 9, 9, hy - 6, 6, hy - 4]), 0.6);
    for (const [x, y] of [[-2, hy - 12], [9, hy - 6]] as const) {
      shape(ctx, GOLD, () => circle(ctx, x, y, 1.3 + Math.abs(Math.sin(p.time * 8)) * 0.3), 0.5);
    }
  }
  // pó de confusão saindo da mão
  if (p.attack > 0.2) {
    ctx.fillStyle = '#f0ff9a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      circle(ctx, 8 + i * 2.5, -4 + Math.sin(i + p.time * 10) * 2, 0.9);
      ctx.fill();
    }
  }
}

/** Lumina: fada-luz dentro de um brilho. A: Farol (lanterna dourada); B: Estrela Cadente (tiara de estrela e rastro). */
export function drawLumina(ctx: Ctx, p: Pose): void {
  const beacon = formA(p);
  const star = formB(p);
  ctx.translate(0, -2 + Math.sin(p.time * 2.5) * 2);
  // halo de luz
  const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 18 + p.attack * 4);
  glow.addColorStop(0, star ? '#bfe8ffaa' : '#fff6c0aa');
  glow.addColorStop(1, '#fff6c000');
  ctx.fillStyle = glow;
  ctx.beginPath();
  circle(ctx, 0, -6, 18 + p.attack * 4);
  ctx.fill();
  if (star) {
    // rastro de estrela
    ctx.strokeStyle = '#bfe8ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(-14, 2, -20, 10);
    ctx.stroke();
  }
  faeWings(ctx, p.time, star ? '#d8f0ff' : '#fff6d8', 1.35);
  const hy = faeBody(ctx, p, star ? '#6a8ae8' : '#fff0a0', star ? '#2a3a8a' : '#d8a830', star ? '#e8f4ff' : '#fff8e0', star ? '#3a6ad8' : '#c08a20');
  if (beacon) {
    // lanterna dourada na mão
    line(ctx, '#8a6a3a', 0.8, () => {
      ctx.moveTo(7, -4);
      ctx.lineTo(9, 0);
    });
    ctx.save();
    ctx.shadowColor = '#ffe9a8';
    ctx.shadowBlur = 10;
    shape(ctx, GOLD, () => ctx.roundRect(7, 0, 5, 6, 1.5), 0.8);
    shape(ctx, '#fff8d0', () => ctx.rect(8, 1.5, 3, 3), 0);
    ctx.restore();
  }
  if (star) {
    ctx.save();
    ctx.shadowColor = '#bfe8ff';
    ctx.shadowBlur = 8;
    shape(ctx, '#ffffff', () => {
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 1.4 : 3.4;
        const a = -Math.PI / 2 + (i * TAU) / 10;
        if (i === 0) ctx.moveTo(1 + Math.cos(a) * r, hy - 8 + Math.sin(a) * r);
        else ctx.lineTo(1 + Math.cos(a) * r, hy - 8 + Math.sin(a) * r);
      }
      ctx.closePath();
    }, 0.5);
    ctx.restore();
  }
}

/** Heroína Rainha Fada: alta, asas de borboleta, coroa e cetro de cristal. */
export function drawFaeQueen(ctx: Ctx, p: Pose): void {
  const dress = skin(p, 'dress', '#c86ae0');
  const dressDark = skin(p, 'dressDark', '#5a1a7a');
  const wing = skin(p, 'wing', '#ffb8f0');
  const hair = skin(p, 'hair', '#fff0a0');
  ctx.translate(0, -3 + Math.sin(p.time * 2.2) * 1.5);
  // asas de borboleta
  const flap = Math.sin(p.time * 6) * 0.25;
  ctx.save();
  ctx.globalAlpha *= 0.85;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-2, -8);
    ctx.scale(side, 1);
    ctx.rotate(flap);
    shape(ctx, radial(ctx, 8, -6, 10, '#ffffff', wing), () => ellipse(ctx, 8, -6, 9, 7, -0.4), 0.8);
    shape(ctx, radial(ctx, 6, 5, 7, '#ffffff', wing), () => ellipse(ctx, 6, 5, 6, 5, 0.5), 0.8);
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    circle(ctx, 9, -7, 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // vestido longo
  shape(ctx, vertical(ctx, -10, 14, dress, dressDark), () => {
    ctx.moveTo(-4, -10);
    ctx.lineTo(4, -10);
    ctx.quadraticCurveTo(10, 4, 9, 14);
    ctx.lineTo(-9, 14);
    ctx.quadraticCurveTo(-10, 4, -4, -10);
    ctx.closePath();
  });
  shape(ctx, GOLD, () => ctx.rect(-6, 0, 12, 1.4), 0.5);
  // cetro de cristal
  ctx.save();
  ctx.translate(8, 0);
  ctx.rotate(0.2 + p.attack * 0.6);
  line(ctx, GOLD, 1.4, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -14);
  });
  ctx.shadowColor = wing;
  ctx.shadowBlur = 8 + p.attack * 10;
  shape(ctx, '#ffe8fc', () => poly(ctx, [0, -21, 2.8, -16, 0, -12, -2.8, -16]), 0.7);
  ctx.restore();
  // rosto, cabelo longo e coroa
  const hy = -16;
  shape(ctx, hair, () => {
    ctx.moveTo(-6.5, hy - 2);
    ctx.quadraticCurveTo(-11, hy + 10, -6, hy + 14);
    ctx.lineTo(-3, hy + 3);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 7, '#fff0e0', '#f0c0a8'), () => circle(ctx, 1, hy, 6.8));
  shape(ctx, hair, () => {
    ctx.moveTo(-6.5, hy - 1);
    ctx.quadraticCurveTo(-2, hy - 9, 7, hy - 3);
    ctx.lineTo(6.5, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10, -7, hy - 3);
    ctx.closePath();
  }, 0.8);
  eye(ctx, 1, hy + 0.6, 1.7, '#a03ac0', 0.4);
  eye(ctx, 4.6, hy + 0.6, 1.7, '#a03ac0', 0.4);
  shape(ctx, '#f8d4bc', () => poly(ctx, [-4.5, hy - 1, -9.5, hy - 5, -5, hy + 1.5]), 0.6);
  shape(ctx, vertical(ctx, hy - 14, hy - 6, '#fff6c0', '#d8a830'), () =>
    poly(ctx, [-4, hy - 6, -4.5, hy - 11, -1.5, hy - 8.5, 1, hy - 13, 3.5, hy - 8.5, 6.5, hy - 11, 6, hy - 6]),
  );
  glowingEye(ctx, 1, hy - 9, 0.9, '#ff8ad0');
}
