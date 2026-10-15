// Raça Demônios: Diabrete, Súcubo, Infernal e o herói Arquidemônio.
import {
  TAU,
  halo,
  circle,
  darken,
  ellipse,
  FIRE_FLAME,
  flame,
  SPIRIT_FLAME,
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
/** Cores do Diabrete em cada variante: pele, pele escura, asas, olhos e fogo. */
const IMP_VARIANTS = {
  // Diabrete Azul: fogo azul
  rare: { skin: '#3a6ae0', dark: '#10246a', wing: '#14205a', eyes: '#bfeaff', fire: SPIRIT_FLAME },
  // Diabrete Mecânico: latão, engrenagens, chifres de metal, olho de lente e chave de corda
  epic: { skin: '#c89a4a', dark: '#5a3a14', wing: '#6a5a4a', eyes: '#7af0ff', fire: FIRE_FLAME },
  // Cavaleiro do Cão Infernal: diabrete negro montado num cão de crina em chamas
  legendary: { skin: '#3a2a3a', dark: '#120812', wing: '#2a0a1a', eyes: '#ff5a1a', fire: FIRE_FLAME },
} as const;

/** Cãozinho infernal (montaria do Cavaleiro do Cão Infernal): corpo negro, crina e cauda de fogo. */
function hellhound(ctx: Ctx, t: number, bite: number): void {
  const run = Math.sin(t * 8) * 1.2;
  // patas
  for (const [x, ph] of [[-7, 0], [-3, 1.6], [4, 0.8], [8, 2.4]] as const) {
    line(ctx, '#1a1014', 2.2, () => {
      ctx.moveTo(x, 5);
      ctx.lineTo(x + Math.sin(t * 8 + ph) * 1.5, 12);
    });
  }
  // cauda de fogo
  flame(ctx, -11, 2, 2.4, 8, -1.1 + run * 0.1, t, FIRE_FLAME);
  // corpo
  shape(ctx, radial(ctx, 0, 2, 11, '#3a2a30', '#0a0608'), () => ellipse(ctx, 0, 3, 11, 5), 1);
  // crina de fogo no pescoço
  for (const [x, a] of [[5, -0.5], [7.5, -0.2], [3, -0.8]] as const) flame(ctx, x, -1, 2.2, 7, a, t + x, FIRE_FLAME);
  // cabeça com focinho e olhos de brasa
  ctx.save();
  ctx.translate(11, -1);
  ctx.rotate(-bite * 0.3);
  shape(ctx, radial(ctx, 0, 0, 5, '#3a2a30', '#0a0608'), () => ellipse(ctx, 0, 0, 4.5, 4), 0.9);
  shape(ctx, '#2a1a20', () => ellipse(ctx, 4.5, 1.2, 3.2, 2.2), 0.8);
  shape(ctx, '#2a1a20', () => poly(ctx, [-2, -3, -1, -7, 1.5, -3.4]), 0.7);
  glowingEye(ctx, 1, -0.8, 0.9, '#ff6a1a');
  shape(ctx, '#ffffff', () => poly(ctx, [5, 3, 5.8, 3, 5.4, 4.4]), 0);
  ctx.restore();
}

export function drawImp(ctx: Ctx, p: Pose): void {
  const flaming = formA(p);
  const thief = formB(p);
  const iv = p.variant ? IMP_VARIANTS[p.variant] : null;
  const skinColor = iv ? (thief ? darken(iv.skin, 0.2) : iv.skin) : thief ? '#a83a3a' : '#e04a3a';
  const skinDark = iv ? iv.dark : '#6a1010';
  const fireColors = iv ? iv.fire : FIRE_FLAME;
  if (p.variant === 'legendary') {
    // montado no cão infernal: o cão fica embaixo e o diabrete sobe
    ctx.save();
    ctx.translate(0, 3);
    hellhound(ctx, p.time, p.attack);
    ctx.restore();
    ctx.translate(-1, -8);
  } else {
    ctx.translate(0, -3 + Math.sin(p.time * 5) * 1.5);
  }
  if (p.variant === 'epic') {
    // chave de corda nas costas, girando
    ctx.save();
    ctx.translate(-6, -2);
    ctx.rotate(p.time * 3);
    line(ctx, '#c89a4a', 1.2, () => {
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, 0);
    });
    for (const x of [-4, 4]) shape(ctx, '#e0b860', () => ellipse(ctx, x, 0, 1.6, 2.4), 0.5);
    ctx.restore();
  }
  if (p.supreme && flaming) {
    // Arquidiabrete: roda de fogo girando atrás dele
    halo(ctx, 0, -4, 20, '#ff8a2a', 0.45);
    ctx.save();
    ctx.strokeStyle = '#ffb040';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    circle(ctx, 0, -4, 13);
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 10; i++) {
      const a = p.time * 1.4 + (i * TAU) / 10;
      flame(ctx, Math.cos(a) * 13, -4 + Math.sin(a) * 13, 2.4, 7, a + Math.PI / 2, p.time + i, fireColors);
    }
  }
  if (p.supreme && thief) {
    // Rei dos Ladrões: saco de ouro gigante nas costas, moedas caindo
    shape(ctx, vertical(ctx, -20, 6, '#a8804a', '#5a3a1a'), () => ellipse(ctx, -8, -6, 9, 11), 1);
    shape(ctx, '#5a3a1a', () => ctx.roundRect(-11, -18, 6, 3, 1), 0.6);
    shape(ctx, GOLD, () => circle(ctx, -8, -4, 3.4), 0.6);
    shape(ctx, '#a8701a', () => ctx.rect(-8.5, -6.5, 1, 5), 0);
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 0.9 + i / 3) % 1;
      shape(ctx, '#ffe08a', () => ellipse(ctx, -14 + i * 3, -2 + t * 14, 1.4 * Math.abs(Math.cos(p.time * 5 + i)) + 0.3, 1.4), 0.4);
    }
  }
  if (p.variant !== 'legendary') demonWings(ctx, p.time * 1.5, iv ? iv.wing : '#5a1a1a', 0.8, -4);
  demonTail(ctx, p.time, skinColor);
  if (flaming && !p.supreme) flame(ctx, -14.5, -1.5 + Math.sin(p.time * 3) * 3, 1.8, 6, -0.8, p.time, fireColors);
  shape(ctx, radial(ctx, 0, 0, 7, skinColor, skinDark), () => ellipse(ctx, 0, 1, 5.5, 7));
  if (p.variant === 'epic') {
    // engrenagem no peito, girando
    ctx.save();
    ctx.translate(0, 1.5);
    ctx.rotate(p.time * 2);
    shape(ctx, '#e0b860', () => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.rect(Math.cos(a) * 2.6 - 0.6, Math.sin(a) * 2.6 - 0.6, 1.2, 1.2);
      }
      circle(ctx, 0, 0, 2.4);
    }, 0.4);
    shape(ctx, '#5a3a14', () => circle(ctx, 0, 0, 0.9), 0);
    ctx.restore();
  }
  line(ctx, '#6a1010', 1.4, () => {
    ctx.moveTo(-2, 7);
    ctx.lineTo(-2.5, 12);
    ctx.moveTo(2, 7);
    ctx.lineTo(2.5, 12);
  });
  // tridente (de fogo no Diabrete Flamejante; lança deitada no Cavaleiro do Cão)
  ctx.save();
  ctx.translate(6, 0);
  ctx.rotate(p.variant === 'legendary' ? 1.25 + p.attack * 0.2 : 0.35 + p.attack * 0.7);
  line(ctx, '#3a2a2a', 1.2, () => {
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -10);
  });
  if (flaming) {
    for (const x of [-2.6, 0, 2.6]) flame(ctx, x, -10, 1.3, x === 0 ? 7 : 5, x * 0.12, p.time + x, fireColors);
  } else {
    shape(ctx, p.variant === 'epic' ? '#e0b860' : '#c8ccd8', () => poly(ctx, [-3, -10, -3, -14, -2, -11, 0, -15, 2, -11, 3, -14, 3, -10]), 0.5);
  }
  ctx.restore();
  const hy = -9;
  shape(ctx, radial(ctx, 1, hy, 6, skinColor, darken(skinColor, 0.4)), () => circle(ctx, 1, hy, 5.5));
  horns(ctx, 1, hy - 3, 0.7, p.variant === 'epic' ? '#a8acb8' : '#2a1a1a');
  if (flaming && !p.supreme) for (const x of [-3.2, 5.2]) flame(ctx, x, hy - 8, 1.4, 5, x * 0.06, p.time + x, fireColors);
  eye(ctx, 0, hy, 1.5, iv ? iv.eyes : '#ffd23a', 0.4);
  if (p.variant === 'epic') {
    // olho de lente de latão
    shape(ctx, '#c89a4a', () => circle(ctx, 3.4, hy, 2.2), 0.6);
    shape(ctx, '#7af0ff', () => circle(ctx, 3.4, hy, 1.4), 0);
    halo(ctx, 3.4, hy, 3, '#7af0ff', 0.6);
  } else {
    eye(ctx, 3.4, hy, 1.5, iv ? iv.eyes : '#ffd23a', 0.4);
  }
  ctx.strokeStyle = '#2a0808';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-0.5, hy + 2.5);
  ctx.quadraticCurveTo(2, hy + 4.5, 4.5, hy + 2);
  ctx.stroke();
  if (thief) {
    shape(ctx, '#2a2a36', () => poly(ctx, [-6, hy + 1, -5, hy - 6, 1, hy - 8, 7, hy - 5, 6, hy + 1, 3, hy - 3, -2, hy - 3]), 0.7);
    shape(ctx, '#8a6a3a', () => circle(ctx, -7, 4, 3), 0.7);
    shape(ctx, GOLD, () => circle(ctx, -7, 1, 1.1), 0.4);
  }
  if (p.supreme && formA(p)) {
    // chamas altas nos chifres
    for (const x of [-3.2, 5.2]) flame(ctx, x, hy - 8, 1.8, 8, x * 0.06, p.time + x, fireColors);
  }
}

/** Súcubo: demônia roxa com asas e chicote. A: Sedutora (aura de corações); B: Tormento (correntes e chicote de espinhos). */
export function drawSuccubus(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Rainha Súcubo (A, chicote de chamas) e Agonia (B, correntes sombrias)
  if (p.supreme && formB(p)) {
    // Agonia: auréola quebrada gigante e invertida, e correntes grossas girando em volta
    ctx.save();
    ctx.translate(0, -26);
    ctx.rotate(Math.PI + Math.sin(p.time) * 0.08);
    ctx.strokeStyle = '#8a8a9a';
    ctx.shadowColor = '#c86aff';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.6;
    for (const [a0, a1] of [[0.3, 2.2], [2.6, 4.1], [4.5, 5.9]] as const) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 4.5, 0, a0, a1);
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = p.time * 1.2 + (i * TAU) / 12;
      ctx.save();
      ctx.strokeStyle = '#6a6a7a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ellipse(ctx, Math.cos(a) * 17, -2 + Math.sin(a) * 6, 1.8, 1.1, a + (i % 2 ? Math.PI / 2 : 0));
      ctx.stroke();
      ctx.restore();
    }
  }
  const lure = formA(p);
  const torment = formB(p);
  const SV = {
    // Sedutora Esmeralda
    rare: { skin: ['#c8f0d8', '#5ab88a'], dress: '#14502e', hair: '#0a2a18', wing: '#1a5a3a', eyes: '#7affb0' },
    // Sedutora das Cartas: vestido de crupiê vermelho e preto, chapéu e cartas flutuando
    epic: { skin: ['#f0d0e0', '#c87aa0'], dress: '#8a0a1e', hair: '#1a0a14', wing: '#2a0a14', eyes: '#ffd25a' },
    // Anjo Caído: asas de penas negras com pontas douradas, cabelo branco, auréola quebrada
    legendary: { skin: ['#f4ecf0', '#c8b0c0'], dress: '#14101e', hair: '#ffffff', wing: '#14101e', eyes: '#ffd25a' },
  } as const;
  const sv = p.variant ? SV[p.variant] : null;
  const skinColor = sv ? sv.skin[1] : '#b86ad8';
  ctx.translate(0, -2 + Math.sin(p.time * 2.5) * 1.2);
  if (p.variant === 'legendary') {
    // asas de penas negras com pontas douradas (no lugar das asas de morcego)
    const flap = Math.sin(p.time * 4) * 0.12;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(0, -6);
      ctx.scale(side, 1);
      ctx.rotate(-0.15 + flap);
      // asa: base sólida e penas longas em leque por cima
      shape(ctx, vertical(ctx, -6, 6, '#2a2236', '#0a0810'), () => {
        ctx.moveTo(1, 0);
        ctx.quadraticCurveTo(10, -9, 20, -6);
        ctx.quadraticCurveTo(14, 2, 4, 6);
        ctx.closePath();
      }, 0.8);
      for (let i = 0; i < 6; i++) {
        const len = 22 - i * 2.2;
        ctx.save();
        ctx.rotate(-0.35 + i * 0.22);
        shape(ctx, vertical(ctx, -2, 2, '#3a3046', '#0a0810'), () => {
          ctx.moveTo(3, 0);
          ctx.quadraticCurveTo(len * 0.6, -2.8, len, -0.6);
          ctx.quadraticCurveTo(len * 0.6, 2, 3, 1.4);
          ctx.closePath();
        }, 0.6);
        if (i < 2) shape(ctx, GOLD, () => ellipse(ctx, len - 1.2, -0.5, 1.4, 0.8), 0);
        ctx.restore();
      }
      ctx.restore();
    }
  } else {
    if (lure && p.supreme) {
      // Rainha Súcubo: coração de luz rosa enorme atrás
      const beat = 1 + Math.max(0, Math.sin(p.time * 4)) * 0.06;
      ctx.save();
      ctx.translate(0, -12);
      ctx.scale(beat, beat);
      halo(ctx, 0, 0, 24, '#ff6ab8', 0.45);
      shape(ctx, vertical(ctx, -14, 16, '#ff9ad0cc', '#c02a7a88'), () => {
        ctx.moveTo(0, 16);
        ctx.bezierCurveTo(-24, 0, -14, -20, 0, -8);
        ctx.bezierCurveTo(14, -20, 24, 0, 0, 16);
        ctx.closePath();
      }, 1);
      ctx.restore();
    }
    demonWings(ctx, p.time, sv ? sv.wing : torment ? '#2a0a1a' : '#5a1a5a', lure ? (p.supreme ? 2.1 : 1.65) : 1.1, -6);
  }
  if (torment && !p.supreme) {
    // auréola quebrada e invertida, pendendo atrás da cabeça
    ctx.save();
    ctx.translate(1, -24);
    ctx.rotate(Math.PI + Math.sin(p.time) * 0.1);
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2, 0, 0.4, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
  }
  demonTail(ctx, p.time, sv ? sv.wing : '#7a2a8a');
  shape(ctx, vertical(ctx, -9, 12, sv ? (torment ? darken(sv.dress, 0.3) : sv.dress) : torment ? '#2a0a14' : '#3a1440', '#0e0410'), () =>
    poly(ctx, [-4, -9, 4, -9, 7, 12, -7, 12]),
  );
  if (p.variant === 'epic') {
    // colete de crupiê com botões dourados
    shape(ctx, '#14101a', () => poly(ctx, [-3.5, -9, 3.5, -9, 2, 0, -2, 0]), 0.5);
    for (const y of [-6, -3]) shape(ctx, GOLD, () => circle(ctx, 0, y, 0.6), 0);
  }
  // chicote (estala no ataque)
  const crack = p.attack;
  line(ctx, torment ? '#3a3a44' : '#7a2a5a', 1.1, () => {
    ctx.moveTo(5, -3);
    ctx.quadraticCurveTo(12 + crack * 6, -10 - crack * 2, 18 + crack * 6, -2 + Math.sin(p.time * 8) * 2);
  });
  if (torment) {
    for (let i = 1; i <= 3; i++) shape(ctx, '#c8ccd8', () => circle(ctx, 5 + i * 4 + crack * 2, -6 + i, 0.8), 0.3);
    if (!p.supreme) {
      // correntes de sombra saindo da outra mão, até o chão
      ctx.save();
      ctx.strokeStyle = '#3a2a4a';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ellipse(ctx, -7 - i * 1.6, 1 + i * 2.4 + Math.sin(p.time * 3 + i) * 0.4, 1.4, 1, 0.8 + (i % 2) * 1.4);
        ctx.stroke();
      }
      ctx.restore();
      halo(ctx, -13, 12, 5, '#5a2a8a', 0.6);
    } else {
      ctx.strokeStyle = '#8a8a96';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-10, 6);
      ctx.lineTo(-7, 10);
      ctx.stroke();
    }
  }
  if (lure && !p.supreme) {
    // leque de penas na outra mão
    ctx.save();
    ctx.translate(-6, -2);
    ctx.rotate(-0.5 + Math.sin(p.time * 3) * 0.15);
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(-0.8 + i * 0.4);
      shape(ctx, vertical(ctx, -9, 0, '#ffb8e8', '#c04a9a'), () => ellipse(ctx, 0, -5, 1.6, 5), 0.5);
      ctx.restore();
    }
    ctx.restore();
  }
  if (p.variant === 'epic') {
    // cartas de baralho flutuando em volta
    for (let i = 0; i < 3; i++) {
      const a = p.time * 1.4 + (i * TAU) / 3;
      ctx.save();
      ctx.translate(Math.cos(a) * 13, -6 + Math.sin(a) * 5);
      ctx.rotate(a * 0.5);
      shape(ctx, '#ffffff', () => ctx.roundRect(-2, -3, 4, 6, 0.6), 0.5);
      shape(ctx, i % 2 ? '#d02a3a' : '#14101a', () => {
        ctx.moveTo(0, -1.6);
        ctx.lineTo(1.2, 0);
        ctx.lineTo(0, 1.6);
        ctx.lineTo(-1.2, 0);
        ctx.closePath();
      }, 0);
      ctx.restore();
    }
  }
  const hy = -15;
  shape(ctx, sv ? sv.hair : '#2a0a2a', () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-11, hy + 9, -6, hy + 12);
    ctx.lineTo(-3, hy + 2);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 6, sv ? sv.skin[0] : '#e0b0f0', skinColor), () => circle(ctx, 1, hy, 6));
  if (p.variant !== 'legendary') horns(ctx, 1, hy - 4, 0.8, '#1a0a1a');
  glowingEye(ctx, 0, hy, 1.2, sv ? sv.eyes : torment ? '#ff3a4a' : '#ff8ad0');
  glowingEye(ctx, 3.5, hy, 1.2, sv ? sv.eyes : torment ? '#ff3a4a' : '#ff8ad0');
  if (p.variant === 'legendary') {
    // auréola dourada quebrada, inclinada sobre a cabeça
    ctx.save();
    ctx.translate(1, hy - 9);
    ctx.rotate(-0.25);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2, 0, 0.5, Math.PI * 1.75);
    ctx.stroke();
    ctx.restore();
    halo(ctx, 1, hy - 9, 7, '#ffe08a', 0.5);
  }
  if (p.variant === 'epic') {
    // chapéu de crupiê (viseira verde)
    shape(ctx, '#2a8a4a', () => {
      ctx.moveTo(-5, hy - 3);
      ctx.lineTo(8, hy - 3);
      ctx.lineTo(10, hy - 1);
      ctx.lineTo(-3, hy - 1);
      ctx.closePath();
    }, 0.7);
    shape(ctx, '#14101a', () => ctx.rect(-5, hy - 5, 11, 2.2), 0.6);
  }
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
  if (p.supreme && formA(p)) {
    // chicote de chamas
    ctx.save();
    ctx.translate(7, -2);
    const crack = p.attack;
    line(ctx, '#ff5a1a', 1.4, () => {
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(8, -6 - crack * 4, 14, 4, 20 + crack * 6, -2);
    }, false);
    halo(ctx, 20 + crack * 6, -2, 4, '#ffd040', 0.8);
    ctx.restore();
  }
}

/** Infernal: brutamontes de rocha em chamas. A: Senhor do Abismo (coroa de chifres); B: Berserker (fúria vermelha e machado). */
export function drawInfernal(ctx: Ctx, p: Pose): void {
  // Infernal: demônio brutamontes de pé (pernas de bode, asas, cauda, chifres curvos e juba de fogo).
  // A: Senhor do Abismo (coroa e braceletes de ouro); B: Berserker (vermelho-sangue, machado e cicatrizes).
  const lord = formA(p);
  const rage = formB(p);
  const INV = {
    // Infernal de Cinzas: cinza com brasas
    rare: { hide: '#7a7470', dark: '#2a2624', fire: '#ff8a2a', wing: '#3a3634', mane: ['#ffd040', '#ff6a1a'] },
    // Infernal Gladiador: elmo, ombreira e martelo
    epic: { hide: '#c8582a', dark: '#5a1a08', fire: '#ff8a2a', wing: '#4a1410', mane: ['#ffd040', '#ff8a2a'] },
    // Arquiduque Infernal: pele negra, armadura de ossos dourados, quatro chifres, fogo negro-violeta
    legendary: { hide: '#2a1a2e', dark: '#0a040c', fire: '#a84aff', wing: '#14081a', mane: ['#e0a8ff', '#6a1aa8'] },
  } as const;
  const iv = p.variant ? INV[p.variant] : null;
  const hide = iv ? (rage ? darken(iv.hide, 0.15) : iv.hide) : rage ? '#b8281a' : '#c8402a';
  const hideDark = iv ? iv.dark : rage ? '#4a0806' : '#5a1408';
  const fire = iv ? iv.fire : rage ? '#ff3a1a' : '#ff8a2a';
  const breathe = Math.sin(p.time * 3) * 0.6;
  const throwArm = p.attack;
  const voidFlame = { outer: ['#d8a8ff', '#4a0a8a'] as const, inner: ['#ffffff', '#e0c8ff'] as const, glow: '#8a3aff' };
  if (p.variant === 'legendary') {
    // Arquiduque: mais alto e imponente
    ctx.translate(0, 14);
    ctx.scale(1.12, 1.12);
    ctx.translate(0, -14);
  }
  if (lord) {
    // Senhor do Abismo: capa de chamas subindo atrás das costas (no Lorde do Inferno, um paredão de fogo)
    const k = p.supreme ? 1.5 : 1;
    if (p.supreme) halo(ctx, 0, -10, 28, '#ff6a1a', 0.45);
    for (const [x, h, a] of (p.supreme
      ? [[-18, 20, -0.5], [-13, 26, -0.35], [-7, 30, -0.15], [0, 32, 0], [7, 30, 0.15], [13, 26, 0.35], [18, 20, 0.5]]
      : [[-13, 18, -0.45], [-9, 22, -0.25], [-4, 20, -0.1], [9, 16, 0.3]]) as [number, number, number][]) {
      flame(ctx, x, 8, 3.8 * Math.sqrt(k), h, a, p.time + x, p.variant === 'legendary' ? voidFlame : FIRE_FLAME);
    }
  }
  if (rage && p.supreme) {
    // Fúria Infernal: anel de fogo no chão em volta dele
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10 + p.time * 0.5;
      const x = Math.cos(a) * 19;
      const y = 12 + Math.sin(a) * 4.5;
      if (Math.sin(a) > 0) continue; // a metade da frente vem depois do corpo
      flame(ctx, x, y, 2.8, 10 + Math.sin(p.time * 6 + i) * 2, 0, p.time + i, p.variant === 'legendary' ? voidFlame : FIRE_FLAME);
    }
  }

  demonWings(ctx, p.time, iv ? iv.wing : rage ? '#3a0606' : '#4a1410', lord ? (p.supreme ? 1.9 : 1.6) : 1.2, -8);
  demonTail(ctx, p.time, hideDark);
  // pernas de bode com cascos
  for (const side of [-1, 1]) {
    line(ctx, hideDark, 4, () => {
      ctx.moveTo(side * 4, 4);
      ctx.lineTo(side * 6, 9);
      ctx.lineTo(side * 4.5, 13);
    });
    shape(ctx, '#1a0a0a', () => ctx.roundRect(side * 4.5 - 2.2, 12, 4.4, 2.4, 1), 0.6);
  }
  // tronco musculoso em V
  shape(ctx, radial(ctx, -1, -6, 14, hide, hideDark), () => {
    ctx.moveTo(-11, -10 + breathe);
    ctx.quadraticCurveTo(0, -14 + breathe, 11, -10 + breathe);
    ctx.quadraticCurveTo(9, -1, 5, 5);
    ctx.lineTo(-5, 5);
    ctx.quadraticCurveTo(-9, -1, -11, -10 + breathe);
    ctx.closePath();
  });
  // peitorais e abdômen
  ctx.strokeStyle = hideDark;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -10 + breathe);
  ctx.lineTo(0, 3);
  ctx.moveTo(-6, -5);
  ctx.quadraticCurveTo(-3, -3, 0, -5);
  ctx.quadraticCurveTo(3, -3, 6, -5);
  ctx.moveTo(-3, -1);
  ctx.lineTo(3, -1);
  ctx.moveTo(-3, 2);
  ctx.lineTo(3, 2);
  ctx.stroke();
  // tanga de couro com cinto de crânio
  shape(ctx, '#2a1410', () => poly(ctx, [-5.5, 3, 5.5, 3, 4, 8, 0, 6.5, -4, 8]), 0.7);
  shape(ctx, '#e8e0d0', () => circle(ctx, 0, 3.5, 1.4), 0.4);
  if (p.variant === 'rare') {
    // brasas acesas nas rachaduras de cinza
    for (const [x, y] of [[-6, -6], [4, -3], [-2, 1], [6, -8]] as const) halo(ctx, x, y, 2.4, '#ff8a2a', 0.8 + Math.sin(p.time * 4 + x) * 0.2);
  }
  if (p.variant === 'legendary') {
    // armadura de ossos dourados: costelas sobre o peito
    for (const y of [-8, -5, -2]) {
      shape(ctx, vertical(ctx, y - 1, y + 1, '#fff0a0', '#c8901a'), () => {
        ctx.moveTo(-7, y);
        ctx.quadraticCurveTo(0, y - 2.4, 7, y);
        ctx.lineTo(7, y + 1.4);
        ctx.quadraticCurveTo(0, y - 1, -7, y + 1.4);
        ctx.closePath();
      }, 0.5);
    }
    shape(ctx, vertical(ctx, -10, 3, '#fff0a0', '#c8901a'), () => ctx.rect(-0.9, -10, 1.8, 12), 0.4);
  }
  if (p.variant === 'epic') {
    // ombreira de gladiador no ombro esquerdo, com tiras de couro
    shape(ctx, vertical(ctx, -14, -5, '#d8dce4', '#6a7080'), () => ctx.roundRect(-14, -13, 9, 7, [4, 4, 1, 1]), 1);
    line(ctx, '#5a3a1e', 1.2, () => {
      ctx.moveTo(-7, -7);
      ctx.lineTo(4, 3);
    });
  }
  if (rage) {
    // cicatrizes no peito e machado na outra mão
    line(ctx, '#3a0404', 0.9, () => {
      ctx.moveTo(-7, -8);
      ctx.lineTo(-2, -2);
      ctx.moveTo(-5, -9);
      ctx.lineTo(0, -3);
    }, false);
    line(ctx, '#3a2a1a', 1.8, () => {
      ctx.moveTo(-10, -6);
      ctx.lineTo(-16, 8);
    });
    shape(ctx, vertical(ctx, -2, 8, '#e8ecf4', '#7a8090'), () => poly(ctx, [-13, 0, -21, -2, -20, 7, -15, 6]), 0.7);
  } else if (p.variant === 'epic') {
    // braço esquerdo com o martelo de gladiador
    line(ctx, hide, 4, () => {
      ctx.moveTo(-10, -8);
      ctx.lineTo(-13, 0);
    });
    line(ctx, '#5a3a1e', 1.8, () => {
      ctx.moveTo(-13, 6);
      ctx.lineTo(-13, -10);
    });
    shape(ctx, vertical(ctx, -15, -8, '#d8dce4', '#6a7080'), () => ctx.roundRect(-18, -15, 10, 6, 1.2), 0.9);
    shape(ctx, hideDark, () => circle(ctx, -13.5, 1, 2.6), 0.7);
  } else {
    // braço esquerdo com o punho cerrado em brasa
    line(ctx, hide, 4, () => {
      ctx.moveTo(-10, -8);
      ctx.lineTo(-13, 0);
    });
    halo(ctx, -13.5, 1, 5, fire, 0.6);
    shape(ctx, hideDark, () => circle(ctx, -13.5, 1, 2.6), 0.7);
  }
  // braço direito erguendo a bola de fogo (lança no ataque)
  line(ctx, hide, 4.2, () => {
    ctx.moveTo(9, -9 + breathe);
    ctx.lineTo(14, -16 + throwArm * 7);
  });
  if (lord) for (const [x, y] of [[11, -12 + throwArm * 3], [-11.5, -4]] as const) shape(ctx, GOLD, () => ctx.roundRect(x - 2.4, y - 1, 4.8, 2, 0.8), 0.5);
  halo(ctx, 15, -20 + throwArm * 7, 9, fire, 0.7);
  shape(ctx, radial(ctx, 15, -20 + throwArm * 7, 5, p.variant === 'legendary' ? '#f0e0ff' : '#fff2c0', fire), () => circle(ctx, 15, -20 + throwArm * 7, 3.8 + Math.sin(p.time * 8) * 0.5), 0);

  // cabeça: juba de fogo atrás, chifres curvos, mandíbula com presas
  const hy = -17 + breathe;
  const mane = iv ? iv.mane : (['#ffd040', fire] as const);
  for (let i = 0; i < 5; i++) {
    const h = 6 + Math.sin(p.time * 9 + i * 1.3) * 2;
    shape(ctx, i % 2 ? mane[0] : mane[1], () => poly(ctx, [-6 + i * 2.6, hy - 2, -7 + i * 2.6, hy - 6 - h, -3.5 + i * 2.6, hy - 3]), 0);
  }
  shape(ctx, radial(ctx, 1, hy, 7, hide, hideDark), () => {
    ctx.moveTo(-5, hy - 4);
    ctx.quadraticCurveTo(1, hy - 8, 7, hy - 3);
    ctx.quadraticCurveTo(8, hy + 2, 5, hy + 5);
    ctx.lineTo(-3, hy + 5);
    ctx.quadraticCurveTo(-6, hy + 1, -5, hy - 4);
    ctx.closePath();
  });
  if (p.variant === 'legendary') horns(ctx, 1, hy - 1, 1.1, '#fff0a0');
  horns(ctx, 1, hy - 4, lord ? 1.9 : 1.3, lord || p.variant === 'legendary' ? GOLD : '#1a0a0a');
  // sobrancelha franzida e olhos de fogo
  shape(ctx, hideDark, () => poly(ctx, [-4, hy - 2.6, 1, hy - 1, 6, hy - 2.6, 6, hy - 1.6, 1, hy, -4, hy - 1.6]), 0);
  glowingEye(ctx, -1.5, hy, 1.3, p.variant === 'legendary' ? '#d8a8ff' : '#ffd23a');
  glowingEye(ctx, 3.5, hy, 1.3, p.variant === 'legendary' ? '#d8a8ff' : '#ffd23a');
  if (p.variant === 'epic') {
    // elmo de gladiador com crista
    shape(ctx, vertical(ctx, hy - 7, hy + 2, '#e4e8f0', '#6a7080'), () => {
      ctx.moveTo(-5, hy + 1);
      ctx.quadraticCurveTo(-5.5, hy - 7, 1, hy - 7.5);
      ctx.quadraticCurveTo(7.5, hy - 7, 7.5, hy + 1);
      ctx.lineTo(5.5, hy - 1);
      ctx.lineTo(-3, hy - 1);
      ctx.closePath();
    }, 0.9);
    shape(ctx, '#d02a2a', () => poly(ctx, [-4, hy - 6, 1, hy - 12, 6, hy - 6, 1, hy - 7.6]), 0.6);
  }
  // boca com presas
  shape(ctx, '#2a0606', () => ctx.roundRect(-1.5, hy + 2.4, 6, 1.8 + throwArm, 0.8), 0);
  for (const x of [-0.6, 3.4]) shape(ctx, '#f4f0dc', () => poly(ctx, [x, hy + 2.3, x + 0.7, hy + 4.4, x + 1.4, hy + 2.3]), 0.3);
  if (lord) {
    // coroa de chifres grande
    shape(ctx, vertical(ctx, hy - 17, hy - 6, '#ffe07a', '#c8901a'), () => poly(ctx, [-4.5, hy - 6, -4, hy - 13, -1.5, hy - 9, 1, hy - 17, 3.5, hy - 9, 6, hy - 13, 6.5, hy - 6]), 0.7);
    shape(ctx, '#ff3a3a', () => circle(ctx, 1, hy - 8.5, 1.1), 0.3);
  }
  if (p.supreme && lord) {
    // Lorde do Inferno: coroa de fogo
    for (let i = 0; i < 5; i++) {
      const h = 6 + Math.sin(p.time * 9 + i) * 2;
      shape(ctx, i % 2 ? '#ffd040' : '#ff5a1a', () => poly(ctx, [-5 + i * 3, hy - 11, -3.5 + i * 3, hy - 11 - h, -2 + i * 3, hy - 11]), 0);
    }
    halo(ctx, 1, hy - 14, 11, '#ffb040', 0.5);
  }
  if (p.supreme && rage) {
    // Fúria Infernal: corpo incandescente e a metade da frente do anel de fogo
    halo(ctx, 0, -6, 22, '#ff3a1a', 0.45 + Math.sin(p.time * 5) * 0.15);
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10 + p.time * 0.5;
      if (Math.sin(a) <= 0) continue;
      flame(ctx, Math.cos(a) * 19, 12 + Math.sin(a) * 4.5, 2.8, 10 + Math.sin(p.time * 6 + i) * 2, 0, p.time + i, p.variant === 'legendary' ? voidFlame : FIRE_FLAME);
    }
  }
}

/** Rolo de fumaça (ou bafo gelado) que some ao subir. */
function glowSmoke(ctx: Ctx, x: number, y: number, r: number, alpha: number, color = '#2a1a34'): void {
  halo(ctx, x, y, r, color, alpha);
}

/** Herói Arquidemônio: demônio alto com chifres, capa de fogo e espada flamejante. */
export function drawArchdemon(ctx: Ctx, p: Pose): void {
  const skinColor = skin(p, 'skin', '#c83a2a');
  const skinDark = skin(p, 'skinDark', '#5a0e0a');
  const cape = skin(p, 'cape', '#1a0808');
  const fire = skin(p, 'fire', '#ff8a2a');
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  const look = skin(p, 'look', '');
  if (look === 'shadow') {
    // capa de fumaça: rolos escuros subindo atrás do corpo
    for (let i = 0; i < 5; i++) {
      const t = (p.time * 0.45 + i / 5) % 1;
      glowSmoke(ctx, -6 + Math.sin(t * 5 + i) * 4 - t * 4, 6 - t * 26, 3 + t * 5, 1 - t);
    }
  }
  demonWings(ctx, p.time * 0.8, cape, 1.25, -8);
  shape(ctx, skinDark, () => ctx.roundRect(-5 + step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, skinDark, () => ctx.roundRect(0.5 - step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, radial(ctx, 0, -2, 11, skinColor, skinDark), () => ctx.roundRect(-7, -11, 14, 18, [5, 5, 3, 3]));
  shape(ctx, '#2a1010', () => ctx.rect(-7, 3, 14, 2.4), 0.6);
  // espada flamejante
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(0.5 + p.attack * 1.2);
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
  if (look === 'frost') {
    // chifres de gelo maiores, com pingentes pendurados
    horns(ctx, 1, hy - 4, 1.5, '#cfeeff');
    for (const side of [-1, 1]) {
      for (const k of [0.45, 0.75]) {
        const x = 1 + side * (2 + 4 * k) * 1.5;
        const y = hy - 4 - 6 * k * 1.5;
        shape(ctx, '#ffffff', () => poly(ctx, [x - 0.7, y, x + 0.7, y, x, y + 2.6]), 0.3);
      }
    }
    const k = (p.time * 0.8) % 1;
    glowSmoke(ctx, 8 + k * 4, hy + 2 - k * 3, 1.5 + k * 3, 0.8 * (1 - k), '#e8fbff');
  } else if (look === 'shadow') {
    // coroa de chifres: cinco pontas negras em leque
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.42;
      const len = i === 2 ? 11 : i % 2 ? 8 : 9.5;
      shape(ctx, vertical(ctx, hy - 18, hy - 5, '#3a2a4a', '#0a0410'), () => poly(ctx, [1 + Math.cos(a - 0.18) * 5.5, hy + Math.sin(a - 0.18) * 5.5, 1 + Math.cos(a) * (5.5 + len), hy + Math.sin(a) * (5.5 + len), 1 + Math.cos(a + 0.18) * 5.5, hy + Math.sin(a + 0.18) * 5.5]), 0.7);
    }
  } else {
    horns(ctx, 1, hy - 4, 1.2, '#1a0a0a');
  }
  glowingEye(ctx, -0.5, hy, 1.4, fire);
  glowingEye(ctx, 3.5, hy, 1.4, fire);
  ctx.strokeStyle = '#2a0808';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-0.5, hy + 3);
  ctx.lineTo(4.5, hy + 2.6);
  ctx.stroke();
}
