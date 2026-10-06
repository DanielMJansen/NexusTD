import { ARENA } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { ENEMIES, type EnemyId } from '../data/enemies';
import { HEROES, type HeroId } from '../data/heroes';
import { WAVES } from '../data/waves';
import type { GameEvent } from '../game/events';
import type { Point } from '../game/state';
import { drawSprite } from './sprites';

const TAU = Math.PI * 2;
const GOLD = '#ffd25a';

/** Cores do Pulso de cada herói. */
const PULSE_LOOK: Record<HeroId, { ring: string; inner: string; particle: string }> = {
  knight: { ring: '#c08cff', inner: '#ffffff', particle: '#c99bff' },
  vampireLord: { ring: '#ff3a50', inner: '#2a1040', particle: '#3a1a50' },
  draconian: { ring: '#ff8a2a', inner: '#ffd25a', particle: '#ff5a1a' },
  lycan: { ring: '#e8c890', inner: '#ffffff', particle: '#c8a070' },
  specter: { ring: '#8ce8d8', inner: '#e8fffc', particle: '#5ab8a8' },
  witch: { ring: '#7ad85a', inner: '#2a5a1a', particle: '#a8f080' },
};

/** Golpes corpo a corpo (corte sobre o alvo) e a cor do corte. */
const MELEE: Partial<Record<CreatureId, string>> = {
  duelist: '#ff3a50',
  guard: '#e8f6ff',
  hunter: '#f0e0c0',
  alpha: '#ffd8a0',
};

interface Shot {
  source: CreatureId | 'hero';
  /** Cor do corte (golpes do herói). */
  color?: string;
  from: Point;
  to: Point;
  duration: number;
  remaining: number;
  trailTimer: number;
}

interface Wave extends Point {
  angle: number;
  halfAngle: number;
  range: number;
  life: number;
  maxLife: number;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  /** Mistura aditiva (brilho). */
  glow: boolean;
}

interface Ring extends Point {
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  width: number;
}

interface Corpse extends Point {
  enemy: EnemyId;
  life: number;
  maxLife: number;
}

interface FloatingText extends Point {
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface Banner {
  text: string;
  subtitle: string;
  color: string;
  life: number;
  maxLife: number;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Efeitos puramente visuais, alimentados pelos eventos da simulação. */
export class Effects {
  private shots: Shot[] = [];
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private waves: Wave[] = [];
  private corpses: Corpse[] = [];
  private texts: FloatingText[] = [];
  private banners: Banner[] = [];
  private shake = 0;
  /** 1 logo após o Nexus levar dano, caindo até 0. */
  nexusHurt = 0;
  /** Números de dano flutuando (opção nas Configurações). */
  showDamageNumbers = true;

  clear(): void {
    this.shots = [];
    this.particles = [];
    this.rings = [];
    this.waves = [];
    this.corpses = [];
    this.texts = [];
    this.banners = [];
    this.shake = 0;
    this.nexusHurt = 0;
  }

  handle(event: GameEvent): void {
    switch (event.type) {
      case 'shot': {
        const melee = MELEE[event.source];
        const duration = melee ? 0.16 : event.source === 'cauldron' ? 0.4 : 0.22;
        this.shots.push({ ...event, duration, remaining: duration, trailTimer: 0, color: melee });
        break;
      }
      case 'heroAttack': {
        const color = HEROES[event.hero].color;
        if (event.cone === null) {
          const slash = event.hero === 'knight' ? '#e8f6ff' : color;
          this.shots.push({ source: 'hero', from: event.from, to: event.to, duration: 0.16, remaining: 0.16, trailTimer: 1, color: slash });
          break;
        }
        // leque de fogo: partículas espalhadas dentro do cone
        const aim = Math.atan2(event.to.y - event.from.y, event.to.x - event.from.x);
        for (let i = 0; i < 18; i++) {
          const a = aim + random(-event.cone, event.cone);
          const speed = random(event.range * 2, event.range * 3.4);
          this.particles.push({
            x: event.from.x,
            y: event.from.y - 6,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 0.3,
            maxLife: 0.3,
            size: random(2, 3.5),
            color: Math.random() < 0.5 ? '#ffb040' : color,
            gravity: 0,
            glow: true,
          });
        }
        break;
      }
      case 'enemyDamaged':
        if (this.showDamageNumbers) {
          const amount = event.amount >= 10 ? Math.round(event.amount) : Math.round(event.amount * 10) / 10;
          this.texts.push({
            x: event.x + random(-6, 6),
            y: event.y - 14,
            text: event.crit ? `${amount}!` : String(amount),
            color: event.crit ? '#ffb02a' : '#f4ecff',
            size: event.crit ? 10 : 7,
            life: 0.5,
            maxLife: 0.5,
          });
        }
        break;
      case 'enemyKilled':
        this.corpses.push({ enemy: event.enemy, x: event.x, y: event.y, life: 0.45, maxLife: 0.45 });
        this.burst(event.x, event.y - 6, 8, event.color, 70, 0.45, 2.2, false);
        this.burst(event.x, event.y - 6, 4, GOLD, 50, 0.7, 2, true, -60, 160);
        this.particles.push({
          x: event.x,
          y: event.y - 10,
          vx: random(-6, 6),
          vy: -30,
          life: 0.9,
          maxLife: 0.9,
          size: 3.5,
          color: '#c8b0ff',
          gravity: 0,
          glow: true,
        });
        this.text(event.x, event.y - 18, `+${event.gold}`, GOLD, 10);
        break;
      case 'pulse': {
        const look = PULSE_LOOK[event.hero];
        if (event.to) {
          // investida em linha: rastro de partículas ao longo do caminho
          for (let i = 0; i <= 24; i++) {
            const t = i / 24;
            this.burst(event.x + (event.to.x - event.x) * t, event.y + (event.to.y - event.y) * t - 6, 2, look.particle, 30, 0.5, 3, true);
          }
          this.ring(event.to.x, event.to.y, 30, look.ring, 0.4, 4);
          this.shake = Math.max(this.shake, 3);
          break;
        }
        this.ring(event.x, event.y, event.radius, look.ring, 0.45, 6);
        this.ring(event.x, event.y, event.radius * 0.6, look.inner, 0.3, 3);
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * TAU;
          const speed = random(140, 220) * (event.radius / 95);
          this.particles.push({
            x: event.x,
            y: event.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 0.45,
            maxLife: 0.45,
            size: 2.4,
            color: Math.random() < 0.6 ? look.particle : look.inner,
            gravity: 0,
            glow: true,
          });
        }
        this.shake = Math.max(this.shake, 3);
        break;
      }
      case 'screech':
        this.waves.push({ ...event, life: 0.4, maxLife: 0.4 });
        break;
      case 'poolCreated':
        this.burst(event.x, event.y, 12, '#a8f080', 60, 0.5, 2.6, true, -20);
        break;
      case 'nexusHit':
        this.nexusHurt = 1;
        this.shake = Math.max(this.shake, Math.min(7, 2 + event.damage * 0.2));
        this.text(ARENA.center.x, ARENA.center.y - 52, `-${event.damage}`, '#ff5a6a', 13);
        this.burst(ARENA.center.x, ARENA.center.y - 16, 10, '#ff6a7a', 90, 0.5, 2.4, true);
        break;
      case 'wardBlocked':
        this.ring(ARENA.center.x, ARENA.center.y - 10, 40, '#ffd25a', 0.5, 4);
        this.text(ARENA.center.x, ARENA.center.y - 52, 'Égide!', '#ffd25a', 12);
        break;
      case 'nexusHealed':
        this.text(ARENA.center.x + 14, ARENA.center.y - 46, `+${event.amount}`, '#5af0a0', 11);
        this.burst(ARENA.center.x, ARENA.center.y - 16, 6, '#5af0a0', 40, 0.6, 2, true, -40);
        break;
      case 'bossSpawned':
        this.shake = Math.max(this.shake, 9);
        this.banner(`${ENEMIES[event.enemy].name} chegou!`, 'Chefe', '#ff5a5a', 2.6);
        break;
      case 'waveStarted':
        this.banner(`Onda ${event.wave}`, event.wave === WAVES.total ? 'Onda final' : `de ${WAVES.total}`, '#e2c8ff', 1.8);
        break;
      case 'creaturePlaced': {
        const color = CREATURES[event.creature].color;
        this.ring(event.x, event.y + 12, 26, color, 0.5, 3);
        this.burst(event.x, event.y + 6, 14, color, 60, 0.7, 2.2, true, -50);
        break;
      }
      case 'creatureEvolved': {
        const def = CREATURES[event.creature];
        this.ring(event.x, event.y + 6, 34, def.color, 0.6, 4);
        this.ring(event.x, event.y + 6, 22, '#ffd25a', 0.45, 2.5);
        this.burst(event.x, event.y, 22, '#ffd25a', 90, 0.8, 2.4, true, -70);
        this.burst(event.x, event.y, 10, def.color, 60, 0.7, 2.6, true, -40);
        const label = event.ascended ? `${def.ascended.name}!` : `Nível ${event.level}`;
        this.text(event.x, event.y - 46, label, '#ffd25a', event.ascended ? 13 : 11);
        if (event.ascended) this.shake = Math.max(this.shake, 3);
        break;
      }
      case 'creatureSold':
        this.burst(event.x, event.y, 12, '#8a80a0', 50, 0.6, 3.5, false, -20);
        this.text(event.x, event.y - 20, `+${event.refund}`, GOLD, 11);
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    for (const shot of this.shots) {
      shot.remaining -= dt;
      shot.trailTimer -= dt;
      if (shot.trailTimer <= 0) {
        shot.trailTimer = 0.016;
        this.trail(shot);
      }
      if (shot.remaining <= 0) this.impact(shot);
    }
    this.shots = this.shots.filter((s) => s.remaining > 0);

    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - (p.gravity ? 0.5 : 2) * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.rings) r.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const w of this.waves) w.life -= dt;
    this.waves = this.waves.filter((w) => w.life > 0);
    for (const c of this.corpses) c.life -= dt;
    this.corpses = this.corpses.filter((c) => c.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 20 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const b of this.banners) b.life -= dt;
    this.banners = this.banners.filter((b) => b.life > 0);
    this.shake = Math.max(0, this.shake - dt * 18);
    this.nexusHurt = Math.max(0, this.nexusHurt - dt * 3);
  }

  /** Deslocamento da câmera pelo tremor de tela. */
  shakeOffset(): Point {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return { x: random(-1, 1) * this.shake, y: random(-1, 1) * this.shake };
  }

  /** Efeitos no mundo (projéteis, partículas, anéis, cadáveres, números). */
  drawWorld(ctx: CanvasRenderingContext2D, time: number): void {
    for (const c of this.corpses) {
      const fade = c.life / c.maxLife;
      const def = ENEMIES[c.enemy];
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(c.x, c.y);
      ctx.rotate((1 - fade) * 0.5);
      ctx.filter = 'brightness(1.8) saturate(0.3)';
      drawSprite(ctx, c.enemy, 0, (1 - fade) * 4, def.scale * (0.6 + fade * 0.4), { time });
      ctx.restore();
    }

    for (const r of this.rings) {
      const progress = 1 - r.life / r.maxLife;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * (1 - progress * 0.6);
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius * (0.2 + progress * 0.8), r.radius * (0.2 + progress * 0.8) * 0.8, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const w of this.waves) {
      // ondas do grito da Banshee: arcos que se abrem no leque
      const progress = 1 - w.life / w.maxLife;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = '#d8e4ff';
      for (let k = 0; k < 3; k++) {
        const r = w.range * Math.min(1, progress + k * 0.18);
        ctx.lineWidth = 2.5 - k * 0.6;
        ctx.beginPath();
        ctx.arc(w.x, w.y - 8, r, w.angle - w.halfAngle, w.angle + w.halfAngle);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    for (const shot of this.shots) drawShot(ctx, shot);

    for (const p of this.particles) {
      const fade = p.life / p.maxLife;
      ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
      ctx.globalAlpha = Math.min(1, fade * 1.5);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + fade * 0.6), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const t of this.texts) {
      const fade = t.life / t.maxLife;
      const pop = 1 + Math.max(0, fade - 0.8) * 2;
      ctx.globalAlpha = Math.min(1, fade * 2.5);
      ctx.font = `700 ${t.size * pop}px Cinzel, Georgia, serif`;
      ctx.strokeStyle = '#0a0612';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  /** Faixas de anúncio no centro da tela ("Onda 3", chefe). */
  drawBanners(ctx: CanvasRenderingContext2D): void {
    const banner = this.banners[this.banners.length - 1];
    if (!banner) return;
    const age = banner.maxLife - banner.life;
    const alpha = Math.min(1, age / 0.25, banner.life / 0.5);
    const pop = 1 + Math.max(0, 0.25 - age) * 1.2;
    const x = ARENA.width / 2;
    const y = ARENA.height * 0.17;
    ctx.save();
    ctx.globalAlpha = alpha;
    const band = ctx.createLinearGradient(0, 0, ARENA.width, 0);
    band.addColorStop(0, '#0a061200');
    band.addColorStop(0.5, '#0a0612bb');
    band.addColorStop(1, '#0a061200');
    ctx.fillStyle = band;
    ctx.fillRect(0, y - 30, ARENA.width, 60);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 10px Cinzel, Georgia, serif`;
    ctx.fillStyle = '#a898c4';
    ctx.fillText(banner.subtitle.toUpperCase(), x, y - 17);
    ctx.font = `900 ${30 * pop}px 'Cinzel Decorative', Cinzel, Georgia, serif`;
    ctx.shadowColor = banner.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = banner.color;
    ctx.fillText(banner.text, x, y + 6);
    ctx.restore();
  }

  // ---------- auxiliares ----------

  private text(x: number, y: number, text: string, color: string, size: number): void {
    this.texts.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9 });
  }

  private ring(x: number, y: number, radius: number, color: string, life: number, width: number): void {
    this.rings.push({ x, y, radius, color, life, maxLife: life, width });
  }

  private banner(text: string, subtitle: string, color: string, life: number): void {
    this.banners.push({ text, subtitle, color, life, maxLife: life });
  }

  private burst(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number,
    life: number,
    size: number,
    glow: boolean,
    lift = 0,
    gravity = 0,
  ): void {
    for (let i = 0; i < count; i++) {
      const a = random(0, TAU);
      const s = random(speed * 0.4, speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s + lift,
        life: random(life * 0.6, life),
        maxLife: life,
        size,
        color,
        gravity,
        glow,
      });
    }
  }

  private trail(shot: Shot): void {
    const pos = shotPosition(shot);
    if (shot.source === 'fireDragon') {
      this.burst(pos.x, pos.y, 2, Math.random() < 0.5 ? '#ffb040' : '#ff5a1a', 20, 0.35, 2.6, true, -10);
    } else if (shot.source === 'sanguine') {
      this.burst(pos.x, pos.y, 1, '#ff3050', 14, 0.35, 2, true);
    } else if (shot.source === 'haunt') {
      this.burst(pos.x, pos.y, 1, '#8ce8d8', 10, 0.45, 2.2, true, -10);
    } else if (shot.source === 'sorceress') {
      this.burst(pos.x, pos.y, 1, '#a8f080', 14, 0.35, 1.8, true);
    } else if (shot.source === 'iceDragon') {
      this.burst(pos.x, pos.y, 1, '#dff6ff', 12, 0.4, 1.8, true);
    }
  }

  private impact(shot: Shot): void {
    const { x, y } = shot.to;
    switch (shot.source) {
      case 'fireDragon': {
        const ability = CREATURES.fireDragon.ability;
        const radius = ability.kind === 'splash' ? ability.radius : 40;
        this.ring(x, y, radius, '#ff8a2a', 0.35, 4);
        this.burst(x, y, 16, '#ffb040', 110, 0.45, 3, true);
        this.burst(x, y, 6, '#4a3a3a', 40, 0.7, 4, false, -30);
        break;
      }
      case 'iceDragon':
        this.ring(x, y, 18, '#bff0ff', 0.3, 2.5);
        this.burst(x, y, 9, '#e8faff', 70, 0.5, 2, true);
        break;
      case 'archer':
        this.burst(x, y, 4, '#ffe9a8', 60, 0.25, 1.6, true);
        break;
      case 'duelist':
        this.burst(x, y, 6, '#ff3a50', 80, 0.3, 1.8, true);
        break;
      case 'sanguine':
        this.burst(x, y, 8, '#ff3050', 70, 0.4, 2, true);
        break;
      case 'guard':
        this.burst(x, y, 5, '#e8f0ff', 60, 0.25, 1.6, true);
        break;
      case 'hero':
      case 'hunter':
      case 'alpha':
        this.burst(x, y, 4, shot.color ?? '#e8f6ff', 70, 0.25, 1.6, true);
        break;
      case 'haunt':
        this.burst(x, y, 8, '#8ce8d8', 60, 0.45, 2.2, true);
        break;
      case 'sorceress':
        this.burst(x, y, 7, '#7ad85a', 60, 0.45, 2.2, true);
        break;
      case 'cauldron':
      case 'banshee':
        break;
    }
  }
}

function shotPosition(shot: Shot): Point {
  const progress = 1 - shot.remaining / shot.duration;
  return {
    x: shot.from.x + (shot.to.x - shot.from.x) * progress,
    y: shot.from.y - 8 + (shot.to.y - shot.from.y + 8) * progress,
  };
}

function drawShot(ctx: CanvasRenderingContext2D, shot: Shot): void {
  const progress = 1 - shot.remaining / shot.duration;
  const { x, y } = shotPosition(shot);
  const angle = Math.atan2(shot.to.y - shot.from.y + 8, shot.to.x - shot.from.x);
  ctx.save();
  switch (shot.source) {
    case 'archer':
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#ffe9a855';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-8, 0);
      ctx.stroke();
      ctx.strokeStyle = '#8a5a32';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = '#e0e8f4';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(3, -2.2);
      ctx.lineTo(3, 2.2);
      ctx.fill();
      ctx.fillStyle = '#f4f0e8';
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(-12, -2.5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-12, 2.5);
      ctx.fill();
      break;
    case 'fireDragon': {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
      glow.addColorStop(0, '#fff2c0');
      glow.addColorStop(0.35, '#ffb040');
      glow.addColorStop(1, '#ff4a1a00');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, TAU);
      ctx.fill();
      break;
    }
    case 'iceDragon':
      ctx.translate(x, y);
      ctx.rotate(progress * 10);
      ctx.shadowColor = '#bff0ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#e8faff';
      ctx.strokeStyle = '#4aa8e8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(2.5, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-2.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'sanguine': {
      const orb = ctx.createRadialGradient(x, y, 0, x, y, 7);
      orb.addColorStop(0, '#ffd0d8');
      orb.addColorStop(0.4, '#ff3050');
      orb.addColorStop(1, '#a00c2400');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      break;
    }
    case 'haunt':
    case 'sorceress': {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.35, shot.source === 'haunt' ? '#8ce8d8' : '#7ad85a');
      glow.addColorStop(1, '#00000000');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cauldron': {
      // poção arremessada em arco
      const lift = Math.sin(progress * Math.PI) * 30;
      ctx.translate(x, y - lift);
      ctx.rotate(progress * 8);
      ctx.fillStyle = '#5ad8a8';
      ctx.strokeStyle = '#170c24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 1.5, 3.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c8b8a0';
      ctx.fillRect(-1.2, -4, 2.4, 3);
      break;
    }
    case 'banshee':
      break;
    case 'duelist':
    case 'guard':
    case 'hunter':
    case 'alpha':
    case 'hero': {
      // corte em meia-lua sobre o alvo
      const color = shot.color ?? (shot.source === 'duelist' ? '#ff3a50' : '#e8f6ff');
      const start = -1.6 + progress * 2.4;
      ctx.translate(shot.to.x, shot.to.y - 6);
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1 - progress * 0.6;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, start, start + 1.8);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 12, start + 0.3, start + 1.5);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}
