import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';

export type SpriteId = 'hero' | CreatureId | EnemyId;

const TAU = Math.PI * 2;

/** Desenha um sprite vetorial centrado em (x, y). `time` anima asas e braços. */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  id: SpriteId,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const flap = Math.sin(time * 8);
  const fill = (color: string, path: () => void) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    path();
    ctx.fill();
  };
  const circle = (cx: number, cy: number, r: number) => ctx.arc(cx, cy, r, 0, TAU);
  const ellipse = (cx: number, cy: number, rx: number, ry: number) => ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  const segment = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  };
  const stroke = (color: string, width: number, path: () => void) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    path();
    ctx.stroke();
  };

  switch (id) {
    case 'hero':
      fill('#4a5a86', () => {
        segment(0, -8, 11, 13);
        ctx.lineTo(-11, 13);
      });
      fill('#e8d3b8', () => circle(0, -10, 5));
      stroke('#cfe', 2, () => segment(9, 2, 15, -12));
      break;

    case 'archer':
      fill('#2f6b3a', () => {
        segment(0, -12, 10, 13);
        ctx.lineTo(-10, 13);
      });
      fill('#e8d3b8', () => circle(0, -6, 4));
      stroke('#c96', 2, () => ctx.arc(10, 0, 11, -1.2, 1.2));
      break;

    case 'duelist':
      fill('#1c1030', () => {
        segment(-17, 12, -6, -8);
        ctx.lineTo(6, -8);
        ctx.lineTo(17, 12);
        ctx.lineTo(0, 6);
      });
      fill('#c22', () => {
        segment(-9, 10, 0, -2);
        ctx.lineTo(9, 10);
      });
      fill('#eadff0', () => circle(0, -10, 5));
      fill('#f33', () => {
        circle(-2, -11, 1.2);
        circle(2.5, -11, 1.2);
      });
      break;

    case 'fireDragon':
    case 'iceDragon': {
      const [body, head] = id === 'fireDragon' ? ['#d4521a', '#ffb040'] : ['#3a8fd0', '#bdf'];
      fill(body, () => {
        segment(-3, -4, -20, -14 + flap * 3);
        ctx.lineTo(-10, 6);
        ctx.lineTo(10, 6);
        ctx.lineTo(20, -14 + flap * 3);
        ctx.lineTo(3, -4);
      });
      fill(body, () => ellipse(0, 2, 8, 10));
      fill(head, () => circle(0, -10, 6));
      fill('#fff', () => {
        circle(-2, -11, 1.3);
        circle(2, -11, 1.3);
      });
      break;
    }

    case 'zombie':
      stroke('#5c8a4a', 3, () => {
        segment(-6, 0, -15, -3 + flap * 2);
        segment(6, 0, 15, -3 + flap * 2);
      });
      fill('#5c8a4a', () => ellipse(0, 2, 8, 10));
      fill('#7ba862', () => circle(0, -9, 6));
      fill('#000', () => {
        circle(-2, -10, 1.2);
        circle(2, -10, 1.2);
      });
      break;

    case 'bat':
      fill('#4b3460', () => {
        segment(0, -2, -16, -8 - flap * 6);
        ctx.lineTo(-9, 4);
        ctx.lineTo(0, 2);
        ctx.lineTo(9, 4);
        ctx.lineTo(16, -8 - flap * 6);
      });
      fill('#3a2748', () => ellipse(0, 0, 5, 6));
      fill('#f44', () => {
        circle(-2, -2, 1.1);
        circle(2, -2, 1.1);
      });
      break;

    case 'ogre':
    case 'ogreKing': {
      const isKing = id === 'ogreKing';
      fill(isKing ? '#6b2a2a' : '#8a5a3a', () => ellipse(0, 3, 12, 13));
      fill('#a87a52', () => circle(0, -9, 8));
      fill('#ddd', () => {
        segment(-8, -14, -11, -22);
        ctx.lineTo(-4, -15);
        segment(8, -14, 11, -22);
        ctx.lineTo(4, -15);
      });
      fill('#ff0', () => {
        circle(-3, -10, 1.5);
        circle(3, -10, 1.5);
      });
      if (isKing) {
        fill('#fc3', () => {
          segment(-8, -18, -5, -26);
          ctx.lineTo(0, -19);
          ctx.lineTo(5, -26);
          ctx.lineTo(8, -18);
        });
      }
      break;
    }
  }
  ctx.restore();
}

/** Sombra elíptica sob um personagem. */
export function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
  ctx.fillStyle = '#0007';
  ctx.beginPath();
  ctx.ellipse(x, y + 13, width, 5, 0, 0, TAU);
  ctx.fill();
}
