// Raça Golem: Muralha, Cristal, Magma e o herói Colosso.
import {
  circle,
  darken,
  ellipse,
  flame,
  formA,
  formB,
  glowingEye,
  halo,
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
/** Cores da Muralha em cada variante: pedra clara, escura, olhos e detalhes. */
const WALL_VARIANTS = {
  // Golem de Arenito: cor de areia com runas
  rare: { light: '#e0c48a', dark: '#9a7a44', eyes: '#5ac8ff', accent: '#5ac8ff' },
  // Golem de Musgo: pedra coberta de musgo e cogumelos, passarinho no ombro
  epic: { light: '#8a9a7a', dark: '#4a5a3a', eyes: '#c8ff6a', accent: '#5ab84a' },
  // Moai: pedra vulcânica, cabeça enorme e alongada com testa pesada e chapéu de pedra vermelha
  legendary: { light: '#a8a094', dark: '#5a544c', eyes: '#ffd25a', accent: '#b85a3a' },
} as const;

/** Cabeça de Moai: bloco alto, testa saliente, nariz longo, orelhas compridas e pukao vermelho. */
function moaiHead(ctx: Ctx, light: string, dark: string, eyes: string, t: number): void {
  for (const x of [-7.5, 5.5]) rock(ctx, x, -24, 2, 9, light, dark, 1);
  rock(ctx, -6.5, -32, 13, 24, light, dark, 2.5);
  shape(ctx, vertical(ctx, -38, -31, '#c8704a', '#7a3a1e'), () => ctx.roundRect(-5, -37.5, 10, 6, 2), 1);
  // testa pesada fazendo sombra sobre os olhos
  shape(ctx, dark, () => ctx.roundRect(-6.5, -25.5, 13, 3, 1.2), 0.6);
  glowingEye(ctx, -2.4, -21.5, 1.1 + Math.sin(t * 3) * 0.1, eyes);
  glowingEye(ctx, 2.4, -21.5, 1.1 + Math.sin(t * 3) * 0.1, eyes);
  shape(ctx, vertical(ctx, -23, -14, light, dark), () => poly(ctx, [-1.2, -23, 1.2, -23, 2.8, -14.5, -2.8, -14.5]), 0.7);
  line(ctx, '#2a2620', 1, () => {
    ctx.moveTo(-3.6, -12);
    ctx.lineTo(3.6, -12);
  }, false);
}

export function drawWall(ctx: Ctx, p: Pose): void {
  const fort = formA(p);
  const snow = formB(p);
  const wv = p.variant ? WALL_VARIANTS[p.variant] : null;
  const light = wv ? (snow ? darken(wv.light, 0.15) : wv.light) : snow ? '#c8d4e4' : '#9a9488';
  const dark = wv ? wv.dark : snow ? '#6a7a90' : '#56504a';
  const slam = p.attack;
  if (fort) {
    // Fortaleza: 15% maior, torre com bandeira nas costas
    ctx.translate(0, 14);
    ctx.scale(1.15, 1.15);
    ctx.translate(0, -14);
    if (!p.supreme) {
      rock(ctx, 5, -30, 8, 22, light, dark, 1);
      for (let i = 0; i < 3; i++) rock(ctx, 4.5 + i * 3.2, -33, 2.4, 3.5, light, dark, 0.4);
      line(ctx, '#5a3a1e', 0.9, () => {
        ctx.moveTo(9, -33);
        ctx.lineTo(9, -42);
      }, false);
      const wave = Math.sin(p.time * 4) * 1.2;
      shape(ctx, wv ? wv.accent : '#d0303a', () => poly(ctx, [9, -42, 16, -40 + wave, 9, -37.5]), 0.6);
    }
  }
  const moai = p.variant === 'legendary';
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
  if (p.variant === 'rare') {
    // runas azuis gravadas
    line(ctx, '#5ac8ff', 0.8, () => {
      ctx.moveTo(4, -6);
      ctx.lineTo(6, -3);
      ctx.lineTo(4, -2);
      ctx.moveTo(-8, 2);
      ctx.lineTo(-8, 6);
      ctx.moveTo(-9.5, 3.5);
      ctx.lineTo(-6.5, 3.5);
    }, false);
  }
  if (p.variant === 'epic') {
    // musgo por cima e cogumelos
    shape(ctx, '#5ab84a', () => ellipse(ctx, -4, -8.5, 7, 2), 0.5);
    shape(ctx, '#5ab84a', () => ellipse(ctx, 6, 1, 4, 1.6), 0.5);
    for (const [x, y] of [[-9, 6], [8, 5]] as const) {
      shape(ctx, '#f4e8d0', () => ctx.rect(x - 0.5, y - 2, 1, 2), 0);
      shape(ctx, '#e04a3a', () => {
        ctx.ellipse(x, y - 2, 2, 1.6, 0, Math.PI, TAU);
        ctx.closePath();
      }, 0.4);
    }
  }
  if (moai) {
    // marcas de pedra vulcânica e um colar de pedra gravado
    for (const [x, y] of [[-7, 3], [6, -5], [3, 5]] as const) shape(ctx, wv!.dark, () => circle(ctx, x, y, 0.8), 0);
    line(ctx, wv!.accent, 1, () => ctx.arc(0, -9, 6, 0.4, Math.PI - 0.4), false);
  }
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
  // cabeça pequena com olhos (cabeça de Moai na Lendária)
  if (moai) moaiHead(ctx, light, dark, snow ? '#9fdcff' : wv!.eyes, p.time);
  else {
    rock(ctx, -6, -18, 12, 9, light, dark, 3);
    glowingEye(ctx, -2, -14, 1.3, wv ? wv.eyes : snow ? '#9fdcff' : '#ffb84a');
    glowingEye(ctx, 2.5, -14, 1.3, wv ? wv.eyes : snow ? '#9fdcff' : '#ffb84a');
  }
  if (p.variant === 'epic') {
    // passarinho no ombro
    const hop = Math.abs(Math.sin(p.time * 3)) * 1;
    shape(ctx, '#e8a040', () => ellipse(ctx, 13, -10 - hop, 2.2, 1.7), 0.5);
    shape(ctx, '#e8a040', () => circle(ctx, 14.6, -11.6 - hop, 1.3), 0.5);
    shape(ctx, '#f0d040', () => poly(ctx, [15.8, -11.8 - hop, 17.2, -11.4 - hop, 15.8, -11 - hop]), 0);
  }
  if (fort) {
    // ameias de torre e escudo-muralha grande
    if (!moai) for (let i = 0; i < 3; i++) rock(ctx, -6 + i * 4.5, -22, 3, 4, light, dark, 0.5);
    shape(ctx, vertical(ctx, -9, 13, wv ? wv.light : '#c8c0b0', wv ? wv.dark : '#7a7266'), () => {
      ctx.moveTo(-18, -9);
      ctx.lineTo(-5, -9);
      ctx.lineTo(-5, 6);
      ctx.quadraticCurveTo(-11.5, 14, -18, 6);
      ctx.closePath();
    });
    line(ctx, '#3a342e', 0.7, () => {
      ctx.moveTo(-18, -3);
      ctx.lineTo(-5, -3);
      ctx.moveTo(-11.5, -9);
      ctx.lineTo(-11.5, -3);
      ctx.moveTo(-15, -3);
      ctx.lineTo(-15, 4);
      ctx.moveTo(-8, -3);
      ctx.lineTo(-8, 5);
    }, false);
  }
  if (snow) {
    // neve no topo (no Moai, por cima do chapéu de pedra)
    const sy = moai ? -37 : -17;
    shape(ctx, '#ffffff', () => {
      ctx.moveTo(-7, sy);
      ctx.quadraticCurveTo(0, sy - 5, 7, sy);
      ctx.lineTo(5, sy + 1.5);
      ctx.lineTo(2, sy);
      ctx.lineTo(-2, sy + 1.5);
      ctx.lineTo(-5, sy);
      ctx.closePath();
    }, 0.6);
  }
  // Formas Supremas: Montanha Viva (A, musgo e pinheiros no alto) e Terremoto (B, pedras orbitando à frente)
  if (p.supreme && formA(p)) {
    const ty = moai ? -37 : -17;
    shape(ctx, '#3a8a3a', () => ellipse(ctx, 0, ty, 12, 3), 0.6);
    for (const [x, h] of [[-7, 9], [0, 12], [7, 8]] as const) {
      shape(ctx, '#2a6a3a', () => poly(ctx, [x - 3.5, ty, x, ty - h, x + 3.5, ty]), 0.7);
      shape(ctx, '#5a3a1a', () => ctx.rect(x - 0.6, ty, 1.2, 2), 0);
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
  const CV = {
    // Golem de Topázio (âmbar; a ametista ficava igual ao roxo original)
    rare: { color: '#d07a10', glow: '#ffe08a' },
    // Golem de Esmeralda
    epic: { color: '#0e8a4a', glow: '#8affc0' },
    // Golem Geodo: casca de rocha rachada ao meio, ametista por dentro
    legendary: { color: '#7a3ab8', glow: '#f0d8ff' },
  } as const;
  const cv = p.variant ? CV[p.variant] : null;
  const geode = p.variant === 'legendary';
  const color = cv ? (amp ? darken(cv.color, 0.25) : cv.color) : amp ? '#3a8ad8' : '#8a4ad8';
  const glow = cv ? cv.glow : amp ? '#bfeaff' : '#e0c0ff';
  if (p.variant === 'epic') halo(ctx, 0, -2, 16 + Math.sin(p.time * 3) * 2, '#4affa0', 0.4);
  // pernas e corpo (Prisma: corpo de prisma grande e facetado)
  crystal(ctx, -4, 10, 3, 5, color, glow);
  crystal(ctx, 4, 10, 3, 5, color, glow);
  if (prism && !p.supreme) {
    shape(ctx, vertical(ctx, -13, 9, glow, color), () => poly(ctx, [0, -13, 11, 8, -11, 8]), 1);
    line(ctx, '#ffffffaa', 0.7, () => {
      ctx.moveTo(0, -13);
      ctx.lineTo(-3, 8);
      ctx.moveTo(0, -13);
      ctx.lineTo(4, 8);
    }, false);
  } else {
    crystal(ctx, 0, -1, 9, 10, color, glow);
  }
  if (geode) {
    // casca de rocha rachada: duas metades abertas, com a ametista à mostra no meio
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, -12, 10, '#9a8a7a', '#4a3e34'), () => {
        ctx.moveTo(side * 1.5, -12);
        ctx.quadraticCurveTo(side * 13, -11, side * 12.5, 0);
        ctx.quadraticCurveTo(side * 12, 9, side * 2, 10);
        ctx.lineTo(side * 5, 6);
        ctx.lineTo(side * 3.5, 2);
        ctx.lineTo(side * 6, -2);
        ctx.lineTo(side * 4, -6);
        ctx.lineTo(side * 5.5, -9);
        ctx.closePath();
      });
      // borda de quartzo branco na rachadura
      line(ctx, '#f4ecff', 0.9, () => {
        ctx.moveTo(side * 2, 10);
        ctx.lineTo(side * 5, 6);
        ctx.lineTo(side * 3.5, 2);
        ctx.lineTo(side * 6, -2);
        ctx.lineTo(side * 4, -6);
        ctx.lineTo(side * 5.5, -9);
      }, false);
    }
    // punhos de rocha com pontas de cristal
    for (const [x, y] of [[-10, -2], [10, -2 - p.attack * 2]] as const) {
      shape(ctx, vertical(ctx, y - 5, y + 5, '#9a8a7a', '#4a3e34'), () => ctx.roundRect(x - 3.5, y - 4, 7, 9, 3));
      crystal(ctx, x, y - 5, 1.6, 3, color, glow);
    }
  } else {
    crystal(ctx, -10, -2, 3, 6, color, glow);
    crystal(ctx, 10, -2 - p.attack * 2, 3, 6, color, glow);
  }
  // núcleo pulsante
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8 + Math.sin(p.time * 4) * 3 + p.attack * 8;
  shape(ctx, '#ffffff', () => circle(ctx, 0, -1, 2.4), 0.5);
  ctx.restore();
  if (prism && !p.supreme) {
    // feixes de arco-íris saindo do prisma
    const colors = ['#ff6a6a', '#ffd25a', '#6af06a', '#5ab0ff', '#c86aff'];
    ctx.save();
    ctx.globalAlpha *= 0.75 + p.attack * 0.25;
    colors.forEach((c, i) => {
      line(ctx, c, 1.4, () => {
        ctx.moveTo(4, -2);
        ctx.lineTo(20, -9 + i * 3.2 + Math.sin(p.time * 3) * 0.5);
      }, false);
    });
    ctx.restore();
  }
  // cabeça
  if (prism) {
    shape(ctx, vertical(ctx, -24, -12, '#ffffff', cv ? glow : '#c8b8ff'), () => poly(ctx, [0, -25, 6, -13, -6, -13]), 0.9);
    if (p.supreme) {
      const colors = ['#ff6a6a', '#ffd25a', '#6af06a', '#5ab0ff', '#c86aff'];
      colors.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(3, -18);
        ctx.lineTo(10 + i * 0.5, -21 + i * 1.6);
        ctx.stroke();
      });
    }
  } else if (geode) {
    // cabeça de pedra redonda com cristais brotando do alto
    for (const [x, h, a] of [[-2.5, 5, -0.4], [0.5, 7, 0], [3.5, 4.5, 0.4]] as const) {
      ctx.save();
      ctx.translate(x, -21);
      ctx.rotate(a);
      crystal(ctx, 0, -h * 0.6, 1.5, h * 0.6, color, glow);
      ctx.restore();
    }
    shape(ctx, radial(ctx, -1, -18, 7, '#9a8a7a', '#4a3e34'), () => ellipse(ctx, 0, -16.5, 6, 5));
  } else {
    crystal(ctx, 0, -17, 5, 6, color, glow);
  }
  glowingEye(ctx, -1.5, -17, 1, geode ? glow : '#ffffff');
  glowingEye(ctx, 1.8, -17, 1, geode ? glow : '#ffffff');
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
/** Cores do Magma em cada variante: rocha, rocha escura, lava (rachaduras, olhos e gotas). */
const MAGMA_VARIANTS = {
  // Golem de Lava Azul: fogo de enxofre azul
  rare: { body: '#2a2e3a', bodyDark: '#0c0e14', lava: '#4ab8ff', eyes: '#8ad8ff' },
  // Golem de Obsidiana: vidro negro com rachaduras roxas
  epic: { body: '#2a2236', bodyDark: '#06040a', lava: '#c86aff', eyes: '#e0a8ff' },
  // Golem Fornalha: fornalha de tijolos com porta de ferro, chaminés nos ombros e martelo
  legendary: { body: '#9a4430', bodyDark: '#3a140c', lava: '#ffb040', eyes: '#ffd25a' },
} as const;

/** Corpo de fornalha: tijolos, porta de grade com fogo dentro, chaminés fumegando nos ombros. */
function furnaceBody(ctx: Ctx, t: number, body: string, bodyDark: string, attack: number): void {
  for (const x of [-10, 7]) {
    shape(ctx, vertical(ctx, -22, -8, '#4a4650', '#1a1820'), () => ctx.rect(x, -21, 3.4, 12), 0.8);
    shape(ctx, '#2a2830', () => ctx.rect(x - 0.6, -22.5, 4.6, 2), 0.6);
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.6 + i / 2 + (x > 0 ? 0.25 : 0)) % 1;
      halo(ctx, x + 1.7 + Math.sin(k * 6) * 1.5, -24 - k * 10, 2 + k * 2.5, '#6a6068', 0.7 * (1 - k));
    }
  }
  shape(ctx, vertical(ctx, -12, 9, body, bodyDark), () => ctx.roundRect(-11.5, -12, 23, 20, 3));
  line(ctx, darken(bodyDark, 0.3), 0.6, () => {
    for (let r = 0; r < 5; r++) {
      const y = -8 + r * 4;
      ctx.moveTo(-11, y);
      ctx.lineTo(11, y);
      for (let x = -9 + (r % 2) * 3; x < 11; x += 6) {
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y);
      }
    }
  }, false);
  // porta de ferro com o fogo aceso dentro (aumenta no ataque)
  shape(ctx, '#1a0a06', () => ctx.roundRect(-5.5, -6, 11, 10, 2), 1);
  flame(ctx, 0, 3.5, 3.5 + attack, 7 + attack * 3, 0, t);
  line(ctx, '#3a3640', 1, () => {
    for (const x of [-2.8, 0, 2.8]) {
      ctx.moveTo(x, -6);
      ctx.lineTo(x, 4);
    }
  }, false);
  halo(ctx, 0, 0, 8 + attack * 4, '#ff8a2a', 0.4);
}

export function drawMagmaGolem(ctx: Ctx, p: Pose): void {
  const volcano = formA(p);
  const living = formB(p);
  const glowPulse = 0.5 + Math.sin(p.time * 3) * 0.3;
  const mv = p.variant ? MAGMA_VARIANTS[p.variant] : null;
  const body = mv ? (living ? darken(mv.body, 0.2) : mv.body) : living ? '#5a2a1a' : '#3a2a2a';
  const bodyDark = mv ? mv.bodyDark : living ? '#2a0e08' : '#140c0c';
  const lava = mv ? mv.lava : '#ff8a2a';
  const furnace = p.variant === 'legendary';
  if (volcano && !p.supreme) {
    // Vulcão: costas em forma de montanha, com lava escorrendo pelos ombros
    shape(ctx, vertical(ctx, -30, 6, mv ? mv.body : '#7a5a4e', mv ? darken(mv.body, 0.3) : '#3a2622'), () => poly(ctx, [-17, 6, -5, -28, 5, -28, 17, 6]), 1.1);
    shape(ctx, lava, () => ellipse(ctx, 0, -28, 5, 1.6), 0);
    halo(ctx, 0, -29, 7, lava, 0.7);
    for (const side of [-1, 1]) {
      shape(ctx, lava, () => {
        ctx.moveTo(side * 3, -28);
        ctx.quadraticCurveTo(side * 8, -18, side * 11, -8);
        ctx.lineTo(side * 9.5, -8);
        ctx.quadraticCurveTo(side * 6.5, -18, side * 1.5, -27);
        ctx.closePath();
      }, 0);
    }
  }
  rock(ctx, -8, 7, 6, 7, furnace ? '#4a4650' : body, furnace ? '#1a1820' : bodyDark, 2);
  rock(ctx, 2, 7, 6, 7, furnace ? '#4a4650' : body, furnace ? '#1a1820' : bodyDark, 2);
  if (furnace) {
    furnaceBody(ctx, p.time, body, bodyDark, p.attack);
    // braços de cano de ferro e o martelo de ferreiro na mão da frente
    line(ctx, '#4a4650', 3.4, () => {
      ctx.moveTo(-11, -6);
      ctx.lineTo(-15, 3);
      ctx.moveTo(11, -6);
      ctx.lineTo(15, 1 - p.attack * 4);
    });
    ctx.save();
    ctx.translate(15, 1 - p.attack * 4);
    ctx.rotate(-0.5 + p.attack * 1.4);
    line(ctx, '#6a4a2a', 1.6, () => {
      ctx.moveTo(0, 2);
      ctx.lineTo(0, -10);
    });
    shape(ctx, vertical(ctx, -13, -8, '#8a8890', '#3a3840'), () => ctx.roundRect(-4, -13, 8, 5, 1), 0.8);
    ctx.restore();
    // cabeça: capacete de ferro com viseira acesa
    const fy = -17;
    shape(ctx, radial(ctx, -1, fy - 1, 7, '#6a6670', '#1a1820'), () => ctx.roundRect(-6, fy - 5.5, 12, 10, [5, 5, 2, 2]));
    shape(ctx, mv!.eyes, () => ctx.roundRect(-4, fy - 1, 8, 1.8, 0.8), 0);
    halo(ctx, 0, fy, 5, mv!.eyes, 0.5);
    for (const x of [-4.5, 4.5]) shape(ctx, '#9a98a0', () => circle(ctx, x, fy + 2.5, 0.6), 0);
  } else {
    shape(ctx, radial(ctx, 0, -1, 13, body, bodyDark), () => ellipse(ctx, 0, -1, 11, 11));
  }
  if (!furnace) {
    // rachaduras de lava
    ctx.save();
    ctx.shadowColor = lava;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = mv ? lava : `rgba(255, ${120 + Math.round(glowPulse * 80)}, 40, 1)`;
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
  }
  // cabeça
  const hy = -15;
  if (!furnace) {
    shape(ctx, radial(ctx, 0, hy, 7, body, bodyDark), () => circle(ctx, 0, hy, 6.5));
    glowingEye(ctx, -2, hy, 1.4, mv ? mv.eyes : '#ffb03a');
    glowingEye(ctx, 2.6, hy, 1.4, mv ? mv.eyes : '#ffb03a');
  }
  if (volcano && p.supreme) {
    shape(ctx, '#2a1a18', () => poly(ctx, [-5, hy - 4, -3, hy - 10, 3, hy - 10, 5, hy - 4]), 0.9);
    ctx.save();
    ctx.shadowColor = lava;
    ctx.shadowBlur = 8;
    shape(ctx, lava, () => ellipse(ctx, 0, hy - 10, 3, 1), 0);
    ctx.restore();
    ctx.fillStyle = '#5a5050aa';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.8 + i / 3) % 1;
      ctx.beginPath();
      circle(ctx, Math.sin(ph * 6 + i) * 2, hy - 12 - ph * 12, 1.5 + ph * 2.5);
      ctx.fill();
    }
  }
  if (volcano && !p.supreme) {
    // fumaça saindo do topo da montanha
    ctx.fillStyle = '#5a5050aa';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.8 + i / 3) % 1;
      ctx.beginPath();
      circle(ctx, Math.sin(ph * 6 + i) * 2, -31 - ph * 12, 1.5 + ph * 2.5);
      ctx.fill();
    }
  }
  if (living) {
    ctx.fillStyle = lava;
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
      shape(ctx, mv ? lava : '#ff7a1a', () => ellipse(ctx, -7 + i * 4.5, 4 + t * 10, 1.2, 1.8 + t), 0.4);
    }
    shape(ctx, (mv ? lava.slice(0, 7) : '#ff5a1a') + '88', () => ellipse(ctx, 0, 14, 12, 2.5), 0);
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
