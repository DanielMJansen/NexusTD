// Raça Necromante: Guerreiro Esqueleto, Ceifador, Drenador e o herói Senhor dos Mortos.
// O esqueleto aliado erguido (inimigo 'boneWarrior') usa o desenho do Guerreiro Esqueleto.
import {
  halo,
  circle,
  darken,
  ellipse,
  formA,
  formB,
  glowingEye,
  line,
  OUTLINE,
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

function skullHead(ctx: Ctx, x: number, y: number, r: number, eyes: string, bone = BONE): void {
  const light = bone === BONE ? '#fffaf0' : bone;
  shape(ctx, radial(ctx, x, y, r, light, bone === BONE ? BONE_DARK : darken(bone, 0.4)), () => circle(ctx, x, y, r));
  shape(ctx, bone, () => ctx.roundRect(x - r * 0.45, y + r * 0.55, r * 1.1, r * 0.55, 1), 0.9);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.05, y, r * 0.3, r * 0.34), 0);
  shape(ctx, '#140a1e', () => ellipse(ctx, x + r * 0.62, y, r * 0.24, r * 0.32), 0);
  glowingEye(ctx, x + r * 0.08, y + 0.2, r * 0.14, eyes);
  glowingEye(ctx, x + r * 0.62, y + 0.2, r * 0.12, eyes);
}

/** Guerreiro Esqueleto: ossos, escudo redondo e espada. A: Cavaleiro da Morte (armadura negra com chifres); B: Legião de Ossos (estandarte de ossos). */
export function drawSkeletonWarrior(ctx: Ctx, p: Pose, ally = false): void {
  // Formas Supremas: Lorde da Morte (A, armadura negra e chamas verdes) e Exército dos Mortos (B, estandarte de ossos)
  if (p.supreme && formB(p) && !ally) {
    line(ctx, '#3a2a1a', 1.4, () => {
      ctx.moveTo(-9, 14);
      ctx.lineTo(-9, -26);
    }, false);
    shape(ctx, '#2a1a3a', () => poly(ctx, [-9, -26, 4, -24, 0, -19, 4, -14, -9, -14]), 0.8);
    shape(ctx, '#ece4cc', () => circle(ctx, -3, -20, 2.4), 0.5);
    shape(ctx, '#140a1e', () => circle(ctx, -3.8, -20.4, 0.6), 0);
    shape(ctx, '#140a1e', () => circle(ctx, -2.2, -20.4, 0.6), 0);
  }
  const knight = formA(p);
  const legion = formB(p);
  const step = p.moving ? Math.sin(p.time * 9) : 0;
  const SV = {
    // Esqueleto de Ônix: ossos negros, olhos verdes
    rare: { bone: '#3a3640', boneDark: '#141218', eyes: '#7aff8a' },
    // Esqueleto Pirata: chapéu de capitão, tapa-olho, cutelo
    epic: { bone: '#ece4cc', boneDark: '#a89c80', eyes: '#ffd25a' },
    // Rei dos Ossos: ossos dourados, coroa, capa real
    legendary: { bone: '#ffe08a', boneDark: '#c8901a', eyes: '#ff5a5a' },
  } as const;
  const sv = !ally && p.variant ? SV[p.variant] : null;
  const bone = sv ? sv.bone : BONE;
  const eyes = sv ? sv.eyes : ally ? '#7affb0' : knight ? '#7affb0' : legion ? '#c86aff' : '#7affb0';
  if (p.variant === 'legendary' && !ally) {
    // capa real de veludo
    shape(ctx, vertical(ctx, -10, 14, '#a01a3a', '#3a0614'), () => poly(ctx, [-5, -9, 5, -9, 9, 14, -10, 14]), 1);
    shape(ctx, '#ffffff', () => ctx.roundRect(-6, -11, 12, 3, 1.5), 0.6);
  }
  if (knight && !ally && !p.supreme) {
    // capa rasgada do Cavaleiro da Morte
    shape(ctx, vertical(ctx, -10, 14, '#1e1e28', '#05050a'), () => poly(ctx, [-5, -10, 6, -10, 8, 12, 4, 9, 1, 14, -3, 10, -7, 13]), 1);
  }
  line(ctx, bone, 1.8, () => {
    ctx.moveTo(-2, 5);
    ctx.lineTo(-3 + step * 2, 14);
    ctx.moveTo(2, 5);
    ctx.lineTo(3 - step * 2, 14);
  });
  if (knight) {
    // armadura de placas pesada com ombreiras
    shape(ctx, vertical(ctx, -10, 6, sv ? sv.boneDark : '#3a3a48', '#121218'), () => ctx.roundRect(-6, -10, 12, 16, 3));
    shape(ctx, '#5adca0', () => ctx.rect(-6, -2, 12, 1.4), 0);
    if (!ally) for (const x of [-9, 5]) shape(ctx, vertical(ctx, -12, -5, '#5a5a6a', '#1a1a22'), () => ctx.roundRect(x, -12, 5, 6, [3, 3, 1, 1]), 0.9);
  } else {
    line(ctx, bone, 1.6, () => {
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 5);
    });
    ctx.strokeStyle = bone;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const y of [-6, -3, 0]) {
      ctx.moveTo(-4, y);
      ctx.quadraticCurveTo(0, y - 2, 4, y);
    }
    ctx.stroke();
  }
  // escudo redondo atrás
  shape(ctx, radial(ctx, -7, -1, 6, knight ? '#5a5a6a' : sv ? sv.boneDark : '#8a6a3a', knight ? '#1a1a22' : '#4a3018'), () => circle(ctx, -7, -1, 5.5));
  shape(ctx, knight ? '#5adca0' : '#c8c0a0', () => circle(ctx, -7, -1, 1.4), 0.5);
  // espada (golpe de cima para baixo); cutelo no Pirata, chamas verdes no Cavaleiro da Morte
  ctx.save();
  ctx.translate(5, -4);
  ctx.rotate(0.5 + p.attack * 1.2);
  if (p.variant === 'epic' && !ally) {
    shape(ctx, vertical(ctx, -15, 0, '#e8ecf4', '#8a92a8'), () => {
      ctx.moveTo(-0.8, 0);
      ctx.lineTo(-0.8, -13);
      ctx.quadraticCurveTo(3.5, -15, 3.2, -9);
      ctx.lineTo(1, 0);
      ctx.closePath();
    }, 0.7);
  } else {
    if (knight && !ally) halo(ctx, 0, -8, 7, '#5affb0', 0.6);
    line(ctx, knight ? '#9affd0' : '#d0d8e4', knight && !ally ? 2.2 : 1.6, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, knight && !ally ? -18 : -15);
    });
  }
  shape(ctx, '#5a3a1a', () => ctx.rect(-2.5, -1, 5, 1.6), 0.6);
  ctx.restore();
  skullHead(ctx, 1, -16, 5, eyes, bone);
  if (knight && !ally) {
    // elmo fechado com chifres grandes curvados
    shape(ctx, vertical(ctx, -22, -11, '#4a4a5a', '#121218'), () => ctx.roundRect(-4, -22, 10, 11, [4, 4, 2, 2]), 0.9);
    shape(ctx, '#05050a', () => ctx.rect(-2.6, -18, 7.6, 1.6), 0);
    glowingEye(ctx, 0, -17.2, 0.7, '#7affb0');
    glowingEye(ctx, 3.6, -17.2, 0.7, '#7affb0');
    for (const side of [-1, 1]) {
      const bx = side < 0 ? -3 : 5;
      shape(ctx, vertical(ctx, -32, -18, '#e8e0cc', '#4a4a5a'), () => {
        ctx.moveTo(bx, -19);
        ctx.quadraticCurveTo(bx + side * 7, -22, bx + side * 6, -31);
        ctx.quadraticCurveTo(bx + side * 4, -25, bx - side * 1, -21.5);
        ctx.closePath();
      }, 0.8);
    }
  } else if (knight) {
    shape(ctx, '#121218', () => poly(ctx, [-4, -20, -4.5, -27, 0, -21]), 0.8);
    shape(ctx, '#121218', () => poly(ctx, [5, -21, 8, -27, 6.5, -20]), 0.8);
  }
  if (p.variant === 'epic' && !ally && !knight) {
    // chapéu de capitão com caveira e tapa-olho
    shape(ctx, vertical(ctx, -28, -19, '#2a1e1a', '#0e0a08'), () => {
      ctx.moveTo(-7, -19.5);
      ctx.quadraticCurveTo(-5, -28, 1, -27);
      ctx.quadraticCurveTo(7, -28, 9, -19.5);
      ctx.quadraticCurveTo(1, -22, -7, -19.5);
      ctx.closePath();
    }, 0.9);
    shape(ctx, '#ffffff', () => circle(ctx, 1, -24, 1.2), 0);
    shape(ctx, '#0e0a08', () => ellipse(ctx, 1.3, -16, 1.9, 1.7), 0);
    line(ctx, '#0e0a08', 0.6, () => {
      ctx.moveTo(-3.6, -19);
      ctx.lineTo(4.6, -14);
    }, false);
  }
  if (p.variant === 'legendary' && !ally && !knight) {
    // coroa dourada
    shape(ctx, vertical(ctx, -27, -20, '#fff4b0', '#e0a020'), () => poly(ctx, [-3.5, -20.5, -4, -25.5, -1.5, -23, 1, -27, 3.5, -23, 6, -25.5, 5.5, -20.5]), 0.6);
    shape(ctx, '#ff3a5a', () => circle(ctx, 1, -22.5, 0.9), 0);
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
  if (p.supreme && formA(p) && !ally) {
    // peitoral negro e chamas verdes na cabeça
    shape(ctx, vertical(ctx, -9, 3, '#3a3a48', '#0a0a12'), () => ctx.roundRect(-5, -9, 10, 11, 2), 0.8);
    for (let i = 0; i < 4; i++) {
      const h = 6 + Math.sin(p.time * 10 + i * 1.6) * 2;
      shape(ctx, i % 2 ? '#7affb0' : '#3ad87a', () => poly(ctx, [-4 + i * 2.6, -20, -3 + i * 2.6, -20 - h, -1.6 + i * 2.6, -20]), 0);
    }
  }
}

/** Ceifador: manto com capuz e foice. A: Ceifador Sombrio (chamas roxas, foice maior); B: Colhedor de Almas (lanterna de almas). */
/** Cores do Ceifador em cada variante: manto (topo, base), capuz, rosto e olhos. */
const REAPER_VARIANTS = {
  // Ceifador Pálido: manto branco
  rare: { robe: ['#e8e8f0', '#8a8aa0'], hood: '#f4f4fa', face: '#1a1a24', eyes: '#5ac8ff' },
  // Ceifador do Dia dos Mortos: calavera pintada, flores de cempasúchil
  epic: { robe: ['#3a1a4a', '#120818'], hood: '#4a2260', face: '#f4ecdc', eyes: '#ff5a8a' },
  // Caronte, o Barqueiro: de pé num barco no rio dos mortos, remo no lugar da foice, rosto de caveira
  legendary: { robe: ['#5a5448', '#1a1814'], hood: '#4a4438', face: '#e8e0cc', eyes: '#7affd0' },
} as const;

/** Barco de Caronte: casco curvo de madeira escura, proa enrolada com lanterna e água esverdeada. */
function ferryBoat(ctx: Ctx, t: number, front: boolean): void {
  if (!front) {
    // água do rio dos mortos
    shape(ctx, '#2a6a5a66', () => ellipse(ctx, 0, 13, 20, 3.4), 0);
    line(ctx, '#7affd088', 0.7, () => {
      for (const [x, w] of [[-14, 4], [10, 5]] as const) {
        const off = Math.sin(t * 2 + x) * 1.5;
        ctx.moveTo(x + off, 13.5);
        ctx.quadraticCurveTo(x + off + w / 2, 12.5, x + off + w, 13.5);
      }
    }, false);
    return;
  }
  const rock = Math.sin(t * 1.5) * 0.04;
  ctx.save();
  ctx.translate(0, 9);
  ctx.rotate(rock);
  shape(ctx, vertical(ctx, -3, 5, '#5a3a24', '#1e120a'), () => {
    ctx.moveTo(-17, -3);
    ctx.lineTo(13, -3);
    ctx.quadraticCurveTo(17, -4, 18, -10);
    ctx.quadraticCurveTo(20, -4, 15, 1);
    ctx.quadraticCurveTo(0, 6, -14, 3);
    ctx.quadraticCurveTo(-17, 0, -17, -3);
    ctx.closePath();
  });
  line(ctx, '#7a5434', 0.6, () => {
    ctx.moveTo(-15, 0);
    ctx.quadraticCurveTo(0, 3, 14, -1);
  }, false);
  // lanterna pendurada na proa
  line(ctx, '#2a2a20', 0.6, () => {
    ctx.moveTo(18, -10);
    ctx.lineTo(19, -7);
  }, false);
  halo(ctx, 19, -5, 5, '#7affd0', 0.7 + Math.sin(t * 4) * 0.15);
  shape(ctx, '#2a2a20', () => ctx.roundRect(17.6, -7, 2.8, 3.6, 0.8), 0.5);
  shape(ctx, '#c8ffe8', () => circle(ctx, 19, -5.2, 0.9), 0);
  ctx.restore();
}

export function drawReaper(ctx: Ctx, p: Pose): void {
  const dark = formA(p);
  const souls = formB(p);
  const rv = p.variant ? REAPER_VARIANTS[p.variant] : null;
  const float = Math.sin(p.time * 2) * 1.2;
  const charon = p.variant === 'legendary';
  if (charon) ferryBoat(ctx, p.time, false);
  // Ceifador Sombrio (A): flutua mais alto, com manto longo e esfarrapado (Caronte fica de pé no barco)
  ctx.translate(0, charon ? -4 : float - (dark && !p.supreme ? 5 : 2));
  const robe = rv ? (souls ? darken(rv.robe[0], 0.25) : rv.robe[0]) : dark ? '#2a1a3a' : '#2a2a30';
  const robeBottom = rv ? rv.robe[1] : '#08060c';
  if (dark && !p.supreme) {
    // manto longo e esfarrapado, com tiras ondulando
    shape(ctx, vertical(ctx, -12, 20, robe, robeBottom), () => {
      ctx.moveTo(-6, -11);
      ctx.lineTo(6, -11);
      ctx.quadraticCurveTo(13, 4, 11, 20 + Math.sin(p.time * 4) * 2);
      ctx.lineTo(6, 15);
      ctx.lineTo(3, 21 + Math.sin(p.time * 4 + 2) * 2);
      ctx.lineTo(-1, 15);
      ctx.lineTo(-5, 21 + Math.sin(p.time * 4 + 1) * 2);
      ctx.lineTo(-8, 15);
      ctx.lineTo(-12, 19 + Math.sin(p.time * 4 + 3) * 2);
      ctx.quadraticCurveTo(-13, 4, -6, -11);
      ctx.closePath();
    });
    // correntes cruzando o manto
    ctx.save();
    ctx.strokeStyle = '#8a8ea0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ellipse(ctx, -7 + i * 2.6, -4 + i * 1.6, 1.4, 0.9, 0.6 + (i % 2) * 1.5);
      ctx.stroke();
    }
    ctx.restore();
    // ampulheta na cintura
    shape(ctx, '#c8a060', () => ctx.rect(-8.5, 1, 5, 1), 0.4);
    shape(ctx, '#c8a060', () => ctx.rect(-8.5, 8, 5, 1), 0.4);
    shape(ctx, '#e8f4ff88', () => poly(ctx, [-8, 2, -4, 2, -6, 4.8, -4, 8, -8, 8, -6, 4.8]), 0.5);
    shape(ctx, '#e0c060', () => poly(ctx, [-7.6, 7.8, -4.4, 7.8, -6, 5.6]), 0);
  } else {
    shape(ctx, vertical(ctx, -12, 14, robe, robeBottom), () => {
      ctx.moveTo(-6, -11);
      ctx.lineTo(6, -11);
      ctx.quadraticCurveTo(10, 4, 8, 14 + Math.sin(p.time * 4) * 1.5);
      ctx.lineTo(0, 11);
      ctx.lineTo(-8, 14 + Math.sin(p.time * 4 + 1) * 1.5);
      ctx.quadraticCurveTo(-10, 4, -6, -11);
      ctx.closePath();
    });
  }
  if (charon) {
    // o casco cobre a barra do manto; moedas para a travessia no cinto
    ctx.save();
    ctx.translate(0, 4);
    ferryBoat(ctx, p.time, true);
    ctx.restore();
    for (const x of [-3, -0.5]) shape(ctx, '#e0b040', () => circle(ctx, x, -1, 1), 0.4);
  }
  if (p.variant === 'epic') {
    // flores de cempasúchil na barra do manto
    for (const [x, y] of [[-5, 10], [0, 8], [5, 10]] as const) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        shape(ctx, '#ff9a1a', () => circle(ctx, x + Math.cos(a) * 1.3, y + Math.sin(a) * 1.3, 1), 0.2);
      }
      shape(ctx, '#ffd040', () => circle(ctx, x, y, 0.8), 0);
    }
  }
  // foice (corta de cima no ataque)
  ctx.save();
  ctx.translate(6, -2);
  ctx.rotate(0.1 + p.attack * 1);
  line(ctx, '#3a2a1a', 1.6, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  const big = dark ? 1.35 : 1;
  if (dark) {
    ctx.shadowColor = '#b86aff';
    ctx.shadowBlur = 8;
  }
  if (charon) {
    // remo longo: a pá fica embaixo, na água
    line(ctx, '#3a2a1a', 1.6, () => {
      ctx.moveTo(0, 12);
      ctx.lineTo(0, 20);
    });
    shape(ctx, vertical(ctx, 16, 26, '#6a4a2a', '#2a1a0a'), () => ellipse(ctx, 0, 22, 2.4, 5), 0.8);
    if (dark) halo(ctx, 0, -16, 6, '#b86aff', 0.6);
  } else {
    shape(ctx, vertical(ctx, -18, -8, '#e8ecf4', '#8a92a8'), () => {
      ctx.moveTo(0, -16);
      ctx.quadraticCurveTo(12 * big, -20 * big, 16 * big, -9 * big);
      ctx.quadraticCurveTo(9 * big, -14 * big, 0, -12);
      ctx.closePath();
    });
  }
  ctx.restore();
  // capuz com rosto na sombra (calavera pintada no Dia dos Mortos)
  shape(ctx, vertical(ctx, -27, -8, rv ? rv.hood : dark ? '#3a2050' : '#3a3a44', '#0a080e'), () => poly(ctx, [-8, -8, -6, -22, 0, -27, 7, -21, 8, -8]));
  shape(ctx, rv ? rv.face : '#05030a', () => ellipse(ctx, 1.5, -15, 4.5, 5), 0);
  if (p.variant === 'epic') {
    // calavera: olhos pretos com contorno de flores e boca costurada
    for (const x of [0, 3.4]) {
      shape(ctx, '#ff5a8a', () => circle(ctx, x, -15.5, 1.9), 0);
      shape(ctx, '#140a14', () => circle(ctx, x, -15.5, 1.2), 0);
    }
    line(ctx, '#140a14', 0.5, () => {
      ctx.moveTo(-1, -11.8);
      ctx.lineTo(4.4, -11.8);
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(-0.4 + i * 1.5, -12.6);
        ctx.lineTo(-0.4 + i * 1.5, -11);
      }
    }, false);
    shape(ctx, '#5ac8ff', () => circle(ctx, 1.7, -18.6, 0.8), 0);
  }
  if (charon) {
    // caveira: órbitas fundas, nariz e dentes
    for (const x of [0, 3.4]) shape(ctx, '#1a1410', () => circle(ctx, x, -15.5, 1.6), 0);
    shape(ctx, '#1a1410', () => poly(ctx, [1.7, -13.6, 1.1, -12.4, 2.3, -12.4]), 0);
    line(ctx, '#1a1410', 0.5, () => {
      ctx.moveTo(-0.4, -11);
      ctx.lineTo(3.8, -11);
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(0 + i * 1.2, -11.8);
        ctx.lineTo(0 + i * 1.2, -10.2);
      }
    }, false);
  }
  glowingEye(ctx, 0, -15.5, 1, rv ? rv.eyes : dark ? '#c86aff' : '#ff3a4a');
  glowingEye(ctx, 3.4, -15.5, 1, rv ? rv.eyes : dark ? '#c86aff' : '#ff3a4a');
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
  if (p.supreme && formA(p)) {
    // A Morte: capuz vazio (só escuridão) e foice gigante
    shape(ctx, '#05020a', () => ellipse(ctx, 1.5, -16, 4.5, 5), 0);
    glowingEye(ctx, 0, -16.5, 0.9, '#c86aff');
    glowingEye(ctx, 3.4, -16.5, 0.9, '#c86aff');
    ctx.save();
    ctx.translate(-8, 2);
    ctx.rotate(-0.25 + p.attack * 0.9);
    line(ctx, '#2a1a14', 1.8, () => {
      ctx.moveTo(0, 12);
      ctx.lineTo(0, -32);
    }, false);
    shape(ctx, vertical(ctx, -36, -24, '#e8e8f8', '#6a6a8a'), () => {
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(14, -36, 22, -24);
      ctx.quadraticCurveTo(12, -29, 0, -28);
      ctx.closePath();
    }, 0.8);
    ctx.restore();
  }
  if (p.supreme && formB(p)) {
    // lanterna de almas na mão
    line(ctx, '#3a2a1a', 0.8, () => {
      ctx.moveTo(-8, -2);
      ctx.lineTo(-9, 3);
    }, false);
    shape(ctx, '#2a2a36', () => ctx.roundRect(-12, 3, 6, 8, 1.5), 0.7);
    halo(ctx, -9, 7, 7, '#7affb0', 0.7 + Math.sin(p.time * 4) * 0.2);
    for (let i = 0; i < 2; i++) shape(ctx, '#c8ffe0', () => circle(ctx, -10 + i * 2, 6 + Math.sin(p.time * 3 + i * 2) * 1.5, 0.9), 0);
  }
}

/** Drenador: cultista curvado com garras de energia. A: Sanguessuga (gavinhas vermelhas); B: Corruptor (corrupção verde-ácida). */
/** Cores do Drenador em cada variante: manto, máscara e energia. */
const DRAINER_VARIANTS = {
  // Sanguessuga Pálida: cinza-azulada
  rare: { robe: '#5a6a80', mask: '#e8eef4', energy: '#8ad0ff' },
  // Sanguessuga Pestilenta: máscara de médico da peste com bico
  epic: { robe: '#2a2620', mask: '#e8dcc0', energy: '#c8ff6a' },
  // Sanguessuga Gigante: um verme enorme erguido, de anéis brilhantes e boca redonda cheia de dentes
  legendary: { robe: '#9a4a6a', mask: '#3a1428', energy: '#ff5a7a' },
} as const;

/** Sanguessuga Gigante: corpo em anéis erguido do chão e a boca-ventosa voltada para a frente. */
function giantLeech(ctx: Ctx, t: number, body: string, dark: string, energy: string, attack: number, form: 'bloated' | 'corrupt' | null): void {
  const n = 9;
  const pts: [number, number, number][] = [];
  const beat = Math.max(0, Math.sin(t * 6)) * 0.6;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const sway = Math.sin(t * 2.5 - k * 3) * 2 * k;
    // Sanguessuga (A): barriga inchada de sangue no meio do corpo, pulsando
    const bulge = form === 'bloated' ? Math.exp(-((k - 0.35) ** 2) / 0.03) * (3 + beat) : 0;
    pts.push([-11 + k * 16 + sway, 10 - k * 22 + Math.sin(k * Math.PI) * -3, 6.4 - k * 2.2 + bulge]);
  }
  if (form === 'corrupt') {
    // Corruptor (B): espinhos tortos de corrupção ao longo das costas
    pts.forEach(([x, y, r], i) => {
      if (i % 2 || i === n) return;
      shape(ctx, vertical(ctx, y - r - 6, y, '#9aff3a', '#1e3a14'), () => poly(ctx, [x - r * 0.7, y - r * 0.5, x - r * 0.9 - 1.5, y - r - 5, x + r * 0.1, y - r * 0.8]), 0.6);
    });
  }
  pts.forEach(([x, y, r]) => shape(ctx, OUTLINE, () => circle(ctx, x, y, r + 0.9), 0));
  pts.forEach(([x, y, r], i) => {
    shape(ctx, radial(ctx, x - r * 0.4, y - r * 0.4, r * 1.6, darken(body, -0.35), body), () => circle(ctx, x, y, r), 0);
    if (i % 2) line(ctx, dark, 0.9, () => ctx.arc(x, y, r * 0.92, -2.4, -0.6), false);
  });
  if (form === 'bloated') {
    // sangue visível por dentro da pele esticada, com veias
    const [bx, by, br] = pts[3];
    shape(ctx, '#ff2a4a88', () => ellipse(ctx, bx + 0.5, by + 0.5, br * 0.75, br * 0.6), 0);
    line(ctx, '#ff6a7a', 0.6, () => {
      ctx.moveTo(bx - br * 0.6, by - 1);
      ctx.quadraticCurveTo(bx, by - br * 0.5, bx + br * 0.6, by - 2);
      ctx.moveTo(bx - br * 0.3, by + br * 0.4);
      ctx.lineTo(bx + br * 0.4, by + br * 0.2);
    }, false);
  }
  if (form === 'corrupt') {
    // pústulas verdes brilhando nos anéis
    for (const i of [1, 4, 6]) {
      const [x, y, r] = pts[i];
      halo(ctx, x + r * 0.3, y + r * 0.1, 2.5, '#9aff3a', 0.6);
      shape(ctx, '#c8ff6a', () => circle(ctx, x + r * 0.3, y + r * 0.1, 1.2), 0.4);
    }
  }
  // brilho de muco nas costas
  ctx.save();
  ctx.globalAlpha *= 0.5;
  line(ctx, '#ffffff', 0.8, () => {
    ctx.moveTo(pts[1][0] - 2, pts[1][1] - 3);
    ctx.quadraticCurveTo(pts[4][0] - 3, pts[4][1] - 3, pts[7][0] - 2.5, pts[7][1] - 2.5);
  }, false);
  ctx.restore();
  // boca-ventosa: disco com anéis de dentes, abrindo no ataque
  const [hx, hy] = pts[n];
  const mr = 3.6 + attack * 1.2;
  shape(ctx, dark, () => ellipse(ctx, hx + 2, hy, mr, mr + 0.6), 0.9);
  shape(ctx, '#3a0a14', () => ellipse(ctx, hx + 2.4, hy, mr * 0.55, mr * 0.65), 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.5;
    const tx = hx + 2.4 + Math.cos(a) * mr * 0.75;
    const ty = hy + Math.sin(a) * mr * 0.85;
    shape(ctx, '#fff4e8', () => poly(ctx, [tx + Math.cos(a + 0.5) * 0.6, ty + Math.sin(a + 0.5) * 0.6, tx + Math.cos(a - 0.5) * 0.6, ty + Math.sin(a - 0.5) * 0.6, tx - Math.cos(a) * 1.4, ty - Math.sin(a) * 1.4]), 0);
  }
  halo(ctx, hx + 2.4, hy, 4 + attack * 3, energy, 0.4 + attack * 0.4);
  // olhinhos em cima da cabeça
  for (const dx of [-1.6, 0.6]) glowingEye(ctx, hx + dx, hy - 3.6, 0.6, energy);
  if (form === 'corrupt') {
    // baba ácida pingando da boca
    const k = (t * 1.2) % 1;
    shape(ctx, '#9aff3a', () => ellipse(ctx, hx + 2.4, hy + 3 + k * 8, 0.8, 1.2 + k * 0.4), 0);
  }
}

export function drawDrainer(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Praga (A, nuvem de moscas) e Ruína (B, chão apodrecendo)
  if (p.supreme && formB(p)) {
    shape(ctx, '#3a4a1a88', () => ellipse(ctx, 0, 13, 18, 4.5), 0);
    for (let i = 0; i < 5; i++) {
      const t = (p.time * 0.6 + i / 5) % 1;
      shape(ctx, '#9aff3a', () => circle(ctx, -12 + i * 6, 13 - t * 6, 1 * (1 - t) + 0.3), 0);
    }
  }
  const leech = formA(p);
  const corrupt = formB(p);
  const dv = p.variant ? DRAINER_VARIANTS[p.variant] : null;
  const energy = dv ? dv.energy : leech ? '#ff3a5a' : corrupt ? '#9aff3a' : '#b86aff';
  const robe = dv ? (corrupt ? darken(dv.robe, 0.3) : dv.robe) : leech ? '#4a1420' : corrupt ? '#1e3a14' : '#2a1a40';
  const giant = p.variant === 'legendary';
  if (giant) {
    // Sanguessuga Gigante: o corpo todo é o verme; as marcas das formas vêm por cima
    // A: corpo vermelho-sangue e inchado; B: verde-pântano com espinhos e pústulas
    const tint = leech ? '#b8384e' : corrupt ? '#5a6a3a' : robe;
    giantLeech(ctx, p.time, tint, dv!.mask, energy, p.attack, leech ? 'bloated' : corrupt ? 'corrupt' : null);
  }
  ctx.rotate(0.08);
  if (leech && !p.supreme && !giant) {
    // tentáculos de sangue saindo das costas
    for (const [a, len] of [[-2.4, 16], [-2, 14], [-2.8, 12]] as const) {
      const wave = Math.sin(p.time * 3 + a * 3) * 3;
      line(ctx, '#c0203a', 2.4, () => {
        ctx.moveTo(-4, -4);
        ctx.quadraticCurveTo(-4 + Math.cos(a) * len * 0.5 + wave, -4 + Math.sin(a) * len * 0.5, -4 + Math.cos(a) * len, -4 + Math.sin(a) * len + wave);
      });
      shape(ctx, '#ff5a6a', () => circle(ctx, -4 + Math.cos(a) * len, -4 + Math.sin(a) * len + wave, 1.2), 0.4);
    }
  }
  if (giant) {
    drainerMarks(ctx, p, leech, corrupt);
    return;
  }
  shape(ctx, vertical(ctx, -9, 14, robe, '#08060c'), () => poly(ctx, [-6, -8, 5, -9, 9, 14, -9, 14]));
  if (leech && !p.supreme) {
    // coração pulsando no peito
    const beat = 1 + Math.max(0, Math.sin(p.time * 6)) * 0.2;
    halo(ctx, 0, -3, 5 * beat, '#ff3a5a', 0.6);
    ctx.save();
    ctx.translate(0, -3);
    ctx.scale(beat, beat);
    shape(ctx, '#e0203a', () => {
      ctx.moveTo(0, 2.4);
      ctx.bezierCurveTo(-3.6, -0.4, -2, -3.4, 0, -1.4);
      ctx.bezierCurveTo(2, -3.4, 3.6, -0.4, 0, 2.4);
      ctx.closePath();
    }, 0.5);
    ctx.restore();
  }
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
  shape(ctx, dv ? dv.mask : corrupt ? '#9aa88a' : '#d8ccc0', () => ellipse(ctx, 1.5, -15, 4, 4.6), 0.8);
  glowingEye(ctx, 0, -16, 1.1, energy);
  glowingEye(ctx, 3.4, -16, 1.1, energy);
  if (p.variant === 'epic') {
    // bico longo de médico da peste
    shape(ctx, vertical(ctx, -16, -9, '#f0e4c8', '#a8946a'), () => {
      ctx.moveTo(3.5, -15);
      ctx.quadraticCurveTo(10, -13.5, 13, -9);
      ctx.quadraticCurveTo(8, -10, 3.5, -11);
      ctx.closePath();
    }, 0.8);
    for (const x of [0, 3.4]) {
      shape(ctx, '#3a3020', () => circle(ctx, x, -16, 1.5), 0.4);
      glowingEye(ctx, x, -16, 0.8, energy);
    }
  }
  drainerMarks(ctx, p, leech, corrupt);
}

/** Marcas das formas do Drenador: gotas de sangue (A), poça ácida (B) e moscas (Praga). */
function drainerMarks(ctx: Ctx, p: Pose, leech: boolean, corrupt: boolean): void {
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
  if (p.supreme && formA(p)) {
    // nuvem de moscas zumbindo
    ctx.fillStyle = '#140a14';
    for (let i = 0; i < 9; i++) {
      const a = p.time * (2 + (i % 3)) + i * 0.7;
      ctx.beginPath();
      circle(ctx, Math.cos(a) * (12 + (i % 4) * 2), -8 + Math.sin(a * 1.3) * 8, 0.8);
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
  ctx.rotate(0.15 + p.attack * 0.9);
  line(ctx, '#2a1e14', 1.8, () => {
    ctx.moveTo(0, 13);
    ctx.lineTo(0, -19);
  });
  ctx.shadowColor = fire;
  ctx.shadowBlur = 8;
  shape(ctx, vertical(ctx, -22, -10, '#e8fff4', '#6aa890'), () => {
    ctx.moveTo(0, -19);
    ctx.quadraticCurveTo(13, -24, 17, -11);
    ctx.quadraticCurveTo(9, -17, 0, -15);
    ctx.closePath();
  });
  const look = skin(p, 'look', '');
  if (look === 'crimson') {
    // foice dupla: segunda lâmina na ponta de baixo, virada ao contrário
    shape(ctx, vertical(ctx, 10, 22, '#ffe8e8', '#a83040'), () => {
      ctx.moveTo(0, 13);
      ctx.quadraticCurveTo(-13, 18, -16, 6);
      ctx.quadraticCurveTo(-8, 13, 0, 10);
      ctx.closePath();
    });
  }
  ctx.restore();
  if (look === 'lich') {
    // grimório aberto flutuando ao lado, com runas brilhando
    const by = -4 + Math.sin(p.time * 2.5) * 1.5;
    ctx.save();
    ctx.translate(-13, by);
    ctx.rotate(-0.15);
    halo(ctx, 0, 0, 8, fire, 0.45 + p.attack * 0.4);
    shape(ctx, '#2a1a3a', () => ctx.roundRect(-6.5, -4, 13, 8, 1), 0.9);
    shape(ctx, '#f0e8d8', () => poly(ctx, [-5.8, -3.2, -0.3, -2.4, -0.3, 3.2, -5.8, 2.4]), 0.5);
    shape(ctx, '#f0e8d8', () => poly(ctx, [0.3, -2.4, 5.8, -3.2, 5.8, 2.4, 0.3, 3.2]), 0.5);
    line(ctx, fire, 0.6, () => {
      for (const y of [-1.2, 0.6]) {
        ctx.moveTo(-4.6, y);
        ctx.lineTo(-1.4, y + 0.3);
        ctx.moveTo(1.4, y + 0.3);
        ctx.lineTo(4.6, y);
      }
    }, false);
    ctx.restore();
  }
  // rosto cadavérico, capuz e coroa de ossos (coroa de lich, de ouro com joias, no Lich Real)
  const hy = -17;
  shape(ctx, vertical(ctx, hy - 9, hy + 9, robe, robeDark), () => poly(ctx, [-8, hy + 8, -7, hy - 4, 1, hy - 9, 8, hy - 4, 8, hy + 8]));
  shape(ctx, radial(ctx, 1, hy + 1, 5, '#d8e8d8', '#8aa898'), () => ellipse(ctx, 1.5, hy + 1.5, 4.4, 5), 0.8);
  glowingEye(ctx, 0, hy + 0.5, 1.2, fire);
  glowingEye(ctx, 3.4, hy + 0.5, 1.2, fire);
  if (look === 'lich') {
    shape(ctx, vertical(ctx, hy - 16, hy - 6, '#fff2b0', '#a8701a'), () => poly(ctx, [-5, hy - 6, -5.5, hy - 12, -2.5, hy - 9, 1, hy - 16, 4.5, hy - 9, 7.5, hy - 12, 7, hy - 6]), 0.8);
    for (const [x, y] of [[-5.5, hy - 12], [1, hy - 16], [7.5, hy - 12]] as const) shape(ctx, fire, () => circle(ctx, x, y, 1), 0.4);
  } else {
    for (let i = 0; i < 5; i++) {
      const x = -3 + i * 2;
      shape(ctx, BONE, () => poly(ctx, [x - 0.8, hy - 6, x, hy - 10 - (i % 2) * 2, x + 0.8, hy - 6]), 0.5);
    }
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
