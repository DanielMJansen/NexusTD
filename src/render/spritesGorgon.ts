// Raça Górgona: Arqueira Serpente, Medusa, Basilisco e a heroína Rainha Górgona.
import {
  halo,
  circle,
  darken,
  ellipse,
  flame,
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
} from "./spriteKit";

/** Cauda de serpente no lugar das pernas (corpo de naga). */
function nagaTail(ctx: Ctx, t: number, color: string, dark: string): void {
  const wave = Math.sin(t * 3) * 2;
  shape(ctx, vertical(ctx, 0, 14, color, dark), () => {
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-9, 10, -2, 13);
    ctx.quadraticCurveTo(8, 15 + wave, 14, 10 + wave);
    ctx.quadraticCurveTo(9, 11, 2, 9);
    ctx.quadraticCurveTo(4, 4, 5, 0);
    ctx.closePath();
  });
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (const x of [-2, 2, 6]) {
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 2, 12);
  }
  ctx.stroke();
}

/** Cabelo de serpentes que se mexem (`len` alonga, `width` engrossa). */
function snakeHair(
  ctx: Ctx,
  hy: number,
  t: number,
  color: string,
  count = 5,
  len = 1,
  width = 1.4,
  eyes = "#ff3a3a",
): void {
  for (let i = 0; i < count; i++) {
    const a = -2.6 + (i / (count - 1)) * 2.2;
    const x0 = 1 + Math.cos(a) * 5;
    const y0 = hy + Math.sin(a) * 5;
    const wig = Math.sin(t * 5 + i) * 2 * len;
    const tx = x0 + Math.cos(a) * 8 * len;
    const ty = y0 + Math.sin(a) * 8 * len + wig;
    line(ctx, color, width, () => {
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(
        x0 + Math.cos(a) * 5 * len + wig,
        y0 + Math.sin(a) * 5 * len,
        tx,
        ty,
      );
    });
    if (len > 1.2)
      shape(ctx, color, () => ellipse(ctx, tx, ty, 1.5, 1.1, a), 0.4);
    ctx.fillStyle = eyes;
    ctx.beginPath();
    circle(ctx, tx, ty, 0.5);
    ctx.fill();
  }
}

/** Cores da Arqueira Serpente em cada variante: cauda, pele, cabelo, roupa e cobra companheira. */
const ARCHER_SNAKE_VARIANTS = {
  // Górgona do Deserto: escamas cor de areia
  rare: {
    tail: ["#d8b070", "#7a5a2a"],
    skin: ["#f4e4c0", "#c8a878"],
    hair: "#c89a50",
    top: ["#a85a2a", "#5a2a10"],
    snake: ["#e0b060", "#7a5418"],
    eyes: "#ff8a2a",
  },
  // Górgona Coral: listras vermelho, preto e amarelo
  epic: {
    tail: ["#e0303a", "#5a0a10"],
    skin: ["#f0e0d0", "#c8a890"],
    hair: "#14141a",
    top: ["#f0c030", "#8a6a10"],
    snake: ["#e0303a", "#14141a"],
    eyes: "#ffe040",
  },
  // Górgona de Jade: pele de jade, joias e cobras de esmeralda
  legendary: {
    tail: ["#4ad8a0", "#0e5a3e"],
    skin: ["#c8ffe4", "#6ac8a0"],
    hair: "#1ea870",
    top: ["#ffe07a", "#c8901a"],
    snake: ["#2ae890", "#0a6a40"],
    eyes: "#ffffff",
  },
} as const;

/** Domadora de Serpentes: naga com flauta e uma cobra que dá o bote. A: Víbora (roxa, veneno forte); B: Naja (capuz de naja, cospe em leque). */
export function drawSerpentArcher(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Rainha das Víboras (A, serpente enorme enrolada) e Hidra Menor (B, três serpentes na mão)
  if (p.supreme && formA(p)) {
    // Rainha das Víboras: víbora gigante erguida atrás dela, de capuz aberto sobre sua cabeça
    const sway = Math.sin(p.time * 2) * 2;
    const sv = p.variant
      ? ARCHER_SNAKE_VARIANTS[p.variant].snake
      : (["#8a4ac8", "#3a1a5a"] as const);
    // enrolada no chão atrás e à esquerda dela, erguendo-se acima do ombro (sem cobrir a domadora)
    shape(ctx, sv[1], () => ellipse(ctx, -14, 12, 9, 3.2), 0.9);
    line(ctx, "#0a0612", 7.5, () => {
      ctx.moveTo(-14, 11);
      ctx.bezierCurveTo(-24, 2, -20, -10, -15, -20 + sway);
    });
    line(
      ctx,
      sv[0],
      6,
      () => {
        ctx.moveTo(-14, 11);
        ctx.bezierCurveTo(-24, 2, -20, -10, -15, -20 + sway);
      },
      false,
    );
    // capuz aberto de naja, voltado para a frente
    shape(
      ctx,
      vertical(ctx, -32, -14, sv[0], sv[1]),
      () => ellipse(ctx, -15, -23 + sway, 6.5, 8),
      0.9,
    );
    shape(ctx, sv[1], () => ellipse(ctx, -15, -23 + sway, 2.8, 5), 0);
    shape(ctx, sv[0], () => ellipse(ctx, -12.5, -27 + sway, 4, 2.8), 0.8);
    glowingEye(ctx, -11.5, -27.8 + sway, 0.9, "#ffe060");
  }
  const viper = formA(p);
  const cobra = formB(p);
  const av = p.variant ? ARCHER_SNAKE_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (av && cobra ? darken(c, 0.25) : c);
  const scale = av
    ? shadeB(av.snake[0])
    : viper
      ? "#8a4ad8"
      : cobra
        ? "#c8a03a"
        : "#4ab86a";
  const dark = av
    ? av.snake[1]
    : viper
      ? "#3a1a6a"
      : cobra
        ? "#5a4010"
        : "#1e5a2e";
  if (viper && !p.supreme) {
    // Víbora: cobra grande atrás, subindo pelas costas com o capuz aberto sobre o ombro
    const sw = Math.sin(p.time * 2) * 1.5;
    line(ctx, dark, 5, () => {
      ctx.moveTo(-6, 10);
      ctx.bezierCurveTo(-16, 4, -4, -8, -11, -20 + sw);
    });
    line(
      ctx,
      scale,
      3.4,
      () => {
        ctx.moveTo(-6, 10);
        ctx.bezierCurveTo(-16, 4, -4, -8, -11, -20 + sw);
      },
      false,
    );
    shape(
      ctx,
      vertical(ctx, -28, -16, scale, dark),
      () => ellipse(ctx, -11, -21 + sw, 5.5, 6.5),
      0.8,
    );
    shape(ctx, dark, () => ellipse(ctx, -11, -21 + sw, 2.4, 3.6), 0);
    shape(ctx, scale, () => ellipse(ctx, -9, -24 + sw, 3, 2), 0.7);
    glowingEye(ctx, -8, -24.5 + sw, 0.8, "#ffe060");
  }
  nagaTail(
    ctx,
    p.time,
    av ? av.tail[0] : "#5a8a5a",
    av ? av.tail[1] : "#24402a",
  );
  if (p.variant === "epic") {
    // listras de coral na cauda
    for (const [x, c] of [
      [-4, "#14141a"],
      [0, "#f0c030"],
      [4, "#14141a"],
      [8, "#f0c030"],
    ] as const)
      shape(ctx, c, () => ctx.rect(x, 9, 1.6, 4), 0);
  }
  shape(
    ctx,
    vertical(
      ctx,
      -10,
      2,
      av ? av.top[0] : "#e8dcc0",
      av ? av.top[1] : "#a89878",
    ),
    () => poly(ctx, [-5, -10, 5, -10, 6, 2, -6, 2]),
  );
  shape(ctx, scale, () => ctx.rect(-5.5, -4, 11, 1.6), 0.5);
  if (p.variant === "legendary")
    for (const x of [-3, 0, 3])
      shape(
        ctx,
        "#2ae890",
        () => poly(ctx, [x, -8.6, x + 1, -7.2, x, -5.8, x - 1, -7.2]),
        0.4,
      );
  const hy = -15;
  snakeHair(ctx, hy, p.time, av ? av.hair : "#5ab85a", 4);
  shape(
    ctx,
    radial(
      ctx,
      1,
      hy,
      6,
      av ? av.skin[0] : "#d8f0c8",
      av ? av.skin[1] : "#8ab878",
    ),
    () => circle(ctx, 1, hy, 6),
  );
  glowingEye(ctx, 0.5, hy, 1.1, av ? av.eyes : "#ffd23a");
  glowingEye(ctx, 4, hy, 1.1, av ? av.eyes : "#ffd23a");
  // flauta
  line(ctx, "#8a5a2e", 1.4, () => {
    ctx.moveTo(4, hy + 3);
    ctx.lineTo(11, hy + 6);
  });
  // a serpente companheira: enrolada à frente, ergue-se e dá o bote no ataque
  const strike = p.attack;
  const sway = Math.sin(p.time * 3) * 1.5;
  const headX = 12 + strike * 8;
  const headY = -6 - (1 - strike) * 4 + sway * (1 - strike);
  // na Hidra Menor a companheira vira a própria hidra (desenhada abaixo)
  const hydra = p.supreme && cobra;
  if (!hydra) {
    shape(ctx, dark, () => ellipse(ctx, 10, 10, 6, 2.5), 0.8);
    line(ctx, scale, cobra ? 3.6 : 2.6, () => {
      ctx.moveTo(8, 9);
      ctx.quadraticCurveTo(14, 4, 11, -1);
      ctx.quadraticCurveTo(9 + strike * 4, -5, headX, headY);
    });
    if (cobra && !p.supreme) {
      // Naja: capuz grande e largo, com o desenho de óculos
      shape(
        ctx,
        vertical(
          ctx,
          headY - 8,
          headY + 6,
          av ? av.snake[0] : "#e8c060",
          av ? av.snake[1] : "#7a5a1a",
        ),
        () => ellipse(ctx, headX - 1.5, headY, 5.4, 7.4),
        0.8,
      );
      for (const dy of [-2.6, 2.2])
        shape(
          ctx,
          "#2a1a0a",
          () => ellipse(ctx, headX - 2, headY + dy, 1.4, 1.1),
          0,
        );
    } else if (cobra) {
      // capuz de naja
      shape(
        ctx,
        vertical(ctx, headY - 5, headY + 4, "#e8c060", "#7a5a1a"),
        () => ellipse(ctx, headX - 1, headY, 3.6, 4.6),
        0.7,
      );
    }
    shape(ctx, scale, () => ellipse(ctx, headX + 1.5, headY, 3, 2.1), 0.8);
    ctx.fillStyle = av ? av.eyes : viper ? "#ff6aff" : "#ffd23a";
    ctx.beginPath();
    circle(ctx, headX + 2, headY - 0.8, 0.6);
    ctx.fill();
    if (strike > 0.2) {
      // língua bífida no bote
      ctx.strokeStyle = "#e0243a";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(headX + 4.4, headY + 0.4);
      ctx.lineTo(headX + 6.5, headY - 0.6);
      ctx.moveTo(headX + 4.4, headY + 0.4);
      ctx.lineTo(headX + 6.5, headY + 1.4);
      ctx.stroke();
    }
  }
  if (hydra) {
    // Hidra Menor: a companheira vira uma hidra de três cabeças grandes, de capuz de naja
    const hc = av ? av.snake : (["#e8c060", "#7a5a1a"] as const);
    // corpo enrolado à direita e três pescoços abertos em leque, longe do rosto dela
    shape(ctx, hc[1], () => ellipse(ctx, 17, 11, 7, 3), 0.9);
    for (let i = 0; i < 3; i++) {
      const wave = Math.sin(p.time * 3 + i * 1.7) * 1.5;
      const tx = 14 + i * 6.5 + strike * 3;
      const ty = -10 - (i === 1 ? 6 : 0) + wave;
      line(ctx, "#0a0612", 4.4, () => {
        ctx.moveTo(15 + i * 2, 10);
        ctx.quadraticCurveTo(13 + i * 5, 0, tx, ty);
      });
      line(
        ctx,
        hc[0],
        3.2,
        () => {
          ctx.moveTo(15 + i * 2, 10);
          ctx.quadraticCurveTo(13 + i * 5, 0, tx, ty);
        },
        false,
      );
      shape(
        ctx,
        vertical(ctx, ty - 4, ty + 4, hc[0], hc[1]),
        () => ellipse(ctx, tx - 0.5, ty, 3.2, 4),
        0.8,
      );
      shape(ctx, hc[0], () => ellipse(ctx, tx + 1.8, ty - 0.8, 2.6, 1.8), 0.7);
      glowingEye(ctx, tx + 2.2, ty - 1.4, 0.6, "#ff3a3a");
    }
  }
}

/** Medusa: serpentes no cabelo e olhar que brilha. A: Olhar Pétreo (olhos dourados intensos); B: Górgona Ancestral (coroa antiga, olhos vermelhos). */
/** Cores da Medusa em cada variante: cauda, pele, cabelo, roupa e olhos. */
const MEDUSA_VARIANTS = {
  // Medusa de Mármore: pele cinza-pedra
  rare: {
    tail: ["#a8a8b0", "#4a4a54"],
    skin: ["#f0f0f4", "#a8a8b4"],
    hair: "#8a8a96",
    top: ["#ffffff", "#b8b8c4"],
    eyes: "#ffd25a",
  },
  // Medusa Rainha do Nilo: nemes listrado, delineado e cobras douradas
  epic: {
    tail: ["#d0a040", "#6a4a10"],
    skin: ["#f0d8b0", "#c89a68"],
    hair: "#e8b830",
    top: ["#3a6ad8", "#14287a"],
    eyes: "#5ad8ff",
  },
  // Medusa Água-viva: um sino de água-viva no lugar do cabelo, tentáculos compridos caindo atrás
  legendary: {
    tail: ["#ff9ad8", "#8a2a7a"],
    skin: ["#eef6ff", "#a8c0e0"],
    hair: "#ff9ad8",
    top: ["#7ad8ff", "#2a6a9a"],
    eyes: "#ff6ad0",
  },
} as const;

/** Tentáculos da água-viva caindo da borda do sino, ondulando (finos e de babado). */
function jellyTentacles(ctx: Ctx, hy: number, t: number, color: string): void {
  ctx.save();
  ctx.globalAlpha *= 0.8;
  for (let i = 0; i < 6; i++) {
    const x = -6 + i * 2.8;
    const len = 18 + (i % 2) * 6;
    line(
      ctx,
      color,
      i % 2 ? 0.8 : 1.8,
      () => {
        ctx.moveTo(x, hy - 1);
        for (let k = 1; k <= 4; k++)
          ctx.lineTo(
            x - k * 1.6 + Math.sin(t * 3 + i + k) * 1.4,
            hy - 1 + (len * k) / 4,
          );
      },
      false,
    );
  }
  ctx.restore();
}

/** Sino translúcido da água-viva sobre a cabeça, com borda ondulada e pintas que brilham. */
function jellyBell(ctx: Ctx, hy: number, t: number, color: string): void {
  const pulse = 1 + Math.sin(t * 3) * 0.05;
  halo(ctx, 1, hy - 6, 11, color, 0.35);
  ctx.save();
  ctx.translate(1, hy - 1);
  ctx.scale(pulse, 1 / pulse);
  shape(
    ctx,
    vertical(ctx, -12, 0, "#ffe0f4ee", color + "aa"),
    () => {
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(-9, -12, 0, -12);
      ctx.quadraticCurveTo(9, -12, 8, 0);
      for (let x = 8; x > -8; x -= 2)
        ctx.quadraticCurveTo(x - 1, 1.6, x - 2, 0);
      ctx.closePath();
    },
    0.8,
  );
  for (const [x, y] of [
    [-4, -6],
    [0, -9],
    [4, -5],
    [-1, -3],
  ] as const)
    halo(ctx, x, y, 2, "#ffffff", 0.5 + Math.sin(t * 4 + x) * 0.3);
  ctx.restore();
}

export function drawMedusa(ctx: Ctx, p: Pose): void {
  const stone = formA(p);
  const ancient = formB(p);
  const mv = p.variant ? MEDUSA_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (mv && ancient ? darken(c, 0.2) : c);
  if (p.supreme && ancient && p.variant === "legendary") {
    // Água-viva: no lugar da naja dourada, uma água-viva colossal flutuando atrás, com tentáculos longos
    const sway = Math.sin(p.time * 1.6) * 1.5;
    halo(ctx, 0, -26, 22, "#c86aff", 0.35);
    ctx.save();
    ctx.translate(0, -13 + sway);
    ctx.scale(1.6, 1.6);
    jellyTentacles(ctx, 0, p.time * 0.7, "#c86aff");
    jellyBell(ctx, 0, p.time * 0.7, "#c86aff");
    ctx.restore();
  } else if (p.supreme && ancient) {
    // Górgona Ancestral suprema: naja dourada colossal erguida atrás, de capuz aberto
    const sway = Math.sin(p.time * 1.6) * 1.5;
    halo(ctx, 0, -24, 22, "#ffd25a", 0.4);
    shape(
      ctx,
      vertical(ctx, -46, 6, "#ffe48a", "#a8701a"),
      () => {
        ctx.moveTo(-6, 8);
        ctx.quadraticCurveTo(-20, -14, -16, -34 + sway);
        ctx.quadraticCurveTo(-8, -48 + sway, 0, -46 + sway);
        ctx.quadraticCurveTo(8, -48 + sway, 16, -34 + sway);
        ctx.quadraticCurveTo(20, -14, 6, 8);
        ctx.closePath();
      },
      1.1,
    );
    shape(ctx, "#2a4ab0", () => ellipse(ctx, 0, -30 + sway, 8, 12), 0);
    for (const y of [-38, -30, -22])
      shape(ctx, "#ffd25a", () => ellipse(ctx, 0, y + sway, 4, 1.4), 0);
    shape(
      ctx,
      vertical(ctx, -52, -40, "#ffe48a", "#a8701a"),
      () => ellipse(ctx, 0, -47 + sway, 5, 4),
      0.9,
    );
    glowingEye(ctx, -2, -48 + sway, 0.9, "#ff3a3a");
    glowingEye(ctx, 2, -48 + sway, 0.9, "#ff3a3a");
  }
  if (p.supreme && stone) {
    // Olhar Pétreo supremo: jardim de estátuas de pedra das vítimas ao redor
    for (const [x, s, flip] of [
      [-17, 1.25, 1],
      [-10, 0.95, -1],
      [16, 1.15, -1],
    ] as const) {
      ctx.save();
      ctx.translate(x, 14);
      ctx.scale(s * flip, s);
      shape(
        ctx,
        vertical(ctx, -14, 0, "#d8d8d8", "#6a6a6a"),
        () => ctx.roundRect(-2.6, -10, 5.2, 10, 1.2),
        0.8,
      );
      shape(ctx, "#c0c0c0", () => circle(ctx, 0, -12.5, 3), 0.8);
      line(ctx, "#a8a8a8", 1.6, () => {
        ctx.moveTo(2, -8);
        ctx.lineTo(5.5, -12);
      });
      line(
        ctx,
        "#7a7a7a",
        0.5,
        () => {
          ctx.moveTo(-1, -6);
          ctx.lineTo(1, -3);
        },
        false,
      );
      ctx.restore();
    }
  }
  if (stone && !p.supreme) {
    // Olhar Pétreo: estátuas de pedra pequenas aos pés (vítimas petrificadas)
    for (const [x, s] of [
      [-12, 1],
      [-7, 0.8],
    ] as const) {
      shape(
        ctx,
        vertical(ctx, 14 - 9 * s, 14, "#c8c8c8", "#6a6a6a"),
        () => ctx.roundRect(x - 2 * s, 14 - 7 * s, 4 * s, 7 * s, 1),
        0.7,
      );
      shape(ctx, "#b0b0b0", () => circle(ctx, x, 14 - 8.5 * s, 2 * s), 0.7);
    }
  }
  nagaTail(
    ctx,
    p.time,
    mv ? shadeB(mv.tail[0]) : "#6a9a5a",
    mv ? mv.tail[1] : "#2a4a24",
  );
  shape(
    ctx,
    vertical(
      ctx,
      -10,
      2,
      mv ? mv.top[0] : "#e8e0c8",
      mv ? mv.top[1] : "#a8a08a",
    ),
    () => poly(ctx, [-5, -10, 5, -10, 6, 2, -6, 2]),
  );
  shape(ctx, GOLD, () => ctx.rect(-5.5, -3, 11, 1.4), 0.5);
  const jelly = p.variant === "legendary";
  const hy = -15;
  if (p.variant === "epic" && !ancient) {
    // nemes listrado azul e dourado caindo pelos ombros
    shape(
      ctx,
      vertical(ctx, hy - 7, hy + 9, "#3a6ad8", "#14287a"),
      () =>
        poly(ctx, [
          -6,
          hy - 4,
          7,
          hy - 4,
          8.5,
          hy + 9,
          4,
          hy + 9,
          4,
          hy + 2,
          -3,
          hy + 2,
          -3,
          hy + 9,
          -7.5,
          hy + 9,
        ]),
      0.8,
    );
    line(
      ctx,
      "#ffd25a",
      0.8,
      () => {
        for (const y of [hy + 4, hy + 6.5]) {
          ctx.moveTo(-7.2, y);
          ctx.lineTo(-3, y);
          ctx.moveTo(4, y);
          ctx.lineTo(8.2, y);
        }
      },
      false,
    );
  }
  // o sino da água-viva fica acima dos olhos (como cabelo), sem cobrir o rosto
  const bellY = hy - 4;
  if (jelly) {
    jellyTentacles(ctx, bellY, p.time, ancient ? darken(mv!.hair, 0.3) : mv!.hair);
    if (p.supreme && stone) {
      // Olhar Eterno (Água-viva): tentáculos urticantes erguidos em leque atrás do sino, de pontas acesas
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.34;
        const len = 18 + Math.sin(p.time * 4 + i) * 2;
        const tx = 1 + Math.cos(a) * len;
        const ty = bellY - 6 + Math.sin(a) * len;
        line(ctx, "#ff9ad8cc", 1.6, () => {
          ctx.moveTo(1 + Math.cos(a) * 4, bellY - 6);
          ctx.quadraticCurveTo((1 + tx) / 2 + Math.sin(p.time * 3 + i) * 2.5, (bellY - 6 + ty) / 2, tx, ty);
        }, false);
        halo(ctx, tx, ty, 3, "#7ad8ff", 0.6 + Math.sin(p.time * 5 + i) * 0.3);
        shape(ctx, "#e8f8ff", () => circle(ctx, tx, ty, 1.1), 0);
      }
    }
  } else
    snakeHair(
      ctx,
      hy,
      p.time,
      mv ? mv.hair : ancient ? "#4a7a3a" : "#5ab85a",
      ancient && !p.supreme ? 9 : 7,
      ancient && !p.supreme ? 1.5 : 1,
      ancient && !p.supreme ? 1.8 : 1.4,
    );
  shape(
    ctx,
    radial(
      ctx,
      1,
      hy,
      6.4,
      mv ? mv.skin[0] : "#e0f0d8",
      mv ? mv.skin[1] : "#98b890",
    ),
    () => circle(ctx, 1, hy, 6.3),
  );
  if (jelly) jellyBell(ctx, bellY, p.time, ancient ? "#c86aff" : mv!.hair);
  const gaze = 1 + p.attack * 0.8;
  const eyes = mv
    ? mv.eyes
    : ancient
      ? "#ff3a3a"
      : stone
        ? "#ffd25a"
        : "#c8ff6a";
  if (stone && !p.supreme) halo(ctx, 2, hy, 7, eyes, 0.7);
  ctx.save();
  ctx.shadowColor = eyes;
  ctx.shadowBlur = 6 + p.attack * 10;
  glowingEye(ctx, 0, hy, 1.4 * gaze * (stone ? 1.2 : 1), eyes);
  glowingEye(ctx, 4, hy, 1.4 * gaze * (stone ? 1.2 : 1), eyes);
  ctx.restore();
  if (p.variant === "epic") {
    // delineado egípcio
    line(
      ctx,
      "#14141a",
      0.7,
      () => {
        ctx.moveTo(-1.6, hy - 0.6);
        ctx.lineTo(-3.4, hy + 0.4);
        ctx.moveTo(5.6, hy - 0.6);
        ctx.lineTo(7.2, hy + 0.6);
      },
      false,
    );
  }
  if (p.attack > 0.2 || (stone && !p.supreme)) {
    // raio do olhar (sempre aceso no Olhar Pétreo)
    ctx.save();
    ctx.globalAlpha *=
      stone && p.attack <= 0.2 ? 0.35 + Math.sin(p.time * 3) * 0.1 : 1;
    ctx.strokeStyle = eyes + "88";
    ctx.lineWidth = stone ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(5, hy);
    ctx.lineTo(20, hy + 3);
    ctx.stroke();
    ctx.restore();
  }
  if (ancient) {
    // coroa antiga (maior, com cobras douradas na Górgona Ancestral); na Água-viva, pousada no topo do sino
    const cy = jelly ? hy - 4 : hy;
    shape(ctx, vertical(ctx, cy - 14, cy - 5, "#ffe090", "#8a6a2a"), () =>
      poly(ctx, [
        -5.5,
        cy - 5,
        -6,
        cy - 11,
        -2.5,
        cy - 7.5,
        1,
        cy - 14,
        4.5,
        cy - 7.5,
        8,
        cy - 11,
        7.5,
        cy - 5,
      ]),
    );
    for (const x of [-6, 1, 8])
      shape(
        ctx,
        "#ff3a3a",
        () => circle(ctx, x, cy - (x === 1 ? 14 : 11), 0.9),
        0,
      );
  }
  if (p.supreme && formA(p) && !jelly) {
    // cabelo de serpentes enormes erguidas em leque, cada uma com cabeça e olhos
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.3;
      const len = 17 + Math.sin(p.time * 5 + i) * 2;
      const x0 = 1 + Math.cos(a) * 5;
      const y0 = -18 + Math.sin(a) * 4;
      const tx = 1 + Math.cos(a) * len;
      const ty = -16 + Math.sin(a) * len;
      line(ctx, jelly ? "#ff7ac8" : "#3a9a6a", 2.4, () => {
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(
          (x0 + tx) / 2 + Math.sin(p.time * 3 + i) * 2.5,
          (y0 + ty) / 2,
          tx,
          ty,
        );
      });
      shape(
        ctx,
        jelly ? "#ffc0e8" : "#5ad88a",
        () => ellipse(ctx, tx, ty, 2.2, 1.6, a),
        0.5,
      );
      shape(
        ctx,
        "#ff3a3a",
        () =>
          circle(
            ctx,
            tx + Math.cos(a) * 0.6,
            ty + Math.sin(a) * 0.6 - 0.4,
            0.5,
          ),
        0,
      );
    }
    halo(ctx, 2, -15, 10, "#e8ff6a", 0.5 + p.attack * 0.4);
  }
  if (p.supreme && formB(p) && !jelly) {
    // coroa de cobras douradas
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 3;
      shape(
        ctx,
        "#f0c35a",
        () => poly(ctx, [x - 1.2, -21, x, -28 - (i % 2) * 2, x + 1.2, -21]),
        0.6,
      );
      shape(ctx, "#ff3a3a", () => circle(ctx, x, -27.5 - (i % 2) * 2, 0.6), 0);
    }
  }
}

/** Basilisco: lagarto-serpente de crista. A: Basilisco Rei (crista coroada); B: Cuspidor (baba ácida verde). */
/** Cores do Basilisco em cada variante: corpo, escuro, barriga, crista e espinhos. */
const BASILISK_VARIANTS = {
  // Basilisco Albino: branco de olhos vermelhos
  rare: {
    body: "#e8e8e4",
    dark: "#8a8a88",
    belly: "#fff4f0",
    crest: "#e05a6a",
    spine: "#c03a4a",
    eye: "#ff3a3a",
  },
  // Basilisco de Lava: escamas de rocha e crista de fogo
  epic: {
    body: "#4a3a36",
    dark: "#140a08",
    belly: "#ff8a2a",
    crest: "#ff6a1a",
    spine: "#ff8a2a",
    eye: "#ffe060",
  },
  // Basilisco Dourado Imperial: escamas de ouro e crista de joias
  legendary: {
    body: "#f0c040",
    dark: "#7a5208",
    belly: "#fff4c8",
    crest: "#3ad8ff",
    spine: "#ff3a8a",
    eye: "#3ad8ff",
  },
} as const;

export function drawBasilisk(ctx: Ctx, p: Pose): void {
  // Basilisco: serpente gigante enrolada, pescoço erguido em S e olhar mortal.
  // A: Basilisco Rei (corpo maior, crista enorme e coroa); B: Cuspidor (ácido verde, glândulas brilhando).
  const king = formA(p);
  const spitter = formB(p);
  const bv = p.variant ? BASILISK_VARIANTS[p.variant] : null;
  const body = bv
    ? spitter
      ? darken(bv.body, 0.2)
      : bv.body
    : king
      ? "#3a6a3a"
      : spitter
        ? "#4a7a2a"
        : "#3a5a3a";
  const dark = bv
    ? bv.dark
    : king
      ? "#0e2a14"
      : spitter
        ? "#1a3a0c"
        : "#122414";
  const belly = bv ? bv.belly : "#c8c890";
  const sway = Math.sin(p.time * 1.6) * 1.5;
  const strike = p.attack;
  // um pouco maior que as outras criaturas: imponente (o Rei, ainda maior)
  // na Suprema a escala de ★5 já aumenta o corpo: o extra do Rei fica menor, para não sair do quadro
  const grow = king ? 1.12 * (p.supreme ? 1.05 : 1.15) : 1.12;
  ctx.translate(0, 14);
  ctx.scale(grow, grow);
  ctx.translate(0, -14);
  if (spitter && !p.supreme) {
    // poça de ácido aos pés
    shape(ctx, "#9aff3a55", () => ellipse(ctx, 2, 13, 15, 3), 0);
  }
  if (p.supreme && king) {
    // Imperador Basilisco: ruínas de um templo atrás (coluna quebrada e um toco), baixas para não disputar com a cabeça
    for (const [x, h, broken] of [
      [-18, 24, true],
      [17, 12, true],
    ] as const) {
      shape(
        ctx,
        vertical(ctx, 13 - h, 13, "#e8e0cc", "#8a8070"),
        () => ctx.rect(x - 3.5, 13 - h, 7, h),
        0.9,
      );
      line(
        ctx,
        "#a89c88",
        0.6,
        () => {
          for (const dx of [-1.5, 1.5]) {
            ctx.moveTo(x + dx, 13 - h + 2);
            ctx.lineTo(x + dx, 12);
          }
        },
        false,
      );
      if (broken)
        shape(
          ctx,
          "#d8d0bc",
          () =>
            poly(ctx, [
              x - 3.5,
              13 - h,
              x - 1,
              10 - h,
              x + 1.5,
              14 - h,
              x + 3.5,
              11 - h,
              x + 3.5,
              13 - h,
            ]),
          0.7,
        );
      else
        shape(
          ctx,
          vertical(ctx, 10 - h, 14 - h, "#f4ecd8", "#a89c88"),
          () => ctx.rect(x - 5, 10 - h, 10, 3.5),
          0.8,
        );
    }
  }

  // espirais do corpo no chão (de trás para a frente)
  for (const [y, rx, ry] of [
    [6, 15, 5],
    [10, 13, 4.5],
  ] as const) {
    shape(
      ctx,
      radial(ctx, -2, y - 2, rx, body, dark),
      () => ellipse(ctx, 0, y, rx, ry),
      1.1,
    );
    ctx.strokeStyle = dark + "aa";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = -3; i <= 3; i++) {
      ctx.moveTo(i * 4 - 1.5, y - ry * 0.6);
      ctx.lineTo(i * 4, y - ry * 0.2);
      ctx.lineTo(i * 4 + 1.5, y - ry * 0.6);
    }
    ctx.stroke();
  }
  // ponta da cauda saindo da espiral
  shape(
    ctx,
    dark,
    () => {
      ctx.moveTo(-14, 8);
      ctx.quadraticCurveTo(-21, 5 + sway, -23, 0 + sway);
      ctx.quadraticCurveTo(-19, 6, -13, 11);
      ctx.closePath();
    },
    0.9,
  );

  // pescoço grosso erguido em S (avança no bote)
  const hx = 9 + strike * 6;
  const hy = -17 + sway - strike * 2;
  const neck = (width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-3, 5);
    ctx.bezierCurveTo(-11, -4, 8 + sway, -6, hx - 4, hy + 3);
    ctx.stroke();
  };
  neck(9.5, "#0a1a0c");
  neck(7.5, body);
  ctx.save();
  ctx.translate(1.2, 0.8);
  neck(2.6, belly);
  ctx.restore();
  // espinhos ao longo da nuca
  for (let k = 1; k <= 4; k++) {
    const u = k / 5;
    const x =
      (1 - u) ** 3 * -3 +
      3 * (1 - u) ** 2 * u * -11 +
      3 * (1 - u) * u * u * (8 + sway) +
      u ** 3 * (hx - 4);
    const y =
      (1 - u) ** 3 * 5 +
      3 * (1 - u) ** 2 * u * -4 +
      3 * (1 - u) * u * u * -6 +
      u ** 3 * (hy + 3);
    shape(
      ctx,
      bv ? bv.spine : king ? GOLD : "#7a2a2a",
      () => poly(ctx, [x - 3.6, y - 1, x - 6.5, y - 5, x - 2, y - 3.6]),
      0.6,
    );
    if (spitter && !p.supreme && k % 2 === 0)
      halo(
        ctx,
        x + 1,
        y + 1,
        4,
        "#9aff3a",
        0.7 + Math.sin(p.time * 4 + k) * 0.2,
      );
  }

  // crista em leque atrás da cabeça (espinhos com membrana); enorme no Basilisco Rei, de fogo no de Lava
  ctx.save();
  ctx.translate(hx - 3, hy - 1);
  if (p.variant === "epic") {
    for (let i = 0; i < 4; i++)
      flame(
        ctx,
        Math.cos(-2.4 + i * 0.4) * 5,
        Math.sin(-2.4 + i * 0.4) * 5,
        2.4,
        king ? 13 : 9,
        -1.4 + i * 0.42,
        p.time + i,
      );
  } else {
    const spikes = king ? 7 : 5;
    const len = king ? 19 : 13;
    if (king) {
      // membrana entre os espinhos
      shape(
        ctx,
        (bv ? bv.crest : "#c8901a") + "88",
        () => {
          ctx.moveTo(0, 0);
          for (let i = 0; i < spikes; i++) {
            const a = -2.7 + i * 0.3;
            ctx.lineTo(Math.cos(a) * (len - 3), Math.sin(a) * (len - 3));
          }
          ctx.closePath();
        },
        0,
      );
    }
    for (let i = 0; i < spikes; i++) {
      const a =
        (king ? -2.7 + i * 0.3 : -2.5 + i * 0.32) +
        Math.sin(p.time * 2 + i) * 0.04;
      shape(
        ctx,
        bv ? bv.crest : king ? "#c8901a" : "#6a1a1a",
        () =>
          poly(ctx, [
            Math.cos(a) * 3,
            Math.sin(a) * 3,
            Math.cos(a) * len,
            Math.sin(a) * len,
            Math.cos(a + 0.2) * 4,
            Math.sin(a + 0.2) * 4,
          ]),
        0.6,
      );
      if (p.variant === "legendary")
        shape(
          ctx,
          "#ffffff",
          () => circle(ctx, Math.cos(a) * len, Math.sin(a) * len, 0.9),
          0,
        );
    }
  }
  ctx.restore();
  // cabeça em cunha
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(0.12 - strike * 0.2);
  const open = 0.1 + strike * 0.75;
  // mandíbula de baixo com presas
  ctx.save();
  ctx.translate(-3, 2);
  ctx.rotate(open);
  shape(
    ctx,
    dark,
    () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 0.6);
      ctx.quadraticCurveTo(13, 2.6, 10, 3);
      ctx.lineTo(0, 2.6);
      ctx.closePath();
    },
    0.9,
  );
  shape(ctx, "#f4f0dc", () => poly(ctx, [8.5, 0.4, 9.5, -2.6, 10.4, 0.5]), 0.4);
  ctx.restore();
  if (open > 0.3)
    shape(
      ctx,
      "#5a0a14",
      () => poly(ctx, [-2, 2, 10, 2, 9, 2 + open * 7, -2, 2.5 + open * 3]),
      0,
    );
  // crânio largo e achatado
  shape(
    ctx,
    radial(ctx, 1, -2, 10, body, dark),
    () => {
      ctx.moveTo(-6, 3);
      ctx.quadraticCurveTo(-7, -5, 0, -6.5);
      ctx.quadraticCurveTo(9, -6, 14, -1.5);
      ctx.quadraticCurveTo(14.5, 1.5, 11, 2.6);
      ctx.lineTo(-6, 3);
      ctx.closePath();
    },
    1.1,
  );
  // presas de cima, longas
  for (const x of [7.5, 10.5])
    shape(
      ctx,
      "#f4f0dc",
      () => poly(ctx, [x - 0.7, 2.3, x, 6 + strike * 2, x + 0.7, 2.3]),
      0.4,
    );
  // escamas grandes do topo e sobrancelha óssea
  shape(ctx, dark, () => poly(ctx, [-1, -6, 7, -6.6, 9, -4, 1, -3.6]), 0.6);
  // olho mortal: amarelo brilhante com pupila em fenda
  halo(
    ctx,
    4,
    -3.4,
    6 + strike * 4,
    bv ? bv.eye : "#ffe14a",
    0.6 + strike * 0.3,
  );
  shape(
    ctx,
    bv ? bv.eye : "#ffd23a",
    () => ellipse(ctx, 4, -3.4, 2.2, 1.6),
    0.6,
  );
  ctx.fillStyle = "#0a0a06";
  ctx.fillRect(3.7, -4.9, 0.6, 3);
  // narina
  ctx.fillStyle = "#0a1a0c";
  ctx.beginPath();
  ellipse(ctx, 12.5, -1.2, 0.7, 0.45);
  ctx.fill();
  if (king) {
    // coroa grande atrás dos olhos, com joias
    shape(
      ctx,
      vertical(ctx, -17, -5, "#ffe07a", "#c8901a"),
      () =>
        poly(
          ctx,
          [-6, -4, -7.5, -14, -3.5, -8, -1, -17, 1.5, -8, 5, -14, 4, -5.5],
        ),
      0.7,
    );
    for (const [x, y] of [
      [-7.5, -14],
      [-1, -17],
      [5, -14],
    ] as const)
      shape(ctx, "#ff3a5a", () => circle(ctx, x, y, 1), 0.3);
  }
  if (spitter && strike > 0.2) halo(ctx, 13, 3, 7, "#9aff3a", strike);
  ctx.restore();

  if (spitter) {
    // gotas de ácido escorrendo das presas
    ctx.fillStyle = "#9aff3a";
    for (let i = 0; i < 2; i++) {
      const ph = (p.time * 1.4 + i / 2) % 1;
      ctx.beginPath();
      ellipse(ctx, hx + 8 + i, hy + 6 + ph * 9, 0.9, 1.4);
      ctx.fill();
    }
  }
  if (p.supreme && king) {
    // Imperador Basilisco: faixas de escamas de ouro acompanhando as espirais, com joias
    for (const [y, rx, ry] of [
      [6, 15, 5],
      [10, 13, 4.5],
    ] as const) {
      ctx.save();
      ctx.strokeStyle = "#5a3a08";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(0, y, rx - 2, ry - 1.4, 0, 0.25, Math.PI - 0.25);
      ctx.stroke();
      ctx.strokeStyle = "#ffd25a";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
    for (const [x, y, c] of [
      [-6, 10.2, "#ff3a5a"],
      [0, 14, "#3ad8ff"],
      [6, 10.2, "#ff3a5a"],
    ] as const) {
      halo(ctx, x, y, 2.6, c, 0.5 + Math.sin(p.time * 3 + x) * 0.2);
      shape(ctx, c, () => circle(ctx, x, y, 1.1), 0.4);
    }
  }
  if (p.supreme && spitter) {
    // Pântano Ácido: glândulas brilhando, poça borbulhante e jato de ácido em arco
    shape(ctx, "#9aff3a55", () => ellipse(ctx, 0, 13, 24, 4.5), 0);
    for (const [x, y] of [
      [-8, 5],
      [0, 7],
      [8, 5],
    ] as const)
      halo(ctx, x, y, 4, "#9aff3a", 0.7 + Math.sin(p.time * 4 + x) * 0.2);
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.8 + i / 4) % 1;
      ctx.save();
      ctx.globalAlpha *= 1 - t;
      ctx.strokeStyle = "#c8ff6a";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      circle(ctx, -16 + i * 10, 13 - t * 6, 1.2 + t * 1.6);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha *= 0.85;
    line(
      ctx,
      "#9aff3a",
      3,
      () => {
        ctx.moveTo(hx + 12, hy + 3);
        ctx.quadraticCurveTo(hx + 26, hy - 10, hx + 30, 12);
      },
      false,
    );
    ctx.restore();
    halo(ctx, hx + 30, 12, 6, "#9aff3a", 0.8);
  }
}

/** Heroína Rainha Górgona: naga dourada com coroa e cabelo de serpentes. */
export function drawGorgonQueen(ctx: Ctx, p: Pose): void {
  const scales = skin(p, "scales", "#3a9a6a");
  const scalesDark = skin(p, "scalesDark", "#14402a");
  const armor = skin(p, "armor", GOLD);
  nagaTail(ctx, p.time, scales, scalesDark);
  shape(ctx, vertical(ctx, -11, 2, scales, scalesDark), () =>
    ctx.roundRect(-5, -11, 10, 13, 3),
  );
  shape(ctx, armor, () => poly(ctx, [-5, -10, 5, -10, 3, -5, -3, -5]), 0.7);
  // lança-serpente
  ctx.save();
  ctx.translate(8, 0);
  ctx.rotate(0.35 + p.attack * 0.6);
  line(ctx, armor, 1.4, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  shape(ctx, scales, () => poly(ctx, [-2, -16, 0, -22, 2, -16]), 0.6);
  ctx.restore();
  const hy = -16;
  const look = skin(p, "look", "");
  if (look === "abyss") {
    // tentáculos de polvo no lugar das cobras, com ventosas
    for (let i = 0; i < 6; i++) {
      const a = -2.7 + (i / 5) * 2.4;
      const x0 = 1 + Math.cos(a) * 5;
      const y0 = hy + Math.sin(a) * 5;
      const curl = Math.sin(p.time * 2.5 + i) * 0.6;
      const tx = x0 + Math.cos(a + curl) * 10;
      const ty = y0 + Math.sin(a + curl) * 10;
      line(ctx, scales, 2.4, () => {
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(
          x0 + Math.cos(a) * 7,
          y0 + Math.sin(a) * 7,
          tx,
          ty,
        );
      });
      shape(ctx, scales, () => circle(ctx, tx, ty, 1.4), 0.5);
      shape(
        ctx,
        "#c8a0ff",
        () =>
          circle(
            ctx,
            (x0 + tx) / 2 + Math.cos(a) * 1.5,
            (y0 + ty) / 2 + Math.sin(a) * 1.5,
            0.6,
          ),
        0,
      );
    }
  } else if (look !== "sand") snakeHair(ctx, hy, p.time, scales, 7);
  if (look === "sand") {
    // toucado de faraó (nemes) listrado caindo pelos ombros
    shape(
      ctx,
      vertical(ctx, hy - 8, hy + 10, "#ffe9a8", "#c8901a"),
      () =>
        poly(ctx, [
          -7,
          hy - 3,
          8,
          hy - 3,
          10,
          hy + 10,
          5,
          hy + 10,
          5,
          hy + 2,
          -3,
          hy + 2,
          -3,
          hy + 10,
          -9,
          hy + 10,
        ]),
      0.8,
    );
    line(
      ctx,
      "#2a4ab0",
      0.9,
      () => {
        for (const y of [hy + 4, hy + 7]) {
          ctx.moveTo(-8.6, y);
          ctx.lineTo(-3, y);
          ctx.moveTo(5, y);
          ctx.lineTo(9.6, y);
        }
      },
      false,
    );
  }
  shape(ctx, radial(ctx, 1, hy, 6.5, "#e0f0d8", "#98b890"), () =>
    circle(ctx, 1, hy, 6.5),
  );
  ctx.save();
  ctx.shadowColor = armor;
  ctx.shadowBlur = 6 + p.attack * 10;
  glowingEye(ctx, 0, hy, 1.4, armor);
  glowingEye(ctx, 4, hy, 1.4, armor);
  ctx.restore();
  if (look === "sand") {
    // topo do nemes e a naja dourada na testa
    shape(
      ctx,
      vertical(ctx, hy - 9, hy - 3, "#ffe9a8", "#c8901a"),
      () => {
        ctx.moveTo(-7, hy - 2);
        ctx.quadraticCurveTo(-7, hy - 9, 1, hy - 9);
        ctx.quadraticCurveTo(9, hy - 9, 8, hy - 2);
        ctx.closePath();
      },
      0.8,
    );
    line(
      ctx,
      "#2a4ab0",
      0.8,
      () => {
        ctx.moveTo(-6, hy - 4.5);
        ctx.lineTo(7.4, hy - 4.5);
      },
      false,
    );
    shape(
      ctx,
      GOLD,
      () => poly(ctx, [0.2, hy - 8.5, 1.8, hy - 12, 3, hy - 8.5]),
      0.6,
    );
    return;
  }
  shape(ctx, vertical(ctx, hy - 13, hy - 6, "#fff0a0", "#c8901a"), () =>
    poly(ctx, [
      -4.5,
      hy - 6,
      -5,
      hy - 11,
      -2,
      hy - 8,
      1,
      hy - 13,
      4,
      hy - 8,
      7,
      hy - 11,
      6.5,
      hy - 6,
    ]),
  );
}
