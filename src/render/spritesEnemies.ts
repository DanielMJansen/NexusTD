// Inimigos do F5: Esqueleto Arqueiro, Lodo, Aranha, Gárgula, Cavaleiro Sem Cabeça,
// Banshee Sombria, Necromante e os chefes Rainha Aranha e Lich.
import { circle, ellipse, glowingEye, line, poly, radial, shape, vertical, type Ctx, type Pose } from './spriteKit';

const BONE = '#ece4cc';
const BONE_DARK = '#a89c80';

function skull(ctx: Ctx, x: number, y: number, r: number, eyes: string): void {
  shape(ctx, radial(ctx, x, y, r, '#fffaf0', BONE_DARK), () => {
    circle(ctx, x, y, r);
  });
  shape(ctx, BONE, () => ctx.roundRect(x - r * 0.45, y + r * 0.55, r * 1.1, r * 0.55, 1), 0.9);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.05, y, r * 0.3, r * 0.34), 0);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.62, y, r * 0.24, r * 0.32), 0);
  glowingEye(ctx, x + r * 0.08, y + 0.2, r * 0.13, eyes);
  glowingEye(ctx, x + r * 0.62, y + 0.2, r * 0.11, eyes);
  ctx.strokeStyle = '#4a4030';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (const dx of [-0.1, 0.25, 0.55]) {
    ctx.moveTo(x + r * dx, y + r * 0.6);
    ctx.lineTo(x + r * dx, y + r * 1.05);
  }
  ctx.stroke();
}

/** Esqueleto Arqueiro: ossos, capuz rasgado e arco curto. */
export function drawSkeletonArcher(ctx: Ctx, p: Pose): void {
  const step = p.moving ? Math.sin(p.time * 9) : 0;
  const draw = p.attack;
  // pernas
  line(ctx, BONE, 1.8, () => {
    ctx.moveTo(-2, 5);
    ctx.lineTo(-3 + step * 2, 14);
    ctx.moveTo(2, 5);
    ctx.lineTo(3 - step * 2, 14);
  });
  // costelas
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
  shape(ctx, BONE_DARK, () => ellipse(ctx, 0, 5, 4, 1.8), 1);
  // capuz rasgado
  shape(ctx, vertical(ctx, -22, -6, '#4a3a5a', '#22182e'), () =>
    poly(ctx, [-8, -10, -6, -20, 0, -24, 6, -20, 7, -11, 4, -8, 2, -11, -1, -8, -4, -11]),
  );
  skull(ctx, 1, -16, 5, '#ff6a3a');
  // arco
  ctx.save();
  ctx.translate(8, -5);
  line(ctx, '#8a5a2e', 1.6, () => {
    ctx.moveTo(0, -9);
    ctx.quadraticCurveTo(5, 0, 0, 9);
  });
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(-3 - draw * 3, 0);
  ctx.lineTo(0, 9);
  ctx.stroke();
  ctx.restore();
  line(ctx, BONE, 1.4, () => {
    ctx.moveTo(1, -7);
    ctx.lineTo(9, -5);
    ctx.moveTo(-1, -7);
    ctx.lineTo(5 - draw * 3, -5);
  });
}

/** Lodo: gota gelatinosa que pulsa (o Lodinho é o mesmo desenho, menor). */
export function drawSlime(ctx: Ctx, p: Pose): void {
  const squish = Math.sin(p.time * 5);
  const w = 11 + squish * 1.2;
  const h = 10 - squish * 1.2;
  const g = ctx.createRadialGradient(-3, 4 - h, 1, 0, 8, 14);
  g.addColorStop(0, '#d8ffe0');
  g.addColorStop(0.5, '#6fdc8cdd');
  g.addColorStop(1, '#2a8a54dd');
  shape(ctx, g, () => {
    ctx.moveTo(-w, 13);
    ctx.quadraticCurveTo(-w - 1, 13 - h * 1.4, 0, 13 - h * 2);
    ctx.quadraticCurveTo(w + 1, 13 - h * 1.4, w, 13);
    ctx.quadraticCurveTo(0, 15, -w, 13);
    ctx.closePath();
  });
  // bolhas e algo engolido lá dentro
  shape(ctx, '#ffffff66', () => circle(ctx, -4, 13 - h * 1.4, 1.8), 0);
  shape(ctx, '#ffffff44', () => circle(ctx, 5, 9, 1.1), 0);
  shape(ctx, '#d8d0b0aa', () => poly(ctx, [-4, 10, -1, 9, 0, 11, -3, 12]), 0);
  shape(ctx, '#fbf7ff', () => circle(ctx, 1, 13 - h * 1.15, 2.2), 0.8);
  shape(ctx, '#fbf7ff', () => circle(ctx, 6, 13 - h * 1.1, 1.8), 0.8);
  ctx.fillStyle = '#12301c';
  ctx.beginPath();
  circle(ctx, 1.7, 13 - h * 1.1, 1);
  circle(ctx, 6.5, 13 - h * 1.05, 0.9);
  ctx.fill();
  shape(ctx, '#1a4a2a', () => ellipse(ctx, 4, 13 - h * 0.7, 2, 1 + squish * 0.4), 0);
}

/** Aranha (e Rainha Aranha, com coroa e marca vermelha). */
export function drawSpider(ctx: Ctx, p: Pose, queen: boolean): void {
  const scuttle = p.moving || queen ? p.time * 14 : 0;
  const body = queen ? '#6a2a8a' : '#3a2a50';
  const bodyLight = queen ? '#c05ae0' : '#8a6ab8';
  ctx.translate(0, 4);
  // patas
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const phase = Math.sin(scuttle + i * 1.3 + (side > 0 ? 0 : Math.PI)) * 1.8;
      line(ctx, body, 1.3, () => {
        const bx = -2 + i * 2.5;
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx + (i - 1.5) * 4 + side * 2, -7 + phase);
        ctx.lineTo(bx + (i - 1.5) * 6.5 + side * 2.5, 9 + phase * 0.4);
      });
    }
  }
  // abdômen
  shape(ctx, radial(ctx, -6, -2, 9, bodyLight, body), () => ellipse(ctx, -6, -1, 8, 7));
  if (queen) {
    shape(ctx, '#e0243a', () => poly(ctx, [-6, -5, -3, -1, -6, 3, -9, -1]), 0.8);
  } else {
    ctx.strokeStyle = '#c8a8ff88';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-10, -3);
    ctx.lineTo(-2, -3);
    ctx.moveTo(-10, 1);
    ctx.lineTo(-2, 1);
    ctx.stroke();
  }
  // cabeça e olhos
  shape(ctx, radial(ctx, 4, 0, 5, bodyLight, body), () => ellipse(ctx, 4, 0, 5, 4.5));
  for (const [x, y, r] of [
    [5.5, -1.5, 1.1],
    [7.5, -0.8, 0.9],
    [4, -2.6, 0.7],
    [6.6, -2.8, 0.6],
  ] as const) {
    glowingEye(ctx, x, y, r, '#ff3a5a');
  }
  shape(ctx, '#f0e8ff', () => poly(ctx, [7, 3, 8.5, 3, 7.6, 5.6]), 0.5);
  shape(ctx, '#f0e8ff', () => poly(ctx, [4.5, 3.4, 6, 3.4, 5.1, 6]), 0.5);
  if (queen) {
    shape(ctx, vertical(ctx, -10, -4, '#ffe07a', '#c8901a'), () =>
      poly(ctx, [1, -4, 0.5, -9, 2.8, -6.5, 4.2, -10, 5.6, -6.5, 7.8, -9, 7.3, -4]),
    );
  }
}

/** Gárgula: asas de morcego em pedra; pousada (sem `moving`) dobra as asas e fica cinza. */
export function drawGargoyle(ctx: Ctx, p: Pose): void {
  const flying = p.moving;
  const flap = flying ? Math.sin(p.time * 10) : -0.6;
  ctx.translate(0, flying ? -8 + Math.sin(p.time * 4) * 1.5 : 0);
  const stone = '#8a90a8';
  const dark = '#4a4e64';
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    const tip = flying ? -14 - flap * 7 : -16;
    const reach = flying ? 20 : 9;
    shape(ctx, vertical(ctx, tip, 4, '#9aa0b8', dark), () => {
      ctx.moveTo(2, -6);
      ctx.quadraticCurveTo(8, tip, reach, tip + 2);
      ctx.lineTo(reach - 3, tip + 9);
      ctx.lineTo(reach - 7, tip + 7);
      ctx.lineTo(reach - 9, tip + 13);
      ctx.quadraticCurveTo(6, -2, 3, 2);
      ctx.closePath();
    });
    ctx.restore();
  }
  // corpo agachado
  shape(ctx, radial(ctx, 0, 2, 10, '#b0b6c8', stone), () => ellipse(ctx, 0, 3, 7.5, 9));
  shape(ctx, dark, () => ctx.roundRect(-6, 9, 4, 5, 1.5));
  shape(ctx, dark, () => ctx.roundRect(2, 9, 4, 5, 1.5));
  // cabeça com chifres
  shape(ctx, stone, () => poly(ctx, [-3, -13, -6, -20, -1, -15]), 1);
  shape(ctx, stone, () => poly(ctx, [5, -13, 7, -20, 3, -15]), 1);
  shape(ctx, radial(ctx, 1.5, -10, 6, '#c0c6d8', stone), () => ellipse(ctx, 1.5, -10, 6, 5.5));
  shape(ctx, '#2a2e40', () => poly(ctx, [1, -6, 8, -7, 6.5, -4.5, 2, -4.5]), 0.8);
  shape(ctx, '#e8e8f0', () => poly(ctx, [3, -6.5, 4.2, -6.5, 3.6, -4.8]), 0.4);
  shape(ctx, '#e8e8f0', () => poly(ctx, [5.6, -6.8, 6.8, -6.8, 6.2, -5]), 0.4);
  glowingEye(ctx, 0.8, -11, 1.1, flying ? '#ffb03a' : '#5a5e70');
  glowingEye(ctx, 4.6, -11, 1.1, flying ? '#ffb03a' : '#5a5e70');
  if (!flying) {
    // rachaduras da pedra
    ctx.strokeStyle = '#3a3e50';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(0, 3);
    ctx.lineTo(-1, 7);
    ctx.moveTo(3, 0);
    ctx.lineTo(5, 4);
    ctx.stroke();
  }
}

/** Cavaleiro Sem Cabeça: armadura escura, capa e a cabeça de abóbora na mão. */
export function drawHeadless(ctx: Ctx, p: Pose): void {
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  // capa
  shape(ctx, vertical(ctx, -12, 12, '#3a1a3a', '#12061a'), () =>
    poly(ctx, [-5, -12, 4, -12, -2, 12, -9 - step, 10, -12, 4]),
  );
  // pernas
  shape(ctx, '#3a4a5a', () => ctx.roundRect(-5 + step * 1.5, 4, 4.5, 10, 1.5));
  shape(ctx, '#3a4a5a', () => ctx.roundRect(1 - step * 1.5, 4, 4.5, 10, 1.5));
  // peitoral
  shape(ctx, vertical(ctx, -12, 6, '#8aa8b8', '#3a5468'), () => ctx.roundRect(-6, -12, 12, 18, 3));
  ctx.strokeStyle = '#1a2a38';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, 4);
  ctx.stroke();
  // gola vazia com fumaça
  shape(ctx, '#1a2a38', () => ellipse(ctx, 0, -12, 5, 1.8), 0.8);
  for (let i = 0; i < 3; i++) {
    const phase = (p.time * 0.9 + i / 3) % 1;
    ctx.fillStyle = `rgba(90, 220, 200, ${0.5 * (1 - phase)})`;
    ctx.beginPath();
    circle(ctx, Math.sin(p.time * 3 + i) * 2, -13 - phase * 10, 1.6 + phase * 2);
    ctx.fill();
  }
  // espada erguida
  line(ctx, '#d0dce8', 2, () => {
    ctx.moveTo(-6, -6);
    ctx.lineTo(-11, -22);
  });
  shape(ctx, '#5a3a1a', () => ctx.rect(-8.5, -8, 5, 2), 0.8);
  // braço com a abóbora
  line(ctx, '#5a7488', 2.6, () => {
    ctx.moveTo(4, -9);
    ctx.lineTo(10, -2);
  });
  shape(ctx, radial(ctx, 11, -1, 5, '#ffb04a', '#c85a10'), () => ellipse(ctx, 11, -1, 5, 4.3));
  shape(ctx, '#3a6a2a', () => ctx.rect(10.3, -6.5, 1.6, 2.2), 0.6);
  ctx.save();
  ctx.shadowColor = '#ffd23a';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#ffe07a';
  ctx.beginPath();
  poly(ctx, [10, -2.5, 11.4, -2.5, 10.7, -1]);
  ctx.fill();
  ctx.beginPath();
  poly(ctx, [12.4, -2.5, 13.8, -2.5, 13.1, -1]);
  ctx.fill();
  ctx.beginPath();
  poly(ctx, [9.6, 0.6, 14.2, 0.6, 13, 2, 11.9, 1.2, 10.8, 2]);
  ctx.fill();
  ctx.restore();
}

/** Banshee Sombria: véu roxo escuro, mãos que espalham luz verde. */
export function drawDarkBanshee(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2.4) * 2 - 6;
  ctx.translate(0, float);
  const g = ctx.createLinearGradient(0, -12, 0, 16);
  g.addColorStop(0, '#4a2a6a');
  g.addColorStop(0.7, '#2a1440cc');
  g.addColorStop(1, '#2a144000');
  shape(ctx, g, () => {
    ctx.moveTo(-7, -10);
    ctx.lineTo(7, -10);
    ctx.quadraticCurveTo(11, 4, 9, 15 + Math.sin(p.time * 5) * 2);
    ctx.lineTo(2, 10);
    ctx.lineTo(-3, 15 + Math.sin(p.time * 5 + 2) * 2);
    ctx.lineTo(-9, 12);
    ctx.quadraticCurveTo(-10, 0, -7, -10);
    ctx.closePath();
  });
  for (const side of [-1, 1]) {
    line(ctx, '#6a4a8a', 2, () => {
      ctx.moveTo(side * 5, -6);
      ctx.lineTo(side * 11, -1 + Math.sin(p.time * 3 + side) * 2);
    });
    ctx.save();
    ctx.shadowColor = '#7affb0';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#9affc8';
    ctx.beginPath();
    circle(ctx, side * 11.5, -1 + Math.sin(p.time * 3 + side) * 2, 1.6);
    ctx.fill();
    ctx.restore();
  }
  // capuz e rosto pálido
  shape(ctx, vertical(ctx, -26, -8, '#5a3a7a', '#2a1440'), () =>
    poly(ctx, [-8, -9, -6, -22, 1, -27, 8, -21, 8, -9]),
  );
  shape(ctx, radial(ctx, 1.5, -15, 5, '#e8e0f8', '#9a8ab8'), () => ellipse(ctx, 1.5, -15, 4.5, 5.5));
  glowingEye(ctx, 0, -16, 1.1, '#7affb0');
  glowingEye(ctx, 3.6, -16, 1.1, '#7affb0');
  shape(ctx, '#1a0a2a', () => ellipse(ctx, 2, -11.5, 1.4, 1.6 + Math.sin(p.time * 4) * 0.5), 0);
}

/** Necromante: manto verde-escuro, cajado com crânio e chama verde. */
export function drawNecromancer(ctx: Ctx, p: Pose): void {
  const step = p.moving ? Math.sin(p.time * 7) : 0;
  shape(ctx, vertical(ctx, -12, 14, '#1e3a30', '#0a1a14'), () =>
    poly(ctx, [-7, -10, 7, -10, 9 + step, 14, 3, 12, -2, 14, -9 - step, 14]),
  );
  shape(ctx, '#5adca0', () => ctx.rect(-7, 1, 14, 1.6), 0.8);
  // cajado
  line(ctx, '#5a3a2a', 1.8, () => {
    ctx.moveTo(10, 14);
    ctx.lineTo(10, -18);
  });
  skull(ctx, 10, -20, 3, '#5adca0');
  ctx.save();
  ctx.shadowColor = '#5adca0';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#9affd0';
  ctx.beginPath();
  const flicker = Math.sin(p.time * 12) * 0.8;
  ctx.moveTo(8, -23);
  ctx.quadraticCurveTo(10, -30 - flicker, 12, -23);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  line(ctx, '#1e3a30', 2.6, () => {
    ctx.moveTo(3, -7);
    ctx.lineTo(9.5, -4);
  });
  // capuz com rosto na sombra
  shape(ctx, vertical(ctx, -26, -8, '#2a4a3e', '#0e2018'), () =>
    poly(ctx, [-8, -8, -6, -21, 0, -26, 7, -20, 8, -8]),
  );
  shape(ctx, '#05100c', () => ellipse(ctx, 1.5, -14, 4.5, 5), 0);
  glowingEye(ctx, 0, -15, 1, '#5adca0');
  glowingEye(ctx, 3.4, -15, 1, '#5adca0');
}

/** Lich: rei esqueleto flutuante com coroa, manto e orbe gélido. */
export function drawLich(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 1.8) * 2 - 6;
  ctx.translate(0, float);
  const g = ctx.createLinearGradient(0, -14, 0, 18);
  g.addColorStop(0, '#2a2a5a');
  g.addColorStop(0.75, '#141434dd');
  g.addColorStop(1, '#14143400');
  shape(ctx, g, () => {
    ctx.moveTo(-9, -12);
    ctx.lineTo(9, -12);
    ctx.quadraticCurveTo(13, 4, 11, 17 + Math.sin(p.time * 4) * 2);
    ctx.lineTo(4, 12);
    ctx.lineTo(-2, 17 + Math.sin(p.time * 4 + 2) * 2);
    ctx.lineTo(-11, 13);
    ctx.quadraticCurveTo(-13, 0, -9, -12);
    ctx.closePath();
  });
  // gola alta
  shape(ctx, vertical(ctx, -22, -10, '#4a3a8a', '#1e1a48'), () =>
    poly(ctx, [-11, -10, -12, -20, -5, -13, 5, -13, 12, -20, 11, -10]),
  );
  shape(ctx, '#7af0d8', () => ctx.rect(-9, -2, 18, 1.4), 0.6);
  // braço com orbe
  line(ctx, BONE, 1.6, () => {
    ctx.moveTo(5, -8);
    ctx.lineTo(13, -6 - p.attack * 3);
  });
  ctx.save();
  ctx.shadowColor = '#7af0d8';
  ctx.shadowBlur = 10;
  shape(ctx, radial(ctx, 14, -9 - p.attack * 3, 3.5, '#ffffff', '#3ac0b0'), () => circle(ctx, 14, -9 - p.attack * 3, 3.2), 0.8);
  ctx.restore();
  skull(ctx, 1, -17, 6, '#7af0d8');
  // coroa
  shape(ctx, vertical(ctx, -30, -21, '#e8f0ff', '#8a9ac8'), () =>
    poly(ctx, [-5, -21, -6, -28, -2.5, -24.5, 1, -30, 4.5, -24.5, 8, -28, 7, -21]),
  );
  shape(ctx, '#7af0d8', () => circle(ctx, 1, -23.5, 1.2), 0.5);
}
