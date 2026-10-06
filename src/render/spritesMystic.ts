// Sprites das raças Lobisomem, Fantasma e Bruxa (criaturas e heróis).
import {
  ascended,
  formA,
  formB,
  circle,
  ellipse,
  eye,
  glowingEye,
  GOLD,
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

export function drawHunter(ctx: Ctx, p: Pose): void {
  const crouch = Math.sin(p.time * 3) * 0.6;
  const swipe = p.attack;
  // Caçador Feral: pelo ruivo, cicatrizes e olhos vermelhos
  const feral = formB(p);
  const fur = feral ? '#b8582a' : '#8a6a4a';
  const furDark = feral ? '#6a2a14' : '#5a4030';

  // cauda e pernas
  shape(ctx, furDark, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 2 + crouch, -17, -4);
    ctx.quadraticCurveTo(-12, 4, -5, 8);
    ctx.closePath();
  });
  shape(ctx, furDark, () => poly(ctx, [-6, 6, -2, 6, -1, 14, -7, 14]));
  shape(ctx, furDark, () => poly(ctx, [1, 6, 5, 6, 6, 14, 0, 14]));
  // tronco curvado para frente, calça rasgada
  ctx.save();
  ctx.rotate(0.15);
  shape(ctx, radial(ctx, 0, 0, 11, fur, furDark), () => ellipse(ctx, 0, -1 + crouch, 8, 10));
  shape(ctx, '#c8a880', () => ellipse(ctx, 3, 1 + crouch, 4, 6), 0.8);
  shape(ctx, '#3a3050', () => poly(ctx, [-7, 4, 7, 4, 6, 9, 3, 7, 0, 9, -3, 7, -6, 9]), 1);
  ctx.restore();
  // braço com garras: golpe de cima para baixo
  ctx.save();
  ctx.translate(5, -5 + crouch);
  ctx.rotate(-0.8 + swipe * 1.6);
  line(ctx, fur, 3.6, () => {
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 2);
  });
  for (const dy of [-1.5, 0.5, 2.5]) shape(ctx, '#f4ecd8', () => poly(ctx, [10, dy, 14, dy + 0.6, 10, dy + 1.2]), 0.5);
  ctx.restore();
  wolfHead(ctx, -15 + crouch, fur, furDark, feral ? '#ff2a2a' : ascended(p) ? '#9fdcff' : '#ffd23a', 0, swipe);
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
  if (formA(p)) {
    // marca da lua na testa
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

export function drawAlpha(ctx: Ctx, p: Pose): void {
  const howl = Math.max(0, Math.sin(p.time * 0.8) - 0.85) * 6;
  const bite = p.attack;
  // Fera Devastadora: pelo quase negro, juba cinza-escura e coleira de espinhos
  const beast = formB(p);
  const fur = beast ? '#3a3238' : '#5a4a3a';
  const furDark = beast ? '#141014' : '#2e241c';

  shape(ctx, furDark, () => {
    ctx.moveTo(-7, 4);
    ctx.quadraticCurveTo(-18, 0, -19, -7);
    ctx.quadraticCurveTo(-13, 3, -6, 9);
    ctx.closePath();
  });
  shape(ctx, furDark, () => ctx.roundRect(-7, 6, 5, 8, 2));
  shape(ctx, furDark, () => ctx.roundRect(2, 6, 5, 8, 2));
  // corpo largo e juba
  shape(ctx, radial(ctx, 0, 0, 13, fur, furDark), () => ellipse(ctx, 0, 0, 10, 11));
  shape(ctx, beast ? '#5a5260' : '#9a8a7a', () => {
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
    // coleira de couro com espinhos de ferro
    shape(ctx, '#4a2a1a', () => ctx.roundRect(-8, -3, 16, 3, 1.2), 0.8);
    for (let i = 0; i < 5; i++) shape(ctx, '#c8ccd8', () => poly(ctx, [-6.5 + i * 3.2, -3, -5 + i * 3.2, -7, -3.5 + i * 3.2, -3]), 0.6);
  }
  wolfHead(ctx, -16, fur, furDark, beast ? '#ff3a1a' : '#ff9a3a', howl, bite);
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
export function drawHowler(ctx: Ctx, p: Pose): void {
  const lunar = formA(p);
  const war = formB(p);
  const fur = lunar ? '#c8d0e0' : war ? '#7a5a3a' : '#8a8aa0';
  const furDark = lunar ? '#7a84a0' : war ? '#3a2614' : '#4a4a60';
  // uiva no ataque e, de vez em quando, sozinho
  const howl = Math.max(p.attack, Math.max(0, Math.sin(p.time * 0.9) - 0.8) * 5);
  if (lunar) {
    ctx.save();
    ctx.shadowColor = '#bfe8ff';
    ctx.shadowBlur = 12;
    shape(ctx, '#e8f6ff', () => {
      ctx.arc(-9, -24, 5, 0.5, TAU - 0.5);
      ctx.arc(-7.5, -24, 4, TAU - 0.8, 0.8, true);
      ctx.closePath();
    }, 0.6);
    ctx.restore();
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
  wolfHead(ctx, -15, fur, furDark, war ? '#ff3a1a' : lunar ? '#9fdcff' : '#ffd23a', Math.min(1, howl), 0);
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
  ghostBody(ctx, p.time, -24, frost ? '#e0f0ff' : '#e8fffa', frost ? '#5a9aff60' : '#8ce8d840');
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
    // chamas espectrais na cabeça
    ctx.save();
    ctx.shadowColor = '#5ae8c8';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 3; i++) {
      const h = 5 + Math.sin(p.time * 9 + i * 2) * 2;
      shape(ctx, '#5ae8c8', () => poly(ctx, [-4 + i * 4, -22, -2 + i * 4, -22 - h, 0 + i * 4, -22]), 0);
    }
    ctx.restore();
  }
}

export function drawBanshee(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2) * 2 - 4;
  const scream = p.attack;
  ctx.translate(0, float);
  const dread = formB(p);
  const eyes = dread ? '#ff2a4a' : '#6a9aff';
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
  shape(ctx, '#1a1438', () => ellipse(ctx, 2.5, -10.5, 1.8, 1.4 + scream * 2.5), 0);
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
  const magic = chaos ? '#c86aff' : '#7ad85a';
  // vestido roxo
  shape(ctx, vertical(ctx, -9, 14, chaos ? '#1e5a3a' : '#6a3aa0', chaos ? '#0a2416' : '#2e1450'), () =>
    poly(ctx, [-5, -9, 5, -9, 10, 14, 4, 12, 0, 14, -4, 12, -10, 14]),
  );
  shape(ctx, '#2a1a10', () => ctx.rect(-5.5, -1, 11, 2), 0.6);
  // varinha com orbe verde
  ctx.save();
  ctx.translate(6, -2);
  ctx.rotate(-0.6 - cast * 0.8);
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
}

export function drawCauldron(ctx: Ctx, p: Pose): void {
  const stir = Math.sin(p.time * 2.5);
  // Caldeirão Alquímico: bronze dourado, ouro líquido e moedas subindo
  const alchemy = formB(p);
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
  shape(ctx, radial(ctx, -2, 0, 14, alchemy ? '#e0b050' : '#4a4458', alchemy ? '#6a4810' : '#141018'), () => {
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
  shape(ctx, radial(ctx, 0, -6, 11, alchemy ? '#fff4c0' : '#c8ffd8', alchemy ? '#e0a020' : '#3ab878'), () => ellipse(ctx, 0, -6, 11, 2.6), 0);
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
  ctx.rotate(-0.25 - p.attack * 0.5);
  line(ctx, '#5a3a1a', 1.8, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8 + p.attack * 10;
  shape(ctx, accent, () => circle(ctx, 0, -17, 2.6 + p.attack), 0.6);
  ctx.restore();
}
