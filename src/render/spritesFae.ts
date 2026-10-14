// Raça Fada: Encantadora, Travessa, Lumina e a heroína Rainha Fada.
import {
  halo,
  circle,
  darken,
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

/** Asas com formato próprio (formas A e variantes). */
type WingStyle = 'petal' | 'butterfly' | 'crystal' | 'moth' | 'sunray';

/** Asas especiais batendo: pétalas, borboleta-monarca, cristal facetado, mariposa com olhos ou raios de sol. */
function styledWings(ctx: Ctx, t: number, style: WingStyle, color: string, y = -6): void {
  const flap = Math.sin(t * 12) * 0.25;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-2, y);
    ctx.scale(side, 1);
    ctx.rotate(flap);
    switch (style) {
      case 'petal':
        // quatro pétalas grandes em leque
        for (const [a, len] of [[-0.9, 13], [-0.35, 15], [0.2, 13], [0.7, 10]] as const) {
          ctx.save();
          ctx.rotate(a);
          shape(ctx, vertical(ctx, -4, 4, '#ffe0f4', color), () => ellipse(ctx, len * 0.55, 0, len * 0.55, 3.6), 0.6);
          ctx.restore();
        }
        break;
      case 'butterfly': {
        // asas de monarca: laranja com veios pretos e pintas brancas
        const upper = () => {
          ctx.moveTo(0, -1);
          ctx.quadraticCurveTo(8, -14, 16, -10);
          ctx.quadraticCurveTo(14, -2, 2, 1);
          ctx.closePath();
        };
        const lower = () => {
          ctx.moveTo(0, 1);
          ctx.quadraticCurveTo(12, 2, 11, 10);
          ctx.quadraticCurveTo(5, 10, 0, 3);
          ctx.closePath();
        };
        shape(ctx, vertical(ctx, -12, 10, color, '#c0400a'), upper, 0.9);
        shape(ctx, vertical(ctx, -12, 10, color, '#c0400a'), lower, 0.9);
        line(ctx, '#1a0a04', 0.7, () => {
          ctx.moveTo(1, -1);
          ctx.lineTo(13, -9);
          ctx.moveTo(1, 0);
          ctx.lineTo(12, -3);
          ctx.moveTo(1, 2);
          ctx.lineTo(9, 7);
        }, false);
        for (const [x, yy] of [[14, -9], [11, -11], [10, 8]] as const) shape(ctx, '#ffffff', () => circle(ctx, x, yy, 0.7), 0);
        break;
      }
      case 'crystal':
        // facetas de cristal com brilho
        for (const [pts, c] of [
          [[0, -1, 7, -13, 14, -9, 9, -1], '#bfe8ff'],
          [[0, 1, 9, 0, 12, 7, 4, 8], '#ffc8f0'],
        ] as const) {
          shape(ctx, vertical(ctx, -13, 8, '#ffffff', c), () => poly(ctx, [...pts]), 0.7);
        }
        line(ctx, '#ffffff', 0.5, () => {
          ctx.moveTo(1, -1);
          ctx.lineTo(10, -8);
          ctx.moveTo(1, 1);
          ctx.lineTo(9, 5);
        }, false);
        break;
      case 'moth':
        // mariposa negra com "olhos" nas asas
        shape(ctx, vertical(ctx, -12, 10, color, '#0a0610'), () => {
          ctx.moveTo(0, -1);
          ctx.quadraticCurveTo(10, -12, 15, -6);
          ctx.quadraticCurveTo(14, 4, 9, 9);
          ctx.quadraticCurveTo(4, 8, 0, 2);
          ctx.closePath();
        }, 0.9);
        shape(ctx, '#e8d0ff', () => circle(ctx, 9, -3, 2.4), 0.5);
        shape(ctx, '#1a0a24', () => circle(ctx, 9.4, -3, 1.2), 0);
        break;
      case 'sunray':
        // raios de sol dourados em leque
        for (let i = 0; i < 5; i++) {
          const a = -1 + i * 0.45;
          ctx.save();
          ctx.rotate(a);
          shape(ctx, vertical(ctx, -2, 2, '#fff4c0', color), () => poly(ctx, [0, -1.6, 15 - Math.abs(i - 2) * 2, 0, 0, 1.6]), 0.5);
          ctx.restore();
        }
        break;
    }
    ctx.restore();
  }
  if (style === 'sunray') halo(ctx, -2, y, 16, '#ffd040', 0.5);
  if (style === 'crystal') halo(ctx, -2, y, 12, '#bfe8ff', 0.4);
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
/** Cores da Encantadora em cada variante: vestido, cabelo, olhos, asas e flor da varinha. */
const ENCHANTRESS_VARIANTS = {
  // Fada da Lavanda
  rare: { dress: ['#bc8ef0', '#6a3aa8'], hair: '#f4e8ff', eyes: '#7a4ad8', wing: '#e4ccff', flower: '#d8b8ff' },
  // Fada Borboleta: asas de monarca e antenas
  epic: { dress: ['#ffa040', '#a04a0a'], hair: '#3a2a1a', eyes: '#a04a0a', wing: '#ff9a2a', flower: '#ffb040' },
  // Fada de Cristal: asas de vitral facetado e vestido de cristal
  legendary: { dress: ['#eef8ff', '#8ab8e8'], hair: '#ffffff', eyes: '#4ab8ff', wing: '#bfe8ff', flower: '#bfe8ff' },
} as const;

/** Antenas de inseto (borboleta, vaga-lume). */
function antennae(ctx: Ctx, hy: number, color: string): void {
  line(ctx, color, 0.7, () => {
    ctx.moveTo(0, hy - 5);
    ctx.quadraticCurveTo(-2, hy - 10, -4, hy - 11);
    ctx.moveTo(3, hy - 5);
    ctx.quadraticCurveTo(4, hy - 10, 6, hy - 11);
  }, false);
  for (const x of [-4, 6]) shape(ctx, color, () => circle(ctx, x, hy - 11, 0.9), 0);
}

export function drawEnchantress(ctx: Ctx, p: Pose): void {
  const bloom = formA(p);
  const warrior = formB(p);
  // Formas Supremas: Primavera Eterna (A, asas de pétalas e flores caindo) e Valquíria Feérica (B, armadura de cristal)
  const spring = p.supreme && bloom;
  const valkyrie = p.supreme && warrior;
  const ev = p.variant ? ENCHANTRESS_VARIANTS[p.variant] : null;
  ctx.translate(0, -1 + Math.sin(p.time * 3) * 1.5);
  if (spring) {
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.5 + i / 4) % 1;
      shape(ctx, i % 2 ? '#ff8ad0' : '#ffd0f4', () => ellipse(ctx, -12 + i * 8 + Math.sin(t * 6) * 2, -20 + t * 34, 1.4, 0.9, t * 6), 0);
    }
  }
  // asas: borboleta e cristal nas variantes; pétalas na Rainha das Flores; libélula no resto
  if (p.variant === 'epic') styledWings(ctx, p.time, 'butterfly', ev!.wing);
  else if (p.variant === 'legendary') styledWings(ctx, p.time, 'crystal', ev!.wing);
  else if (bloom) styledWings(ctx, p.time, 'petal', ev ? ev.wing : '#ff7ac8');
  else faeWings(ctx, p.time, valkyrie ? '#bfe8ff' : warrior ? '#ffd8a0' : ev ? ev.wing : '#ffc8f0', valkyrie ? 1.6 : 1.35);
  const hy = faeBody(ctx, p, warrior ? '#c8cede' : ev ? ev.dress[0] : '#ff8ad0', warrior ? '#6a7290' : ev ? ev.dress[1] : '#b03a8a', ev ? ev.hair : '#ffe08a', ev ? ev.eyes : '#c03a9a');
  if (p.variant === 'epic') antennae(ctx, hy, '#1a0a04');
  if (bloom && !warrior) {
    // saia de pétalas na barra do vestido
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(-6 + i * 3, 8.5);
      ctx.rotate(-0.6 + i * 0.3);
      shape(ctx, vertical(ctx, -1, 4, ev ? ev.flower : '#ffb8e8', ev ? ev.dress[1] : '#d0408a'), () => ellipse(ctx, 0, 1.8, 1.6, 2.6), 0.5);
      ctx.restore();
    }
  }
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
    if (valkyrie) {
      // armadura de cristal e elmo alado
      shape(ctx, vertical(ctx, -10, 1, '#e8f8ff', '#6ab8e8'), () => poly(ctx, [-5, -9, 5, -9, 6, -3, 0, 1, -6, -3]), 0.8);
      for (const side of [-1, 1]) shape(ctx, '#ffffff', () => poly(ctx, [1 + side * 3, hy - 6, 1 + side * 8, hy - 10, 1 + side * 5, hy - 4]), 0.6);
      halo(ctx, 0, -4, 9, '#bfe8ff', 0.4);
    }
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
    shape(ctx, ev ? ev.flower : '#ffd0f4', () => circle(ctx, Math.cos(a) * 2, -10 + Math.sin(a) * 2, 1.4), 0.3);
  }
  shape(ctx, GOLD, () => circle(ctx, 0, -10, 1), 0);
  ctx.restore();
  if (p.variant === 'legendary') {
    // tiara de cristal
    shape(ctx, vertical(ctx, hy - 12, hy - 5, '#ffffff', '#8ad0ff'), () => poly(ctx, [-3, hy - 5.5, -1.5, hy - 9, 0.5, hy - 6.5, 2, hy - 11, 3.5, hy - 6.5, 5.5, hy - 9, 6.5, hy - 5.5]), 0.6);
  }
  if (bloom) {
    // coroa de flores grande (Rainha das Flores)
    for (let i = 0; i < 5; i++) {
      const x = -4.5 + i * 2.8;
      const y = hy - 6.8 - (i % 2) * 1.4;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        shape(ctx, i % 2 ? (ev ? ev.flower : '#ff8ad0') : '#fff4c0', () => circle(ctx, x + Math.cos(a) * 1.2, y + Math.sin(a) * 1.2, 0.95), 0.3);
      }
      shape(ctx, GOLD, () => circle(ctx, x, y, 0.7), 0);
    }
  }
}

/** Travessa: fada verde de sorriso maroto e gorro. A: Pregadora de Peças (gorro de bobo com guizos); B: Ladra de Ouro (máscara e saco de moedas). */
/** Cores da Travessa em cada variante: vestido, gorro, cabelo, olhos e asas. */
const TRICKSTER_VARIANTS = {
  // Fada do Bosque Noturno: azul e roxo
  rare: { dress: ['#5a6ad8', '#1a1a5a'], hat: '#6a3ab0', hair: '#c8d0ff', eyes: '#8a9aff', wing: '#a8b8ff' },
  // Fada Arlequim: losangos vermelhos e pretos, máscara
  epic: { dress: ['#e0303e', '#7a0a14'], hat: '#1a1a22', hair: '#1a1a22', eyes: '#ffd25a', wing: '#ffd0d8' },
  // Fada Sombra: asas de mariposa, cabelo branco, ilusões dela ao lado
  legendary: { dress: ['#3a2e4a', '#0a0810'], hat: '#1a1424', hair: '#ffffff', eyes: '#d8a8ff', wing: '#3a2e4a' },
} as const;

export function drawTrickster(ctx: Ctx, p: Pose): void {
  const jester = formA(p);
  const thief = formB(p);
  // Formas Supremas: Grande Ilusionista (A, cartola e cartas girando) e Rainha dos Ladrões (B, capa de moedas e coroa)
  const illusionist = p.supreme && jester;
  const queen = p.supreme && thief;
  const tv = p.variant ? TRICKSTER_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (tv && thief ? darken(c, 0.35) : c);
  if (p.variant === 'legendary') {
    // duas ilusões translúcidas dela ao lado
    for (const [dx, a] of [[-12, 0.25], [12, 0.18]] as const) {
      ctx.save();
      ctx.globalAlpha *= a + Math.sin(p.time * 3 + dx) * 0.08;
      ctx.translate(dx, -2 + Math.sin(p.time * 4 + dx) * 2);
      ctx.scale(0.8, 0.8);
      faeBody(ctx, p, '#d8a8ff', '#3a2e4a', '#ffffff', '#d8a8ff');
      ctx.restore();
    }
  }
  if (queen) {
    shape(ctx, vertical(ctx, -10, 12, '#6a1a2a', '#2a0610'), () => poly(ctx, [-3, -8, -12, 12, 8, 12, 3, -8]), 0.8);
    for (let i = 0; i < 6; i++) shape(ctx, GOLD, () => circle(ctx, -8 + i * 3, 9 - (i % 2) * 3, 1.1), 0.3);
  }
  ctx.translate(0, -1 + Math.sin(p.time * 4) * 2);
  ctx.rotate(Math.sin(p.time * 2) * 0.08);
  if (p.variant === 'legendary') styledWings(ctx, p.time, 'moth', '#4a3a5e');
  else faeWings(ctx, p.time * 1.3, tv ? tv.wing : thief ? '#c8c0a0' : '#b8ffb0', 1.2);
  const hy = faeBody(ctx, p, tv ? shadeB(tv.dress[0]) : thief ? '#3a3a4a' : '#5ac85a', tv ? tv.dress[1] : thief ? '#16161e' : '#2a6a2a', tv ? tv.hair : '#e86a2a', tv ? tv.eyes : '#3a8a3a');
  if (p.variant === 'epic') {
    // losangos pretos de arlequim no vestido e máscara de baile
    for (const [x, y] of [[-3, -4], [2, -1], [-4, 4], [3, 5]] as const) shape(ctx, '#14141c', () => poly(ctx, [x, y - 2.4, x + 1.8, y, x, y + 2.4, x - 1.8, y]), 0);
    shape(ctx, '#14141c', () => ctx.roundRect(-1.5, hy - 1.2, 8.5, 3.2, 1.6), 0.5);
    eye(ctx, 1, hy + 0.5, 1.3, tv!.eyes, 0.4);
    eye(ctx, 4.4, hy + 0.5, 1.3, tv!.eyes, 0.4);
  }
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
  // gorro (de bobo da corte com duas pontas e guizos, na vertente A)
  const hat = tv ? shadeB(tv.hat) : jester ? '#c03a9a' : thief ? '#2a2a36' : '#3a9a3a';
  if (jester && !illusionist) {
    const bob = Math.sin(p.time * 5) * 1;
    shape(ctx, hat, () => {
      ctx.moveTo(-6, hy - 3);
      ctx.quadraticCurveTo(-9, hy - 10, -12, hy - 9 + bob);
      ctx.quadraticCurveTo(-6, hy - 8, -1, hy - 7);
      ctx.quadraticCurveTo(6, hy - 9, 12, hy - 11 - bob);
      ctx.quadraticCurveTo(9, hy - 6, 6, hy - 3);
      ctx.closePath();
    }, 0.8);
    shape(ctx, '#ffd25a', () => poly(ctx, [-1, hy - 7, 12, hy - 11 - bob, 6, hy - 3]), 0.6);
    for (const [x, y] of [[-12, hy - 9 + bob], [12, hy - 11 - bob]] as const) {
      shape(ctx, GOLD, () => circle(ctx, x, y, 1.6 + Math.abs(Math.sin(p.time * 8)) * 0.3), 0.5);
    }
    // bolinhas de malabarismo girando acima
    for (let i = 0; i < 3; i++) {
      const a = p.time * 3 + (i * TAU) / 3;
      shape(ctx, ['#ff5a6a', '#5ad8ff', '#ffd25a'][i]!, () => circle(ctx, 9 + Math.cos(a) * 4, -10 + Math.sin(a) * 5, 1.4), 0.5);
    }
  } else {
    shape(ctx, hat, () => poly(ctx, [-6, hy - 3, 6, hy - 3, 2, hy - 9, -2, hy - 12]), 0.8);
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
  if (illusionist) {
    // cartola por cima do gorro e cartas girando
    shape(ctx, '#1a1022', () => ctx.roundRect(-4, hy - 18, 9, 9, 1), 0.8);
    shape(ctx, '#1a1022', () => ctx.roundRect(-6, hy - 10, 13, 2, 1), 0.8);
    shape(ctx, '#c03a9a', () => ctx.rect(-4, hy - 12, 9, 1.6), 0);
    for (let i = 0; i < 3; i++) {
      const a = p.time * 2 + (i * TAU) / 3;
      ctx.save();
      ctx.translate(Math.cos(a) * 14, -6 + Math.sin(a) * 6);
      ctx.rotate(a);
      shape(ctx, '#ffffff', () => ctx.roundRect(-2, -3, 4, 6, 0.6), 0.5);
      shape(ctx, i % 2 ? '#d02a4a' : '#1a1022', () => circle(ctx, 0, 0, 0.9), 0);
      ctx.restore();
    }
  }
  if (queen) {
    // coroa dourada
    shape(ctx, GOLD, () => poly(ctx, [-4, hy - 4, -4, hy - 9, -1.5, hy - 6, 1, hy - 10, 3.5, hy - 6, 6, hy - 9, 6, hy - 4]), 0.6);
  }
}

/** Lumina: fada-luz dentro de um brilho. A: Farol (lanterna dourada); B: Estrela Cadente (tiara de estrela e rastro). */
/** Cores da Lumina em cada variante: vestido, cabelo, olhos, asas e brilho. */
const LUMINA_VARIANTS = {
  // Fada do Luar: prata e azul-claro
  rare: { dress: ['#dce8fa', '#7a8ab8'], hair: '#ffffff', eyes: '#5a7ad8', wing: '#e8f0ff', glow: '#cfe0ffaa' },
  // Fada Vaga-lume: cauda de vaga-lume brilhando, antenas, vagalumes
  epic: { dress: ['#3e6e2e', '#1a3a10'], hair: '#2a3a1a', eyes: '#c8ff6a', wing: '#e0ffd0', glow: '#d8ff7aaa' },
  // Fada Solar: asas de raios de sol, coroa de sol
  legendary: { dress: ['#ffd040', '#e07a10'], hair: '#fff4c0', eyes: '#e07a10', wing: '#ffb020', glow: '#ffd040cc' },
} as const;

export function drawLumina(ctx: Ctx, p: Pose): void {
  const beacon = formA(p);
  const star = formB(p);
  const lv = p.variant ? LUMINA_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (lv && star ? darken(c, 0.3) : c);
  // Formas Supremas: Sol Interior (A, sol com raios girando) e Supernova (B, núcleo pulsando e anéis)
  const sun = p.supreme && beacon;
  const nova = p.supreme && star;
  if (sun) {
    ctx.save();
    ctx.translate(0, -6);
    ctx.rotate(p.time * 0.6);
    for (let i = 0; i < 10; i++) {
      ctx.rotate(TAU / 10);
      shape(ctx, '#ffe9a8', () => poly(ctx, [-1.6, -15, 0, -24, 1.6, -15]), 0);
    }
    ctx.restore();
  }
  if (nova) {
    for (let i = 0; i < 2; i++) {
      const t = (p.time * 0.8 + i / 2) % 1;
      ctx.strokeStyle = `rgba(191, 232, 255, ${(1 - t) * 0.8})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      circle(ctx, 0, -6, 8 + t * 18);
      ctx.stroke();
    }
  }
  ctx.translate(0, -2 + Math.sin(p.time * 2.5) * 2);
  // halo de luz
  const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 18 + p.attack * 4);
  glow.addColorStop(0, lv ? lv.glow : star ? '#bfe8ffaa' : '#fff6c0aa');
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
  if (p.variant === 'epic') {
    // cauda de vaga-lume brilhando atrás e vagalumes em volta
    halo(ctx, -6, 6, 9, '#d8ff6a', 0.7 + Math.sin(p.time * 4) * 0.2);
    shape(ctx, vertical(ctx, 0, 12, '#f4ffb0', '#b8e83a'), () => ellipse(ctx, -6, 6, 4.5, 6, 0.5), 0.7);
    for (let i = 0; i < 3; i++) {
      const a = p.time * 1.3 + (i * TAU) / 3;
      halo(ctx, Math.cos(a) * 14, -8 + Math.sin(a * 1.4) * 8, 2.6, '#e8ff7a', 0.6 + Math.sin(p.time * 6 + i) * 0.3);
    }
  }
  if (p.variant === 'legendary') styledWings(ctx, p.time, 'sunray', lv!.wing);
  else faeWings(ctx, p.time, lv ? lv.wing : star ? '#d8f0ff' : '#fff6d8', 1.35);
  const hy = faeBody(ctx, p, lv ? shadeB(lv.dress[0]) : star ? '#6a8ae8' : '#fff0a0', lv ? lv.dress[1] : star ? '#2a3a8a' : '#d8a830', lv ? lv.hair : star ? '#e8f4ff' : '#fff8e0', lv ? lv.eyes : star ? '#3a6ad8' : '#c08a20');
  if (p.variant === 'epic') antennae(ctx, hy, '#2a3a1a');
  if (p.variant === 'legendary' && !star) {
    // coroa de sol
    halo(ctx, 1, hy - 8, 6, '#ffd040', 0.7);
    shape(ctx, radial(ctx, 1, hy - 8, 3, '#ffffff', '#ffc020'), () => circle(ctx, 1, hy - 8, 2.4), 0.5);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + p.time * 0.5;
      shape(ctx, '#ffd040', () => poly(ctx, [1 + Math.cos(a - 0.3) * 2.8, hy - 8 + Math.sin(a - 0.3) * 2.8, 1 + Math.cos(a) * 5, hy - 8 + Math.sin(a) * 5, 1 + Math.cos(a + 0.3) * 2.8, hy - 8 + Math.sin(a + 0.3) * 2.8]), 0);
    }
  }
  if (beacon && !sun) {
    // Farol: lanterna grande erguida num cajado acima da cabeça, com facho de luz
    line(ctx, '#8a6a3a', 1.2, () => {
      ctx.moveTo(6, 4);
      ctx.lineTo(9, -22);
    });
    ctx.save();
    ctx.globalAlpha *= 0.35 + Math.sin(p.time * 3) * 0.08 + p.attack * 0.3;
    shape(ctx, vertical(ctx, -24, 12, '#fff6c0', '#fff6c000'), () => poly(ctx, [7.5, -24, 11.5, -24, 22, 12, -2, 12]), 0);
    ctx.restore();
    halo(ctx, 9.5, -27, 9, '#ffe9a8', 0.8);
    shape(ctx, GOLD, () => ctx.roundRect(6.5, -32, 6, 8, 1.6), 0.8);
    shape(ctx, '#fff8d0', () => ctx.rect(7.6, -30.5, 3.8, 5), 0);
    shape(ctx, GOLD, () => poly(ctx, [6, -32, 13, -32, 9.5, -35]), 0.6);
  } else if (beacon) {
    // lanterna dourada na mão (Sol Interior)
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
  if (sun) halo(ctx, 0, -6, 16, '#fff6c0', 0.7);
  if (nova) {
    halo(ctx, 0, -6, 10 + Math.sin(p.time * 6) * 2, '#bfe8ff', 0.9);
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
