import { PULSE } from '../data/config';
import type { CreatureId } from '../data/creatures';
import type { GameEvent } from '../game/events';
import type { Point } from '../game/state';

const TAU = Math.PI * 2;

interface Shot {
  source: CreatureId | 'hero';
  from: Point;
  to: Point;
  duration: number;
  remaining: number;
}

interface Ring extends Point {
  duration: number;
  remaining: number;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  remaining: number;
  color: string;
}

interface FloatingText extends Point {
  text: string;
  color: string;
  remaining: number;
}

const GOLD_COLOR = '#fc6';

/** Efeitos puramente visuais (projéteis, partículas, textos), alimentados pelos eventos da simulação. */
export class Effects {
  private shots: Shot[] = [];
  private rings: Ring[] = [];
  private particles: Particle[] = [];
  private texts: FloatingText[] = [];

  clear(): void {
    this.shots = [];
    this.rings = [];
    this.particles = [];
    this.texts = [];
  }

  handle(event: GameEvent): void {
    switch (event.type) {
      case 'shot': {
        const duration = event.source === 'hero' ? 0.12 : 0.2;
        this.shots.push({ source: event.source, from: event.from, to: event.to, duration, remaining: duration });
        break;
      }
      case 'enemyKilled':
        this.texts.push({ x: event.x, y: event.y, text: `+${event.gold}`, color: GOLD_COLOR, remaining: 1 });
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: event.x,
            y: event.y,
            vx: (Math.random() - 0.5) * 60,
            vy: -40 - Math.random() * 40,
            remaining: 0.7,
            color: '#fc3',
          });
        }
        for (let i = 0; i < 7; i++) {
          this.particles.push({
            x: event.x,
            y: event.y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            remaining: 0.5,
            color: event.color,
          });
        }
        break;
      case 'pulse':
        this.rings.push({ x: event.x, y: event.y, duration: 0.3, remaining: 0.3 });
        break;
      case 'creatureSold':
        this.texts.push({ x: event.x, y: event.y, text: `+${event.refund}`, color: GOLD_COLOR, remaining: 1 });
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    for (const s of this.shots) s.remaining -= dt;
    for (const r of this.rings) r.remaining -= dt;
    for (const p of this.particles) {
      p.remaining -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (const t of this.texts) {
      t.remaining -= dt;
      t.y -= 22 * dt;
    }
    this.shots = this.shots.filter((s) => s.remaining > 0);
    this.rings = this.rings.filter((r) => r.remaining > 0);
    this.particles = this.particles.filter((p) => p.remaining > 0);
    this.texts = this.texts.filter((t) => t.remaining > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const ring of this.rings) {
      ctx.strokeStyle = '#b36bff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, PULSE.radius * (1 - ring.remaining / ring.duration), 0, TAU);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    for (const shot of this.shots) drawShot(ctx, shot);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.remaining * 2));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.font = 'bold 12px Georgia';
    ctx.textAlign = 'center';
    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, t.remaining * 2);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}

/** Projétil viajando de `from` até `to` conforme o progresso; o visual depende de quem atirou. */
function drawShot(ctx: CanvasRenderingContext2D, shot: Shot): void {
  const progress = 1 - shot.remaining / shot.duration;
  const { from, to } = shot;
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;

  switch (shot.source) {
    case 'archer':
      ctx.strokeStyle = '#ffe9a8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - (to.x - from.x) * 0.15, y - (to.y - from.y) * 0.15);
      ctx.stroke();
      break;
    case 'fireDragon':
      ctx.shadowColor = '#f80';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffb040';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (progress > 0.8) {
        ctx.strokeStyle = '#f60';
        ctx.beginPath();
        ctx.arc(to.x, to.y, (progress - 0.8) * 200, 0, TAU);
        ctx.stroke();
      }
      break;
    case 'iceDragon':
      ctx.fillStyle = '#bdf';
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 3, y);
      ctx.lineTo(x, y + 5);
      ctx.lineTo(x - 3, y);
      ctx.fill();
      break;
    case 'duelist':
    case 'hero':
      // Golpe corpo a corpo: um corte em arco sobre o alvo.
      ctx.strokeStyle = shot.source === 'duelist' ? '#f33' : '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(to.x, to.y, 10, progress * 3, progress * 3 + 2);
      ctx.stroke();
      break;
  }
  ctx.lineWidth = 1;
}
