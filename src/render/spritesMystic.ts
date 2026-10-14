// Sprites das raças Lobisomem, Fantasma e Bruxa (criaturas e heróis).
import {
  ascended,
  formA,
  formB,
  circle,
  darken,
  ellipse,
  starDots,
  eye,
  glowingEye,
  GOLD,
  halo,
  line,
  OUTLINE,
  poly,
  radial,
  shape,
  skin,
  TAU,
  vertical,
  walk,
  type Ctx,
  type Pose,
} from './spriteKit';

// ---------- lobisomens ----------

/** Cabeça de lobo comum ao Caçador, ao Alfa e ao Licantropo. */
/** Cabeça de lobo; `bite` (0–1) abre a mandíbula e `howl` ergue a cabeça. */
function wolfHead(ctx: Ctx, hy: number, fur: string, furDark: string, eyeColor: string, howl = 0, bite = 0): void {
  ctx.save();
  ctx.translate(3, hy);
  ctx.rotate(-howl * 0.6 - bite * 0.15);
  shape(ctx, furDark, () => poly(ctx, [-6, -4, -4, -13, 0, -6]), 1);
  shape(ctx, furDark, () => poly(ctx, [-1, -6, 2, -14, 4, -5]), 1);
  // mandíbula inferior: gira em torno da articulação (4, 3)
  const open = Math.max(howl * 0.5, bite) * 0.7;
  ctx.save();
  ctx.translate(4, 3);
  ctx.rotate(open);
  shape(ctx, furDark, () => ellipse(ctx, 4.5, 1, 5, 2), 1);
  shape(ctx, '#fff8e0', () => poly(ctx, [5.5, -0.6, 6.5, -0.6, 6, -2.4]), 0.4);
  shape(ctx, '#fff8e0', () => poly(ctx, [8, -0.4, 9, -0.4, 8.5, -2.2]), 0.4);
  ctx.restore();
  if (open > 0.1) shape(ctx, '#5a1a1a', () => ellipse(ctx, 8, 3.5, 4, open * 3), 0);
  shape(ctx, radial(ctx, 0, 0, 8, fur, furDark), () => circle(ctx, 0, 0, 7.5));
  shape(ctx, radial(ctx, 8, 1, 5, fur, furDark), () => ellipse(ctx, 7.5, 1.5, 6, 3, 0.05));
  shape(ctx, '#1a1010', () => circle(ctx, 13, 0.8, 1.4), 0.6);
  shape(ctx, '#fff8e0', () => poly(ctx, [8, 4, 9.2, 4, 8.6, 6.2]), 0.5);
  shape(ctx, '#fff8e0', () => poly(ctx, [11, 3.8, 12.2, 3.8, 11.6, 5.8]), 0.5);
  glowingEye(ctx, 3.5, -1.5, 1.5, eyeColor);
  ctx.restore();
}

/** Cores do Caçador em cada variante: pelo, barriga, calça e olhos. */
const HUNTER_VARIANTS = {
  // Lobo do Ártico: branco, olhos azuis
  rare: { fur: '#f2f6fc', furDark: '#a4b0c6', belly: '#ffffff', pants: '#4a5a7a', eyes: '#4ab8ff' },
  // Caçador de Runas: cinza-escuro com runas azuis, colar de dentes e braçadeira
  epic: { fur: '#6e6e7c', furDark: '#2a2a36', belly: '#a8a8b8', pants: '#3a2a1a', eyes: '#5ad8ff' },
  // Lobo Celestial: azul-noite com constelações e cauda de nebulosa
  legendary: { fur: '#2e3e94', furDark: '#0e1444', belly: '#6070d0', pants: '#141a40', eyes: '#ffffff' },
} as const;

export function drawHunter(ctx: Ctx, p: Pose): void {
  const crouch = Math.sin(p.time * 3) * 0.6;
  const swipe = p.attack;
  // Caçador Feral: pelo ruivo, cicatrizes, olhos vermelhos, corpo maior e garras enormes
  const feral = formB(p);
  // Caçador Lunar (A): capa curta com capuz e lua bordada, garras prateadas longas
  const lunar = formA(p) && !p.supreme;
  // Formas Supremas: Lua Sangrenta (A, pelagem prateada e lua vermelha) e Fera Primal (B, maior, olhos em brasa)
  const blood = p.supreme && !feral;
  const primal = p.supreme && feral;
  const hv = p.variant ? HUNTER_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (hv && feral ? darken(c, 0.25) : c);
  const fur = hv ? shadeB(hv.fur) : blood ? '#c8ccd8' : feral ? '#b8582a' : '#8a6a4a';
  const furDark = hv ? shadeB(hv.furDark) : blood ? '#5a6078' : feral ? '#6a2a14' : '#5a4030';
  if (blood) {
    halo(ctx, -6, -24, 14, '#ff3a3a', 0.5);
    shape(ctx, radial(ctx, -7, -25, 8, '#ff8a7a', '#a01a1a'), () => circle(ctx, -6, -24, 7), 0.6);
  }
  if (feral) {
    // cresce a partir dos pés
    const s = primal ? 1.18 : 1.1;
    ctx.translate(0, 14);
    ctx.scale(s, s);
    ctx.translate(0, -14);
  }
  if (lunar) {
    // capa curta de caçador nas costas
    shape(ctx, vertical(ctx, -14, 8, hv ? darken(hv.fur, 0.45) : '#2a3a6a', '#0e1430'), () => {
      ctx.moveTo(-3, -12 + crouch);
      ctx.quadraticCurveTo(-13, -6, -13, 7);
      ctx.lineTo(-8, 5);
      ctx.lineTo(-5, 8);
      ctx.lineTo(-1, -6 + crouch);
      ctx.closePath();
    }, 1);
  }

  // cauda (de nebulosa no Lobo Celestial) e pernas
  shape(ctx, p.variant === 'legendary' ? vertical(ctx, -6, 8, '#e08aff', '#2a3a94') : furDark, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 2 + crouch, -17, -4);
    ctx.quadraticCurveTo(-12, 4, -5, 8);
    ctx.closePath();
  });
  if (p.variant === 'legendary') starDots(ctx, p.time, [[-14, -2], [-11, 2], [-8, 5]]);
  shape(ctx, furDark, () => poly(ctx, [-6, 6, -2, 6, -1, 14, -7, 14]));
  shape(ctx, furDark, () => poly(ctx, [1, 6, 5, 6, 6, 14, 0, 14]));
  // tronco curvado para frente, calça rasgada
  ctx.save();
  ctx.rotate(0.15);
  shape(ctx, radial(ctx, 0, 0, 11, fur, furDark), () => ellipse(ctx, 0, -1 + crouch, 8, 10));
  shape(ctx, hv ? hv.belly : '#c8a880', () => ellipse(ctx, 3, 1 + crouch, 4, 6), 0.8);
  shape(ctx, hv ? hv.pants : '#3a3050', () => poly(ctx, [-7, 4, 7, 4, 6, 9, 3, 7, 0, 9, -3, 7, -6, 9]), 1);
  if (p.variant === 'epic') {
    // runas azuis acesas no corpo
    ctx.save();
    ctx.shadowColor = '#5ad8ff';
    ctx.shadowBlur = 5;
    line(ctx, '#7ae8ff', 1, () => {
      ctx.moveTo(-5, -6 + crouch);
      ctx.lineTo(-3, -2 + crouch);
      ctx.lineTo(-5, 1 + crouch);
      ctx.moveTo(-2, -8 + crouch);
      ctx.lineTo(-1, -4 + crouch);
    }, false);
    ctx.restore();
  }
  if (p.variant === 'legendary') {
    // constelação no peito: estrelas ligadas por linhas finas
    ctx.save();
    ctx.globalAlpha *= 0.5;
    line(ctx, '#bfd0ff', 0.4, () => {
      ctx.moveTo(-4, -6 + crouch);
      ctx.lineTo(-1, -3 + crouch);
      ctx.lineTo(-4, 1 + crouch);
      ctx.lineTo(1, 3 + crouch);
    }, false);
    ctx.restore();
    starDots(ctx, p.time + 2, [[-4, -6 + crouch], [-1, -3 + crouch], [-4, 1 + crouch], [1, 3 + crouch]]);
  }
  ctx.restore();
  // braço com garras: golpe de cima para baixo (prateadas e longas no Lunar, enormes no Feral)
  const clawLen = feral ? 7 : lunar ? 6 : 4;
  const clawColor = lunar ? '#e8f4ff' : '#f4ecd8';
  ctx.save();
  ctx.translate(5, -5 + crouch);
  ctx.rotate(-0.8 + swipe * 1.6);
  line(ctx, fur, feral ? 4.4 : 3.6, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 2);
  });
  if (p.variant === 'epic') shape(ctx, '#5a3a1e', () => ctx.roundRect(4, -0.6, 4, 4, 1), 0.6);
  if (lunar) halo(ctx, 12, 1, 5, '#bfe8ff', 0.6);
  for (const dy of [-1.5, 0.5, 2.5]) shape(ctx, clawColor, () => poly(ctx, [10, dy, 10 + clawLen, dy + 0.6, 10, dy + 1.2 + (feral ? 0.4 : 0)]), 0.5);
  ctx.restore();
  if (p.variant === 'epic') {
    // colar de dentes
    for (let i = 0; i < 5; i++) shape(ctx, '#f4ecd8', () => poly(ctx, [-3 + i * 2.2, -9 + crouch, -1.6 + i * 2.2, -9 + crouch, -2.3 + i * 2.2, -6 + crouch]), 0.4);
  }
  wolfHead(ctx, -15 + crouch, fur, furDark, hv ? hv.eyes : feral ? '#ff2a2a' : ascended(p) ? '#9fdcff' : '#ffd23a', 0, swipe);
  if (lunar) {
    // capuz sobre a cabeça, com a lua bordada
    const hy = -15 + crouch;
    shape(ctx, vertical(ctx, hy - 10, hy + 4, hv ? darken(hv.fur, 0.45) : '#33447a', '#141a3a'), () => {
      ctx.moveTo(-5, hy + 4);
      ctx.quadraticCurveTo(-8, hy - 6, 1, hy - 9);
      ctx.quadraticCurveTo(7, hy - 9.5, 9, hy - 4);
      ctx.quadraticCurveTo(4, hy - 5.5, 2, hy - 3);
      ctx.quadraticCurveTo(-1, hy + 1, -1, hy + 5);
      ctx.closePath();
    }, 1);
    shape(ctx, '#e8f6ff', () => {
      ctx.arc(-1.5, hy - 4, 2.2, 0.6, TAU - 0.6);
      ctx.arc(-0.4, hy - 4, 1.6, TAU - 0.9, 0.9, true);
      ctx.closePath();
    }, 0);
  }
  if (feral) {
    // cicatrizes de garra no peito e pelos eriçados nas costas
    ctx.strokeStyle = '#3a0a0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const dx of [0, 2, 4]) {
      ctx.moveTo(-2 + dx, -6 + crouch);
      ctx.lineTo(1 + dx, 0 + crouch);
    }
    ctx.stroke();
    for (let i = 0; i < 4; i++) shape(ctx, furDark, () => poly(ctx, [-8 + i * 2.5, -8 + crouch, -6.5 + i * 2.5, -14 + crouch - (i % 2) * 2, -5 + i * 2.5, -8 + crouch]), 0.8);
  }
  if (primal) {
    // cicatrizes em brasa e olhos incandescentes
    ctx.save();
    ctx.globalAlpha *= 0.6 + Math.sin(p.time * 5) * 0.3;
    line(ctx, '#ffb040', 0.9, () => {
      for (const dx of [0, 2, 4]) {
        ctx.moveTo(-2 + dx, -6 + crouch);
        ctx.lineTo(1 + dx, 0 + crouch);
      }
    }, false);
    ctx.restore();
    halo(ctx, 6.5, -16.5 + crouch, 5, '#ff6a1a', 0.8);
  }
  if (blood) {
    // marca da lua na testa (Lua Sangrenta)
    ctx.save();
    ctx.shadowColor = '#9fdcff';
    ctx.shadowBlur = 8;
    shape(ctx, '#e8f6ff', () => {
      ctx.arc(2, -21 + crouch, 3, 0.6, TAU - 0.6);
      ctx.arc(3.4, -21 + crouch, 2.2, TAU - 0.9, 0.9, true);
      ctx.closePath();
    }, 0.6);
    ctx.restore();
  }
}

/** Cores do Alfa em cada variante: pelo, juba e olhos. */
const ALPHA_VARIANTS = {
  // Alfa de Prata: preto com a juba prateada
  rare: { fur: '#2c2c34', furDark: '#0e0e14', mane: '#dce0ec', eyes: '#c8d8ff' },
  // Rei das Montanhas: cinza-pedra, juba espessa, ombreiras de rocha e cicatriz
  epic: { fur: '#6e6862', furDark: '#2a2624', mane: '#b0aca6', eyes: '#ffb040' },
  // Fenrir: negro, sombra atrás, olhos de fogo azul e correntes quebradas
  legendary: { fur: '#1c1c28', furDark: '#06060c', mane: '#3e3e5e', eyes: '#5ac8ff' },
} as const;

export function drawAlpha(ctx: Ctx, p: Pose): void {
  const howl = Math.max(0, Math.sin(p.time * 0.8) - 0.85) * 6;
  const bite = p.attack;
  // Fera Devastadora: pelo quase negro, juba cinza-escura, coleira de espinhos, corpo maior e antebraço enorme
  const beast = formB(p);
  // Líder da Matilha (A): estandarte de guerra nas costas
  const leader = formA(p) && !p.supreme;
  // Formas Supremas: Rei Lobo (A, juba branca e coroa de ossos) e Destruidor (B, garras gigantes, chão rachado)
  const king = p.supreme && !beast;
  const wrecker = p.supreme && beast;
  const av = p.variant ? ALPHA_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (av && beast ? darken(c, 0.25) : c);
  const fur = av ? shadeB(av.fur) : beast ? '#3a3238' : '#5a4a3a';
  const furDark = av ? shadeB(av.furDark) : beast ? '#141014' : '#2e241c';
  if (p.variant === 'legendary') {
    // Fenrir: sombra crescendo atrás
    halo(ctx, 0, -6, 24 + Math.sin(p.time * 1.5) * 2, '#2a2a5a', 0.8);
  }
  if (leader) {
    // estandarte de guerra: mastro e bandeira esfarrapada tremulando
    const wave = Math.sin(p.time * 3) * 1.5;
    line(ctx, '#5a3a1e', 1.6, () => {
      ctx.moveTo(-7, 8);
      ctx.lineTo(-10, -34);
    });
    shape(ctx, vertical(ctx, -34, -18, av ? av.mane : '#c0302a', av ? darken(av.mane, 0.4) : '#6a1010'), () => {
      ctx.moveTo(-10, -34);
      ctx.quadraticCurveTo(-17, -33 + wave, -23, -34 + wave);
      ctx.lineTo(-21, -27 + wave);
      ctx.lineTo(-24, -21 + wave);
      ctx.lineTo(-18, -22 + wave * 0.5);
      ctx.lineTo(-16, -18);
      ctx.lineTo(-11, -21);
      ctx.closePath();
    }, 1);
    // marca de garra na bandeira
    line(ctx, '#f4ecd8', 0.8, () => {
      for (const dx of [0, 2, 4]) {
        ctx.moveTo(-19 + dx, -31 + wave * 0.7);
        ctx.lineTo(-17 + dx, -25 + wave * 0.7);
      }
    }, false);
  }
  if (beast) {
    // cresce a partir dos pés
    ctx.translate(0, 14);
    ctx.scale(1.12, 1.12);
    ctx.translate(0, -14);
  }
  if (wrecker) {
    // chão rachado sob as patas
    line(ctx, '#1a1018', 1.2, () => {
      ctx.moveTo(-14, 14);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-1, 15);
      ctx.lineTo(7, 12);
      ctx.lineTo(14, 15);
      ctx.moveTo(-6, 12);
      ctx.lineTo(-8, 16);
      ctx.moveTo(7, 12);
      ctx.lineTo(9, 16);
    }, false);
  }

  shape(ctx, furDark, () => {
    ctx.moveTo(-7, 4);
    ctx.quadraticCurveTo(-18, 0, -19, -7);
    ctx.quadraticCurveTo(-13, 3, -6, 9);
    ctx.closePath();
  });
  shape(ctx, furDark, () => ctx.roundRect(-7, 6, 5, 8, 2));
  shape(ctx, furDark, () => ctx.roundRect(2, 6, 5, 8, 2));
  if (p.variant === 'legendary') {
    // correntes quebradas presas nas patas
    for (const x of [-4.5, 4.5]) {
      shape(ctx, '#8a8ea0', () => ctx.roundRect(x - 3, 9, 6, 2, 1), 0.6);
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.strokeStyle = '#8a8ea0';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ellipse(ctx, x + (x < 0 ? -2 : 2) - i * (x < 0 ? 1.6 : -1.6), 12.5 + i * 2.2, 1.2, 1.6, 0.4);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  // corpo largo e juba
  shape(ctx, radial(ctx, 0, 0, 13, fur, furDark), () => ellipse(ctx, 0, 0, 10, 11));
  shape(ctx, av ? av.mane : beast ? '#5a5260' : '#9a8a7a', () => {
    for (let i = 0; i < 7; i++) {
      const a = -2.6 + i * 0.45;
      const x = Math.cos(a) * 9;
      const y = -7 + Math.sin(a) * 5;
      if (i === 0) ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
      ctx.lineTo(Math.cos(a + 0.22) * 9, -7 + Math.sin(a + 0.22) * 5);
    }
    ctx.lineTo(6, -2);
    ctx.lineTo(-6, -2);
    ctx.closePath();
  });
  // cicatriz e colar de ossos (forma evoluída)
  if (formA(p)) {
    for (let i = 0; i < 5; i++) shape(ctx, '#f4ecd8', () => poly(ctx, [-6 + i * 3, -1, -4.6 + i * 3, -1, -5.3 + i * 3, 3]), 0.6);
  }
  if (beast) {
    // coleira de couro com espinhos de ferro e um pedaço de corrente quebrada pendurado
    shape(ctx, '#4a2a1a', () => ctx.roundRect(-8, -3, 16, 3, 1.2), 0.8);
    for (let i = 0; i < 5; i++) shape(ctx, '#c8ccd8', () => poly(ctx, [-6.5 + i * 3.2, -3, -5 + i * 3.2, -7, -3.5 + i * 3.2, -3]), 0.6);
    ctx.save();
    ctx.strokeStyle = '#a8acb8';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ellipse(ctx, -3 - i * 1.2, 1.5 + i * 2.6, 1.3, 1.7, 0.3);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (p.variant === 'epic') {
    // ombreiras de rocha
    for (const [x, flip] of [[-9, -1], [8, 1]] as const) {
      shape(ctx, vertical(ctx, -10, -2, '#a8a29a', '#5a544e'), () => poly(ctx, [x - 4, -3, x - 3.5, -8, x + flip * 0.5, -10.5, x + 3.5, -8, x + 4, -3]), 1);
      shape(ctx, '#7a746e', () => poly(ctx, [x - 1, -8, x + 1.5, -7, x, -5]), 0);
    }
  }
  if (king) {
    // juba branca volumosa por trás da cabeça
    shape(ctx, '#f0ece4', () => {
      for (let i = 0; i < 9; i++) {
        const a = -3 + i * 0.42;
        const r = 13 + (i % 2) * 3;
        if (i === 0) ctx.moveTo(3 + Math.cos(a) * 6, -16 + Math.sin(a) * 6);
        ctx.lineTo(3 + Math.cos(a + 0.2) * r, -16 + Math.sin(a + 0.2) * r);
        ctx.lineTo(3 + Math.cos(a + 0.42) * 6, -16 + Math.sin(a + 0.42) * 6);
      }
      ctx.closePath();
    }, 0.8);
  }
  if (beast) {
    // antebraço enorme à frente, com garras grossas
    ctx.save();
    ctx.translate(6, -2);
    ctx.rotate(0.6 - bite * 0.8);
    line(ctx, fur, 5.5, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(9, 3);
    });
    for (const dy of [-1.6, 0.6, 2.8]) shape(ctx, '#f4ecd8', () => poly(ctx, [9, dy + 0.6, 14.5, dy + 1.6, 9, dy + 2.4]), 0.6);
    ctx.restore();
  }
  wolfHead(ctx, -16, fur, furDark, av ? av.eyes : beast ? '#ff3a1a' : '#ff9a3a', howl, bite);
  if (p.variant === 'legendary') {
    // olhos de fogo azul
    halo(ctx, 6.5, -17.5, 5, '#5ac8ff', 0.9);
  }
  if (p.variant === 'epic') {
    // cicatriz atravessando o olho
    line(ctx, '#e8a0a0', 1, () => {
      ctx.moveTo(5, -22);
      ctx.lineTo(8.5, -14);
    }, false);
  }
  if (king) {
    // coroa de ossos
    for (let i = 0; i < 5; i++) shape(ctx, '#f4ecd8', () => poly(ctx, [-3 + i * 2.6, -27, -2 + i * 2.6, -33 - (i % 2) * 2, -1 + i * 2.6, -27]), 0.6);
    shape(ctx, '#f4ecd8', () => ctx.roundRect(-3.5, -28, 14, 2.2, 1), 0.6);
  }
  if (wrecker) {
    // garras gigantes nas duas patas
    for (const [x, y] of [[-9, 4], [9, 6]] as const) {
      for (const dx of [-2.2, 0, 2.2]) shape(ctx, '#e8e0d0', () => poly(ctx, [x + dx - 0.9, y, x + dx + 0.4, y + 7 + bite * 2, x + dx + 0.9, y]), 0.6);
    }
  }
  if (formA(p)) {
    ctx.strokeStyle = '#d0302a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(1, 6);
    ctx.moveTo(-1, 1);
    ctx.lineTo(3, 5);
    ctx.stroke();
  }
}

/** Uivador: lobo sentado que ergue a cabeça e uiva. A: Uivo Lunar (pelo prateado e lua); B: Grito de Guerra (pintura de guerra e chifre de osso). */
/** Cores do Uivador em cada variante: pelo e olhos. */
const HOWLER_VARIANTS = {
  // Lobo do Deserto: cor de areia com manchas
  rare: { fur: '#dcb47c', furDark: '#8a6030', eyes: '#ffd23a' },
  // Lobo Xamã: marrom-terra, máscara de crânio de cervo com galhada, contas
  epic: { fur: '#6e5e4c', furDark: '#2e241a', eyes: '#7affa0' },
  // Lobo Espiritual: verde-água translúcido e brilhante
  legendary: { fur: '#8affe8', furDark: '#2a9a8a', eyes: '#ffffff' },
} as const;

export function drawHowler(ctx: Ctx, p: Pose): void {
  const lunar = formA(p);
  const war = formB(p);
  // Formas Supremas: Uivo do Eclipse (A, lua negra com coroa de luz) e Trompa da Matilha (B, trompa de chifre e penas)
  const eclipse = p.supreme && lunar;
  const horn = p.supreme && war;
  const wv = p.variant ? HOWLER_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (wv && war ? darken(c, 0.25) : c);
  const fur = wv ? shadeB(wv.fur) : lunar ? '#c8d0e0' : war ? '#7a5a3a' : '#8a8aa0';
  const furDark = wv ? shadeB(wv.furDark) : lunar ? '#7a84a0' : war ? '#3a2614' : '#4a4a60';
  // uiva no ataque e, de vez em quando, sozinho
  const howl = Math.max(p.attack, Math.max(0, Math.sin(p.time * 0.9) - 0.8) * 5);
  if (eclipse) {
    halo(ctx, -9, -24, 13, '#e8d8ff', 0.6);
    shape(ctx, '#0a0612', () => circle(ctx, -9, -24, 6.5), 0.8);
  } else if (lunar) {
    // Uivo Lunar: lua cheia grande atrás, com crateras
    halo(ctx, -8, -24, 16, '#bfe8ff', 0.55);
    shape(ctx, radial(ctx, -10, -26, 10, '#ffffff', '#c8dcf0'), () => circle(ctx, -8, -24, 9), 0.6);
    for (const [x, y, r] of [[-11, -27, 1.8], [-6, -21, 1.4], [-5, -27, 1]] as const) shape(ctx, '#b8cce4', () => circle(ctx, x, y, r), 0);
  }
  if (p.variant === 'legendary') {
    // Lobo Espiritual: brilho e corpo translúcido
    halo(ctx, 0, -4, 20, '#7affe0', 0.45);
    ctx.globalAlpha *= 0.82;
  }
  // cauda e corpo sentado
  shape(ctx, furDark, () => {
    ctx.moveTo(-6, 10);
    ctx.quadraticCurveTo(-16, 12, -15, 4);
    ctx.quadraticCurveTo(-11, 9, -5, 7);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, -1, 2, 11, fur, furDark), () => ellipse(ctx, -1, 3, 8, 11));
  shape(ctx, furDark, () => ctx.roundRect(-6, 9, 5, 5, 2));
  shape(ctx, furDark, () => ctx.roundRect(2, 9, 5, 5, 2));
  shape(ctx, fur, () => ellipse(ctx, 3, 0, 3.5, 7, 0.2), 1);
  if (p.variant === 'rare') {
    // manchas de lobo do deserto
    for (const [x, y, r] of [[-5, 0, 1.6], [-3, 6, 1.3], [-7, 5, 1.1], [-4, -5, 1.2]] as const) shape(ctx, darken(wv!.fur, 0.35), () => ellipse(ctx, x, y, r * 1.3, r), 0);
  }
  if (p.variant === 'epic') {
    // colar de contas e amuleto
    for (let i = 0; i < 6; i++) shape(ctx, i % 2 ? '#e05a3a' : '#f4ecd8', () => circle(ctx, -3 + i * 1.8, -6 + Math.abs(i - 2.5) * 0.5, 1), 0.4);
    shape(ctx, '#7affa0', () => poly(ctx, [1.5, -4.5, 3, -2, 1.5, 0.5, 0, -2]), 0.5);
  }
  if (war) {
    // tambor de couro no quadril
    shape(ctx, vertical(ctx, 2, 11, '#c89a5a', '#7a5428'), () => ctx.roundRect(4, 3, 7, 8, 2), 1);
    shape(ctx, '#f4e4c8', () => ellipse(ctx, 7.5, 3, 3.5, 1.3), 0.7);
    line(ctx, '#d0302a', 0.8, () => {
      ctx.moveTo(4.5, 7);
      ctx.lineTo(10.5, 7);
    }, false);
  }
  if (war) {
    // pintura de guerra e chifre de osso pendurado
    ctx.strokeStyle = '#d0302a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.lineTo(0, 1);
    ctx.moveTo(-4, 1);
    ctx.lineTo(0, 5);
    ctx.stroke();
    shape(ctx, '#f4ecd8', () => {
      ctx.moveTo(-8, 4);
      ctx.quadraticCurveTo(-12, 8, -9, 12);
      ctx.lineTo(-7, 11);
      ctx.quadraticCurveTo(-9, 8, -6, 5);
      ctx.closePath();
    }, 0.8);
  }
  wolfHead(ctx, -15, fur, furDark, wv ? wv.eyes : war ? '#ff3a1a' : lunar ? '#9fdcff' : '#ffd23a', Math.min(1, howl), 0);
  if (war && !horn) {
    // penas de guerra presas na cabeça
    for (const [x, a, color] of [[-1, -0.5, '#d0302a'], [1.5, -0.2, '#f4ecd8'], [4, 0.1, '#d0302a']] as const) {
      ctx.save();
      ctx.translate(x, -24);
      ctx.rotate(a - Math.min(1, howl) * 0.5);
      shape(ctx, color, () => ellipse(ctx, 0, -3.5, 1.5, 4.2), 0.6);
      ctx.restore();
    }
  }
  if (p.variant === 'epic') {
    // máscara de crânio de cervo com galhada grossa (acompanha o uivo)
    ctx.save();
    ctx.translate(3, -15);
    ctx.rotate(-Math.min(1, howl) * 0.6);
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, -20, -6, '#f4ecd8', '#c8b490'), () => {
        ctx.moveTo(side * 1.5 - 1, -6);
        ctx.quadraticCurveTo(side * 5 - 1, -12, side * 4 - 1, -19);
        ctx.lineTo(side * 6.5 - 1, -18);
        ctx.quadraticCurveTo(side * 7 - 1, -14, side * 8.5 - 1, -14);
        ctx.lineTo(side * 8 - 1, -11.5);
        ctx.quadraticCurveTo(side * 6 - 1, -11, side * 3.5 - 1, -5.5);
        ctx.closePath();
      }, 0.9);
    }
    shape(ctx, vertical(ctx, -8, 3, '#fbf4e4', '#d8c8a8'), () => {
      ctx.moveTo(-5, -5);
      ctx.quadraticCurveTo(1, -9, 7, -5);
      ctx.quadraticCurveTo(11, -2, 10, 1);
      ctx.quadraticCurveTo(4, 2, -4, 1);
      ctx.closePath();
    }, 0.9);
    for (const x of [1.5, 5.5]) shape(ctx, '#1a1410', () => ellipse(ctx, x, -2, 1.4, 1.1), 0);
    halo(ctx, 3.5, -2, 4, '#7affa0', 0.6);
    ctx.restore();
  }
  if (horn) {
    // trompa de chifre presa ao ombro e penas na cabeça
    shape(ctx, vertical(ctx, -10, 2, '#f4ecd8', '#a88a5a'), () => {
      ctx.moveTo(4, -2);
      ctx.quadraticCurveTo(12, -4, 15, -11);
      ctx.lineTo(17, -9);
      ctx.quadraticCurveTo(14, -1, 5, 1);
      ctx.closePath();
    }, 0.8);
    for (const [x, a] of [[-2, -0.4], [1, -0.1]] as const) {
      ctx.save();
      ctx.translate(x, -27);
      ctx.rotate(a);
      shape(ctx, '#d0302a', () => ellipse(ctx, 0, -3, 1.4, 4), 0.5);
      ctx.restore();
    }
  }
  if (howl > 0.3) {
    // ondas do uivo
    ctx.strokeStyle = war ? '#ff8a5a88' : '#cfe0ff88';
    ctx.lineWidth = 1;
    for (const r of [5, 9]) {
      ctx.beginPath();
      ctx.arc(10, -26, r * howl, -1.2, 0.2);
      ctx.stroke();
    }
  }
}

/** Herói Licantropo: lobisomem de pé, com capa vermelha e braçadeiras de couro. */
export function drawLycan(ctx: Ctx, p: Pose): void {
  const step = walk(p, 13);
  const bob = p.moving ? Math.abs(step) * -1.2 : Math.sin(p.time * 2.5) * 0.5;
  const sway = Math.sin(p.time * 3) * 1.5 + step * 2;
  const fur = skin(p, 'fur', '#7a7a8a');
  const furDark = skin(p, 'furDark', '#3e3e4e');

  shape(ctx, vertical(ctx, -8, 12, skin(p, 'cape', '#b02a2a'), skin(p, 'capeDark', '#5a1010')), () =>
    poly(ctx, [-6, -7 + bob, 4, -7 + bob, 2, 11, -7 - sway, 13, -13 - sway, 9]),
  );
  shape(ctx, furDark, () => ctx.roundRect(-5 + step * 2, 6, 4.5, 8, 2));
  shape(ctx, furDark, () => ctx.roundRect(0.5 - step * 2, 6, 4.5, 8, 2));
  shape(ctx, radial(ctx, 0, 0, 11, fur, furDark), () => ctx.roundRect(-7, -9 + bob, 14, 17, [5, 5, 4, 4]));
  shape(ctx, skin(p, 'leather', '#6a4a2a'), () => poly(ctx, [-7, -6 + bob, 7, 2 + bob, 7, 5 + bob, -7, -3 + bob]), 0.8);
  shape(ctx, skin(p, 'leather', '#6a4a2a'), () => ctx.rect(-7, 3 + bob, 14, 2.6), 0.8);
  // garras
  ctx.save();
  ctx.translate(6, -2 + bob);
  ctx.rotate(-0.6 + p.attack * 1.8);
  line(ctx, fur, 3.4, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(9, 1);
  });
  shape(ctx, skin(p, 'leather', '#6a4a2a'), () => ctx.rect(3, -2, 3, 4), 0.6);
  for (const dy of [-1.5, 0.5, 2.5]) shape(ctx, '#f4ecd8', () => poly(ctx, [9, dy, 13, dy + 0.6, 9, dy + 1.2]), 0.5);
  ctx.restore();
  wolfHead(ctx, -16 + bob, fur, furDark, '#ffd23a', 0, p.attack);
}

// ---------- fantasmas ----------

/** Corpo de lençol fantasma com a barra ondulando. */
function ghostBody(ctx: Ctx, t: number, top: number, color: string, edge: string): void {
  const g = ctx.createLinearGradient(0, top, 0, 14);
  g.addColorStop(0, color);
  g.addColorStop(1, edge);
  shape(ctx, g, () => {
    ctx.moveTo(-9, 0);
    ctx.quadraticCurveTo(-10, top, 0, top);
    ctx.quadraticCurveTo(10, top, 9, 0);
    for (let i = 0; i <= 6; i++) {
      const x = 9 - i * 3;
      const y = 10 + Math.sin(t * 6 + i) * 2 + (i % 2 ? 3 : 0);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  });
}

export function drawHaunt(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2.5) * 2 - 4;
  ctx.translate(0, float);
  ctx.globalAlpha *= 0.92;
  // Aparição Gélida: lençol azul-gelo, estilhaços de gelo girando
  const frost = formB(p);
  // Formas Supremas: Ira Eterna (A, chamas azuis e correntes quebradas) e Inverno Fantasma (B, névoa congelante)
  const wrath = p.supreme && !frost;
  const winter = p.supreme && frost;
  if (winter) for (let i = 0; i < 4; i++) {
    const a = p.time * 0.7 + (i * TAU) / 4;
    halo(ctx, Math.cos(a) * 15, 4 + Math.sin(a) * 5, 7, '#e8fbff', 0.45);
  }
  ghostBody(ctx, p.time, -24, wrath ? '#c8d8ff' : frost ? '#e0f0ff' : '#e8fffa', wrath ? '#3a5aff60' : frost ? '#5a9aff60' : '#8ce8d840');
  if (frost) {
    ctx.save();
    ctx.shadowColor = '#9fdcff';
    ctx.shadowBlur = 6;
    for (let i = 0; i < 4; i++) {
      const a = p.time * 1.8 + (i * TAU) / 4;
      const sx = Math.cos(a) * 13;
      const sy = -10 + Math.sin(a) * 6;
      shape(ctx, '#e8fbff', () => poly(ctx, [sx, sy - 3, sx + 1.4, sy, sx, sy + 3, sx - 1.4, sy]), 0.5);
    }
    ctx.restore();
  }
  // braços fantasmagóricos
  shape(ctx, frost ? '#c8e0ff' : '#d0f8f0', () => {
    ctx.moveTo(6, -6);
    ctx.quadraticCurveTo(14 + p.attack * 4, -8, 16 + p.attack * 5, -2);
    ctx.quadraticCurveTo(12, -2, 7, -1);
    ctx.closePath();
  }, 1);
  // olhos ocos e boca
  shape(ctx, '#0e2a26', () => ellipse(ctx, 0, -14, 2.2, 3), 0);
  shape(ctx, '#0e2a26', () => ellipse(ctx, 5.5, -14, 2.2, 3), 0);
  shape(ctx, '#0e2a26', () => ellipse(ctx, 3, -7, 2, 2.6 + p.attack * 1.5), 0);
  ctx.fillStyle = frost ? '#bfe8ff' : '#8ce8d8';
  ctx.beginPath();
  circle(ctx, 0.6, -14.6, 0.8);
  circle(ctx, 6.1, -14.6, 0.8);
  ctx.fill();
  if (frost) {
    // coroa de gelo
    for (const [x, h] of [[-3, 5], [1, 7], [5, 5]] as const) {
      shape(ctx, vertical(ctx, -22 - h, -21, '#ffffff', '#8ad0ff'), () => poly(ctx, [x - 1.5, -21, x, -21 - h, x + 1.5, -21]), 0.7);
    }
  }
  if (formA(p)) {
    // chamas espectrais na cabeça (azuis e altas na Ira Eterna)
    ctx.save();
    ctx.shadowColor = wrath ? '#5a8aff' : '#5ae8c8';
    ctx.shadowBlur = 10;
    for (let i = 0; i < (wrath ? 5 : 3); i++) {
      const h = (wrath ? 9 : 5) + Math.sin(p.time * 9 + i * 2) * 2;
      const x0 = wrath ? -7 + i * 3.5 : -4 + i * 4;
      shape(ctx, wrath ? '#7aa8ff' : '#5ae8c8', () => poly(ctx, [x0, -22, x0 + 2, -22 - h, x0 + 4, -22]), 0);
    }
    ctx.restore();
  }
  if (wrath) {
    // correntes quebradas penduradas
    for (const x of [-8, 9]) {
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = '#8a90a8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ellipse(ctx, x, -2 + k * 3.2 + Math.sin(p.time * 3 + x) * 0.6, 1.2, 1.8);
        ctx.stroke();
      }
    }
  }
  if (winter) {
    // coroa de gelo maior
    for (const [x, h] of [[-6, 6], [-2, 9], [2, 11], [6, 9], [10, 6]] as const) {
      shape(ctx, vertical(ctx, -22 - h, -21, '#ffffff', '#8ad0ff'), () => poly(ctx, [x - 1.4, -21, x, -21 - h, x + 1.4, -21]), 0.6);
    }
  }
}

export function drawBanshee(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2) * 2 - 4;
  const scream = p.attack;
  ctx.translate(0, float);
  const dread = formB(p);
  // Formas Supremas: Lamento Final (A, cabelo erguido) e Pesadelo (B, máscara de caveira e sombras)
  const lament = p.supreme && !dread;
  const nightmare = p.supreme && dread;
  const eyes = dread ? '#ff2a4a' : '#6a9aff';
  if (lament) {
    // cabelo erguido como chamas pálidas
    for (let i = 0; i < 6; i++) {
      const x = -7 + i * 2.8;
      const h = 12 + Math.sin(p.time * 6 + i) * 3 + scream * 4;
      shape(ctx, '#f0f4ffcc', () => {
        ctx.moveTo(x - 1.6, -21);
        ctx.quadraticCurveTo(x - 3, -21 - h * 0.6, x + Math.sin(p.time * 4 + i) * 2, -21 - h);
        ctx.quadraticCurveTo(x + 1, -21 - h * 0.5, x + 1.6, -21);
        ctx.closePath();
      }, 0.5);
    }
  }
  if (nightmare) {
    // tentáculos de sombra no chão
    for (let i = 0; i < 4; i++) {
      const x = -12 + i * 8;
      line(ctx, '#1a0a2a', 1.6, () => {
        ctx.moveTo(x, 14);
        ctx.quadraticCurveTo(x + Math.sin(p.time * 3 + i) * 4, 6, x + 2, -2 + Math.sin(p.time * 2 + i) * 2);
      }, false);
    }
  }
  // cabelo longo esvoaçando para trás
  shape(ctx, vertical(ctx, -24, 10, dread ? '#3a2050' : '#f0f4ff', dread ? '#1a0a2a80' : '#9ab0e080'), () => {
    ctx.moveTo(-2, -24);
    ctx.quadraticCurveTo(-14, -22, -18, -6 + Math.sin(p.time * 4) * 2);
    ctx.quadraticCurveTo(-12, -8, -16, 6 + Math.sin(p.time * 4 + 1) * 2);
    ctx.quadraticCurveTo(-6, -2, -4, -6);
    ctx.closePath();
  });
  // vestido de névoa
  const g = ctx.createLinearGradient(0, -10, 0, 14);
  g.addColorStop(0, dread ? '#5a2a8a' : '#c8d8ff');
  g.addColorStop(1, dread ? '#2a0a4a00' : '#8aa0e000');
  shape(ctx, g, () => {
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -9);
    ctx.quadraticCurveTo(10, 4, 8, 13 + Math.sin(p.time * 5) * 2);
    ctx.lineTo(0, 9);
    ctx.lineTo(-8, 13 + Math.sin(p.time * 5 + 1) * 2);
    ctx.quadraticCurveTo(-9, 2, -6, -9);
    ctx.closePath();
  });
  // braços abertos
  line(ctx, dread ? '#8a6ab0' : '#d8e4ff', 2.2, () => {
    ctx.moveTo(4, -6);
    ctx.lineTo(13 + scream * 3, -11 - scream * 2);
  });
  // rosto e boca do grito
  shape(ctx, radial(ctx, 1, -15, 7, dread ? '#e8dcf0' : '#ffffff', dread ? '#9a88b8' : '#b8c8f0'), () => ellipse(ctx, 1, -15, 6.5, 7.5));
  shape(ctx, dread ? '#3a2050' : '#f0f4ff', () => {
    ctx.moveTo(-6, -15);
    ctx.quadraticCurveTo(-6, -24, 2, -23);
    ctx.quadraticCurveTo(8, -23, 7, -17);
    ctx.quadraticCurveTo(2, -21, -6, -15);
  }, 0.8);
  glowingEye(ctx, 0, -15.5, 1.2, eyes);
  glowingEye(ctx, 4, -15.5, 1.2, eyes);
  if (dread) {
    // chifres retorcidos e correntes de sombra
    shape(ctx, '#1a0a2a', () => poly(ctx, [-3, -21, -8, -29, -5, -22]), 0.8);
    shape(ctx, '#1a0a2a', () => poly(ctx, [5, -21.5, 9, -30, 7, -21]), 0.8);
    ctx.fillStyle = '#c86aff';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.8 + i / 3) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      circle(ctx, -6 + i * 6, 12 - ph * 14, 1.2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  shape(ctx, '#1a1438', () => ellipse(ctx, 2.5, -10.5, lament ? 3 : 1.8, (lament ? 2.6 : 1.4) + scream * (lament ? 4 : 2.5)), 0);
  if (nightmare) {
    // máscara de caveira sobre o rosto
    shape(ctx, '#e8e4dc', () => ellipse(ctx, 1.5, -14.5, 6, 6.8), 0.9);
    shape(ctx, '#0a0410', () => ellipse(ctx, -0.6, -15.5, 1.9, 2.2), 0);
    shape(ctx, '#0a0410', () => ellipse(ctx, 3.8, -15.5, 1.9, 2.2), 0);
    glowingEye(ctx, -0.6, -15.5, 0.8, '#ff2a4a');
    glowingEye(ctx, 3.8, -15.5, 0.8, '#ff2a4a');
    shape(ctx, '#0a0410', () => poly(ctx, [1.6, -13, 0.6, -11, 2.6, -11]), 0);
    for (let k = 0; k < 4; k++) shape(ctx, '#0a0410', () => ctx.rect(-1.4 + k * 1.6, -9.6, 0.6, 1.4), 0);
  }
  if (formA(p)) {
    shape(ctx, '#e0e8f8', () => poly(ctx, [-4, -21.5, -3, -26, -0.5, -23, 1.5, -27.5, 3.5, -23, 6, -26, 6.5, -21.5]), 0.8);
    shape(ctx, '#6a9aff', () => circle(ctx, 1.5, -23.8, 1), 0.5);
  }
}

/** Herói Espectro: espírito encapuzado com lanterna, translúcido da cintura para baixo. */
export function drawSpecter(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2.2) * 1.5 - 2;
  const robe = skin(p, 'robe', '#1e4a50');
  const robeDark = skin(p, 'robeDark', '#0a1e22');
  const glow = skin(p, 'glow', '#8ce8d8');
  ctx.translate(0, float);
  const g = ctx.createLinearGradient(0, -12, 0, 14);
  g.addColorStop(0, robe);
  g.addColorStop(0.7, robeDark);
  g.addColorStop(1, '#0a1e2200');
  shape(ctx, g, () => {
    ctx.moveTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.quadraticCurveTo(10, 4, 7, 14 + Math.sin(p.time * 5) * 2);
    ctx.lineTo(1, 10);
    ctx.lineTo(-6, 14 + Math.sin(p.time * 5 + 1.5) * 2);
    ctx.quadraticCurveTo(-10, 2, -7, -8);
    ctx.closePath();
  });
  // lanterna na mão estendida
  line(ctx, robe, 2.6, () => {
    ctx.moveTo(4, -4);
    ctx.lineTo(10 + p.attack * 3, -1);
  });
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(11 + p.attack * 3, -1);
  ctx.lineTo(11 + p.attack * 3, 2);
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  shape(ctx, '#3a3020', () => ctx.roundRect(8.5 + p.attack * 3, 2, 5, 6, 1), 0.8);
  shape(ctx, glow, () => ellipse(ctx, 11 + p.attack * 3, 5, 1.6, 2.2), 0);
  ctx.restore();
  // capuz com rosto escuro e olhos brilhantes
  shape(ctx, vertical(ctx, -26, -8, robe, robeDark), () => {
    ctx.moveTo(-8, -6);
    ctx.quadraticCurveTo(-10, -20, -2, -25);
    ctx.lineTo(-6, -27);
    ctx.quadraticCurveTo(6, -27, 8, -12);
    ctx.quadraticCurveTo(8, -7, 5, -6);
    ctx.closePath();
  });
  shape(ctx, '#05080a', () => ellipse(ctx, 2, -14, 5, 5.5), 0);
  glowingEye(ctx, 0.5, -14.5, 1.3, glow);
  glowingEye(ctx, 4, -14.5, 1.3, glow);
}

// ---------- bruxas ----------

/** Chapéu pontudo de bruxa. */
function witchHat(ctx: Ctx, hy: number, color: string, band: string, droop: number): void {
  shape(ctx, color, () => ellipse(ctx, 0, hy - 5, 11, 2.6));
  shape(ctx, color, () => {
    ctx.moveTo(-6, hy - 5);
    ctx.lineTo(-1 + droop, hy - 22);
    ctx.quadraticCurveTo(4 + droop * 2, hy - 23, 7 + droop * 2, hy - 19);
    ctx.lineTo(2 + droop, hy - 18);
    ctx.lineTo(6, hy - 5);
    ctx.closePath();
  });
  shape(ctx, band, () => ctx.rect(-5.6, hy - 8.5, 11.2, 2.6), 0.6);
}

export function drawSorceress(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.4) * 1.2;
  const cast = p.attack;
  // Feiticeira do Caos: vestido verde-escuro, orbe e runas roxas
  const chaos = formB(p);
  // Formas Supremas: Bruxa Suprema (A, chapéu com olhos e caldeirão flutuando) e Caos Absoluto (B, cabelo em chamas verdes)
  const supremeWitch = p.supreme && !chaos;
  const absoluteChaos = p.supreme && chaos;
  const magic = chaos ? '#c86aff' : '#7ad85a';
  if (absoluteChaos) {
    // cabelo em chamas verdes atrás
    for (let i = 0; i < 5; i++) {
      const h = 9 + Math.sin(p.time * 9 + i * 1.4) * 3;
      shape(ctx, i % 2 ? '#8aff6a' : '#3ad85a', () => poly(ctx, [-9 + i * 2, -14, -10 + i * 2 - 2, -14 - h, -7 + i * 2, -14]), 0);
    }
  }
  // vestido roxo
  shape(ctx, vertical(ctx, -9, 14, chaos ? '#1e5a3a' : '#6a3aa0', chaos ? '#0a2416' : '#2e1450'), () =>
    poly(ctx, [-5, -9, 5, -9, 10, 14, 4, 12, 0, 14, -4, 12, -10, 14]),
  );
  shape(ctx, '#2a1a10', () => ctx.rect(-5.5, -1, 11, 2), 0.6);
  // varinha com orbe verde
  ctx.save();
  ctx.translate(6, -2);
  ctx.rotate(0.45 + cast * 0.6);
  line(ctx, '#6a4a2a', 1.6, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -12);
  });
  ctx.shadowColor = magic;
  ctx.shadowBlur = 8 + cast * 10;
  shape(ctx, chaos ? '#e0b0ff' : '#a8f080', () => circle(ctx, 0, -13, 2 + cast * 1.2), 0.6);
  ctx.restore();
  // rosto e cabelo
  const hy = -15;
  shape(ctx, '#2a1a3a', () => {
    ctx.moveTo(-7.5, hy - 2);
    ctx.quadraticCurveTo(-12, hy + 8 + sway, -8, hy + 12);
    ctx.lineTo(-4, hy + 4);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 7, '#e8f0d0', '#b8c8a0'), () => circle(ctx, 1, hy, 7));
  eye(ctx, 1, hy + 0.5, 1.8, '#3aa83a');
  eye(ctx, 5, hy + 0.5, 1.8, '#3aa83a');
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(3, hy + 3.4, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  witchHat(ctx, hy, chaos ? '#0e2a1a' : '#3a1a60', magic, sway * 0.5);
  if (chaos) {
    // runas do caos girando ao redor
    ctx.save();
    ctx.shadowColor = magic;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#e8c8ff';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 3; i++) {
      const a = p.time * 1.5 + (i * TAU) / 3;
      const rx = Math.cos(a) * 14;
      const ry = -6 + Math.sin(a) * 5;
      // runa: triângulo com um olho no meio
      ctx.beginPath();
      ctx.moveTo(rx, ry - 2.6);
      ctx.lineTo(rx + 2.3, ry + 1.6);
      ctx.lineTo(rx - 2.3, ry + 1.6);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#e8c8ff';
      ctx.beginPath();
      circle(ctx, rx, ry + 0.2, 0.7);
      ctx.fill();
    }
    ctx.restore();
  }
  if (formA(p)) {
    // estrelas no chapéu e livro flutuante
    ctx.fillStyle = GOLD;
    for (const [x, y] of [[-2, hy - 13], [2, hy - 17]] as const) {
      ctx.beginPath();
      circle(ctx, x, y, 1);
      ctx.fill();
    }
    const by = -8 + Math.sin(p.time * 3) * 2;
    shape(ctx, '#7a2a2a', () => ctx.roundRect(-16, by, 7, 9, 1), 0.8);
    shape(ctx, '#f4ecd8', () => ctx.rect(-15, by + 1, 5, 7), 0.4);
  }
  if (supremeWitch) {
    // olhos no chapéu e caldeirão pequeno flutuando ao lado
    for (const [x, y] of [[-1, -27], [3, -31]] as const) {
      shape(ctx, '#fff6c0', () => ellipse(ctx, x, y, 1.6, 1.1), 0.4);
      shape(ctx, '#1a0a1a', () => circle(ctx, x + 0.3, y, 0.6), 0);
    }
    const cy = -2 + Math.sin(p.time * 2.5) * 2;
    shape(ctx, '#2a2632', () => {
      ctx.moveTo(-18, cy);
      ctx.quadraticCurveTo(-19, cy + 6, -14, cy + 6);
      ctx.quadraticCurveTo(-9, cy + 6, -10, cy);
      ctx.closePath();
    }, 0.7);
    shape(ctx, '#8aff6a', () => ellipse(ctx, -14, cy, 4, 1.2), 0);
    halo(ctx, -14, cy - 2, 6, '#7ad85a', 0.5);
  }
  if (absoluteChaos) {
    // rachaduras de energia no cajado
    halo(ctx, 10, -13, 9, '#c86aff', 0.5 + cast * 0.4);
  }
}

export function drawCauldron(ctx: Ctx, p: Pose): void {
  const stir = Math.sin(p.time * 2.5);
  // Caldeirão Alquímico: bronze dourado, ouro líquido e moedas subindo
  const alchemy = formB(p);
  // Formas Supremas: Caldeirão do Fim (A, caldeirão de ossos roxo) e Pedra Filosofal (B, pedra vermelha flutuando)
  const doom = p.supreme && !alchemy;
  const stone = p.supreme && alchemy;
  if (formA(p)) {
    // chamas roxas por baixo
    ctx.save();
    ctx.shadowColor = '#b36bff';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 4; i++) {
      const h = 5 + Math.sin(p.time * 10 + i * 1.7) * 2.5;
      shape(ctx, '#c08cff', () => poly(ctx, [-7 + i * 4.5, 13, -5 + i * 4.5, 13 - h, -3 + i * 4.5, 13]), 0);
    }
    ctx.restore();
  }
  // pernas
  for (const x of [-8, 0, 8]) shape(ctx, '#1a1622', () => poly(ctx, [x - 1.5, 8, x + 1.5, 8, x + 1, 14, x - 1, 14]), 0.8);
  // caldeirão de ferro
  shape(ctx, radial(ctx, -2, 0, 14, alchemy ? '#e0b050' : doom ? '#e8e0d0' : '#4a4458', alchemy ? '#6a4810' : doom ? '#6a5a50' : '#141018'), () => {
    ctx.moveTo(-12, -6);
    ctx.quadraticCurveTo(-14, 10, 0, 10);
    ctx.quadraticCurveTo(14, 10, 12, -6);
    ctx.closePath();
  });
  shape(ctx, alchemy ? '#8a6418' : '#2a2632', () => ellipse(ctx, 0, -6, 13, 3.5), 1.2);
  if (alchemy) {
    // runa alquímica gravada na frente
    ctx.strokeStyle = '#fff0b0';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    circle(ctx, 0, 2, 3);
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 5);
    ctx.moveTo(-3, 2);
    ctx.lineTo(3, 2);
    ctx.stroke();
  }
  // poção borbulhando
  shape(ctx, radial(ctx, 0, -6, 11, alchemy ? '#fff4c0' : doom ? '#e0a8ff' : '#c8ffd8', alchemy ? '#e0a020' : doom ? '#6a1aa0' : '#3ab878'), () => ellipse(ctx, 0, -6, 11, 2.6), 0);
  ctx.fillStyle = alchemy ? '#ffe070' : '#d8ffe8';
  for (let i = 0; i < 4; i++) {
    const phase = (p.time * 1.6 + i * 0.25) % 1;
    ctx.globalAlpha = 1 - phase;
    ctx.beginPath();
    circle(ctx, -6 + i * 4, -7 - phase * 10, 1 + phase * 1.6);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (alchemy) {
    // moedas saltando da poção
    for (let i = 0; i < 2; i++) {
      const ph = (p.time * 0.9 + i * 0.5) % 1;
      const cx = -4 + i * 8;
      const cy = -8 - Math.sin(ph * Math.PI) * 9;
      shape(ctx, GOLD, () => ellipse(ctx, cx, cy, 2 * Math.abs(Math.cos(p.time * 6 + i)) + 0.4, 2), 0.6);
    }
  }
  // olhos dentro da poção (personalidade)
  glowingEye(ctx, -3, -6.2, 1.1, alchemy ? '#ffffff' : '#f0ff60');
  glowingEye(ctx, 2.5, -6.2, 1.1, alchemy ? '#ffffff' : '#f0ff60');
  // concha mexendo
  ctx.save();
  ctx.translate(5 + stir * 2, -7);
  ctx.rotate(-0.5 + stir * 0.2 - p.attack * 0.8);
  line(ctx, '#8a5a32', 1.8, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
  });
  ctx.restore();
  if (doom) {
    // caveiras penduradas na borda
    for (const x of [-9, 9]) {
      shape(ctx, '#f4ecd8', () => circle(ctx, x, -3, 2.2), 0.6);
      shape(ctx, '#1a0a1a', () => circle(ctx, x - 0.7, -3.3, 0.5), 0);
      shape(ctx, '#1a0a1a', () => circle(ctx, x + 0.7, -3.3, 0.5), 0);
    }
    halo(ctx, 0, -8, 14, '#b36bff', 0.4);
  }
  if (stone) {
    // pedra filosofal flutuando acima
    const sy = -20 + Math.sin(p.time * 2) * 2;
    halo(ctx, 0, sy, 8, '#ff3a3a', 0.6);
    ctx.save();
    ctx.translate(0, sy);
    ctx.rotate(p.time);
    shape(ctx, vertical(ctx, -4, 4, '#ff8a8a', '#a01020'), () => poly(ctx, [0, -4, 3.4, 0, 0, 4, -3.4, 0]), 0.6);
    ctx.restore();
  }
}

/** Heroína Bruxa: vestido preto, cabelo ruivo, cajado com orbe. */
export function drawWitch(ctx: Ctx, p: Pose): void {
  const step = walk(p, 11);
  const bob = p.moving ? Math.abs(step) * -1 : Math.sin(p.time * 2.4) * 0.5;
  const dress = skin(p, 'dress', '#1e1a26');
  const dressDark = skin(p, 'dressDark', '#08060c');
  const hair = skin(p, 'hair', '#d0502a');
  const accent = skin(p, 'accent', '#7ad85a');

  shape(ctx, hair, () => {
    ctx.moveTo(-6, -18 + bob);
    ctx.quadraticCurveTo(-13, -6 + bob, -9, 2 + bob);
    ctx.lineTo(-4, -8 + bob);
    ctx.closePath();
  });
  shape(ctx, vertical(ctx, -9, 14, dress, dressDark), () =>
    poly(ctx, [-5, -9 + bob, 5, -9 + bob, 9 + step, 14, 0, 12, -9 - step, 14]),
  );
  shape(ctx, accent, () => ctx.rect(-5.5, -1 + bob, 11, 2), 0.6);
  const hy = -15 + bob;
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 7));
  shape(ctx, hair, () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-2, hy - 6, 7, hy - 3);
    ctx.lineTo(7.5, hy - 5);
    ctx.quadraticCurveTo(0, hy - 9, -7, hy - 3);
    ctx.closePath();
  }, 0.8);
  eye(ctx, 1.2, hy + 0.5, 1.8, accent);
  eye(ctx, 5, hy + 0.5, 1.8, accent);
  witchHat(ctx, hy, skin(p, 'hat', '#141018'), skin(p, 'hatBand', '#e07a2a'), Math.sin(p.time * 2) * 0.6);
  // cajado com orbe
  ctx.save();
  ctx.translate(10, 2 + bob);
  ctx.rotate(0.2 + p.attack * 0.6);
  line(ctx, '#5a3a1a', 1.8, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8 + p.attack * 10;
  shape(ctx, accent, () => circle(ctx, 0, -17, 2.6 + p.attack), 0.6);
  ctx.restore();
}
