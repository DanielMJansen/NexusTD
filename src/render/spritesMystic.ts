// Sprites das raças Lobisomem, Fantasma e Bruxa (criaturas e heróis).
import {
  ascended,
  formA,
  formB,
  circle,
  darken,
  ellipse,
  flame,
  SPIRIT_FLAME,
  star,
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

/** Lobo espiritual translúcido sentado (matilha das Supremas). `s` = escala, `facing` = -1 olha para a esquerda. */
function spiritWolf(ctx: Ctx, x: number, y: number, s: number, t: number, color: string, facing = 1, howl = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * facing, s);
  ctx.globalAlpha *= 0.6;
  halo(ctx, 0, -6, 16, color, 0.5);
  shape(ctx, color, () => {
    ctx.moveTo(-6, 10);
    ctx.quadraticCurveTo(-16, 12, -15, 4);
    ctx.quadraticCurveTo(-11, 9, -5, 7);
    ctx.closePath();
  }, 0.6);
  shape(ctx, color, () => ellipse(ctx, -1, 3, 8, 11), 0.6);
  wolfHead(ctx, -15, color, darken(color, 0.35), '#ffffff', howl + Math.max(0, Math.sin(t * 0.8 + x) - 0.85) * 4, 0);
  ctx.restore();
}

/** Cores do Caçador em cada variante: pelo, barriga, calça e olhos. */
const HUNTER_VARIANTS = {
  // Lobo do Ártico: branco, olhos azuis
  rare: { fur: '#f2f6fc', furDark: '#a4b0c6', belly: '#ffffff', pants: '#4a5a7a', eyes: '#4ab8ff' },
  // Caçador de Runas: cinza-escuro com runas azuis, colar de dentes e braçadeira
  epic: { fur: '#6e6e7c', furDark: '#2a2a36', belly: '#a8a8b8', pants: '#3a2a1a', eyes: '#5ad8ff' },
  // Lobo Ronin: lobo branco de chapéu de palha, quimono vermelho, hakama e katana
  legendary: { fur: '#ece8e0', furDark: '#8a8478', belly: '#fff8f0', pants: '#2a2e4a', eyes: '#ff4a3a' },
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
    // Lua Sangrenta: lua vermelha enorme atrás, com crateras
    halo(ctx, -3, -20, 26, '#ff3a3a', 0.5);
    shape(ctx, radial(ctx, -6, -24, 17, '#ff9a8a', '#a01a1a'), () => circle(ctx, -3, -20, 16), 0.8);
    for (const [x, y, r] of [[-9, -26, 3], [2, -14, 2.4], [-1, -29, 1.8], [-10, -15, 1.6]] as const) shape(ctx, '#c83a3a', () => circle(ctx, x, y, r), 0);
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

  const ronin = p.variant === 'legendary';
  // cauda e pernas
  shape(ctx, furDark, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 2 + crouch, -17, -4);
    ctx.quadraticCurveTo(-12, 4, -5, 8);
    ctx.closePath();
  });
  shape(ctx, furDark, () => poly(ctx, [-6, 6, -2, 6, -1, 14, -7, 14]));
  shape(ctx, furDark, () => poly(ctx, [1, 6, 5, 6, 6, 14, 0, 14]));
  if (ronin) {
    // hakama larga com pregas até perto do chão
    shape(ctx, vertical(ctx, 3, 13, hv!.pants, darken(hv!.pants, 0.4)), () => poly(ctx, [-7, 3, 7, 3, 9, 12, 1.5, 12, 0, 8, -1.5, 12, -9, 12]), 1);
    line(ctx, '#4a5078', 0.6, () => {
      for (const x of [-5, -2.5, 3, 5.5]) {
        ctx.moveTo(x, 4);
        ctx.lineTo(x * 1.2, 11.5);
      }
    }, false);
  }
  // tronco curvado para frente, calça rasgada
  ctx.save();
  ctx.rotate(0.15);
  shape(ctx, radial(ctx, 0, 0, 11, fur, furDark), () => ellipse(ctx, 0, -1 + crouch, 8, 10));
  if (!ronin) shape(ctx, hv ? hv.belly : '#c8a880', () => ellipse(ctx, 3, 1 + crouch, 4, 6), 0.8);
  if (!ronin) shape(ctx, hv ? hv.pants : '#3a3050', () => poly(ctx, [-7, 4, 7, 4, 6, 9, 3, 7, 0, 9, -3, 7, -6, 9]), 1);
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
  if (ronin) {
    // quimono vermelho cruzado com gola branca e faixa (obi)
    shape(ctx, vertical(ctx, -10, 5, feral ? '#7a141c' : '#b8242e', '#5a0a10'), () => {
      ctx.moveTo(-7.5, -6 + crouch);
      ctx.quadraticCurveTo(-4, -11 + crouch, 1, -10 + crouch);
      ctx.lineTo(7, -5 + crouch);
      ctx.lineTo(7, 4);
      ctx.lineTo(-7.5, 4);
      ctx.closePath();
    }, 1);
    // gola branca em V
    line(ctx, '#fff8f0', 1.4, () => {
      ctx.moveTo(-1.5, -10 + crouch);
      ctx.lineTo(2, -3 + crouch);
      ctx.lineTo(5.5, -8 + crouch);
    }, false);
    shape(ctx, '#2a2e4a', () => ctx.rect(-7.5, 1.5, 14.5, 2.6), 0.6);
  }
  ctx.restore();
  if (primal) {
    // Fera Primal: juba de brasas ardendo nas costas e nos ombros (por cima do tronco)
    halo(ctx, -5, -12, 16, '#ff6a1a', 0.5);
    for (let i = 0; i < 6; i++) flame(ctx, -10 + i * 2.6, -7 - Math.sin((i / 5) * Math.PI) * 4 + crouch, 3.2, 13 - Math.abs(i - 2.5) * 1.6, -0.7 + i * 0.16, p.time + i);
  }
  // braço com garras: golpe de cima para baixo (prateadas e longas no Lunar, enormes no Feral)
  const clawLen = feral ? 7 : lunar ? 6 : 4;
  const clawColor = lunar ? '#e8f4ff' : '#f4ecd8';
  ctx.save();
  ctx.translate(5, -5 + crouch);
  ctx.rotate(-0.8 + swipe * 1.6);
  if (ronin) {
    // manga larga do quimono e a mão segurando o cabo
    shape(ctx, vertical(ctx, -3, 6, feral ? '#7a141c' : '#b8242e', '#5a0a10'), () => poly(ctx, [-1, -2.4, 7, -1.2, 7.5, 3.6, 2, 6, -1, 3]), 0.9);
    shape(ctx, fur, () => circle(ctx, 8.6, 1.4, 2), 0.8);
  } else {
    line(ctx, fur, feral ? 4.4 : 3.6, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 2);
    });
  }
  if (p.variant === 'epic') shape(ctx, '#5a3a1e', () => ctx.roundRect(4, -0.6, 4, 4, 1), 0.6);
  if (lunar) halo(ctx, 12, 1, 5, '#bfe8ff', 0.6);
  if (ronin) {
    // katana: cabo trançado, guarda redonda e lâmina curva (mais longa no Feral)
    const len = feral ? 20 : 16;
    shape(ctx, '#1a1a24', () => ctx.roundRect(7, 0.2, 6, 2.4, 1), 0.5);
    shape(ctx, GOLD, () => ellipse(ctx, 13.4, 1.4, 0.9, 2.4), 0.5);
    shape(ctx, vertical(ctx, -3, 3, '#ffffff', '#a8b0c0'), () => {
      ctx.moveTo(14, 0.4);
      ctx.quadraticCurveTo(14 + len * 0.6, -0.6, 14 + len, -3);
      ctx.quadraticCurveTo(14 + len * 0.6, 1.6, 14, 2.4);
      ctx.closePath();
    }, 0.6);
    if (swipe > 0.3) {
      ctx.save();
      ctx.globalAlpha *= swipe * 0.6;
      line(ctx, '#ffffff', 1.4, () => ctx.arc(0, 0, 14 + len * 0.8, -0.9, 0.3), false);
      ctx.restore();
    }
  } else {
    for (const dy of [-1.5, 0.5, 2.5]) shape(ctx, clawColor, () => poly(ctx, [10, dy, 10 + clawLen, dy + 0.6, 10, dy + 1.2 + (feral ? 0.4 : 0)]), 0.5);
  }
  ctx.restore();
  if (p.variant === 'epic') {
    // colar de dentes
    for (let i = 0; i < 5; i++) shape(ctx, '#f4ecd8', () => poly(ctx, [-3 + i * 2.2, -9 + crouch, -1.6 + i * 2.2, -9 + crouch, -2.3 + i * 2.2, -6 + crouch]), 0.4);
  }
  wolfHead(ctx, -15 + crouch, fur, furDark, hv ? hv.eyes : feral ? '#ff2a2a' : ascended(p) ? '#9fdcff' : '#ffd23a', 0, swipe);
  if (ronin) {
    // chapéu de palha cônico (kasa) bem largo
    const hy = -15 + crouch;
    shape(ctx, vertical(ctx, hy - 14, hy - 5, '#f0d890', '#a8803a'), () => {
      ctx.moveTo(-10, hy - 5);
      ctx.quadraticCurveTo(-2, hy - 12, 3, hy - 14);
      ctx.quadraticCurveTo(8, hy - 12, 17, hy - 5);
      ctx.quadraticCurveTo(3, hy - 7.5, -10, hy - 5);
      ctx.closePath();
    }, 1);
    line(ctx, '#a8803a', 0.5, () => {
      for (const x of [-4, 0, 6, 10]) {
        ctx.moveTo(3, hy - 13.5);
        ctx.lineTo(x, hy - 6.6);
      }
    }, false);
  }
  if (lunar && !ronin) {
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
  if (king) {
    // Rei Lobo: dois lobos espirituais da matilha sentados ao lado dele
    spiritWolf(ctx, -15, 5, 0.6, p.time, '#cfe6ff', -1);
    spiritWolf(ctx, 16, 6, 0.6, p.time + 2, '#cfe6ff', 1);
  }
  if (wrecker) {
    // Destruidor: pedras pontudas rompendo o chão ao redor
    shape(ctx, '#2a201a88', () => ellipse(ctx, 0, 13, 20, 4), 0);
    for (const [x, h, a] of [[-17, 12, -0.35], [-11, 8, -0.15], [12, 10, 0.2], [18, 13, 0.4]] as const) {
      ctx.save();
      ctx.translate(x, 13);
      ctx.rotate(a);
      shape(ctx, vertical(ctx, -h, 0, '#a89a8a', '#4a3e34'), () => poly(ctx, [-3, 0, -1, -h, 1.5, -h * 0.8, 3, 0]), 0.9);
      ctx.restore();
    }
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
  // Orthros: lobo de duas cabeças, pelo ruivo-escuro e coleiras de espinhos
  legendary: { fur: '#a8603a', furDark: '#4a2010', eyes: '#ffd040' },
} as const;

/** Coleira de couro com espinhos, ao redor de um pescoço. */
function spikedCollar(ctx: Ctx, x: number, y: number, w: number, tilt: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  shape(ctx, '#3a2418', () => ctx.roundRect(-w / 2, -1.2, w, 2.4, 1.2), 0.7);
  for (let i = 0; i < 3; i++) shape(ctx, '#e0e4ec', () => poly(ctx, [-w / 3 + i * (w / 3) - 0.8, 1.2, -w / 3 + i * (w / 3) + 0.8, 1.2, -w / 3 + i * (w / 3), 3.4]), 0.4);
  ctx.restore();
}

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
    // Uivo do Eclipse: eclipse enorme atrás, com coroa de raios de luz
    halo(ctx, -5, -22, 28, '#e8d8ff', 0.6);
    ctx.save();
    ctx.translate(-5, -22);
    ctx.rotate(p.time * 0.3);
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      const len = i % 2 ? 19 : 23;
      shape(ctx, '#f4ecff', () => poly(ctx, [Math.cos(a - 0.08) * 14, Math.sin(a - 0.08) * 14, Math.cos(a) * len, Math.sin(a) * len, Math.cos(a + 0.08) * 14, Math.sin(a + 0.08) * 14]), 0);
    }
    ctx.restore();
    shape(ctx, '#0a0612', () => circle(ctx, -5, -22, 14), 1);
  } else if (lunar) {
    // Uivo Lunar: lua cheia grande atrás, com crateras
    halo(ctx, -8, -24, 16, '#bfe8ff', 0.55);
    shape(ctx, radial(ctx, -10, -26, 10, '#ffffff', '#c8dcf0'), () => circle(ctx, -8, -24, 9), 0.6);
    for (const [x, y, r] of [[-11, -27, 1.8], [-6, -21, 1.4], [-5, -27, 1]] as const) shape(ctx, '#b8cce4', () => circle(ctx, x, y, r), 0);
  }
  if (horn) {
    // Trompa da Matilha: dois lobos espirituais uivando atrás
    spiritWolf(ctx, -14, 2, 0.7, p.time, '#ffb88a', 1, Math.min(1, howl + 0.4));
    spiritWolf(ctx, 13, 4, 0.6, p.time + 1, '#ffb88a', -1, Math.min(1, howl + 0.4));
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
  if (p.variant === 'legendary') {
    // Orthros: segunda cabeça atrás, num pescoço próprio, uivando fora de compasso
    shape(ctx, radial(ctx, -8, -8, 8, darken(fur, 0.15), furDark), () => ellipse(ctx, -8, -8, 4.6, 8, -0.6));
    const howl2 = Math.max(p.attack, Math.max(0, Math.sin(p.time * 0.9 + 2) - 0.8) * 5);
    ctx.save();
    ctx.translate(-14, -1);
    ctx.scale(-1, 1);
    ctx.translate(-6, 0);
    wolfHead(ctx, -15, darken(fur, 0.15), furDark, wv!.eyes, Math.min(1, howl2), 0);
    ctx.restore();
    spikedCollar(ctx, -9, -11, 8, -0.6);
  }
  wolfHead(ctx, -15, fur, furDark, wv ? wv.eyes : war ? '#ff3a1a' : lunar ? '#9fdcff' : '#ffd23a', Math.min(1, howl), 0);
  if (p.variant === 'legendary') spikedCollar(ctx, 2, -8, 9, 0.1);
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
  const look = skin(p, 'look', '');
  if (look === 'shadow') {
    // algema com a corrente partida pendurada no pulso
    shape(ctx, '#8a8698', () => ctx.roundRect(5, -2.4, 3, 4.8, 1), 0.6);
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = '#8a8698';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ellipse(ctx, 6.5 + Math.sin(p.time * 4 + k) * 0.5, 4 + k * 2.6, 0.9, 1.4);
      ctx.stroke();
    }
  }
  ctx.restore();
  wolfHead(ctx, -16 + bob, fur, furDark, look === 'shadow' ? '#c86aff' : look === 'arctic' ? '#7ad8ff' : '#ffd23a', 0, p.attack);
  if (look === 'shadow') halo(ctx, 6.5, -17.5 + bob, 5, '#c86aff', 0.7);
  if (look === 'arctic') {
    // gelo cristalizado nos ombros e bafo gelado
    for (const [x, h, a] of [[-6, 6, -0.6], [-3.5, 8, -0.2], [4, 7, 0.3], [6.5, 5, 0.6]] as const) {
      ctx.save();
      ctx.translate(x, -8 + bob);
      ctx.rotate(a);
      shape(ctx, vertical(ctx, -h, 0, '#ffffff', '#7ac8f0'), () => poly(ctx, [-1.4, 0, 0, -h, 1.4, 0]), 0.6);
      ctx.restore();
    }
    const k = (p.time * 0.8) % 1;
    halo(ctx, 17 + k * 4, -14 + bob - k * 2, 2 + k * 3, '#e8fbff', 0.7 * (1 - k));
  }
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

/** Cores da Assombração em cada variante: lençol, barra, braço, olhos ocos e brilho dos olhos. */
const HAUNT_VARIANTS = {
  // Fantasma do Lampião: âmbar e quente, como luz de vela
  rare: { body: '#fffae4', edge: '#ffc04a50', arm: '#fff0c8', hole: '#5a3008', glint: '#ffd040' },
  // Cavaleiro Fantasma: aço espectral, elmo quebrado e espada
  epic: { body: '#d0d8ea', edge: '#5a6a9a60', arm: '#bcc6de', hole: '#141a2e', glint: '#8ab8ff' },
  // Casa Assombrada: casinha torta flutuando, janelas como olhos e a porta como boca
  legendary: { body: '#8a7a9a', edge: '#4a3e5a00', arm: '#d8d0ec', hole: '#1a1024', glint: '#ffd25a' },
} as const;

/** Casa Assombrada: paredes de tábua, telhado pontudo com chaminé, janelas-olhos e porta-boca. */
function hauntedHouse(ctx: Ctx, t: number, attack: number, walls: string, angry: boolean): void {
  // fiapos de lençol fantasma por baixo
  ctx.save();
  ctx.globalAlpha *= 0.7;
  for (let i = 0; i < 3; i++) {
    const x = -6 + i * 6;
    shape(ctx, vertical(ctx, 4, 14, '#e8e0ff', '#e8e0ff00'), () => {
      ctx.moveTo(x - 3, 4);
      ctx.quadraticCurveTo(x - 2 + Math.sin(t * 4 + i) * 2, 10, x + Math.sin(t * 3 + i) * 1.5, 14);
      ctx.quadraticCurveTo(x + 2, 9, x + 3, 4);
      ctx.closePath();
    }, 0);
  }
  ctx.restore();
  // chaminé e telhado
  shape(ctx, vertical(ctx, -28, -20, '#6a4a4a', '#3a2424'), () => ctx.rect(6, -28, 3.6, 8), 0.8);
  shape(ctx, vertical(ctx, -18, 6, walls, darken(walls, 0.5)), () => ctx.roundRect(-9, -17, 19, 23, 1));
  line(ctx, darken(walls, 0.45), 0.5, () => {
    for (const y of [-12, -7, -2, 3]) {
      ctx.moveTo(-8.5, y);
      ctx.lineTo(9.5, y + 0.4);
    }
  }, false);
  shape(ctx, vertical(ctx, -30, -15, '#3a2e4e', '#1a1226'), () => poly(ctx, [-12.5, -15, 0.5, -30, 13.5, -15]));
  line(ctx, '#5a4a6a', 0.5, () => {
    for (const k of [0.35, 0.65]) {
      ctx.moveTo(-12.5 + 13 * k, -15 - 15 * k);
      ctx.lineTo(13.5 - 13 * k, -15 - 15 * k);
    }
  }, false);
  // janelas acesas (olhos), com cruz de madeira e sobrancelha de telha
  const flicker = 0.8 + Math.sin(t * 7) * 0.1;
  for (const x of [-4.5, 5]) {
    halo(ctx, x, -11, 5, '#ffd25a', 0.5 * flicker);
    shape(ctx, '#ffd25a', () => ctx.rect(x - 2.4, -13.4, 4.8, 4.8), 0.8);
    line(ctx, '#3a2424', 0.6, () => {
      ctx.moveTo(x, -13.4);
      ctx.lineTo(x, -8.6);
      ctx.moveTo(x - 2.4, -11);
      ctx.lineTo(x + 2.4, -11);
    }, false);
    line(ctx, '#1a1226', 1.1, () => {
      ctx.moveTo(x - 3, angry ? -15.6 + (x < 0 ? -1 : 1) : -15);
      ctx.lineTo(x + 3, angry ? -15.6 + (x < 0 ? 1 : -1) : -15);
    }, false);
  }
  // porta em arco: a boca, que escancara no ataque
  const open = 2 + attack * 3;
  shape(ctx, '#1a1024', () => {
    ctx.moveTo(-2.4, 6);
    ctx.lineTo(-2.4, 6 - open * 1.6);
    ctx.arc(0.6, 6 - open * 1.6, 3, Math.PI, TAU);
    ctx.lineTo(3.6, 6);
    ctx.closePath();
  }, 0.8);
  halo(ctx, 0.6, 3, 3 + attack * 3, '#ffb040', 0.5);
}

/** Elos de corrente ao longo de uma linha (correntes do Espírito Vingativo). */
function chainLinks(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, count: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  const angle = Math.atan2(y1 - y0, x1 - x0);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    ctx.beginPath();
    ellipse(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 1.7, 1.1, angle + (i % 2 ? Math.PI / 2 : 0));
    ctx.stroke();
  }
  ctx.restore();
}

export function drawHaunt(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2.5) * 2 - 4;
  ctx.translate(0, float);
  ctx.globalAlpha *= 0.92;
  // Aparição Gélida: lençol azul-gelo, estilhaços de gelo girando
  const frost = formB(p);
  // Espírito Vingativo (A): correntes cruzando o corpo, algema no braço, olhar furioso
  const vengeful = formA(p);
  // Formas Supremas: Ira Eterna (A, chamas azuis e correntes quebradas) e Inverno Fantasma (B, névoa congelante)
  const wrath = p.supreme && !frost;
  const winter = p.supreme && frost;
  const hv = p.variant ? HAUNT_VARIANTS[p.variant] : null;
  if (winter) for (let i = 0; i < 4; i++) {
    const a = p.time * 0.7 + (i * TAU) / 4;
    halo(ctx, Math.cos(a) * 15, 4 + Math.sin(a) * 5, 7, '#e8fbff', 0.45);
  }
  if (wrath) {
    // Ira Eterna: corpo envolto num incêndio de chamas espectrais azuis
    halo(ctx, 0, -8, 26, '#5a8aff', 0.5);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.36;
      flame(ctx, Math.cos(a) * 11, -8 + Math.sin(a) * 13, 3.8, 14, a + Math.PI / 2, p.time + i, SPIRIT_FLAME);
    }
  }
  if (winter) {
    // Inverno Fantasma: leque de estacas de gelo enormes atrás
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.38;
      const len = 36 - Math.abs(i - 3) * 3.5;
      ctx.save();
      ctx.translate(0, -10);
      ctx.rotate(a + Math.PI / 2);
      shape(ctx, vertical(ctx, -len, 0, '#ffffff', '#6ab8f0'), () => poly(ctx, [-3.4, -10, 0, -len, 3.4, -10]), 0.8);
      ctx.restore();
    }
  }
  const house = p.variant === 'legendary';
  // Lampião: brilho quente de vela em volta
  if (p.variant === 'rare') halo(ctx, 0, -8, 16, '#ffc040', 0.4 + Math.sin(p.time * 6) * 0.05);
  const bodyTop = hv ? (frost ? darken(hv.body, 0.15) : hv.body) : wrath ? '#c8d8ff' : frost ? '#e0f0ff' : '#e8fffa';
  if (house) {
    // a casa balança torta enquanto flutua
    ctx.rotate(Math.sin(p.time * 1.6) * 0.06);
    hauntedHouse(ctx, p.time, p.attack, bodyTop, vengeful);
  } else ghostBody(ctx, p.time, -24, bodyTop, hv ? hv.edge : wrath ? '#3a5aff60' : frost ? '#5a9aff60' : '#8ce8d840');
  if (vengeful) {
    // correntes cruzando o corpo
    chainLinks(ctx, -9, -16, 8, 2, 6, '#7a8098');
    chainLinks(ctx, 8, -14, -8, 6, 6, '#7a8098');
  }
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
  shape(ctx, hv ? hv.arm : frost ? '#c8e0ff' : '#d0f8f0', () => {
    ctx.moveTo(6, -6);
    ctx.quadraticCurveTo(14 + p.attack * 4, -8, 16 + p.attack * 5, -2);
    ctx.quadraticCurveTo(12, -2, 7, -1);
    ctx.closePath();
  }, 1);
  if (vengeful) {
    // algema no pulso com o resto da corrente quebrada pendurado
    shape(ctx, '#8a90a8', () => ctx.roundRect(11.5 + p.attack * 3, -6.5, 3.4, 4.4, 1), 0.7);
    chainLinks(ctx, 13 + p.attack * 3, -2, 12 + p.attack * 3, 7, 3, '#8a90a8');
  }
  if (p.variant === 'epic') {
    // espada espectral na mão
    ctx.save();
    ctx.translate(15 + p.attack * 5, -3);
    ctx.rotate(-0.9 + p.attack * 1.2);
    halo(ctx, 0, -9, 6, '#8ab8ff', 0.5);
    shape(ctx, vertical(ctx, -16, 0, '#ffffff', '#8ab8ff'), () => poly(ctx, [-1.3, -1, 0, -17, 1.3, -1]), 0.6);
    shape(ctx, '#5a6a9a', () => ctx.rect(-3, -1.4, 6, 1.4), 0.5);
    ctx.restore();
  }
  // olhos ocos e boca (na Casa, são as janelas e a porta)
  const hole = hv ? hv.hole : '#0e2a26';
  if (!house) {
    shape(ctx, hole, () => ellipse(ctx, 0, -14, 2.2, 3), 0);
    shape(ctx, hole, () => ellipse(ctx, 5.5, -14, 2.2, 3), 0);
    shape(ctx, hole, () => ellipse(ctx, 3, -7, 2, 2.6 + p.attack * 1.5), 0);
    ctx.fillStyle = hv ? hv.glint : frost ? '#bfe8ff' : '#8ce8d8';
    ctx.beginPath();
    circle(ctx, 0.6, -14.6, 0.8);
    circle(ctx, 6.1, -14.6, 0.8);
    ctx.fill();
  }
  if (vengeful && !house) {
    // sobrancelhas furiosas sobre os olhos ocos
    line(ctx, hole, 1.2, () => {
      ctx.moveTo(-2.4, -18.2);
      ctx.lineTo(2, -16.6);
      ctx.moveTo(8, -18.2);
      ctx.lineTo(3.6, -16.6);
    }, false);
  }
  if (p.variant === 'epic') {
    // elmo de cavaleiro quebrado, com pluma rasgada
    shape(ctx, vertical(ctx, -27, -17, '#e4eaf6', '#8a96b4'), () => {
      ctx.moveTo(-7.5, -17.5);
      ctx.quadraticCurveTo(-8, -26, 1, -26.5);
      ctx.quadraticCurveTo(9.5, -26, 9, -17.5);
      ctx.lineTo(5, -19);
      ctx.lineTo(4, -17.5);
      ctx.lineTo(2.5, -20);
      ctx.lineTo(0, -17.5);
      ctx.closePath();
    }, 1);
    line(ctx, '#5a6a8a', 0.7, () => {
      ctx.moveTo(4, -26);
      ctx.lineTo(3, -22.5);
      ctx.lineTo(5, -21);
    }, false);
    shape(ctx, '#7a9ad8', () => poly(ctx, [-1, -26, -7, -31, -5, -28.5, -9, -29, -3, -25]), 0.6);
  }
  if (frost && house) {
    // pingentes de gelo no beiral do telhado
    for (let x = -11; x <= 12; x += 3) shape(ctx, '#e8fbff', () => poly(ctx, [x - 1, -15, x + 1, -15, x, -11.5 - (x % 2 ? 0 : 1)]), 0.4);
  } else if (frost) {
    // coroa de gelo
    for (const [x, h] of [[-3, 5], [1, 7], [5, 5]] as const) {
      shape(ctx, vertical(ctx, -22 - h, -21, '#ffffff', '#8ad0ff'), () => poly(ctx, [x - 1.5, -21, x, -21 - h, x + 1.5, -21]), 0.7);
    }
  }
  if (house) {
    // chaminé: fumaça fantasma (chamas espectrais no Espírito Vingativo)
    if (formA(p)) flame(ctx, 7.8, -28, 2.2, wrath ? 9 : 7, 0, p.time, wrath ? SPIRIT_FLAME : { outer: ['#9affe0', '#2ac8a0'], inner: ['#ffffff', '#c8fff0'], glow: '#5ae8c8' });
    else for (let i = 0; i < 3; i++) {
      const k = (p.time * 0.5 + i / 3) % 1;
      halo(ctx, 7.8 - k * 6, -30 - k * 10, 2.5 + k * 3, '#d8d0ec', 0.7 * (1 - k));
    }
  } else if (formA(p) && p.variant !== 'epic') {
    // chamas espectrais em gota na cabeça (azuis e altas na Ira Eterna)
    const colors = wrath ? SPIRIT_FLAME : { outer: ['#9affe0', '#2ac8a0'] as const, inner: ['#ffffff', '#c8fff0'] as const, glow: '#5ae8c8' };
    const count = wrath ? 3 : 2;
    for (let i = 0; i < count; i++) flame(ctx, (count === 3 ? -4 : -2) + i * 4.5, -21, 2, wrath ? 8 : 6, (i - (count - 1) / 2) * 0.25, p.time + i, colors);
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
  if (winter && !house) {
    // coroa de gelo maior
    for (const [x, h] of [[-6, 6], [-2, 9], [2, 11], [6, 9], [10, 6]] as const) {
      shape(ctx, vertical(ctx, -22 - h, -21, '#ffffff', '#8ad0ff'), () => poly(ctx, [x - 1.4, -21, x, -21 - h, x + 1.4, -21]), 0.6);
    }
  }
}

/** Cores da Banshee em cada variante: cabelo, vestido, rosto, olhos e braços (a forma B escurece). */
const BANSHEE_VARIANTS = {
  // Banshee Carmesim: vestido vinho e cabelo ruivo
  rare: { hair: ['#d0402e', '#6a141080'], dress: ['#9a1a3e', '#3a0a1a00'], face: ['#fff4f0', '#e8c0c0'], eyes: '#ff6a8a', arm: '#f0c8c8' },
  // Noiva Cadáver: vestido de noiva rendado, véu, cabelo escuro e buquê murcho
  epic: { hair: ['#3e2e44', '#1a0e2080'], dress: ['#faf6ee', '#c8bca800'], face: ['#e8eef0', '#a8b8c0'], eyes: '#8affd8', arm: '#dfe6ea' },
  // Organista Fantasma: órgão de tubos atrás, vestido vitoriano e notas musicais no ar
  legendary: { hair: ['#ece8f4', '#8a84a880'], dress: ['#4a2a5a', '#1a0a2a00'], face: ['#f4f0f8', '#c0b8d0'], eyes: '#ffd8a0', arm: '#e0d8ec' },
} as const;

/** Órgão de tubos atrás da Organista: tubos em arco, base de madeira entalhada. */
function pipeOrgan(ctx: Ctx, t: number, scream: number): void {
  const heights = [16, 22, 28, 34, 28, 22, 16];
  heights.forEach((h, i) => {
    const x = -15 + i * 5;
    const hum = scream * Math.sin(t * 20 + i) * 0.6;
    shape(ctx, vertical(ctx, 6 - h, 6, '#f0dca0', '#8a6a2a'), () => ctx.roundRect(x - 1.9, 6 - h + hum, 3.8, h, [1.9, 1.9, 0, 0]), 0.8);
    shape(ctx, '#2a1a10', () => ellipse(ctx, x, 6 - h * 0.35, 1, 0.6), 0);
  });
  shape(ctx, vertical(ctx, 4, 12, '#6a3a1e', '#2a140a'), () => ctx.roundRect(-18, 4, 36, 6, 1.5), 0.9);
  line(ctx, '#c8a050', 0.6, () => {
    ctx.moveTo(-17, 6.5);
    ctx.lineTo(17, 6.5);
  }, false);
}

/** Notas musicais subindo (mais rápidas no grito). */
function musicNotes(ctx: Ctx, t: number, scream: number): void {
  for (let i = 0; i < 3; i++) {
    const k = (t * (0.4 + scream * 0.6) + i / 3) % 1;
    const x = 8 + i * 4 + Math.sin(k * 6 + i) * 2;
    const y = -12 - k * 18;
    ctx.save();
    ctx.globalAlpha *= 1 - k;
    shape(ctx, '#ffe8b0', () => ellipse(ctx, x, y, 1.3, 1, -0.4), 0.4);
    line(ctx, '#ffe8b0', 0.6, () => {
      ctx.moveTo(x + 1.1, y - 0.2);
      ctx.lineTo(x + 1.1, y - 4.5);
      ctx.lineTo(x + 2.8, y - 3.6);
    }, false);
    ctx.restore();
  }
}

export function drawBanshee(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2) * 2 - 4;
  const scream = p.attack;
  ctx.translate(0, float);
  const dread = formB(p);
  // Banshee Ancestral (A): cabelo bem mais volumoso e diadema grande
  const ancestral = formA(p);
  // Formas Supremas: Lamento Final (A, cabelo erguido) e Pesadelo (B, máscara de caveira e sombras)
  const lament = p.supreme && !dread;
  const nightmare = p.supreme && dread;
  const bv = p.variant ? BANSHEE_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (bv && dread ? darken(c.slice(0, 7), 0.3) + c.slice(7) : c);
  const eyes = bv ? bv.eyes : dread ? '#ff2a4a' : '#6a9aff';
  if (p.variant === 'legendary') {
    // o órgão fica no chão: desfaz a flutuação só para ele
    ctx.save();
    ctx.translate(0, -float);
    pipeOrgan(ctx, p.time, scream);
    ctx.restore();
  }
  if (lament) {
    // Lamento Final: ondas do grito enormes saindo dela, sempre ecoando
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const k = (p.time * 0.8 + i / 3) % 1;
      ctx.globalAlpha = (1 - k) * 0.7;
      ctx.strokeStyle = '#cfe0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(3, -11, 8 + k * 22, -0.9, 0.9);
      ctx.stroke();
    }
    ctx.restore();
    // cabelo erguido como chamas pálidas
    for (let i = 0; i < 6; i++) {
      const x = -7 + i * 2.8;
      const h = 20 + Math.sin(p.time * 6 + i) * 3 + scream * 4;
      shape(ctx, '#f0f4ffcc', () => {
        ctx.moveTo(x - 1.6, -21);
        ctx.quadraticCurveTo(x - 3, -21 - h * 0.6, x + Math.sin(p.time * 4 + i) * 2, -21 - h);
        ctx.quadraticCurveTo(x + 1, -21 - h * 0.5, x + 1.6, -21);
        ctx.closePath();
      }, 0.5);
    }
  }
  if (nightmare) {
    // Pesadelo: tentáculos de sombra enormes erguendo-se atrás
    halo(ctx, 0, -6, 24, '#6a2aa0', 0.5);
    for (let i = 0; i < 6; i++) {
      const x = -15 + i * 6;
      const top = -30 + Math.abs(i - 2.5) * 5;
      const sway = Math.sin(p.time * 2 + i) * 4;
      shape(ctx, vertical(ctx, top, 14, '#7a3ab0', '#1a0a2a'), () => {
        ctx.moveTo(x - 3, 14);
        ctx.quadraticCurveTo(x - 4 + sway, (top + 14) / 2, x + sway * 1.4, top);
        ctx.quadraticCurveTo(x + 3 + sway, (top + 14) / 2, x + 3, 14);
        ctx.closePath();
      }, 0.8);
      shape(ctx, '#c86aff', () => circle(ctx, x + sway * 1.2, top + 4, 0.8), 0);
    }
  }
  // cabelo longo esvoaçando para trás (bem mais volumoso na Ancestral)
  const big = ancestral ? 1.4 : 1;
  const hairTop = bv ? shadeB(bv.hair[0]) : dread ? '#3a2050' : '#f0f4ff';
  ctx.save();
  ctx.translate(-2, -24);
  ctx.scale(big, big);
  ctx.translate(2, 24);
  shape(ctx, vertical(ctx, -24, 10, hairTop, bv ? bv.hair[1] : dread ? '#1a0a2a80' : '#9ab0e080'), () => {
    ctx.moveTo(-2, -24);
    ctx.quadraticCurveTo(-14, -22, -18, -6 + Math.sin(p.time * 4) * 2);
    ctx.quadraticCurveTo(-12, -8, -16, 6 + Math.sin(p.time * 4 + 1) * 2);
    ctx.quadraticCurveTo(-6, -2, -4, -6);
    ctx.closePath();
  });
  ctx.restore();
  if (p.variant === 'epic') {
    // véu de noiva translúcido caindo atrás
    ctx.save();
    ctx.globalAlpha *= 0.55;
    shape(ctx, vertical(ctx, -26, 12, '#ffffff', '#ffffff00'), () => {
      ctx.moveTo(-4, -24);
      ctx.quadraticCurveTo(-16, -20, -20, 10 + Math.sin(p.time * 3) * 2);
      ctx.lineTo(-6, 6);
      ctx.quadraticCurveTo(-6, -10, 2, -25);
      ctx.closePath();
    }, 0);
    ctx.restore();
  }
  // vestido de névoa
  const g = ctx.createLinearGradient(0, -10, 0, 14);
  g.addColorStop(0, bv ? shadeB(bv.dress[0]) : dread ? '#5a2a8a' : '#c8d8ff');
  g.addColorStop(1, bv ? bv.dress[1] : dread ? '#2a0a4a00' : '#8aa0e000');
  shape(ctx, g, () => {
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -9);
    ctx.quadraticCurveTo(10, 4, 8, 13 + Math.sin(p.time * 5) * 2);
    ctx.lineTo(0, 9);
    ctx.lineTo(-8, 13 + Math.sin(p.time * 5 + 1) * 2);
    ctx.quadraticCurveTo(-9, 2, -6, -9);
    ctx.closePath();
  });
  if (p.variant === 'epic') {
    // renda na barra do vestido
    for (let i = 0; i < 6; i++) shape(ctx, '#ffffff', () => circle(ctx, -6.5 + i * 2.6, 9 + (i % 2) * 1.2, 1.2), 0.4);
  }
  // braços abertos
  line(ctx, bv ? bv.arm : dread ? '#8a6ab0' : '#d8e4ff', 2.2, () => {
    ctx.moveTo(4, -6);
    ctx.lineTo(13 + scream * 3, -11 - scream * 2);
  });
  if (p.variant === 'epic') {
    // buquê murcho na mão
    const bx = 13 + scream * 3;
    const by = -11 - scream * 2;
    for (const [dx, dy, c] of [[0, -1.5, '#8a5a7a'], [1.8, 0, '#6a4a5a'], [-1.4, 0.4, '#a87a8a']] as const) shape(ctx, c, () => circle(ctx, bx + dx, by + dy, 1.5), 0.5);
    line(ctx, '#5a6a3a', 0.8, () => {
      ctx.moveTo(bx, by + 1);
      ctx.lineTo(bx - 1, by + 5);
    }, false);
  }
  // rosto e boca do grito
  shape(ctx, radial(ctx, 1, -15, 7, bv ? bv.face[0] : dread ? '#e8dcf0' : '#ffffff', bv ? bv.face[1] : dread ? '#9a88b8' : '#b8c8f0'), () => ellipse(ctx, 1, -15, 6.5, 7.5));
  shape(ctx, hairTop, () => {
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
  if (p.variant === 'legendary') {
    // gola alta de renda e notas subindo
    shape(ctx, '#f4f0f8', () => poly(ctx, [-4, -9, -6, -12, -2, -10, 1, -12, 4, -10, 8, -12, 6, -9]), 0.6);
    musicNotes(ctx, p.time, scream);
  }
  if (ancestral) {
    // diadema grande, com joia
    shape(ctx, vertical(ctx, -30, -21, '#ffffff', '#b8c4e0'), () => poly(ctx, [-5.5, -21.5, -4.5, -27, -1.5, -24, 1.5, -30, 4.5, -24, 7.5, -27, 8.5, -21.5]), 0.8);
    halo(ctx, 1.5, -25, 4, bv ? bv.eyes : '#6a9aff', 0.7);
    shape(ctx, bv ? bv.eyes : '#6a9aff', () => circle(ctx, 1.5, -25, 1.6), 0.5);
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

/** Cores da Feiticeira em cada variante: vestido, chapéu, faixa, cabelo, olhos e orbe. */
const SORCERESS_VARIANTS = {
  // Bruxa da Abóbora: laranja e preto
  rare: { dress: ['#e8741a', '#7a2a08'], hat: '#1a1014', band: '#ff8a2a', hair: '#1a1014', eyes: '#ff9a2a', orb: '#ffc060', magic: '#ff9a2a' },
  // Bruxa do Mar: verde-mar, chapéu com concha, cabelo de algas, tridente com pérola
  epic: { dress: ['#1e8a96', '#0a2e3a'], hat: '#1a6a7a', band: '#f4e4c8', hair: '#2a8a5a', eyes: '#4ae0d0', orb: '#f4f8ff', magic: '#6af0e0' },
  // Bruxa na Vassoura: voando de lado numa vassoura de palha, cabelo ruivo e o gatinho na garupa
  legendary: { dress: ['#3a2a5a', '#120a22'], hat: '#1a1428', band: '#8a5ad8', hair: '#e8642a', eyes: '#7ad85a', orb: '#e8d8ff', magic: '#c8a0ff' },
} as const;

/** Vassoura de palha atravessada sob a bruxa, com rastro de vento. */
function broomstick(ctx: Ctx, t: number): void {
  ctx.save();
  ctx.globalAlpha *= 0.5;
  line(ctx, '#e8e0ff', 0.7, () => {
    for (const [y, len] of [[3, 8], [8, 11], [13, 7]] as const) {
      const off = ((t * 30) % 10) - 5;
      ctx.moveTo(-26 + off, y);
      ctx.lineTo(-26 + off - len, y);
    }
  }, false);
  ctx.restore();
  shape(ctx, vertical(ctx, 2, 16, '#f0c860', '#a87a20'), () => {
    ctx.moveTo(-11, 7);
    ctx.quadraticCurveTo(-18, 2 + Math.sin(t * 8), -25, 3);
    ctx.lineTo(-23, 9);
    ctx.lineTo(-26, 15 + Math.sin(t * 8 + 1));
    ctx.quadraticCurveTo(-18, 13, -11, 10);
    ctx.closePath();
  }, 0.9);
  line(ctx, '#a87a20', 0.5, () => {
    for (const y of [5, 8, 11]) {
      ctx.moveTo(-12, y - 0.5);
      ctx.lineTo(-23, y + (y - 8) * 0.6);
    }
  }, false);
  line(ctx, '#7a4a22', 2.2, () => {
    ctx.moveTo(-13, 8.6);
    ctx.lineTo(16, 5);
  });
  shape(ctx, '#8a5ad8', () => ctx.roundRect(-13, 6.4, 2.6, 4.6, 0.8), 0.5);
}

/** Gatinho preto espectral sentado (Bruxa Lunar). */
function spectralCat(ctx: Ctx, x: number, y: number, time: number): void {
  halo(ctx, x, y - 2, 6, '#8a9aff', 0.5);
  const tail = Math.sin(time * 2.5) * 1.5;
  line(ctx, '#14101e', 1.2, () => {
    ctx.moveTo(x - 2, y + 1);
    ctx.quadraticCurveTo(x - 6, y - 1 + tail, x - 5, y - 5 + tail);
  });
  shape(ctx, '#14101e', () => ellipse(ctx, x, y, 3, 2.6), 0.6);
  shape(ctx, '#14101e', () => {
    ctx.arc(x + 1.2, y - 3.6, 2.4, 0, TAU);
    ctx.moveTo(x - 0.8, y - 5);
    ctx.lineTo(x - 0.6, y - 7.6);
    ctx.lineTo(x + 1, y - 5.6);
    ctx.moveTo(x + 2.2, y - 5.6);
    ctx.lineTo(x + 3.6, y - 7.4);
    ctx.lineTo(x + 3.6, y - 4.6);
  }, 0.6);
  for (const ex of [0.4, 2.2]) glowingEye(ctx, x + ex, y - 3.8, 0.55, '#ffe060');
}

export function drawSorceress(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.4) * 1.2;
  const cast = p.attack;
  // Feiticeira do Caos: vestido verde-escuro, orbe e runas roxas
  const chaos = formB(p);
  // Arquibruxa (A): grimório grande aberto, capa e chapéu estrelado
  const arch = formA(p);
  // Formas Supremas: Bruxa Suprema (A, chapéu com olhos e caldeirão flutuando) e Caos Absoluto (B, cabelo em chamas verdes)
  const supremeWitch = p.supreme && !chaos;
  const absoluteChaos = p.supreme && chaos;
  const sv = p.variant ? SORCERESS_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (sv && chaos ? darken(c, 0.3) : c);
  const magic = sv ? sv.magic : chaos ? '#c86aff' : '#7ad85a';
  const broom = p.variant === 'legendary';
  if (broom) {
    // voa alto, subindo e descendo, inclinada para a frente como quem acelera
    ctx.translate(0, -12 + Math.sin(p.time * 2.2) * 2.2);
    ctx.rotate(-0.12 + Math.sin(p.time * 2.2 + 1) * 0.04);
  }
  if (arch) {
    // capa nas costas
    shape(ctx, vertical(ctx, -10, 14, sv ? darken(sv.dress[0], 0.35) : '#3a1a60', sv ? sv.dress[1] : '#14082a'), () => {
      ctx.moveTo(-4, -9);
      ctx.quadraticCurveTo(-17, -2, -18 + sway, 14);
      ctx.lineTo(-10, 12);
      ctx.lineTo(-2, -6);
      ctx.closePath();
    }, 1);
  }
  if (absoluteChaos) {
    // cabelo em chamas verdes atrás
    for (let i = 0; i < 5; i++) {
      const h = 9 + Math.sin(p.time * 9 + i * 1.4) * 3;
      shape(ctx, i % 2 ? '#8aff6a' : '#3ad85a', () => poly(ctx, [-9 + i * 2, -14, -10 + i * 2 - 2, -14 - h, -7 + i * 2, -14]), 0);
    }
  }
  // vestido roxo (sentada na vassoura: a saia termina nela e esvoaça para trás)
  if (broom) {
    broomstick(ctx, p.time);
    const flutter = Math.sin(p.time * 9) * 1.2;
    shape(ctx, vertical(ctx, -9, 10, sv ? shadeB(sv.dress[0]) : '#6a3aa0', sv ? sv.dress[1] : '#2e1450'), () =>
      poly(ctx, [-5, -9, 5, -9, 7, 6, 2, 8.5, -6, 9, -12, 10 + flutter, -9, 6, -14, 6 + flutter]),
    );
    // pernas de meia listrada penduradas de lado, com botas pontudas
    for (const [x, sw] of [[1, 0], [4, 1]] as const) {
      const swing = Math.sin(p.time * 3 + sw) * 1;
      line(ctx, '#e8e0f0', 1.8, () => {
        ctx.moveTo(x, 7);
        ctx.lineTo(x + 1 + swing, 13);
      });
      line(ctx, sv ? sv.band : '#8a5ad8', 0.7, () => {
        ctx.moveTo(x - 0.6 + swing * 0.4, 9);
        ctx.lineTo(x + 1 + swing * 0.4, 9.4);
        ctx.moveTo(x - 0.4 + swing * 0.7, 11);
        ctx.lineTo(x + 1.4 + swing * 0.7, 11.4);
      }, false);
      shape(ctx, '#1a1428', () => poly(ctx, [x + swing - 0.4, 12.5, x + swing + 2.4, 12.5, x + swing + 5, 13.6, x + swing - 0.4, 15]), 0.6);
    }
    // a vassoura passa por cima da saia
    line(ctx, '#7a4a22', 2.2, () => {
      ctx.moveTo(-12, 8.4);
      ctx.lineTo(17, 4.4);
    });
  } else {
    shape(ctx, vertical(ctx, -9, 14, sv ? shadeB(sv.dress[0]) : chaos ? '#1e5a3a' : '#6a3aa0', sv ? sv.dress[1] : chaos ? '#0a2416' : '#2e1450'), () =>
      poly(ctx, [-5, -9, 5, -9, 10, 14, 4, 12, 0, 14, -4, 12, -10, 14]),
    );
  }
  shape(ctx, '#2a1a10', () => ctx.rect(-5.5, -1, 11, 2), 0.6);
  // varinha com orbe verde (tridente com pérola na Bruxa do Mar)
  ctx.save();
  ctx.translate(6, -2);
  ctx.rotate(0.45 + cast * 0.6);
  line(ctx, p.variant === 'epic' ? '#c8b080' : '#6a4a2a', 1.6, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -12);
  });
  if (p.variant === 'epic') {
    line(ctx, '#e8d8a8', 1.2, () => {
      ctx.moveTo(-3, -16);
      ctx.lineTo(-3, -12.5);
      ctx.lineTo(3, -12.5);
      ctx.lineTo(3, -16);
      ctx.moveTo(0, -12.5);
      ctx.lineTo(0, -17);
    });
  }
  ctx.shadowColor = magic;
  ctx.shadowBlur = 8 + cast * 10;
  shape(ctx, sv ? sv.orb : chaos ? '#e0b0ff' : '#a8f080', () => circle(ctx, 0, p.variant === 'epic' ? -14.5 : -13, (p.variant === 'epic' ? 1.6 : 2) + cast * 1.2), 0.6);
  ctx.restore();
  // rosto e cabelo (de algas na Bruxa do Mar)
  const hy = -15;
  shape(ctx, sv ? sv.hair : '#2a1a3a', () => {
    ctx.moveTo(-7.5, hy - 2);
    ctx.quadraticCurveTo(-12, hy + 8 + sway, -8, hy + 12);
    ctx.lineTo(-4, hy + 4);
    ctx.closePath();
  });
  if (p.variant === 'epic') {
    for (const dx of [0, 2.5]) {
      line(ctx, '#3aa86a', 1.2, () => {
        ctx.moveTo(-6 - dx, hy + 2);
        ctx.quadraticCurveTo(-9 - dx + sway, hy + 9, -6 - dx, hy + 14);
      });
    }
  }
  shape(ctx, radial(ctx, 1, hy, 7, '#e8f0d0', '#b8c8a0'), () => circle(ctx, 1, hy, 7));
  eye(ctx, 1, hy + 0.5, 1.8, sv ? sv.eyes : '#3aa83a');
  eye(ctx, 5, hy + 0.5, 1.8, sv ? sv.eyes : '#3aa83a');
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(3, hy + 3.4, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  witchHat(ctx, hy, sv ? shadeB(sv.hat) : chaos ? '#0e2a1a' : '#3a1a60', sv ? sv.band : magic, sway * 0.5);
  if (p.variant === 'epic') {
    // concha na faixa do chapéu
    shape(ctx, vertical(ctx, hy - 11, hy - 5, '#ffe8d8', '#e0a890'), () => {
      ctx.moveTo(-1, hy - 6);
      ctx.lineTo(-4, hy - 10);
      ctx.quadraticCurveTo(-1, hy - 13, 2, hy - 10);
      ctx.closePath();
    }, 0.6);
  }
  if (broom) spectralCat(ctx, -10, 5, p.time);
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
  if (arch) {
    // estrelas douradas no chapéu
    for (const [x, y, r] of [[-2, hy - 12, 1.6], [1.5, hy - 16, 1.3], [3, hy - 20, 1]] as const) shape(ctx, GOLD, () => star(ctx, x, y, r * 1.5), 0.3);
    if (!supremeWitch) {
      // grimório grande aberto flutuando ao lado, brilhando
      const by = -6 + Math.sin(p.time * 3) * 1.5;
      ctx.save();
      ctx.translate(-14, by);
      ctx.rotate(-0.15);
      halo(ctx, 0, 0, 9, magic, 0.5 + cast * 0.4);
      shape(ctx, sv ? darken(sv.dress[0], 0.3) : '#7a2a2a', () => ctx.roundRect(-7, -4.5, 14, 9, 1.2), 0.9);
      shape(ctx, '#f8f0dc', () => poly(ctx, [-6.2, -3.6, -0.4, -2.8, -0.4, 3.6, -6.2, 2.8]), 0.5);
      shape(ctx, '#f8f0dc', () => poly(ctx, [0.4, -2.8, 6.2, -3.6, 6.2, 2.8, 0.4, 3.6]), 0.5);
      line(ctx, magic, 0.6, () => {
        for (const y of [-1.4, 0.4, 2]) {
          ctx.moveTo(-5, y);
          ctx.lineTo(-1.4, y + 0.3);
          ctx.moveTo(1.4, y + 0.3);
          ctx.lineTo(5, y);
        }
      }, false);
      ctx.restore();
    }
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

/** Cores do Caldeirão em cada variante: panela, borda, poção, bolhas e olhos. */
const CAULDRON_VARIANTS = {
  // Caldeirão de Cobre: poção rosa
  rare: { pot: ['#e8925a', '#6a2a10'], rim: '#a85a2a', potion: ['#ffd8ec', '#e05a9a'], bubble: '#ffe4f2', eyes: '#ffffff' },
  // Caldeirão de Abóbora: abóbora esculpida com rosto brilhando
  epic: { pot: ['#ffa030', '#a0400a'], rim: '#c0581a', potion: ['#fff0a0', '#ff9a1a'], bubble: '#fff4c0', eyes: '#ffffff' },
  // Caldeirão Mímico: anda em pernas de galinha, olhos na panela, dentes na borda e língua
  legendary: { pot: ['#6a5a6a', '#1a121a'], rim: '#3a2e3a', potion: ['#ffb0c8', '#c0304a'], bubble: '#ffd0dc', eyes: '#ffe060' },
} as const;

const INFERNAL_FLAME = { outer: ['#e0b0ff', '#8a3aff'] as const, inner: ['#ffffff', '#e8d0ff'] as const, glow: '#b36bff' };

export function drawCauldron(ctx: Ctx, p: Pose): void {
  const stir = Math.sin(p.time * 2.5);
  // Caldeirão Alquímico: bronze dourado, ouro líquido e moedas subindo
  const alchemy = formB(p);
  // Caldeirão Infernal (A): chamas roxas lambendo as laterais e alças de caveira
  const infernal = formA(p);
  // Formas Supremas: Caldeirão do Fim (A, caldeirão de ossos roxo) e Pedra Filosofal (B, pedra vermelha flutuando)
  const doom = p.supreme && !alchemy;
  const stone = p.supreme && alchemy;
  const cv = p.variant ? CAULDRON_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (cv && alchemy ? darken(c.slice(0, 7), 0.2) + c.slice(7) : c);
  if (infernal) {
    // chamas roxas em gota por baixo da panela
    for (const [x, h] of [[-6, 8], [0, 9], [6, 8]] as const) flame(ctx, x, 12, 2.6, h, 0, p.time + x, INFERNAL_FLAME);
  }
  const mimic = p.variant === 'legendary';
  if (mimic) {
    // pernas de galinha, andando (o caldeirão sobe um pouco)
    const step = walk(p, 9);
    ctx.translate(0, -3);
    for (const [x, ph] of [[-5, step], [5, -step]] as const) {
      const fx = x + ph * 3;
      line(ctx, '#e8b040', 1.6, () => {
        ctx.moveTo(x, 8);
        ctx.lineTo(x - 2 + ph, 12.5);
        ctx.lineTo(fx, 17);
      });
      line(ctx, '#c88a20', 0.9, () => {
        for (const d of [-1, 0, 1]) {
          ctx.moveTo(fx, 17);
          ctx.lineTo(fx + 2.6, 17 + d * 1.1);
        }
        ctx.moveTo(fx, 17);
        ctx.lineTo(fx - 1.8, 16.6);
      }, false);
    }
  } else {
    // pernas
    for (const x of [-8, 0, 8]) shape(ctx, '#1a1622', () => poly(ctx, [x - 1.5, 8, x + 1.5, 8, x + 1, 14, x - 1, 14]), 0.8);
  }
  // caldeirão de ferro (de cobre, abóbora ou cristal nas variantes)
  shape(ctx, radial(ctx, -2, 0, 14, cv ? shadeB(cv.pot[0]) : alchemy ? '#e0b050' : doom ? '#e8e0d0' : '#4a4458', cv ? cv.pot[1] : alchemy ? '#6a4810' : doom ? '#6a5a50' : '#141018'), () => {
    ctx.moveTo(-12, -6);
    ctx.quadraticCurveTo(-14, 10, 0, 10);
    ctx.quadraticCurveTo(14, 10, 12, -6);
    ctx.closePath();
  });
  if (p.variant === 'epic') {
    // gomos da abóbora e rosto esculpido brilhando
    line(ctx, '#a0400a', 0.8, () => {
      for (const x of [-6, 0, 6]) {
        ctx.moveTo(x, -5);
        ctx.quadraticCurveTo(x * 1.25, 2, x * 0.8, 9);
      }
    }, false);
    halo(ctx, 0, 3, 7, '#ffd040', 0.6);
    for (const x of [-4, 4]) shape(ctx, '#ffe060', () => poly(ctx, [x - 2, 2, x + 2, 2, x, -1.2]), 0.5);
    shape(ctx, '#ffe060', () => poly(ctx, [-5, 5, -3, 4, -1.5, 6, 0, 4.4, 1.5, 6, 3, 4, 5, 5, 3, 7.6, -3, 7.6]), 0.5);
  }
  if (mimic) {
    // olhos grandes na barriga da panela, com pálpebra de ferro
    for (const x of [-4.5, 4.5]) {
      shape(ctx, '#fff8e0', () => circle(ctx, x, 2, 3), 0.8);
      shape(ctx, '#1a0a0a', () => circle(ctx, x + 0.8 + Math.sin(p.time * 1.3) * 0.6, 2.4, 1.5), 0);
      shape(ctx, cv!.pot[0], () => ctx.arc(x, 2, 3.1, Math.PI * 1.05, Math.PI * 1.95), 0.7);
    }
  }
  shape(ctx, cv ? cv.rim : alchemy ? '#8a6418' : '#2a2632', () => ellipse(ctx, 0, -6, 13, 3.5), 1.2);
  if (mimic) {
    // dentes na borda (a boca do mímico)
    for (let x = -10; x <= 10; x += 2.5) shape(ctx, '#fff8e0', () => poly(ctx, [x - 1, -3.6 + Math.abs(x) * 0.08, x + 1, -3.6 + Math.abs(x) * 0.08, x, -1.2 + Math.abs(x) * 0.06]), 0.4);
  }
  if (infernal) {
    // chamas maiores lambendo as laterais, por cima da panela
    for (const [x, a] of [[-12, -0.45], [12, 0.45]] as const) flame(ctx, x, 7, 3, 12, a, p.time + x, INFERNAL_FLAME);
    // alças de caveira nas laterais
    for (const x of [-13.5, 13.5]) {
      shape(ctx, '#f4ecd8', () => circle(ctx, x, -3, 2.6), 0.7);
      shape(ctx, '#1a0a1a', () => circle(ctx, x - 0.9, -3.3, 0.6), 0);
      shape(ctx, '#1a0a1a', () => circle(ctx, x + 0.9, -3.3, 0.6), 0);
      shape(ctx, '#1a0a1a', () => ctx.rect(x - 0.9, -1.4, 1.8, 0.6), 0);
    }
  }
  if (alchemy) {
    // runa alquímica gravada na frente (abaixo dos olhos no Mímico)
    const ry = mimic ? 6.5 : 2;
    const rr = mimic ? 2 : 3;
    ctx.strokeStyle = '#fff0b0';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    circle(ctx, 0, ry, rr);
    ctx.moveTo(0, ry - rr);
    ctx.lineTo(0, ry + rr);
    ctx.moveTo(-rr, ry);
    ctx.lineTo(rr, ry);
    ctx.stroke();
  }
  // poção borbulhando
  shape(ctx, radial(ctx, 0, -6, 11, cv ? cv.potion[0] : alchemy ? '#fff4c0' : doom ? '#e0a8ff' : '#c8ffd8', cv ? cv.potion[1] : alchemy ? '#e0a020' : doom ? '#6a1aa0' : '#3ab878'), () => ellipse(ctx, 0, -6, 11, 2.6), 0);
  ctx.fillStyle = cv ? cv.bubble : alchemy ? '#ffe070' : '#d8ffe8';
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
  if (mimic) {
    // língua comprida pendurada para fora (estica no ataque)
    const len = 6 + p.attack * 6 + Math.sin(p.time * 3) * 0.8;
    shape(ctx, vertical(ctx, -6, 4, '#ff8aa8', '#c0304a'), () => {
      ctx.moveTo(-9, -5.5);
      ctx.quadraticCurveTo(-13, -4, -12 - len * 0.3, -6 + len * 0.6);
      ctx.quadraticCurveTo(-11, -5 + len * 0.5, -7, -5);
      ctx.closePath();
    }, 0.7);
  } else {
    // olhos dentro da poção (personalidade)
    glowingEye(ctx, -3, -6.2, 1.1, cv ? cv.eyes : alchemy ? '#ffffff' : '#f0ff60');
    glowingEye(ctx, 2.5, -6.2, 1.1, cv ? cv.eyes : alchemy ? '#ffffff' : '#f0ff60');
  }
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
  const look = skin(p, 'look', '');
  if (look === 'forest') {
    // musgo na aba e cogumelos brotando do chapéu
    shape(ctx, '#5aa83a', () => ellipse(ctx, -4, hy - 5.5, 5, 1.6), 0.5);
    for (const [x, y, s, c] of [[-6, hy - 7, 1.2, '#e04a3a'], [3, hy - 11, 1, '#e8c860'], [-1, hy - 15, 0.9, '#e04a3a']] as const) {
      shape(ctx, '#f4e8d0', () => ctx.rect(x - 0.5 * s, y, 1 * s, 2.2 * s), 0.4);
      shape(ctx, c, () => {
        ctx.ellipse(x, y, 2.2 * s, 1.8 * s, 0, Math.PI, TAU);
        ctx.closePath();
      }, 0.5);
      shape(ctx, '#ffffff', () => circle(ctx, x - 0.6 * s, y - 0.8 * s, 0.4 * s), 0);
    }
  }
  if (look === 'moon') spectralCat(ctx, -6, -8 + bob, p.time);
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
