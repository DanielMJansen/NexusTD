// Inimigos e chefes do Pântano (Fase 2): Sapo-Boi, Sanguessuga, Bruxa do Brejo, Crocodilo, Fogo-fátuo,
// Rei Sapo, Crocodilo Ancião e Hidra.
import { circle, ellipse, glowingEye, halo, line, poly, radial, shape, TAU, vertical, type Ctx, type Pose } from './spriteKit';

/** Sapo grande e verrugoso; agacha antes do salto e abre a boca no ataque. */
export function drawToad(ctx: Ctx, p: Pose, king = false): void {
  const crouch = Math.sin(p.time * 3) * 0.8;
  const skin = king ? '#6a8a2a' : '#5a7a3a';
  const belly = king ? '#e8d890' : '#d8d0a0';
  // patas traseiras
  for (const side of [-1, 1]) {
    shape(ctx, skin, () => ellipse(ctx, side * 9, 9 + crouch * 0.3, 6, 4.5, side * 0.4));
    shape(ctx, skin, () => ellipse(ctx, side * 12, 13, 4, 1.8));
  }
  // corpo
  shape(ctx, radial(ctx, 0, 0 + crouch, 14, king ? '#9aba4a' : '#8aaa5a', skin), () => ellipse(ctx, 0, 1 + crouch, 13, 10.5));
  shape(ctx, belly, () => ellipse(ctx, 1.5, 5 + crouch, 8, 5.5), 0);
  // verrugas
  ctx.fillStyle = king ? '#4a6a1a' : '#3e5a2a';
  for (const [x, y] of [[-7, -3], [-3, -6], [5, -5], [-9, 3], [8, 1]] as const) {
    ctx.beginPath();
    circle(ctx, x, y + crouch, 1.1);
    ctx.fill();
  }
  // patas da frente
  shape(ctx, skin, () => ellipse(ctx, 6, 11, 3, 2));
  shape(ctx, skin, () => ellipse(ctx, -4, 11, 3, 2));
  // boca (abre no ataque)
  const open = p.attack * 4;
  shape(ctx, '#7a2a3a', () => ellipse(ctx, 4, 0 + crouch + open * 0.4, 8, 1.2 + open), 1);
  if (open > 0.5) shape(ctx, '#e86a8a', () => ellipse(ctx, 6 + open, 0 + crouch + open * 0.5, 3 + open, 1.2), 0.8);
  // olhos saltados
  for (const x of [-4, 6]) {
    shape(ctx, skin, () => circle(ctx, x, -8 + crouch, 3.6));
    shape(ctx, '#ffd84a', () => circle(ctx, x + 0.5, -8.5 + crouch, 2.4), 0.6);
    ctx.fillStyle = '#12081c';
    ctx.fillRect(x - 0.5, -9.3 + crouch, 2.2, 1.4);
  }
  if (king) {
    // coroa de junco e vitória-régia
    shape(ctx, '#f0c35a', () => poly(ctx, [-6, -11, -4, -16, -1.5, -12, 1, -17, 3.5, -12, 6, -16, 8, -11]), 1);
    shape(ctx, '#ff6ab0', () => circle(ctx, 1, -14.5, 1.2), 0.6);
  }
}

/** Sanguessuga: verme escuro e brilhante que ondula, com ventosa cheia de dentes. */
export function drawLeech(ctx: Ctx, p: Pose): void {
  const wave = p.time * 8;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) pts.push([-9 + i * 3, Math.sin(wave + i * 0.9) * 1.6 + 4]);
  line(ctx, '#3a1a2a', 6, () => {
    ctx.moveTo(pts[0]![0], pts[0]![1]);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
  });
  line(ctx, '#7a2a4a', 2, () => {
    ctx.moveTo(pts[0]![0], pts[0]![1] - 1.2);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y - 1.2);
  }, false);
  // ventosa
  const head = pts[6]!;
  const bite = p.attack * 1.5;
  shape(ctx, '#5a1a3a', () => circle(ctx, head[0] + 1 + bite, head[1], 3.6));
  shape(ctx, '#e04a6a', () => circle(ctx, head[0] + 2 + bite, head[1], 1.8), 0.6);
  ctx.fillStyle = '#ffe0e8';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU;
    ctx.fillRect(head[0] + 2 + bite + Math.cos(a) * 1.6 - 0.3, head[1] + Math.sin(a) * 1.6 - 0.3, 0.7, 0.7);
  }
}

/** Bruxa do Brejo: velha corcunda coberta de musgo, com cajado de raiz e lanterna verde. */
export function drawBogHag(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.4) * 0.8;
  // manto de musgo
  shape(ctx, vertical(ctx, -12, 14, '#4a5a3a', '#26301e'), () => {
    ctx.moveTo(-5, -10);
    ctx.quadraticCurveTo(-11, 2, -9, 14);
    ctx.lineTo(9, 14);
    ctx.quadraticCurveTo(10, 0, 5, -10);
    ctx.closePath();
  });
  ctx.strokeStyle = '#6a8a4a';
  ctx.lineWidth = 0.9;
  for (const x of [-6, -2, 3, 7]) {
    ctx.beginPath();
    ctx.moveTo(x, 9);
    ctx.quadraticCurveTo(x + 1, 12, x, 15);
    ctx.stroke();
  }
  // capuz e rosto
  shape(ctx, '#3a4a2e', () => ellipse(ctx, 0 + sway, -12, 7, 7));
  shape(ctx, '#9aa080', () => ellipse(ctx, 1.5 + sway, -11, 4.2, 4.5));
  shape(ctx, '#8a9070', () => poly(ctx, [4 + sway, -11, 8.5 + sway, -8.5, 4.5 + sway, -9]), 0.8);
  glowingEye(ctx, 0.2 + sway, -12.5, 1, '#aaff5a');
  glowingEye(ctx, 3.2 + sway, -12.5, 1, '#aaff5a');
  // cajado de raiz na frente, com lanterna
  ctx.save();
  ctx.translate(8, -2);
  ctx.rotate(-0.15 + p.attack * 0.6);
  line(ctx, '#5a3a1e', 1.8, () => {
    ctx.moveTo(0, 16);
    ctx.quadraticCurveTo(-1.5, 2, 1, -12);
  });
  halo(ctx, 1.5, -13, 7 + p.attack * 5, '#9aff4a', 0.8);
  shape(ctx, '#caff8a', () => circle(ctx, 1.5, -13, 2.4), 0.8);
  ctx.restore();
  // mão
  shape(ctx, '#9aa080', () => circle(ctx, 8.5, 0, 1.8), 0.9);
}

/** Crocodilo: comprido e blindado; anda rente ao chão e morde no ataque. */
export function drawCrocodile(ctx: Ctx, p: Pose, elder = false): void {
  const walk = Math.sin(p.time * 6) * 1.2;
  const body = elder ? '#3a5a3a' : '#4a6a3a';
  const scales = elder ? '#2a4028' : '#36502a';
  // cauda
  shape(ctx, body, () => {
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-18, 2 + walk, -24, 6 - walk);
    ctx.quadraticCurveTo(-16, 8, -8, 8);
    ctx.closePath();
  });
  // patas
  for (const x of [-5, 6]) {
    shape(ctx, body, () => ellipse(ctx, x + walk * 0.5, 10, 2.6, 2));
    shape(ctx, body, () => ellipse(ctx, x - walk * 0.5, 9, 2.4, 1.8));
  }
  // corpo
  shape(ctx, radial(ctx, 0, 2, 12, elder ? '#5a7a4a' : '#6a8a4a', body), () => ellipse(ctx, 0, 4, 12, 5.5));
  // placas nas costas
  for (let i = -3; i <= 3; i++) shape(ctx, scales, () => poly(ctx, [i * 3 - 1.2, 0, i * 3, -2.5 - (elder ? 1 : 0), i * 3 + 1.2, 0]), 0.6);
  // cabeça com mandíbula (abre no ataque)
  const jaw = p.attack * 0.45;
  ctx.save();
  ctx.translate(10, 3);
  shape(ctx, body, () => ctx.roundRect(0, -3, 12, 4, 2));
  ctx.rotate(jaw);
  shape(ctx, elder ? '#4a6a40' : '#5a7a44', () => ctx.roundRect(0, 0, 12, 3, 1.5));
  ctx.fillStyle = '#f4f0dc';
  for (let x = 2; x < 12; x += 2.4) ctx.fillRect(x, -0.3, 0.9, 1.2);
  ctx.restore();
  glowingEye(ctx, 12, 0, 1.1, elder ? '#ff9a3a' : '#ffd84a');
  if (elder) {
    // cicatrizes e musgo
    line(ctx, '#c8b890', 0.8, () => {
      ctx.moveTo(-3, 1);
      ctx.lineTo(2, 6);
    }, false);
    shape(ctx, '#6a8a3a', () => ellipse(ctx, -4, -2, 4, 1.4), 0.6);
  }
}

/** Fogo-fátuo: chama fantasmagórica azul-esverdeada com rosto. */
export function drawWisp(ctx: Ctx, p: Pose): void {
  const flick = Math.sin(p.time * 9) * 1.5;
  halo(ctx, 0, -4, 16, '#7affe0', 0.7);
  shape(ctx, radial(ctx, 0, -2, 8, '#ffffff', '#5adcc8'), () => {
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-7, -8, -1, -13 - flick);
    ctx.quadraticCurveTo(1, -8, 3, -11 + flick);
    ctx.quadraticCurveTo(7, -6, 6, 0);
    ctx.quadraticCurveTo(0, 5, -6, 0);
    ctx.closePath();
  }, 0);
  ctx.fillStyle = '#1a4a48';
  ctx.beginPath();
  ellipse(ctx, -1.8, -3, 1, 1.4);
  ellipse(ctx, 1.8, -3, 1, 1.4);
  ctx.fill();
  ctx.beginPath();
  ellipse(ctx, 0, 0 + p.attack, 1.4, 0.7 + p.attack);
  ctx.fill();
  // brasas que sobem
  ctx.fillStyle = '#c8fff0';
  for (let i = 0; i < 3; i++) {
    const t = (p.time * 1.3 + i / 3) % 1;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    circle(ctx, Math.sin(i * 2 + p.time * 3) * 3, -6 - t * 12, 0.8);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Hidra: dragão-serpente saindo do pântano, com pescoços longos (pose.level = cabeças vivas, 1 a 5). */
export function drawHydra(ctx: Ctx, p: Pose): void {
  const heads = Math.max(1, Math.min(5, p.level || 3));
  const t = p.time;
  const scaleDark = '#1f4a3a';
  const scaleMid = '#2f6e52';
  const scaleLight = '#4f9a6e';
  const belly = '#c8d890';

  // água do pântano ao redor (ondulações)
  ctx.fillStyle = '#1a3a32cc';
  ctx.beginPath();
  ellipse(ctx, 0, 13, 27, 6);
  ctx.fill();
  ctx.strokeStyle = '#6ab0a066';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 2; k++) {
    const r = ((t * 0.6 + k * 0.5) % 1);
    ctx.globalAlpha = 1 - r;
    ctx.beginPath();
    ellipse(ctx, 0, 13, 22 + r * 10, 5 + r * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // cauda enrolada atrás
  line(ctx, scaleMid, 6, () => {
    ctx.moveTo(-12, 8);
    ctx.bezierCurveTo(-26, 10, -30, 0 + Math.sin(t * 1.5) * 2, -22, -4);
    ctx.quadraticCurveTo(-17, -7, -19, -1);
  });
  shape(ctx, scaleLight, () => poly(ctx, [-22, -5, -25, -9, -19, -6]), 0.8);

  // corpo
  shape(ctx, radial(ctx, -3, -2, 20, scaleLight, scaleDark), () => ellipse(ctx, 0, 4, 19, 11));
  // escamas do dorso
  ctx.strokeStyle = '#163a2c';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 9; i++) {
    const x = -14 + i * 3.5;
    ctx.beginPath();
    ctx.arc(x, -1 + Math.abs(x) * 0.12, 2.2, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
  }
  // espinhos das costas
  for (let i = 0; i < 6; i++) {
    const x = -12 + i * 4.5;
    shape(ctx, '#b8c870', () => poly(ctx, [x - 1.6, -5 + Math.abs(x) * 0.1, x, -10 + Math.abs(x) * 0.12, x + 1.6, -5 + Math.abs(x) * 0.1]), 0.7);
  }
  // barriga em placas
  for (let i = 0; i < 5; i++) {
    shape(ctx, belly, () => ellipse(ctx, -6 + i * 4, 10.5, 2.3, 1.5), 0.6);
  }
  // patas da frente com garras
  for (const [x, phase] of [[-9, 0], [9, 1.4]] as const) {
    const step = Math.sin(t * 2 + phase) * 0.8;
    shape(ctx, scaleMid, () => ctx.roundRect(x - 3, 6 + step, 6, 7, 2.5));
    for (const c of [-2, 0, 2]) shape(ctx, '#e8e4c8', () => poly(ctx, [x + c - 0.7, 13 + step, x + c, 15.5 + step, x + c + 0.7, 13 + step]), 0.5);
  }

  // pescoços (de trás para a frente) e cabeças
  const order = Array.from({ length: heads }, (_, i) => i).sort((a, b) => Math.abs(b - (heads - 1) / 2) - Math.abs(a - (heads - 1) / 2));
  for (const h of order) {
    const spread = heads === 1 ? 0 : (h / (heads - 1) - 0.5) * 2; // -1 .. 1
    const sway = Math.sin(t * 1.8 + h * 1.7);
    const lunge = p.attack * (0.6 + 0.4 * Math.sin(h * 2.3 + 1));
    // base no corpo, curva e cabeça
    // leque mais aberto com mais cabeças
    const fan = heads >= 4 ? 30 : heads === 3 ? 24 : 20;
    const bx = spread * (heads >= 4 ? 11 : 8);
    const by = -2;
    const hx = spread * fan + 6 + sway * 2 + lunge * 7;
    const hy = -28 - (1 - Math.abs(spread)) * 9 + Math.cos(t * 1.6 + h) * 1.8 - lunge * 2;
    const cx1 = bx + spread * 4 - 4;
    const cy1 = by - 14;
    const cx2 = hx - 10 - sway * 2;
    const cy2 = hy + 10;
    // pescoço grosso que afina (contorno + cor + listra clara da garganta)
    const neck = (width: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, hx - 3, hy + 2);
      ctx.stroke();
    };
    neck(8.4, '#0e2a20');
    neck(6.2, scaleMid);
    neck(2.2, scaleLight);
    // espinhos ao longo do pescoço
    for (let k = 1; k <= 3; k++) {
      const u = k / 4;
      const x = (1 - u) ** 3 * bx + 3 * (1 - u) ** 2 * u * cx1 + 3 * (1 - u) * u * u * cx2 + u ** 3 * (hx - 3);
      const y = (1 - u) ** 3 * by + 3 * (1 - u) ** 2 * u * cy1 + 3 * (1 - u) * u * u * cy2 + u ** 3 * (hy + 2);
      shape(ctx, '#b8c870', () => poly(ctx, [x - 3.2, y - 1.5, x - 5.5, y - 4, x - 2, y - 3.2]), 0.6);
    }

    // cabeça de dragão-serpente
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-0.15 + spread * 0.25 - lunge * 0.2);
    const open = 0.15 + lunge * 0.55;
    // crista e chifres
    shape(ctx, '#7a3a5a', () => poly(ctx, [-6, -1, -11, -6, -8, 1]), 0.7);
    shape(ctx, '#e8e0c0', () => {
      ctx.moveTo(-2, -4);
      ctx.quadraticCurveTo(-8, -10, -11, -8);
      ctx.quadraticCurveTo(-7, -7, -4, -2);
      ctx.closePath();
    }, 0.7);
    // mandíbula de baixo (abre no ataque)
    ctx.save();
    ctx.translate(-2, 1.5);
    ctx.rotate(open);
    shape(ctx, scaleDark, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(11, 1);
      ctx.quadraticCurveTo(12, 3, 9, 3.5);
      ctx.lineTo(0, 3);
      ctx.closePath();
    }, 0.9);
    ctx.fillStyle = '#f4f0dc';
    for (let k = 0; k < 4; k++) ctx.fillRect(2.5 + k * 2.2, -0.3, 0.8, 1.4);
    ctx.restore();
    // boca por dentro
    if (open > 0.3) shape(ctx, '#5a1a2a', () => poly(ctx, [-1, 1, 10, 1.5, 9, 1.5 + open * 6, -1, 2 + open * 3]), 0);
    // crânio alongado com focinho
    shape(ctx, radial(ctx, 0, -2, 9, scaleLight, scaleMid), () => {
      ctx.moveTo(-6, 2);
      ctx.quadraticCurveTo(-6, -5, 1, -5);
      ctx.quadraticCurveTo(8, -4.5, 12, -1.5);
      ctx.quadraticCurveTo(13, 1, 11, 2);
      ctx.lineTo(-6, 2);
      ctx.closePath();
    });
    ctx.fillStyle = '#f4f0dc';
    for (let k = 0; k < 4; k++) ctx.fillRect(3 + k * 2.2, 1.6, 0.8, 1.2);
    // narina e sobrancelha
    ctx.fillStyle = '#0e2a20';
    ctx.beginPath();
    ellipse(ctx, 10.5, -1.6, 0.8, 0.5);
    ctx.fill();
    shape(ctx, scaleDark, () => poly(ctx, [0, -4.6, 5, -5.2, 4, -3.4]), 0.6);
    // olho amarelo com pupila em fenda
    halo(ctx, 2.5, -2.6, 4, '#e8ff5a', 0.5);
    shape(ctx, '#f0e04a', () => ellipse(ctx, 2.5, -2.6, 1.8, 1.3), 0.6);
    ctx.fillStyle = '#1a1a10';
    ctx.fillRect(2.2, -3.8, 0.6, 2.4);
    // baba ácida
    if (lunge > 0.25) {
      ctx.fillStyle = '#b8ff4a';
      ctx.globalAlpha = lunge;
      ctx.beginPath();
      ellipse(ctx, 9, 4 + lunge * 5, 1, 2 + lunge * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      halo(ctx, 12, 2, 6, '#b8ff4a', lunge * 0.8);
    }
    ctx.restore();
  }
}
