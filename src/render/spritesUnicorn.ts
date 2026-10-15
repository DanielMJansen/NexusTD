// Raça Unicórnio (exclusiva, por código de presente): Potro Estelar, Unicórnio Guardião,
// Pégaso de Guerra e o herói Alicórnio. Corpo de cavalo compartilhado, com peças trocáveis
// (crina, chifre, cabeça, asas, patas) para as formas e as variantes.
import {
  circle,
  darken,
  ellipse,
  FIRE_FLAME,
  flame,
  formA,
  formB,
  GOLD,
  halo,
  line,
  poly,
  radial,
  shape,
  skin,
  star,
  TAU,
  vertical,
  type Ctx,
  type FlameColors,
  type Pose,
} from './spriteKit';

const RAINBOW = ['#ff7a9a', '#ffb45a', '#ffe66a', '#7ae8a0', '#7ac8ff', '#b08aff'];
const JADE_FLAME: FlameColors = { outer: ['#a0ffd8', '#20a878'], inner: ['#ffffff', '#d0fff0'], glow: '#40d8a0' };

type Point = readonly [number, number];
type DecorStage = 'body' | 'neck' | 'head' | 'top';

interface HorseLook {
  coat: string;
  coatDark: string;
  hoof: string;
  /** Cores da crina e da cauda (em mechas). */
  mane: readonly string[];
  horn?: string;
  /** Tamanho geral (1 = potro). */
  size: number;
  /** Mechas, bolinhas de algodão, entalhe de madeira, folhas ou chamas. */
  maneStyle?: 'strands' | 'puff' | 'carved' | 'leaf' | 'flame';
  flame?: FlameColors;
  hornStyle?: 'spiral' | 'candy' | 'lance' | 'wood' | 'antler';
  head?: 'horse' | 'eagle' | 'qilin';
  /** Penas da cabeça e do pescoço (cabeça de águia). */
  feather?: readonly [string, string];
  /** Patas da frente de águia (hipogrifo). */
  talons?: boolean;
  /** Nuvens no lugar dos cascos. */
  cloudHooves?: boolean;
  /** Escamas na pelagem. */
  scales?: string;
  /** Orelha pontuda com tufo. */
  tuftEars?: boolean;
  /** Olho brilhante desta cor. */
  eye?: string;
  /** Parado em pose de empinar (cavalo de carrossel). */
  frozen?: boolean;
}

interface WingLook {
  color: string;
  dark: string;
  shape?: 'feather' | 'jagged' | 'bat' | 'royal';
  size?: number;
  /** Ergue a asa (mais vertical). */
  raise?: number;
  rim?: string;
  sparks?: boolean;
}

function wingPath(ctx: Ctx, kind: NonNullable<WingLook['shape']>): void {
  ctx.moveTo(0, 0);
  if (kind === 'bat') {
    ctx.lineTo(-2, -20);
    ctx.quadraticCurveTo(0, -14, 4, -18);
    ctx.quadraticCurveTo(4, -11, 9, -13);
    ctx.quadraticCurveTo(7, -6, 12, -5);
    ctx.quadraticCurveTo(6, -1, 3, 1);
  } else if (kind === 'jagged') {
    ctx.quadraticCurveTo(-4, -10, -2, -21);
    ctx.lineTo(1, -15);
    ctx.lineTo(4, -20);
    ctx.lineTo(5, -13);
    ctx.lineTo(9, -16);
    ctx.lineTo(8.5, -9);
    ctx.lineTo(12, -9);
    ctx.quadraticCurveTo(8, -3, 3, 1);
  } else {
    ctx.quadraticCurveTo(-4, -10, -2, -20);
    // penas na ponta
    ctx.lineTo(1, -16);
    ctx.lineTo(3, -19);
    ctx.lineTo(4.5, -14);
    ctx.lineTo(7, -16);
    ctx.lineTo(7.5, -10);
    ctx.lineTo(10, -10);
    ctx.quadraticCurveTo(8, -3, 3, 1);
  }
  ctx.closePath();
}

/** Asa real: penas longas em leque, abertas para trás, com pontas douradas (Pégaso Real). */
function royalWing(ctx: Ctx, x: number, y: number, w: WingLook, size: number, flap: number, back: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.4 - flap * 0.45 + (back ? 0.25 : 0));
  ctx.scale(size * (w.size ?? 1), size * (w.size ?? 1));
  const base = back ? w.dark : w.color;
  // camada de penas longas (forma da asa normal, maior) com borda dourada
  shape(ctx, vertical(ctx, -20, 2, base, back ? darken(w.dark, 0.2) : w.dark), () => wingPath(ctx, 'feather'), 0.8);
  if (w.rim && !back) {
    ctx.strokeStyle = w.rim;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    wingPath(ctx, 'feather');
    ctx.stroke();
  }
  // segunda camada de penas, menor e mais clara, por cima
  if (!back) {
    ctx.save();
    ctx.translate(0.5, -0.5);
    ctx.scale(0.62, 0.62);
    shape(ctx, vertical(ctx, -20, 2, '#ffffff', w.color), () => wingPath(ctx, 'feather'), 0.6);
    ctx.restore();
  }
  ctx.restore();
}

/** Asa (de trás para a frente: a de trás mais escura). */
function wing(ctx: Ctx, x: number, y: number, w: WingLook, size: number, flap: number, back: boolean, t: number): void {
  if (w.shape === 'royal') {
    royalWing(ctx, x, y, w, size, flap, back);
    return;
  }
  const kind = w.shape ?? 'feather';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5 - flap * 0.6 + (back ? 0.25 : 0) + (w.raise ?? 0));
  ctx.scale(size * (w.size ?? 1), size * (w.size ?? 1));
  shape(ctx, back ? w.dark : w.color, () => wingPath(ctx, kind), 0.8);
  if (w.rim) {
    ctx.strokeStyle = w.rim;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    wingPath(ctx, kind);
    ctx.stroke();
  }
  if (!back) {
    ctx.strokeStyle = kind === 'bat' ? w.dark : '#00000022';
    ctx.lineWidth = kind === 'bat' ? 0.7 : 0.6;
    ctx.beginPath();
    if (kind === 'bat') {
      // ossos dos dedos da membrana
      for (const [bx, by] of [[-2, -20], [4, -18], [9, -13], [12, -5]] as const) {
        ctx.moveTo(0.5, -0.5);
        ctx.lineTo(bx, by);
      }
    } else {
      for (const k of [0.35, 0.6]) {
        ctx.moveTo(1, -2);
        ctx.lineTo(-1 + k * 9, -17 + k * 6);
      }
    }
    ctx.stroke();
    if (w.sparks && Math.sin(t * 20) > 0.3) {
      line(ctx, '#bfe8ff', 0.9, () => {
        ctx.moveTo(-1, -17);
        ctx.lineTo(2, -12);
        ctx.lineTo(0, -10);
        ctx.lineTo(4, -5);
      }, false);
    }
  }
  ctx.restore();
}

function quad(a: Point, c: Point, b: Point, k: number): [number, number] {
  const u = 1 - k;
  return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]];
}

/** Mechas onduladas (crina ou cauda) entre dois pontos, uma por cor. */
function strands(ctx: Ctx, colors: readonly string[], from: Point, to: Point, bend: number, t: number, width: number): void {
  colors.forEach((color, i) => {
    const off = (i - (colors.length - 1) / 2) * width * 0.7;
    const wave = Math.sin(t * 4 + i) * 1.6;
    line(ctx, color, width, () => {
      ctx.moveTo(from[0], from[1] + off * 0.4);
      ctx.quadraticCurveTo((from[0] + to[0]) / 2 + bend, (from[1] + to[1]) / 2 + off + wave, to[0] + wave * 0.5, to[1] + off);
    }, false);
  });
}

/** Crina ou cauda no estilo do visual. */
function mane(ctx: Ctx, look: HorseLook, from: Point, to: Point, bend: number, t: number, width: number, tail: boolean): void {
  const style = look.maneStyle ?? 'strands';
  const ctrl: Point = [(from[0] + to[0]) / 2 + bend, (from[1] + to[1]) / 2];
  if (style === 'strands' || style === 'leaf') strands(ctx, look.mane, from, to, bend, t, width);
  else if (style === 'carved') strands(ctx, look.mane, from, to, bend, 0.4, width * 1.25); // madeira entalhada: não ondula
  else if (style === 'puff') {
    const n = tail ? 5 : 6;
    for (let i = 0; i < n; i++) {
      const [x, y] = quad(from, ctrl, to, i / (n - 1));
      const r = width * (1.3 - (i / (n - 1)) * 0.35) + Math.sin(t * 3 + i) * 0.15;
      shape(ctx, look.mane[i % look.mane.length], () => circle(ctx, x, y, r), 0.5);
    }
  } else {
    const colors = look.flame ?? FIRE_FLAME;
    if (tail) {
      // cauda de leão com ponta em chama
      line(ctx, look.coatDark, 1.4, () => {
        ctx.moveTo(from[0], from[1]);
        ctx.quadraticCurveTo(ctrl[0], ctrl[1], to[0] + 2, to[1] - 4);
      }, false);
      flame(ctx, to[0] + 2, to[1] - 4, 2.4, 7, -0.9, t, colors);
    } else {
      for (const k of [0.05, 0.35, 0.65, 0.95]) {
        const [x, y] = quad(from, ctrl, to, k);
        flame(ctx, x, y, 1.6, 5, -0.6, t + k * 3, colors);
      }
    }
  }
  if (style === 'leaf') {
    for (let i = 0; i < 3; i++) {
      const [x, y] = quad(from, ctrl, to, 0.4 + i * 0.3);
      ctx.save();
      ctx.translate(x, y + Math.sin(t * 3 + i) * 0.6);
      ctx.rotate(0.8 + i);
      shape(ctx, look.mane[(i + 1) % look.mane.length], () => ellipse(ctx, 0, 0, 2, 0.95), 0.4);
      ctx.restore();
    }
  }
}

function horn(ctx: Ctx, look: HorseLook, hx: number, hy: number): void {
  const color = look.horn!;
  const style = look.hornStyle ?? 'spiral';
  if (style === 'lance') {
    // chifre-lança apontado para a frente, com anel na base
    shape(ctx, vertical(ctx, hy - 13, hy - 3, '#ffffff', color), () => poly(ctx, [hx - 0.8, hy - 3.8, hx + 15, hy - 13, hx + 1.8, hy - 2.8]), 0.8);
    shape(ctx, GOLD, () => ellipse(ctx, hx + 0.6, hy - 3.6, 1.9, 1.2), 0.5);
  } else if (style === 'wood') {
    // galho torcido com brotos
    line(ctx, color, 1.6, () => {
      ctx.moveTo(hx + 0.4, hy - 3.4);
      ctx.quadraticCurveTo(hx + 3, hy - 8, hx + 1.6, hy - 12.5);
    });
    line(ctx, color, 0.9, () => {
      ctx.moveTo(hx + 1.9, hy - 8);
      ctx.lineTo(hx + 4.4, hy - 10);
    });
    for (const [x, y, a] of [[hx + 4.8, hy - 10.4, -0.4], [hx + 1.4, hy - 13.2, -1.2]] as const) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      shape(ctx, '#7ad860', () => ellipse(ctx, 0, 0, 1.8, 0.9), 0.4);
      ctx.restore();
    }
  } else if (style === 'antler') {
    // galhada de qilin
    line(ctx, color, 1.3, () => {
      ctx.moveTo(hx - 0.5, hy - 3.4);
      ctx.quadraticCurveTo(hx - 1.5, hy - 8, hx + 0.5, hy - 12);
      ctx.moveTo(hx - 0.9, hy - 7);
      ctx.lineTo(hx + 2.6, hy - 8.6);
      ctx.moveTo(hx - 0.4, hy - 10);
      ctx.lineTo(hx - 3, hy - 12);
    });
  } else {
    shape(ctx, vertical(ctx, hy - 13, hy - 3, '#ffffff', style === 'candy' ? '#ffffff' : color), () => poly(ctx, [hx - 0.6, hy - 3.6, hx + 2.2, hy - 13, hx + 2.2, hy - 3.2]), 0.8);
    ctx.strokeStyle = style === 'candy' ? color : '#00000030';
    ctx.lineWidth = style === 'candy' ? 1 : 0.5;
    ctx.beginPath();
    for (let k = 1; k <= 3; k++) {
      const y = hy - 3.6 - k * 2.3;
      ctx.moveTo(hx - 0.3 + k * 0.5, y + 0.6);
      ctx.lineTo(hx + 2.2, y - 0.4);
    }
    ctx.stroke();
  }
}

/**
 * Cavalo de perfil olhando para a direita, cascos em y ≈ 14.
 * Devolve a posição da cabeça (para chifre, coroa, olhos e acessórios).
 */
function horse(
  ctx: Ctx,
  p: Pose,
  look: HorseLook,
  extra?: { wings?: WingLook; decorate?: (stage: DecorStage, hx: number, hy: number) => void },
): { hx: number; hy: number } {
  const s = look.size;
  const t = p.time;
  const gallop = look.frozen ? 0.9 : p.moving ? Math.sin(t * 12) : Math.sin(t * 2) * 0.15;
  const rear = look.frozen ? 0 : p.attack * 0.6; // empina ao atacar
  const bob = look.frozen ? 0 : p.moving ? Math.abs(Math.sin(t * 12)) * -1.2 : Math.sin(t * 2) * 0.4;
  const flap = Math.sin(t * 6) * 0.5 + 0.3;
  const eagle = look.head === 'eagle';
  const feather = look.feather ?? [look.coat, look.coatDark];
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(-rear * 0.25);
  ctx.scale(s, s);

  if (extra?.wings) wing(ctx, -2, -6, extra.wings, 1.05, flap, true, t);

  // cauda
  mane(ctx, look, [-11, -4], [-19, 6], -4, t, 1.8, true);

  // pernas de trás e da frente (galope alternado)
  const legs: [number, number][] = [
    [-8, gallop],
    [-5, -gallop],
    [6, -gallop],
    [9, gallop],
  ];
  for (const [x, phase] of legs) {
    const kneeX = x + phase * 2;
    const fx = x + phase * 3;
    const fy = 13.5 - Math.max(0, phase) * 1.5;
    if (look.talons && x > 0) {
      // pata de águia: calça de penas, canela amarela e garras
      line(ctx, feather[1], 2.8, () => {
        ctx.moveTo(x, 3);
        ctx.lineTo(kneeX, 8);
      });
      line(ctx, '#e8b040', 1.4, () => {
        ctx.moveTo(kneeX, 8);
        ctx.lineTo(fx, fy);
      });
      line(ctx, '#2a1a10', 0.7, () => {
        for (const d of [-1, 0, 1]) {
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + 1.8, fy + 0.4 + d * 0.8);
        }
      }, false);
      continue;
    }
    line(ctx, look.coatDark, 2.6, () => {
      ctx.moveTo(x, 3);
      ctx.lineTo(kneeX, 9);
      ctx.lineTo(fx, fy);
    });
    if (look.cloudHooves) {
      for (const [dx, dy, r] of [[-1, 0.6, 1.6], [1, 0.4, 1.5], [0, -0.6, 1.4]] as const) shape(ctx, '#fffaf0', () => circle(ctx, fx + dx, fy + dy, r), 0.4);
    } else {
      shape(ctx, look.hoof, () => ctx.roundRect(fx - 1.6, fy - 0.7, 3.2, 1.8, 0.6), 0.6);
    }
  }

  // corpo
  shape(ctx, radial(ctx, -2, -4, 14, look.coat, look.coatDark), () => ellipse(ctx, 0, -1, 12, 6.8));
  if (look.scales) {
    ctx.save();
    ctx.strokeStyle = look.scales;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha *= 0.75;
    ctx.beginPath();
    for (let row = 0; row < 3; row++) {
      const y = -5 + row * 3;
      for (let x = -9 + (row % 2) * 1.5; x <= 8; x += 3) {
        if ((x / 11) ** 2 + ((y + 1) / 6) ** 2 > 0.85) continue;
        ctx.moveTo(x + 1.4, y);
        ctx.arc(x, y, 1.4, 0, Math.PI);
      }
    }
    ctx.stroke();
    ctx.restore();
  }
  extra?.decorate?.('body', 14, -15);
  // pescoço
  shape(ctx, vertical(ctx, -16, 0, eagle ? feather[0] : look.coat, eagle ? feather[1] : look.coatDark), () => {
    ctx.moveTo(5, -4);
    ctx.quadraticCurveTo(8, -12, 11, -15);
    ctx.lineTo(15, -13);
    ctx.quadraticCurveTo(12, -6, 11, 1);
    ctx.closePath();
  });
  if (eagle) {
    // penas pontudas onde o pescoço encontra o corpo
    for (const [x, y] of [[5, -5], [7.5, -3], [9.5, -0.5]] as const) {
      shape(ctx, feather[0], () => poly(ctx, [x - 2.4, y - 2, x + 2.6, y - 1.4, x - 0.6, y + 3.4]), 0.5);
    }
  }
  extra?.decorate?.('neck', 14, -15);
  // cabeça
  const hx = 14;
  const hy = -15;
  if (eagle) {
    // cabeça de águia com bico curvo e tufos para trás
    shape(ctx, feather[0], () => poly(ctx, [hx - 3.5, hy - 2, hx - 8, hy - 4.5, hx - 4.6, hy + 0.2, hx - 8.2, hy + 1.8, hx - 3.5, hy + 2.6]), 0.6);
    shape(ctx, radial(ctx, hx - 1, hy - 1.5, 6, feather[0], feather[1]), () => ellipse(ctx, hx, hy - 0.5, 4.6, 4.2));
    shape(ctx, vertical(ctx, hy - 2.5, hy + 3, '#ffe08a', '#c88a1a'), () => {
      ctx.moveTo(hx + 3, hy - 2.3);
      ctx.quadraticCurveTo(hx + 8.8, hy - 2.6, hx + 8.2, hy + 2.8);
      ctx.quadraticCurveTo(hx + 6.6, hy + 1, hx + 3.2, hy + 1.6);
      ctx.closePath();
    }, 0.7);
    shape(ctx, '#ffd040', () => circle(ctx, hx + 1, hy - 1.3, 1.3), 0.5);
    shape(ctx, '#12081c', () => circle(ctx, hx + 1.4, hy - 1.2, 0.6), 0);
    line(ctx, feather[1], 0.9, () => {
      ctx.moveTo(hx - 0.8, hy - 3.2);
      ctx.lineTo(hx + 2.8, hy - 2.2);
    }, false);
  } else {
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
    if (look.eye) {
      halo(ctx, hx + 0.8, hy - 1.2, 3, look.eye, 0.6);
      shape(ctx, look.eye, () => ellipse(ctx, hx + 0.8, hy - 1.2, 1.25, 1.1), 0);
    } else {
      shape(ctx, '#2a1a3a', () => ellipse(ctx, hx + 0.8, hy - 1.2, 1.25, 1.4), 0);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ellipse(ctx, hx + 1.2, hy - 1.8, 0.45, 0.45);
      ctx.fill();
    }
    // orelha
    if (look.tuftEars) {
      shape(ctx, look.coat, () => poly(ctx, [hx - 2.5, hy - 2.5, hx - 3.2, hy - 9.5, hx + 0.5, hy - 3.2]), 0.8);
      line(ctx, look.mane[0], 0.8, () => {
        ctx.moveTo(hx - 3.2, hy - 9.5);
        ctx.lineTo(hx - 4.4, hy - 11.5);
      }, false);
    } else {
      shape(ctx, look.coat, () => poly(ctx, [hx - 2.5, hy - 2.5, hx - 2, hy - 7, hx, hy - 3.2]), 0.8);
    }
    if (look.head === 'qilin') {
      // bigodes de dragão e barbicha de chama
      line(ctx, look.coatDark, 0.6, () => {
        ctx.moveTo(hx + 5.6, hy + 2.2);
        ctx.quadraticCurveTo(hx + 9, hy + 2.6 + Math.sin(t * 3), hx + 10.5, hy + 6);
        ctx.moveTo(hx + 5, hy + 3);
        ctx.quadraticCurveTo(hx + 7, hy + 6, hx + 5.4, hy + 8.5 + Math.sin(t * 3 + 1) * 0.6);
      }, false);
      flame(ctx, hx + 1, hy + 3.6, 1.2, 3.6, Math.PI * 0.92, t, look.flame);
    }
  }
  // crina
  mane(ctx, look, [hx - 2, hy - 3], [3, -5], -3, t + 1, 1.7, false);
  if (look.horn) horn(ctx, look, hx, hy);
  extra?.decorate?.('head', hx, hy);
  if (extra?.wings) wing(ctx, 0, -6, extra.wings, 1.15, flap, false, t);
  extra?.decorate?.('top', hx, hy);
  ctx.restore();
  return { hx: hx * s, hy: hy * s + bob };
}

/** Brilho do chifre (e do raio) ao atacar. */
function hornGlow(ctx: Ctx, p: Pose, hx: number, hy: number, color: string): void {
  const pulse = 0.5 + Math.sin(p.time * 4) * 0.2 + p.attack * 0.6;
  halo(ctx, hx + 2, hy - 9, 7 + p.attack * 6, color, pulse);
}

/** Variantes do Potro: Noturno (cor), Algodão-Doce (crina de algodão, chifre listrado), Carrossel (cavalo de parque no poste). */
const FOAL_VARIANTS = {
  rare: { coat: '#4a4a80', coatDark: '#22224a', hoof: '#8a8ac0', mane: ['#c8d0ff', '#ffffff', '#8a9aff'], horn: '#c8d0ff' },
  epic: { coat: '#ffeef8', coatDark: '#f0b4d4', hoof: '#ff9ac8', mane: ['#ffb0d8', '#b0e0ff', '#fff0a8', '#d8b8ff'], horn: '#ff6aa8' },
  legendary: { coat: '#fffaf0', coatDark: '#dccaa4', hoof: '#e0a830', mane: ['#fff2b0', '#ffd25a', '#e0a830'], horn: '#ffd25a' },
} as const;

/** Poste dourado e toldo listrado do carrossel (atrás do potro, que sobe e desce nele). */
function carouselPole(ctx: Ctx): void {
  const px = -1.5;
  const top = -33;
  shape(ctx, vertical(ctx, top, 14, '#fff2b0', '#b8861a'), () => ctx.rect(px - 0.9, top, 1.8, 47), 0.5);
  ctx.strokeStyle = '#e0243a';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let y = top + 3; y < 14; y += 3.5) {
    ctx.moveTo(px - 0.9, y + 1);
    ctx.lineTo(px + 0.9, y);
  }
  ctx.stroke();
  // toldo: gomos vermelhos e brancos com barra ondulada
  const half = 11;
  const n = 6;
  const step = (half * 2) / n;
  for (let i = 0; i < n; i++) {
    const x0 = px - half + i * step;
    shape(ctx, i % 2 ? '#fff6ec' : '#e0243a', () => poly(ctx, [px, top - 7, x0, top, x0 + step, top]), 0.6);
    shape(ctx, i % 2 ? '#e0243a' : '#fff6ec', () => ctx.arc(x0 + step / 2, top, step / 2, 0, Math.PI), 0.5);
  }
  shape(ctx, GOLD, () => circle(ctx, px, top - 8, 1.5), 0.5);
}

/** Potro Estelar: unicórnio jovem; o chifre dispara o raio de luz. */
export function drawStarFoal(ctx: Ctx, p: Pose): void {
  const prism = formA(p);
  const guide = formB(p);
  const fv = p.variant ? FOAL_VARIANTS[p.variant] : null;
  const carousel = p.variant === 'legendary';
  const shadeB = (c: string) => (fv && guide ? darken(c, 0.15) : c);
  if (p.supreme && prism) {
    // Arco-Íris Vivo: arco atrás do potro, como uma moldura (não cobre o corpo)
    halo(ctx, 0, -8, 26, '#ffd0f4', 0.25);
    RAINBOW.forEach((color, i) => {
      ctx.save();
      ctx.globalAlpha *= 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 12, 30 - i * 1.7, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.restore();
    });
  }
  if (p.supreme && guide) {
    // Constelação: estrelas grandes ligadas por linhas no céu atrás, e uma lua crescente
    const stars: [number, number][] = [[-20, -10], [-14, -24], [-4, -30], [6, -26], [14, -34], [20, -20], [12, -12]];
    halo(ctx, 0, -20, 26, '#3a4aa8', 0.5);
    ctx.save();
    ctx.globalAlpha *= 0.7;
    line(ctx, '#bfe8ff', 0.8, () => {
      stars.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    }, false);
    ctx.restore();
    stars.forEach(([x, y], i) => {
      const tw = 0.6 + Math.sin(p.time * 3 + i) * 0.4;
      halo(ctx, x, y, 4, '#bfe8ff', tw);
      shape(ctx, '#ffffff', () => star(ctx, x, y, 2 + (i % 2) * 0.8), 0);
    });
    shape(ctx, '#fff6d0', () => {
      ctx.arc(-18, -32, 5, 0.6, TAU - 0.6);
      ctx.arc(-15.6, -33, 4, TAU - 0.9, 0.9, true);
      ctx.closePath();
    }, 0.5);
  }
  if (carousel) carouselPole(ctx);
  ctx.save();
  // Estrela Guia flutua numa nuvem; o cavalo de carrossel sobe e desce no poste
  ctx.translate(0, (guide ? -4 + Math.sin(p.time * 2) : 0) + (carousel ? Math.sin(p.time * 2.2) * 2.5 : 0));
  const mane = fv ? fv.mane : prism ? RAINBOW : guide ? ['#bfe8ff', '#ffffff', '#9ad8ff'] : ['#ffb0d8', '#d8b0ff', '#b0d8ff'];
  const { hx, hy } = horse(
    ctx,
    p,
    {
      coat: fv ? shadeB(fv.coat) : '#fbf7ff',
      coatDark: fv ? fv.coatDark : '#c8bce0',
      hoof: fv ? fv.hoof : '#b8a0d8',
      mane,
      horn: fv ? fv.horn : prism ? '#ff9ad8' : GOLD,
      size: 0.9,
      maneStyle: p.variant === 'epic' ? 'puff' : carousel ? 'carved' : 'strands',
      hornStyle: p.variant === 'epic' ? 'candy' : 'spiral',
      frozen: carousel,
    },
    {
      decorate: (stage) => {
        if (stage !== 'body') return;
        if (carousel) {
          // sela pintada e flores no flanco
          shape(ctx, vertical(ctx, -9, -1, '#ff4a5a', '#8a1020'), () => {
            ctx.moveTo(-6, -6.5);
            ctx.quadraticCurveTo(-2, -9.5, 3, -6.8);
            ctx.lineTo(3.5, -1.5);
            ctx.quadraticCurveTo(-1, 0, -6.5, -1.5);
            ctx.closePath();
          }, 0.6);
          line(ctx, GOLD, 0.8, () => {
            ctx.moveTo(-6.5, -1.5);
            ctx.quadraticCurveTo(-1, 0, 3.5, -1.5);
          }, false);
          shape(ctx, '#40c8e0', () => circle(ctx, -1.5, -4.5, 1.2), 0.5);
          for (const [x, y] of [[-9, -1], [-7.5, 2.5]] as const) {
            for (let k = 0; k < 5; k++) {
              const a = (k / 5) * Math.PI * 2;
              shape(ctx, '#ff9ac8', () => circle(ctx, x + Math.cos(a) * 1, y + Math.sin(a) * 1, 0.7), 0);
            }
            shape(ctx, GOLD, () => circle(ctx, x, y, 0.5), 0);
          }
        }
        if (prism) {
          // Prisma: cristal nas costas que parte a luz em arco-íris
          RAINBOW.forEach((color, i) => {
            ctx.save();
            ctx.globalAlpha *= 0.55 + Math.sin(p.time * 3 + i) * 0.2;
            line(ctx, color, 0.9, () => {
              ctx.moveTo(-2, -12);
              ctx.lineTo(-13, -19 + i * 1.3);
            }, false);
            ctx.restore();
          });
          shape(ctx, vertical(ctx, -16, -6, '#ffffff', '#d8b0ff'), () => poly(ctx, [-5.5, -6.5, -2, -16, 1.5, -6.5]), 0.7);
          shape(ctx, '#ffffffaa', () => poly(ctx, [-2, -16, 1.5, -6.5, -1, -6.5]), 0);
        }
      },
    },
  );
  hornGlow(ctx, p, hx, hy, carousel ? '#fff2b0' : prism ? '#ffd0f4' : '#fff6c0');
  if (guide) {
    // Estrela Guia: nuvem sob os cascos e uma estrela grande sobre o chifre
    for (const [x, y, r] of [[-10, 12.5, 4], [-4, 13.5, 5], [3, 13.5, 5], [9, 12.5, 4], [-7, 10.5, 3.5], [6, 10.5, 4]] as const) {
      shape(ctx, radial(ctx, x - 1, y - 2, r + 1, '#ffffff', '#c8dcff'), () => circle(ctx, x, y, r), 0.6);
    }
    const y = hy - 18 + Math.sin(p.time * 3) * 1.2;
    halo(ctx, hx + 2, y, 10, '#bfe8ff', 0.7);
    line(ctx, '#bfe8ff', 0.6, () => {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + p.time;
        ctx.moveTo(hx + 2 + Math.cos(a) * 5, y + Math.sin(a) * 5);
        ctx.lineTo(hx + 2 + Math.cos(a) * 7, y + Math.sin(a) * 7);
      }
    }, false);
    shape(ctx, '#ffffff', () => star(ctx, hx + 2, y, 4.2), 0.5);
  }
  if (p.supreme && guide) {
    // Constelação: estrelas cintilando na pelagem
    for (const [x, y] of [[-6, -3], [-2, 1], [3, -4], [7, 0], [-9, 2]] as const) {
      const tw = 0.5 + Math.sin(p.time * 4 + x) * 0.5;
      halo(ctx, x, y, 2.5, '#bfe8ff', tw);
      shape(ctx, '#ffffff', () => circle(ctx, x, y, 0.6), 0);
    }
  }
  ctx.restore();
}

/** Variantes do Guardião: Lunar (cor), Silvestre (chifre de galho, crina de folhas), Qilin (escamas, chamas de jade, nuvens nos cascos). */
const GUARD_VARIANTS = {
  rare: { coat: '#dce4f8', coatDark: '#6a78a8', hoof: '#4a5888', mane: ['#a8c0ff', '#eef4ff', '#6a80c8'], horn: '#c8d8ff', cloth: ['#3a4a8a', '#1a2450'], trim: '#c8d8ff', gem: '#c8d8ff' },
  epic: { coat: '#ece4cc', coatDark: '#8a7a5a', hoof: '#5a4a3a', mane: ['#5a9a4a', '#8ac860', '#3a6a2a'], horn: '#8a6a3a', cloth: ['#5a8a3a', '#2a4a1a'], trim: '#e8d890', gem: '#ff8ab0' },
  legendary: { coat: '#f4d878', coatDark: '#a8782a', hoof: '#6a4a1a', mane: ['#40d8a0'], horn: '#8a5a1a', cloth: ['#d8243a', '#7a0a1a'], trim: '#ffd25a', gem: '#40d8a0' },
} as const;

/** Unicórnio Guardião: maior, com peitoral prateado e a aura de proteção. */
export function drawGuardianUnicorn(ctx: Ctx, p: Pose): void {
  const sanctuary = formA(p);
  const lance = formB(p);
  const gv = p.variant ? GUARD_VARIANTS[p.variant] : null;
  const qilin = p.variant === 'legendary';
  const shadeB = (c: string) => (gv && lance ? darken(c, 0.15) : c);
  // aura de proteção no chão
  ctx.save();
  ctx.globalAlpha *= 0.35 + Math.sin(p.time * 2) * 0.08;
  ctx.strokeStyle = sanctuary ? '#fff2b0' : '#cfe6ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ellipse(ctx, 0, 13, 20, 5);
  ctx.stroke();
  ctx.restore();
  const trim = gv ? gv.trim : GOLD;
  const { hx, hy } = horse(
    ctx,
    p,
    {
      coat: gv ? shadeB(gv.coat) : '#f4f0ff',
      coatDark: gv ? gv.coatDark : '#b8b0d8',
      hoof: gv ? gv.hoof : '#8a90b8',
      mane: gv ? gv.mane : sanctuary ? ['#fff2b0', '#ffffff', '#ffd25a'] : ['#cfe6ff', '#ffffff', '#b0c8ff'],
      horn: gv ? gv.horn : sanctuary ? GOLD : '#9ad8ff',
      size: 1.05,
      maneStyle: qilin ? 'flame' : p.variant === 'epic' ? 'leaf' : 'strands',
      flame: JADE_FLAME,
      // o Juízo de Luz desenha o chifre gigante por cima
      hornStyle: lance && !p.supreme ? 'lance' : qilin ? 'antler' : p.variant === 'epic' ? 'wood' : 'spiral',
      head: qilin ? 'qilin' : 'horse',
      cloudHooves: qilin,
      scales: qilin ? '#c8902a' : undefined,
    },
    {
      decorate: (stage) => {
        if (stage === 'body' && sanctuary) {
          // Santuário: manta de torneio até perto do chão, com brasão
          const cloth = gv ? gv.cloth : ['#fffaf0', '#d8c8a0'];
          shape(ctx, vertical(ctx, -8, 8, cloth[0], cloth[1]), () => {
            ctx.moveTo(-12.5, -2);
            ctx.quadraticCurveTo(-11, -8.5, -2, -8.2);
            ctx.quadraticCurveTo(6, -8, 9.5, -4.5);
            ctx.lineTo(10, 7);
            for (let x = 10; x > -12; x -= 2.5) ctx.quadraticCurveTo(x - 1.25, 9.4, x - 2.5, 7);
            ctx.closePath();
          }, 0.8);
          line(ctx, trim, 0.8, () => {
            ctx.moveTo(-12.4, 6);
            ctx.lineTo(10, 6);
          }, false);
          shape(ctx, vertical(ctx, -4, 4, trim, darken(trim, 0.35)), () => {
            ctx.moveTo(-5, -3.5);
            ctx.lineTo(1, -3.5);
            ctx.lineTo(1, 0.5);
            ctx.quadraticCurveTo(-2, 4, -2, 4);
            ctx.quadraticCurveTo(-5, 2, -5, 0.5);
            ctx.closePath();
          }, 0.6);
          shape(ctx, gv ? gv.gem : '#7ac8ff', () => circle(ctx, -2, -0.8, 1), 0.4);
        }
        if (stage === 'neck' && lance) {
          // Lança Celeste: placas de armadura no pescoço
          for (const [x, y, a] of [[6.5, -6, -1.1], [8.6, -9.6, -0.95], [10.8, -12.8, -0.8]] as const) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a);
            shape(ctx, vertical(ctx, -2, 2, '#f0f4ff', '#7a809a'), () => ctx.roundRect(-2.4, -1.8, 4.8, 3.6, 1), 0.6);
            ctx.restore();
          }
        }
      },
    },
  );
  // peitoral prateado com gema
  shape(ctx, vertical(ctx, -8, 2, '#e8ecf8', '#8a90b8'), () => {
    ctx.moveTo(6, -7);
    ctx.quadraticCurveTo(13, -6, 13, 0);
    ctx.lineTo(8, 2);
    ctx.quadraticCurveTo(5, -2, 6, -7);
    ctx.closePath();
  }, 0.8);
  const gem = lance ? '#ff9a5a' : gv ? gv.gem : '#7ac8ff';
  halo(ctx, 10, -3, 5, gem, 0.8);
  shape(ctx, gem, () => ellipse(ctx, 10, -3, 1.6, 1.6), 0.5);
  hornGlow(ctx, p, hx, hy, qilin ? '#a0ffd8' : sanctuary ? '#fff2b0' : '#cfe6ff');
  if (lance) {
    // raios de luz cravados ao redor
    for (const x of [-14, 16]) {
      line(ctx, '#fff6c0', 1.2, () => {
        ctx.moveTo(x, 13);
        ctx.lineTo(x + 1, -6 + Math.sin(p.time * 3 + x) * 1.5);
      }, false);
      halo(ctx, x + 1, -6, 4, '#fff6c0', 0.6);
    }
  }
  if (p.supreme && sanctuary) {
    // Templo Vivo: pilares de luz ao redor
    for (const x of [-18, 18]) {
      shape(ctx, vertical(ctx, -26, 14, '#fff6dcaa', '#ffd25a22'), () => ctx.rect(x - 2, -26, 4, 40), 0);
      shape(ctx, '#ffe9a8', () => ctx.rect(x - 3, -27, 6, 2), 0.4);
    }
  }
  if (p.supreme && lance) {
    // Juízo de Luz: chifre gigante brilhando e raio vertical
    halo(ctx, hx + 2, hy - 14, 14, '#fff6c0', 0.7 + p.attack * 0.3);
    shape(ctx, vertical(ctx, hy - 26, hy - 3, '#ffffff', '#ffd25a'), () => poly(ctx, [hx - 1, hy - 3.6, hx + 3, hy - 26, hx + 3.2, hy - 3.2]), 0.6);
  }
}

/** Variantes do Pégaso: Ruão (cor), Morcego (asas de membrana, orelhas com tufo, olhos acesos), Hipogrifo (cabeça e patas de águia). */
const PEG_VARIANTS = {
  rare: { coat: '#ecc8b8', coatDark: '#9a6a5a', hoof: '#4a2a1a', mane: ['#7a3a2a', '#a85a3a', '#4a2016'], wing: ['#fbefe8', '#c09888'] },
  epic: { coat: '#4e3e60', coatDark: '#1e1428', hoof: '#2a1a34', mane: ['#9a6ab8', '#5a3a7a', '#c8a0e0'], wing: ['#6a4a80', '#34224a'] },
  legendary: { coat: '#b8844e', coatDark: '#5a3a1a', hoof: '#3a2410', mane: ['#f4efe4', '#c8a070', '#8a6a4a'], wing: ['#d8b080', '#7a5634'] },
} as const;
const GRIFFIN_FEATHER = ['#fbf8f0', '#b8a888'] as const;

/** Pégaso de Guerra: asas abertas e armadura de investida. */
export function drawWarPegasus(ctx: Ctx, p: Pose): void {
  const storm = formA(p);
  const royal = formB(p);
  const pv = p.variant ? PEG_VARIANTS[p.variant] : null;
  const bat = p.variant === 'epic';
  const griffin = p.variant === 'legendary';
  const shadeB = (c: string) => (pv && royal ? darken(c, 0.15) : c);
  const { hx, hy } = horse(
    ctx,
    p,
    {
      coat: pv ? shadeB(pv.coat) : storm ? '#d8dcf0' : '#fdfbff',
      coatDark: pv ? pv.coatDark : storm ? '#7a80a8' : '#c0b8d8',
      hoof: pv ? pv.hoof : '#6a6080',
      mane: pv ? pv.mane : storm ? ['#9ad8ff', '#5a7aff', '#ffffff'] : royal ? ['#ffd25a', '#ffb45a', '#fff2b0'] : ['#c8b8ff', '#ffffff', '#b0d8ff'],
      size: 1,
      head: griffin ? 'eagle' : 'horse',
      feather: griffin ? GRIFFIN_FEATHER : undefined,
      talons: griffin,
      tuftEars: bat,
      eye: bat ? '#ffd040' : storm && !pv ? '#bfe8ff' : undefined,
    },
    {
      wings: {
        color: pv ? shadeB(pv.wing[0]) : storm ? '#e0e8ff' : royal ? '#fff6dc' : '#ffffff',
        dark: pv ? pv.wing[1] : storm ? '#8a98c8' : royal ? '#d8b870' : '#c8c0e0',
        shape: bat ? 'bat' : storm ? 'jagged' : royal ? 'royal' : 'feather',
        sparks: storm,
        size: royal ? (p.supreme ? 1.25 : 1.1) : 1,
        rim: royal ? GOLD : undefined,
      },
      decorate: (stage, x, y) => {
        if (stage !== 'top' || !royal) return;
        // Real: penacho vermelho no elmo
        shape(ctx, vertical(ctx, y - 12, y - 2, '#ff4a5a', '#a01a2a'), () => {
          ctx.moveTo(x - 1, y - 3.5);
          ctx.quadraticCurveTo(x - 1, y - 12.5, x - 9.5, y - 10);
          ctx.quadraticCurveTo(x - 5, y - 8, x - 3, y - 2.5);
          ctx.closePath();
        }, 0.6);
      },
    },
  );
  if (!griffin) {
    // testeira de armadura
    shape(ctx, vertical(ctx, hy - 4, hy + 2, royal ? '#ffe9a8' : '#e0e4f0', royal ? '#b08a3a' : '#7a809a'), () => {
      ctx.moveTo(hx - 2, hy - 3.5);
      ctx.lineTo(hx + 5, hy - 1.5);
      ctx.lineTo(hx + 4, hy + 0.5);
      ctx.lineTo(hx - 2.5, hy - 1);
      ctx.closePath();
    }, 0.6);
  }
  if (p.attack > 0.2) halo(ctx, hx + 6, hy + 4, 10, storm ? '#9ad8ff' : '#ffffff', p.attack * 0.6);
  if (p.supreme && storm) {
    // Tempestade Alada: nuvem sobre as asas e raios constantes
    for (const [x, y, r] of [[-6, -26, 4], [-1, -28, 5], [4, -26, 4]] as const) shape(ctx, '#5a6a8a', () => circle(ctx, x, y, r), 0.6);
    if (Math.sin(p.time * 12) > 0) {
      line(ctx, '#fff6a0', 1.2, () => {
        ctx.moveTo(-1, -23);
        ctx.lineTo(-3, -17);
        ctx.lineTo(0, -16);
        ctx.lineTo(-2, -10);
      }, false);
    }
  }
  if (p.supreme && royal) {
    // Pégaso Imperial: armadura dourada no corpo
    shape(ctx, vertical(ctx, -8, 4, '#fff2b0', '#c8901a'), () => ctx.roundRect(-9, -7, 16, 8, 3), 0.7);
    shape(ctx, '#e0243a', () => circle(ctx, -1, -3, 1.4), 0.4);
    halo(ctx, 0, -6, 18, '#ffd25a', 0.25);
  }
}

/** Herói Alicórnio: unicórnio alado com coroa; crina de arco-íris. */
export function drawAlicorn(ctx: Ctx, p: Pose): void {
  const coat = skin(p, 'coat', '#fbf6ff');
  const coatDark = skin(p, 'coatDark', '#c8b8e8');
  const wingColor = skin(p, 'wing', '#ffffff');
  const look = skin(p, 'look', '');
  const nightmare = look === 'nightmare';
  const { hx, hy } = horse(
    ctx,
    p,
    {
      coat,
      coatDark,
      hoof: skin(p, 'hoof', '#b89ad8'),
      // Pesadelo: crina e cauda de fogo e olhos acesos; Celestial: crina de aurora
      mane: look === 'celestial' ? ['#7affc8', '#7ac8ff', '#c08aff', '#ffffff'] : RAINBOW,
      maneStyle: nightmare ? 'flame' : 'strands',
      flame: FIRE_FLAME,
      eye: nightmare ? '#ff6a1a' : undefined,
      horn: skin(p, 'horn', GOLD),
      size: 1.1,
    },
    { wings: { color: wingColor, dark: skin(p, 'wingDark', '#d0c4ec'), shape: nightmare ? 'bat' : 'feather' } },
  );
  if (look === 'celestial') {
    // estrelas cintilando na pelagem
    for (const [x, y] of [[-7, -3], [-2, 0], [4, -4], [-10, 1]] as const) {
      halo(ctx, x * 1.1, y * 1.1, 2.5, '#bfe8ff', 0.5 + Math.sin(p.time * 4 + x) * 0.4);
      shape(ctx, '#ffffff', () => star(ctx, x * 1.1, y * 1.1, 1.1), 0);
    }
  }
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
  hornGlow(ctx, p, hx, hy, nightmare ? '#ff8a3a' : look === 'celestial' ? '#bfe8ff' : '#ffd0f4');
}
