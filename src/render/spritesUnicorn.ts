// Raça Unicórnio (exclusiva, por código de presente): Potro Estelar, Unicórnio Guardião,
// Pégaso de Guerra e o herói Alicórnio. Corpo de cavalo compartilhado, crina e cauda de arco-íris.
import { ellipse, formA, formB, GOLD, halo, line, poly, radial, shape, skin, vertical, type Ctx, type Pose } from './spriteKit';

const RAINBOW = ['#ff7a9a', '#ffb45a', '#ffe66a', '#7ae8a0', '#7ac8ff', '#b08aff'];

interface HorseLook {
  coat: string;
  coatDark: string;
  hoof: string;
  /** Cores da crina e da cauda (em mechas). */
  mane: string[];
  horn?: string;
  /** Tamanho geral (1 = potro). */
  size: number;
}

/** Asa de penas (de trás para a frente: a de trás mais escura). */
function wing(ctx: Ctx, x: number, y: number, size: number, flap: number, color: string, dark: string, back: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5 - flap * 0.6 + (back ? 0.25 : 0));
  ctx.scale(size, size);
  const fill = back ? dark : color;
  shape(ctx, fill, () => {
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-4, -10, -2, -20);
    // penas na ponta
    ctx.lineTo(1, -16);
    ctx.lineTo(3, -19);
    ctx.lineTo(4.5, -14);
    ctx.lineTo(7, -16);
    ctx.lineTo(7.5, -10);
    ctx.lineTo(10, -10);
    ctx.quadraticCurveTo(8, -3, 3, 1);
    ctx.closePath();
  }, 0.8);
  if (!back) {
    ctx.strokeStyle = '#00000022';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (const k of [0.35, 0.6]) {
      ctx.moveTo(1, -2);
      ctx.lineTo(-1 + k * 9, -17 + k * 6);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Mechas onduladas (crina ou cauda) entre dois pontos, uma por cor. */
function strands(ctx: Ctx, colors: string[], from: [number, number], to: [number, number], bend: number, t: number, width: number): void {
  colors.forEach((color, i) => {
    const off = (i - (colors.length - 1) / 2) * width * 0.7;
    const wave = Math.sin(t * 4 + i) * 1.6;
    line(ctx, color, width, () => {
      ctx.moveTo(from[0], from[1] + off * 0.4);
      ctx.quadraticCurveTo((from[0] + to[0]) / 2 + bend, (from[1] + to[1]) / 2 + off + wave, to[0] + wave * 0.5, to[1] + off);
    }, false);
  });
}

/**
 * Cavalo de perfil olhando para a direita, cascos em y ≈ 14.
 * Devolve a posição da cabeça (para chifre, coroa, olhos e acessórios).
 */
function horse(ctx: Ctx, p: Pose, look: HorseLook, extra?: { wings?: { color: string; dark: string } }): { hx: number; hy: number } {
  const s = look.size;
  const t = p.time;
  const gallop = p.moving ? Math.sin(t * 12) : Math.sin(t * 2) * 0.15;
  const rear = p.attack * 0.6; // empina ao atacar
  const bob = p.moving ? Math.abs(Math.sin(t * 12)) * -1.2 : Math.sin(t * 2) * 0.4;
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(-rear * 0.25);
  ctx.scale(s, s);

  if (extra?.wings) wing(ctx, -2, -6, 1.05, Math.sin(t * 6) * 0.5 + 0.3, extra.wings.color, extra.wings.dark, true);

  // cauda
  strands(ctx, look.mane, [-11, -4], [-19, 6], -4, t, 1.8);

  // pernas de trás e da frente (galope alternado)
  const legs: [number, number][] = [
    [-8, gallop],
    [-5, -gallop],
    [6, -gallop],
    [9, gallop],
  ];
  for (const [x, phase] of legs) {
    const kneeX = x + phase * 2;
    line(ctx, look.coatDark, 2.6, () => {
      ctx.moveTo(x, 3);
      ctx.lineTo(kneeX, 9);
      ctx.lineTo(x + phase * 3, 13.5 - Math.max(0, phase) * 1.5);
    });
    shape(ctx, look.hoof, () => ctx.roundRect(x + phase * 3 - 1.6, 12.8 - Math.max(0, phase) * 1.5, 3.2, 1.8, 0.6), 0.6);
  }

  // corpo
  shape(ctx, radial(ctx, -2, -4, 14, look.coat, look.coatDark), () => ellipse(ctx, 0, -1, 12, 6.8));
  // pescoço
  shape(ctx, vertical(ctx, -16, 0, look.coat, look.coatDark), () => {
    ctx.moveTo(5, -4);
    ctx.quadraticCurveTo(8, -12, 11, -15);
    ctx.lineTo(15, -13);
    ctx.quadraticCurveTo(12, -6, 11, 1);
    ctx.closePath();
  });
  // cabeça e focinho
  const hx = 14;
  const hy = -15;
  shape(ctx, radial(ctx, hx - 1, hy - 1, 6, look.coat, look.coatDark), () => {
    ctx.moveTo(hx - 3, hy - 3);
    ctx.quadraticCurveTo(hx + 2, hy - 5, hx + 5, hy - 1);
    ctx.quadraticCurveTo(hx + 7.5, hy + 2, hx + 6, hy + 3.5);
    ctx.quadraticCurveTo(hx + 1, hy + 4.5, hx - 3, hy + 2);
    ctx.closePath();
  });
  // narina e olho
  ctx.fillStyle = '#4a3a5a';
  ctx.beginPath();
  ellipse(ctx, hx + 5.4, hy + 1.6, 0.6, 0.45);
  ctx.fill();
  shape(ctx, '#2a1a3a', () => ellipse(ctx, hx + 0.8, hy - 1.2, 1.25, 1.4), 0);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ellipse(ctx, hx + 1.2, hy - 1.8, 0.45, 0.45);
  ctx.fill();
  // orelha
  shape(ctx, look.coat, () => poly(ctx, [hx - 2.5, hy - 2.5, hx - 2, hy - 7, hx, hy - 3.2]), 0.8);
  // crina
  strands(ctx, look.mane, [hx - 2, hy - 3], [3, -5], -3, t + 1, 1.7);
  // chifre espiralado
  if (look.horn) {
    shape(ctx, vertical(ctx, hy - 13, hy - 3, '#ffffff', look.horn), () => poly(ctx, [hx - 0.6, hy - 3.6, hx + 2.2, hy - 13, hx + 2.2, hy - 3.2]), 0.8);
    ctx.strokeStyle = '#00000030';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let k = 1; k <= 3; k++) {
      const y = hy - 3.6 - k * 2.3;
      ctx.moveTo(hx - 0.3 + k * 0.5, y + 0.6);
      ctx.lineTo(hx + 2.2, y - 0.4);
    }
    ctx.stroke();
  }
  if (extra?.wings) wing(ctx, 0, -6, 1.15, Math.sin(t * 6) * 0.5 + 0.3, extra.wings.color, extra.wings.dark, false);
  ctx.restore();
  return { hx: hx * s, hy: hy * s + bob };
}

/** Brilho do chifre (e do raio) ao atacar. */
function hornGlow(ctx: Ctx, p: Pose, hx: number, hy: number, color: string): void {
  const pulse = 0.5 + Math.sin(p.time * 4) * 0.2 + p.attack * 0.6;
  halo(ctx, hx + 2, hy - 9, 7 + p.attack * 6, color, pulse);
}

/** Potro Estelar: unicórnio jovem; o chifre dispara o raio de luz. */
export function drawStarFoal(ctx: Ctx, p: Pose): void {
  const prism = formA(p);
  const guide = formB(p);
  const mane = prism ? RAINBOW : guide ? ['#bfe8ff', '#ffffff', '#9ad8ff'] : ['#ffb0d8', '#d8b0ff', '#b0d8ff'];
  const { hx, hy } = horse(ctx, p, { coat: '#fbf7ff', coatDark: '#c8bce0', hoof: '#b8a0d8', mane, horn: prism ? '#ff9ad8' : GOLD, size: 0.9 });
  hornGlow(ctx, p, hx, hy, prism ? '#ffd0f4' : '#fff6c0');
  if (guide) {
    // Estrela Guia: estrela flutuando sobre o chifre
    const y = hy - 17 + Math.sin(p.time * 3) * 1.2;
    halo(ctx, hx + 2, y, 8, '#bfe8ff', 0.7);
    shape(ctx, '#ffffff', () => poly(ctx, [hx + 2, y - 3.5, hx + 3, y - 1, hx + 5.5, y, hx + 3, y + 1, hx + 2, y + 3.5, hx + 1, y + 1, hx - 1.5, y, hx + 1, y - 1]), 0.5);
  }
}

/** Unicórnio Guardião: maior, com peitoral prateado e a aura de proteção. */
export function drawGuardianUnicorn(ctx: Ctx, p: Pose): void {
  const sanctuary = formA(p);
  const lance = formB(p);
  // aura de proteção no chão
  ctx.save();
  ctx.globalAlpha *= 0.35 + Math.sin(p.time * 2) * 0.08;
  ctx.strokeStyle = sanctuary ? '#fff2b0' : '#cfe6ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ellipse(ctx, 0, 13, 20, 5);
  ctx.stroke();
  ctx.restore();
  const { hx, hy } = horse(ctx, p, {
    coat: '#f4f0ff',
    coatDark: '#b8b0d8',
    hoof: '#8a90b8',
    mane: sanctuary ? ['#fff2b0', '#ffffff', '#ffd25a'] : ['#cfe6ff', '#ffffff', '#b0c8ff'],
    horn: sanctuary ? GOLD : '#9ad8ff',
    size: 1.05,
  });
  // peitoral prateado com gema
  shape(ctx, vertical(ctx, -8, 2, '#e8ecf8', '#8a90b8'), () => {
    ctx.moveTo(6, -7);
    ctx.quadraticCurveTo(13, -6, 13, 0);
    ctx.lineTo(8, 2);
    ctx.quadraticCurveTo(5, -2, 6, -7);
    ctx.closePath();
  }, 0.8);
  halo(ctx, 10, -3, 5, lance ? '#ff9a5a' : '#7ac8ff', 0.8);
  shape(ctx, lance ? '#ffb07a' : '#9ad8ff', () => ellipse(ctx, 10, -3, 1.6, 1.6), 0.5);
  hornGlow(ctx, p, hx, hy, sanctuary ? '#fff2b0' : '#cfe6ff');
  if (lance) {
    // Lança Celeste: raios de luz cravados ao redor
    for (const x of [-14, 16]) {
      line(ctx, '#fff6c0', 1.2, () => {
        ctx.moveTo(x, 13);
        ctx.lineTo(x + 1, -6 + Math.sin(p.time * 3 + x) * 1.5);
      }, false);
      halo(ctx, x + 1, -6, 4, '#fff6c0', 0.6);
    }
  }
}

/** Pégaso de Guerra: asas abertas e armadura de investida. */
export function drawWarPegasus(ctx: Ctx, p: Pose): void {
  const storm = formA(p);
  const royal = formB(p);
  const { hx, hy } = horse(
    ctx,
    p,
    {
      coat: storm ? '#d8dcf0' : '#fdfbff',
      coatDark: storm ? '#7a80a8' : '#c0b8d8',
      hoof: '#6a6080',
      mane: storm ? ['#9ad8ff', '#5a7aff', '#ffffff'] : royal ? ['#ffd25a', '#ffb45a', '#fff2b0'] : ['#c8b8ff', '#ffffff', '#b0d8ff'],
      size: 1,
    },
    { wings: storm ? { color: '#e0e8ff', dark: '#8a98c8' } : royal ? { color: '#fff6dc', dark: '#d8b870' } : { color: '#ffffff', dark: '#c8c0e0' } },
  );
  // testeira de armadura
  shape(ctx, vertical(ctx, hy - 4, hy + 2, royal ? '#ffe9a8' : '#e0e4f0', royal ? '#b08a3a' : '#7a809a'), () => {
    ctx.moveTo(hx - 2, hy - 3.5);
    ctx.lineTo(hx + 5, hy - 1.5);
    ctx.lineTo(hx + 4, hy + 0.5);
    ctx.lineTo(hx - 2.5, hy - 1);
    ctx.closePath();
  }, 0.6);
  if (storm) {
    // Corcel da Tempestade: faíscas nas asas
    const flick = Math.sin(p.time * 20) > 0.3;
    if (flick) {
      line(ctx, '#bfe8ff', 1, () => {
        ctx.moveTo(-6, -22);
        ctx.lineTo(-3, -18);
        ctx.lineTo(-5, -16);
        ctx.lineTo(-1, -12);
      }, false);
    }
  }
  if (p.attack > 0.2) halo(ctx, hx + 6, hy + 4, 10, storm ? '#9ad8ff' : '#ffffff', p.attack * 0.6);
}

/** Herói Alicórnio: unicórnio alado com coroa; crina de arco-íris. */
export function drawAlicorn(ctx: Ctx, p: Pose): void {
  const coat = skin(p, 'coat', '#fbf6ff');
  const coatDark = skin(p, 'coatDark', '#c8b8e8');
  const wingColor = skin(p, 'wing', '#ffffff');
  const { hx, hy } = horse(
    ctx,
    p,
    { coat, coatDark, hoof: skin(p, 'hoof', '#b89ad8'), mane: RAINBOW, horn: skin(p, 'horn', GOLD), size: 1.1 },
    { wings: { color: wingColor, dark: skin(p, 'wingDark', '#d0c4ec') } },
  );
  // coroa
  shape(ctx, vertical(ctx, hy - 8, hy - 3, '#fff2b0', GOLD), () => {
    ctx.moveTo(hx - 3, hy - 3.5);
    ctx.lineTo(hx - 2.5, hy - 7);
    ctx.lineTo(hx - 1, hy - 5);
    ctx.lineTo(hx, hy - 8);
    ctx.lineTo(hx + 1, hy - 5);
    ctx.lineTo(hx + 2.5, hy - 7);
    ctx.lineTo(hx + 2.5, hy - 3);
    ctx.closePath();
  }, 0.6);
  hornGlow(ctx, p, hx, hy, '#ffd0f4');
}
