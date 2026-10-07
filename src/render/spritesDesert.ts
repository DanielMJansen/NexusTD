// Inimigos e chefes do Deserto (Fase 4): Escaravelho, Múmia, Serpente das Areias, Saqueador, Djinn,
// Escorpião Colossal e Faraó Imortal.
import { circle, ellipse, glowingEye, GOLD, halo, line, poly, radial, shape, vertical, type Ctx, type Pose } from './spriteKit';

/** Escaravelho: besouro de carapaça verde-azulada iridescente, patinhas rápidas. */
export function drawScarab(ctx: Ctx, p: Pose): void {
  const run = p.time * 18;
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const swing = Math.sin(run + k * 2 + (side > 0 ? 1 : 0)) * 1.5;
      line(ctx, '#1a2a2a', 1.3, () => {
        ctx.moveTo(-4 + k * 3.5, side * 2);
        ctx.lineTo(-5 + k * 4 + swing, side * 7.5);
        ctx.lineTo(-6 + k * 4.5 + swing, side * 9);
      });
    }
  }
  // carapaça dividida ao meio
  shape(ctx, radial(ctx, -1, -3, 8, '#7affe0', '#0e5a5a'), () => ellipse(ctx, -1, 0, 7.5, 5.5));
  ctx.strokeStyle = '#06302e';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(3, 0);
  ctx.stroke();
  // brilho iridescente
  shape(ctx, '#d0fff4aa', () => ellipse(ctx, -3, -2.5, 2.6, 1, -0.2), 0);
  // cabeça com chifrinho
  shape(ctx, '#0e3a3a', () => ellipse(ctx, 6, 0, 3, 3), 0.9);
  shape(ctx, GOLD, () => poly(ctx, [7, -1.5, 11, -4 - p.attack * 2, 8.5, 0]), 0.6);
  glowingEye(ctx, 7.2, 1.2, 0.6, '#ffd84a');
}

/** Múmia: corpo envolto em ataduras, braços esticados, olhos verdes no vão das faixas. */
export function drawMummy(ctx: Ctx, p: Pose): void {
  const shuffle = Math.sin(p.time * 4) * 1.2;
  const linen = '#e0d4b4';
  const shade = '#9a8a6a';
  // pernas arrastando
  shape(ctx, linen, () => ctx.roundRect(-5 + shuffle, 5, 4, 9, 1.5), 1);
  shape(ctx, linen, () => ctx.roundRect(1 - shuffle, 5, 4, 9, 1.5), 1);
  // tronco
  shape(ctx, vertical(ctx, -12, 8, '#f0e6cc', shade), () => ctx.roundRect(-6, -10, 12, 17, 4));
  // faixas diagonais
  ctx.strokeStyle = shade;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let y = -8; y <= 5; y += 3) {
    ctx.moveTo(-6, y + 1.5);
    ctx.lineTo(6, y - 0.5);
  }
  ctx.stroke();
  // ponta de atadura solta balançando
  line(ctx, linen, 1.4, () => {
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(-10, 5 + Math.sin(p.time * 3) * 2, -12, 9);
  });
  // braços estendidos para a frente
  for (const y of [-7, -3]) {
    line(ctx, linen, 3.2, () => {
      ctx.moveTo(2, y);
      ctx.lineTo(12 + p.attack * 3, y - 1 + Math.sin(p.time * 4 + y) * 0.8);
    });
  }
  // cabeça enfaixada
  shape(ctx, radial(ctx, 0, -16, 7, '#f4ead4', '#b0a080'), () => ellipse(ctx, 1, -15, 5.5, 5.5));
  ctx.strokeStyle = shade;
  ctx.beginPath();
  ctx.moveTo(-4, -18);
  ctx.lineTo(6, -17);
  ctx.moveTo(-4.5, -12.5);
  ctx.lineTo(6, -13.5);
  ctx.stroke();
  // vão dos olhos
  shape(ctx, '#2a2216', () => ctx.roundRect(-1, -16.4, 7, 2.4, 1), 0);
  glowingEye(ctx, 1.2, -15.2, 0.9, '#7aff6a');
  glowingEye(ctx, 4.2, -15.2, 0.9, '#7aff6a');
  // escaravelho dourado no peito
  shape(ctx, GOLD, () => ellipse(ctx, 0, -5, 1.8, 1.4), 0.5);
}

/** Serpente das Areias: cobra cor de areia com capuz listrado, erguida para o bote. */
export function drawSandSerpent(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 3) * 2;
  const body = '#d8b060';
  const band = '#7a4a1a';
  const strike = p.attack;
  // corpo ondulando no chão
  ctx.lineCap = 'round';
  for (const [w, c] of [[7, '#3a2408'], [5.4, body]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.quadraticCurveTo(-10, 4 + sway, -4, 9);
    ctx.quadraticCurveTo(1, 12 - sway, 3, 4);
    ctx.lineTo(4 + strike * 4, -6);
    ctx.stroke();
  }
  // listras escuras
  for (const [x, y] of [[-12, 7], [-6, 8], [1, 9], [3.4, 1]] as const) shape(ctx, band, () => ellipse(ctx, x, y, 1.2, 2.4), 0);
  // capuz aberto
  const hx = 4 + strike * 4;
  const hy = -10 - strike;
  shape(ctx, vertical(ctx, hy - 6, hy + 8, '#e8c070', '#9a6a2a'), () => {
    ctx.moveTo(hx, hy - 5);
    ctx.quadraticCurveTo(hx - 7, hy - 1, hx - 4, hy + 7);
    ctx.lineTo(hx + 4, hy + 7);
    ctx.quadraticCurveTo(hx + 7, hy - 1, hx, hy - 5);
    ctx.closePath();
  });
  for (const k of [-1, 1]) shape(ctx, band, () => ellipse(ctx, hx + k * 2.6, hy + 2, 1, 2.4), 0);
  // cabeça com língua bifurcada
  shape(ctx, body, () => ellipse(ctx, hx + 2, hy - 4, 4, 2.8), 1);
  glowingEye(ctx, hx + 3, hy - 5, 0.8, '#ff4a2a');
  if (strike > 0.1 || Math.sin(p.time * 5) > 0.6) {
    line(ctx, '#d0283a', 0.6, () => {
      ctx.moveTo(hx + 6, hy - 3.5);
      ctx.lineTo(hx + 9, hy - 3.5);
      ctx.lineTo(hx + 10, hy - 4.5);
      ctx.moveTo(hx + 9, hy - 3.5);
      ctx.lineTo(hx + 10, hy - 2.5);
    }, false);
  }
}

/** Saqueador: bandido do deserto com turbante, véu, cimitarra e saco de ouro. */
export function drawRaider(ctx: Ctx, p: Pose): void {
  const step = Math.sin(p.time * 12) * 2;
  // pernas
  shape(ctx, '#5a3a2a', () => ctx.roundRect(-4 + step, 4, 3, 9, 1), 1);
  shape(ctx, '#5a3a2a', () => ctx.roundRect(1 - step, 4, 3, 9, 1), 1);
  // saco de ouro nas costas
  shape(ctx, '#a07a4a', () => ellipse(ctx, -7, -2, 4.5, 5), 1);
  shape(ctx, GOLD, () => circle(ctx, -7, -6.5, 1.4), 0.4);
  // túnica com faixa
  shape(ctx, vertical(ctx, -10, 6, '#d04a2a', '#7a1e10'), () => {
    ctx.moveTo(-5, -9);
    ctx.lineTo(5, -9);
    ctx.lineTo(6.5, 6);
    ctx.lineTo(-6.5, 6);
    ctx.closePath();
  });
  shape(ctx, '#2a1a10', () => ctx.roundRect(-5.5, -1, 11, 2.4, 1), 0.6);
  // cabeça com turbante e véu
  shape(ctx, '#b07a52', () => ellipse(ctx, 1, -13, 4.5, 4.5));
  shape(ctx, '#2a2a3a', () => ctx.roundRect(-3.5, -12.5, 9, 4.5, 1.5), 0.8);
  shape(ctx, '#f0e6d0', () => ellipse(ctx, 0.5, -17, 5.5, 3.2));
  glowingEye(ctx, 3, -14, 0.8, '#ffd84a');
  // cimitarra
  ctx.save();
  ctx.translate(5, -4);
  ctx.rotate(-0.8 + p.attack * 1.8);
  line(ctx, '#3a2a1a', 1.6, () => {
    ctx.moveTo(0, 2);
    ctx.lineTo(0, -1);
  });
  shape(ctx, vertical(ctx, -14, 0, '#ffffff', '#9aa4b4'), () => {
    ctx.moveTo(-0.8, -1);
    ctx.quadraticCurveTo(-1, -10, 4, -14);
    ctx.quadraticCurveTo(2, -8, 1.2, -1);
    ctx.closePath();
  }, 0.7);
  ctx.restore();
}

/** Djinn: tronco azul que termina numa espiral de fumaça, braceletes de ouro e chama na cabeça. */
export function drawDjinn(ctx: Ctx, p: Pose): void {
  const float = Math.sin(p.time * 2.5) * 1.5;
  // cauda de fumaça em espiral
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const x = Math.sin(p.time * 3 + i) * 2.5 * (1 - t);
    shape(ctx, i % 2 ? '#3a8ad8' : '#5ab8ff', () => ellipse(ctx, x, 10 - i * 4 + float, 2 + i * 1.4, 2.2 + i * 0.6), 0);
  }
  halo(ctx, 0, -4 + float, 18, '#4ab0ff', 0.4);
  // tronco
  shape(ctx, radial(ctx, -1, -6 + float, 10, '#7ad0ff', '#1a5aa8'), () => {
    ctx.moveTo(-7, -10 + float);
    ctx.quadraticCurveTo(0, -13 + float, 7, -10 + float);
    ctx.quadraticCurveTo(5, 0 + float, 0, 4 + float);
    ctx.quadraticCurveTo(-5, 0 + float, -7, -10 + float);
    ctx.closePath();
  });
  // braços cruzados ou lançando
  const cast = p.attack;
  for (const side of [-1, 1]) {
    line(ctx, '#3a9ae8', 3, () => {
      ctx.moveTo(side * 6, -9 + float);
      ctx.lineTo(side * (8 + cast * 3), -3 + float - cast * 5);
    });
    shape(ctx, GOLD, () => ctx.roundRect(side * (8 + cast * 3) - 1.8, -4.5 + float - cast * 5, 3.6, 1.8, 0.6), 0.4);
  }
  // cabeça, barba pontuda e chama no alto
  const hy = -15 + float;
  shape(ctx, '#5ab8ff', () => ellipse(ctx, 0, hy, 4.5, 4.5));
  shape(ctx, '#0e2a5a', () => poly(ctx, [-2, hy + 2.5, 2, hy + 2.5, 0, hy + 7]), 0.5);
  shape(ctx, '#f4ead4', () => ellipse(ctx, 0, hy - 3.5, 5, 2.2), 0.8);
  shape(ctx, GOLD, () => circle(ctx, 0, hy - 4, 1), 0.3);
  const flame = 3 + Math.sin(p.time * 10) * 1;
  shape(ctx, '#bfe8ff', () => poly(ctx, [-1.2, hy - 5.5, 0, hy - 7 - flame, 1.2, hy - 5.5]), 0);
  glowingEye(ctx, -1.5, hy, 0.8, '#fff2a0');
  glowingEye(ctx, 1.8, hy, 0.8, '#fff2a0');
}

/** Escorpião Colossal: carapaça âmbar segmentada, pinças enormes e ferrão erguido sobre as costas. */
export function drawScorpionKing(ctx: Ctx, p: Pose): void {
  const shell = '#d08a2a';
  const dark = '#5a2a08';
  const walk = p.time * 6;
  const sting = p.attack;
  // patas (4 de cada lado)
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const swing = Math.sin(walk + k * 1.4 + (side > 0 ? 0.7 : 0)) * 1.4;
      line(ctx, dark, 1.4, () => {
        ctx.moveTo(-6 + k * 3.5, side * 2 + 2);
        ctx.lineTo(-8 + k * 3.5 + swing, side * 5 + 4);
        ctx.lineTo(-9 + k * 3.5 + swing, side * 7 + 7);
      });
    }
  }
  // corpo segmentado
  shape(ctx, radial(ctx, -2, 0, 12, '#f0b04a', dark), () => ellipse(ctx, -1, 3, 11, 6));
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (const x of [-6, -2, 2]) {
    ctx.moveTo(x, -2.5);
    ctx.quadraticCurveTo(x + 1, 3, x, 8.5);
  }
  ctx.stroke();
  // cauda em arco por cima das costas, até o ferrão
  // curva de Bézier: sai do fim do corpo, sobe por trás e se curva para a frente (avança no golpe)
  const sway = Math.sin(p.time * 2) * 1.2;
  const bez = (t: number, a: number, b: number, c: number) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
  const tip = { x: 1 + sting * 8 + sway, y: -19 + sting * 5 };
  const segs = 11;
  let px = 0;
  let py = 0;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    px = bez(t, -11, -24, tip.x);
    py = bez(t, 3, -22, tip.y);
    shape(ctx, radial(ctx, px - 1, py - 1, 4, '#f0b04a', i % 2 ? shell : '#a8661a'), () => circle(ctx, px, py, 3.6 - t * 1.4), 0.9);
  }
  // ferrão curvo com veneno, apontado para a frente e para baixo
  halo(ctx, px + 4, py + 4, 5 + sting * 4, '#ffb02a', 0.6 + sting * 0.35);
  shape(ctx, '#2a1004', () => {
    ctx.moveTo(px - 1.5, py - 1.5);
    ctx.quadraticCurveTo(px + 6, py - 1, px + 5, py + 6);
    ctx.quadraticCurveTo(px + 3, py + 2, px - 1, py + 1.5);
    ctx.closePath();
  }, 0.7);
  // cabeça e pinças
  shape(ctx, shell, () => ellipse(ctx, 9, 3, 4.5, 4), 1);
  for (const side of [-1, 1]) {
    const open = 0.3 + Math.sin(p.time * 3 + side) * 0.15 + sting * 0.3;
    line(ctx, shell, 2.4, () => {
      ctx.moveTo(10, 3 + side * 2);
      ctx.lineTo(15, 3 + side * 6);
    });
    ctx.save();
    ctx.translate(16, 3 + side * 6);
    shape(ctx, radial(ctx, 0, 0, 5, '#f0b04a', '#8a4a10'), () => ellipse(ctx, 2, 0, 4, 2.6));
    ctx.rotate(side * open);
    shape(ctx, '#8a4a10', () => poly(ctx, [3, -side * 1, 9, -side * 2.5, 5, side * 0.5]), 0.6);
    ctx.restore();
  }
  glowingEye(ctx, 11, 1.5, 0.8, '#ff3a1a');
  glowingEye(ctx, 11, 4.5, 0.8, '#ff3a1a');
}

/** Faraó Imortal: rei-múmia com nemes listrado, máscara de ouro, cetro e ankh, flutuando em areia. */
export function drawPharaoh(ctx: Ctx, p: Pose): void {
  const breathe = Math.sin(p.time * 2) * 0.7;
  const blue = '#1a3a8a';
  const curse = p.attack;
  halo(ctx, 0, -6, 20, '#f0c35a', 0.25 + Math.sin(p.time * 3) * 0.08);
  // saia de linho e pernas enfaixadas
  shape(ctx, '#c8b890', () => ctx.roundRect(-4, 6, 3.5, 8, 1), 0.9);
  shape(ctx, '#c8b890', () => ctx.roundRect(0.5, 6, 3.5, 8, 1), 0.9);
  shape(ctx, vertical(ctx, 0, 9, '#f4ecd4', '#c8b890'), () => poly(ctx, [-6, 0, 6, 0, 7.5, 9, -7.5, 9]));
  shape(ctx, GOLD, () => poly(ctx, [-2, 0, 2, 0, 1, 8, -1, 8]), 0.5);
  // tronco enfaixado com colar largo de ouro e lápis-lazúli
  shape(ctx, vertical(ctx, -12, 1, '#e0d4b4', '#9a8a6a'), () => ctx.roundRect(-6, -11 + breathe, 12, 12, 3));
  for (let r = 0; r < 3; r++) {
    shape(ctx, r % 2 ? blue : GOLD, () => {
      ctx.ellipse(0, -10 + breathe, 7 - r * 0.2, 3.6 - r * 0.9 + 1.6, 0, 0, Math.PI);
    }, 0.4);
  }
  // braço com cetro (gancho) e braço com ankh
  line(ctx, '#e0d4b4', 3, () => {
    ctx.moveTo(-5, -8 + breathe);
    ctx.lineTo(-9, -1);
  });
  line(ctx, GOLD, 1.4, () => {
    ctx.moveTo(-9, 6);
    ctx.lineTo(-9, -14);
    ctx.quadraticCurveTo(-9, -18, -12, -17);
  });
  line(ctx, '#e0d4b4', 3, () => {
    ctx.moveTo(5, -8 + breathe);
    ctx.lineTo(10, -6 - curse * 6);
  });
  ctx.save();
  ctx.translate(11, -9 - curse * 6);
  if (curse > 0.1) halo(ctx, 0, -2, 9, '#9aff5a', curse);
  line(ctx, GOLD, 1.3, () => {
    ctx.moveTo(0, 5);
    ctx.lineTo(0, -1);
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
  });
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ellipse(ctx, 0, -3, 1.6, 2.2);
  ctx.stroke();
  ctx.restore();
  // cabeça: nemes listrado azul e ouro, máscara dourada, barba postiça e cobra na testa
  const hy = -17 + breathe;
  shape(ctx, GOLD, () => {
    ctx.moveTo(-7, hy + 7);
    ctx.lineTo(-6, hy - 4);
    ctx.quadraticCurveTo(0, hy - 9, 6, hy - 4);
    ctx.lineTo(7, hy + 7);
    ctx.lineTo(3, hy + 5);
    ctx.lineTo(-3, hy + 5);
    ctx.closePath();
  });
  ctx.strokeStyle = blue;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const y of [-2, 1, 4]) {
    ctx.moveTo(-6.5, hy + y);
    ctx.lineTo(-4, hy + y);
    ctx.moveTo(4, hy + y);
    ctx.lineTo(6.5, hy + y);
  }
  ctx.moveTo(-5, hy - 4);
  ctx.quadraticCurveTo(0, hy - 6.5, 5, hy - 4);
  ctx.stroke();
  shape(ctx, radial(ctx, 0, hy, 5, '#ffe9a0', '#c8901a'), () => ellipse(ctx, 0, hy, 3.8, 4.4), 0.8);
  shape(ctx, blue, () => ctx.roundRect(-0.9, hy + 3.8, 1.8, 4, 0.6), 0.5);
  // olhos com delineado e brilho verde-maldição
  for (const x of [-1.6, 1.6]) {
    shape(ctx, '#0a0a1a', () => poly(ctx, [x - 1.3, hy - 0.6, x + 1.3, hy - 0.6, x + 1.8, hy, x, hy + 0.6]), 0);
    glowingEye(ctx, x, hy - 0.1, 0.6, '#9aff5a');
  }
  shape(ctx, GOLD, () => poly(ctx, [-0.8, hy - 4, 0, hy - 7, 0.8, hy - 4]), 0.4);
  glowingEye(ctx, 0, hy - 6, 0.5, '#ff3a3a');
}
