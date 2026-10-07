import { raisableCorpses } from './raise';
import { HERO_PLACEMENT } from '../data/config';
import type { PulseEffect } from '../data/heroes';
import { PULSE_DAMAGE_PER_LEVEL } from '../data/heroUpgrades';
import { damageEnemy, poisonEnemy } from './combat';
import { healHero, heroMaxHp } from './hero';
import { isHostile, raiseSkeleton } from './hitEffects';
import { random } from './random';
import { distance, type Enemy, type Point, type RunState } from './state';

// Pulsos dos heróis: cada um tem um tipo próprio (carga, deslize, enxame, lança-chamas, sapo...).
// Os instantâneos resolvem em firePulse; os que duram no tempo seguem em updatePulses.

/** Multiplicador de dano do Pulso: talentos, melhorias do herói e +10% por nível do herói. */
export const pulsePower = (state: RunState): number =>
  (1 + state.talents.heroDamage) * (1 + state.heroStats.pulseDamage) * (1 + PULSE_DAMAGE_PER_LEVEL * (state.hero.level - 1));

const pulseEffect = (state: RunState): PulseEffect => state.hero.def.pulse.effect;

/** Ângulo entre a direção (de → para) e outra direção, em radianos (0–π). */
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

const clampToArena = (state: RunState, p: Point): Point => {
  const m = HERO_PLACEMENT.edgeMargin;
  return { x: Math.min(state.map.width - m, Math.max(m, p.x)), y: Math.min(state.map.height - m, Math.max(m, p.y)) };
};

/** Direção da mira: o ponto mirado, senão o inimigo mais próximo, senão para onde o herói olha. */
function aimAngle(state: RunState, aim?: Point): number {
  const { hero } = state;
  const target = aim ?? state.enemies.filter(isHostile).sort((a, b) => distance(a, hero) - distance(b, hero))[0];
  return target ? Math.atan2(target.y - hero.y, target.x - hero.x) : hero.facing > 0 ? 0 : Math.PI;
}

/** Ponto mirado (ou à frente do herói, na direção da mira). */
function aimPoint(state: RunState, aim?: Point, fallbackDistance = 90): Point {
  if (aim) return clampToArena(state, aim);
  const angle = aimAngle(state);
  return clampToArena(state, { x: state.hero.x + Math.cos(angle) * fallbackDistance, y: state.hero.y + Math.sin(angle) * fallbackDistance });
}

/** Golpe do Pulso num inimigo: dano (com a força do Pulso), medo e atordoamento comuns a vários Pulsos. */
function pulseHit(state: RunState, enemy: Enemy, damage: number): void {
  const pulse = state.hero.def.pulse;
  damageEnemy(state, enemy, damage, undefined, { ignoreArmor: state.hero.def.attack.pierceArmor });
  if (enemy.dead || enemy.def.isBoss) return;
  if (pulse.fear) {
    enemy.fearTimer = Math.max(enemy.fearTimer, pulse.fear);
    enemy.fearLook = 'fear';
  }
  if (pulse.stun) {
    enemy.stunTimer = Math.max(enemy.stunTimer, pulse.stun.duration);
    enemy.stunLook = pulse.stun.look;
  }
}

/** Acerta todos os inimigos hostis que passam no teste; devolve quantos. */
function hitWhere(state: RunState, test: (e: Enemy) => boolean, damage: number, extra?: (e: Enemy) => void): number {
  let hit = 0;
  for (const enemy of [...state.enemies]) {
    if (!isHostile(enemy) || !test(enemy)) continue;
    pulseHit(state, enemy, damage);
    if (!enemy.dead) extra?.(enemy);
    hit++;
  }
  return hit;
}

/** Dispara o Pulso do herói. `aim`: ponto mirado (mouse ou direção do teclado). Devolve false se não pode. */
export function firePulse(state: RunState, aim?: Point): boolean {
  if (state.phase !== 'playing' || state.pulse.remaining > 0 || state.hero.dead) return false;
  const { hero } = state;
  const pulse = hero.def.pulse;
  const effect = pulse.effect;
  state.pulse.remaining = state.pulse.cooldown;
  const power = pulsePower(state);
  const damage = pulse.damage * power;
  const start = { x: hero.x, y: hero.y };
  // Pulso Ampliado: mais alcance, duração e quantidade
  const size = 1 + state.heroStats.pulseSize;
  const reach = (1 + state.talents.pulseRadius) * size;
  const more = (n: number) => Math.round(n * size);
  const radius = state.pulse.radius;
  const inRadius = (e: Enemy) => distance(e, hero) < radius;
  let hit = 0;
  let to: Point | undefined;
  let cone: { angle: number; halfAngle: number; length: number } | undefined;

  switch (effect.kind) {
    case 'burst':
      hit = hitWhere(state, inRadius, damage);
      break;
    case 'charge': {
      // atropela e arremessa para longe do Nexus (chefes resistem ao arremesso)
      const angle = aimAngle(state, aim);
      const end = clampToArena(state, { x: hero.x + Math.cos(angle) * effect.length * reach, y: hero.y + Math.sin(angle) * effect.length * reach });
      hit = hitWhere(state, (e) => distanceToSegment(e, start, end) <= effect.width / 2 + e.def.radius * 0.5, damage, (e) => {
        if (e.def.isBoss) return;
        const away = Math.atan2(e.y - state.nexus.y, e.x - state.nexus.x);
        e.x += Math.cos(away) * effect.knockback;
        e.y += Math.sin(away) * effect.knockback;
      });
      hero.x = end.x;
      hero.y = end.y;
      hero.target = { ...end };
      to = end;
      break;
    }
    case 'glide': {
      const angle = aimAngle(state, aim);
      const end = clampToArena(state, { x: hero.x + Math.cos(angle) * effect.length * reach, y: hero.y + Math.sin(angle) * effect.length * reach });
      state.pulseFx.glide = { from: start, to: end, elapsed: 0, duration: effect.duration, width: effect.width, id: ++state.pulseFx.count };
      break;
    }
    case 'cone': {
      const angle = aimAngle(state, aim);
      const length = effect.length * reach;
      hit = hitWhere(state, (e) => distance(e, hero) <= length && angleDiff(Math.atan2(e.y - hero.y, e.x - hero.x), angle) <= effect.halfAngle, damage);
      cone = { angle, halfAngle: effect.halfAngle, length };
      break;
    }
    case 'swarm': {
      // cada morcego voa até um dos inimigos mais próximos
      const targets = state.enemies
        .filter((e) => isHostile(e) && distance(e, hero) <= effect.range * reach)
        .sort((a, b) => distance(a, hero) - distance(b, hero))
        .slice(0, more(effect.count));
      state.events.push({ type: 'pulseSwarm', from: start, to: targets.map((e) => ({ x: e.x, y: e.y })) });
      for (const e of targets) {
        pulseHit(state, e, damage);
        if (!e.dead) poisonEnemy(e, effect.bleed.dps * power, effect.bleed.duration);
        hit++;
      }
      break;
    }
    case 'flame':
      state.pulseFx.flame = { remaining: effect.duration * size, angle: aimAngle(state, aim) };
      break;
    case 'transform':
      state.pulseFx.transform = effect.duration * size;
      hit = hitWhere(state, inRadius, damage);
      break;
    case 'hex':
      hit = hitWhere(state, inRadius, damage, (e) => {
        if (e.def.isBoss) return;
        e.hexTimer = effect.duration * size;
        e.hexVuln = effect.vulnerable;
      });
      break;
    case 'haste':
      state.haste = { amount: effect.amount, remaining: effect.duration * size };
      hit = hitWhere(state, inRadius, damage);
      break;
    case 'fissure': {
      // fenda em linha: atordoa e fere; fica no chão deixando lento
      const angle = aimAngle(state, aim);
      const length = effect.length * reach;
      const end = clampToArena(state, { x: hero.x + Math.cos(angle) * length, y: hero.y + Math.sin(angle) * length });
      hit = hitWhere(state, (e) => distanceToSegment(e, start, end) <= effect.width / 2 + e.def.radius * 0.5, damage);
      const steps = Math.max(1, Math.round(distance(start, end) / 18));
      const span = distance(start, end) / steps;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        state.pools.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
          radius: effect.width / 2 + 4,
          remaining: effect.duration * size,
          duration: effect.duration * size,
          dps: 0,
          color: '#5a3a2a',
          slow: effect.slow,
          look: 'crack',
          angle,
          span,
          along: t,
        });
      }
      to = end;
      break;
    }
    case 'rainbow': {
      // feixe em linha: fere e encanta (inimigos comuns viram aliados por um tempo)
      const angle = aimAngle(state, aim);
      const length = effect.length * reach;
      const end = clampToArena(state, { x: hero.x + Math.cos(angle) * length, y: hero.y + Math.sin(angle) * length });
      hit = hitWhere(state, (e) => distanceToSegment(e, start, end) <= effect.width / 2 + e.def.radius * 0.5, damage, (e) => {
        if (e.def.isBoss || e.dead || e.allyTimer > 0) return;
        e.allyTimer = effect.charm * size;
        e.allyExplode = null;
        state.events.push({ type: 'possessed', x: e.x, y: e.y });
      });
      to = end;
      break;
    }
    case 'raise': {
      // ergue onde inimigos caíram há pouco; sem corpos, ergue alguns ao redor do herói
      hit = hitWhere(state, inRadius, damage);
      const corpses = raisableCorpses(state);
      if (corpses.length) for (const c of corpses) raiseSkeleton(state, c, effect.duration);
      else for (let i = 0; i < more(effect.fallback); i++) raiseSkeleton(state, hero, effect.duration);
      state.recentDeaths = state.recentDeaths.filter((d) => !corpses.includes(d));
      break;
    }
    case 'meteors': {
      const center = aimPoint(state, aim);
      for (let i = 0; i < more(effect.count); i++) {
        const a = random() * Math.PI * 2;
        const r = random() * effect.spread * size;
        state.pulseFx.strikes.push({
          x: Math.min(state.map.width, Math.max(0, center.x + Math.cos(a) * r)),
          y: Math.min(state.map.height, Math.max(0, center.y + Math.sin(a) * r)),
          delay: 0.45 + i * effect.interval,
          total: 0.45 + i * effect.interval,
          kind: 'meteor',
        });
      }
      break;
    }
    case 'judgment': {
      const at = aimPoint(state, aim);
      state.pulseFx.strikes.push({ x: at.x, y: at.y, delay: effect.delay, total: effect.delay, kind: 'judgment' });
      break;
    }
  }

  if (pulse.selfDamage) hero.hp = Math.max(1, hero.hp - heroMaxHp(state) * pulse.selfDamage);
  // Eco do Pulso: às vezes recarrega quase na hora
  if (state.heroStats.pulseEcho > 0 && random() < state.heroStats.pulseEcho) {
    state.pulse.remaining = Math.min(state.pulse.remaining, 1);
    state.events.push({ type: 'pulseEcho', x: hero.x, y: hero.y });
  }
  if (pulse.healPerEnemy > 0 && hit > 0) healHero(state, pulse.healPerEnemy * hit);
  state.events.push({ type: 'pulse', hero: hero.def.id, kind: effect.kind, x: start.x, y: start.y, radius: radius || 30, to, cone });
  return true;
}

/** Pulsos que duram no tempo: deslize, lança-chamas, transformação e golpes atrasados (meteoros, coluna de luz). */
export function updatePulses(state: RunState, dt: number, aim?: Point): void {
  const fx = state.pulseFx;
  const { hero } = state;
  const power = pulsePower(state);
  const effect = pulseEffect(state);

  if (fx.glide) {
    // desliza translúcido; fere (uma vez) e assusta quem atravessa
    const g = fx.glide;
    g.elapsed = Math.min(g.duration, g.elapsed + dt);
    const t = g.elapsed / g.duration;
    const eased = 1 - (1 - t) * (1 - t);
    hero.x = g.from.x + (g.to.x - g.from.x) * eased;
    hero.y = g.from.y + (g.to.y - g.from.y) * eased;
    hero.target = { x: hero.x, y: hero.y };
    for (const enemy of [...state.enemies]) {
      if (!isHostile(enemy) || enemy.pulseHitId === g.id) continue;
      if (distance(enemy, hero) > g.width / 2 + enemy.def.radius) continue;
      enemy.pulseHitId = g.id;
      pulseHit(state, enemy, hero.def.pulse.damage * power);
    }
    if (g.elapsed >= g.duration) fx.glide = null;
  }

  if (fx.flame && effect.kind === 'flame') {
    // jato contínuo: segue a mira enquanto dura
    const f = fx.flame;
    f.remaining -= dt;
    if (aim) f.angle = Math.atan2(aim.y - hero.y, aim.x - hero.x);
    const length = effect.length * (1 + state.talents.pulseRadius) * (1 + state.heroStats.pulseSize);
    for (const enemy of [...state.enemies]) {
      if (!isHostile(enemy) || distance(enemy, hero) > length) continue;
      if (angleDiff(Math.atan2(enemy.y - hero.y, enemy.x - hero.x), f.angle) > effect.halfAngle) continue;
      damageEnemy(state, enemy, hero.def.pulse.damage * power * dt, undefined, { overTime: true });
      if (!enemy.dead) poisonEnemy(enemy, effect.burn.dps * power, effect.burn.duration);
    }
    state.events.push({ type: 'pulseFlame', x: hero.x, y: hero.y, angle: f.angle, halfAngle: effect.halfAngle, length });
    if (!hero.dead && f.remaining > 0) hero.facing = Math.cos(f.angle) >= 0 ? 1 : -1;
    if (f.remaining <= 0 || hero.dead) fx.flame = null;
  }

  if (fx.transform > 0) fx.transform = hero.dead ? 0 : Math.max(0, fx.transform - dt);

  // golpes atrasados: meteoros e a coluna de luz
  for (const strike of fx.strikes) strike.delay -= dt;
  const ready = fx.strikes.filter((s) => s.delay <= 0);
  fx.strikes = fx.strikes.filter((s) => s.delay > 0);
  for (const strike of ready) {
    if (strike.kind === 'meteor' && effect.kind === 'meteors') {
      const radius = effect.radius * (1 + state.heroStats.pulseSize);
      state.events.push({ type: 'pulseStrike', kind: 'meteor', x: strike.x, y: strike.y, radius });
      hitWhere(state, (e) => distance(e, strike) <= radius, hero.def.pulse.damage * power);
      state.pools.push({ x: strike.x, y: strike.y, radius: radius * 0.7, remaining: effect.burn.duration, duration: effect.burn.duration, dps: effect.burn.dps * power, color: '#ff6a1a' });
    } else if (strike.kind === 'judgment' && effect.kind === 'judgment') {
      const radius = effect.radius * (1 + state.heroStats.pulseSize);
      state.events.push({ type: 'pulseStrike', kind: 'judgment', x: strike.x, y: strike.y, radius });
      hitWhere(state, (e) => distance(e, strike) <= radius, hero.def.pulse.damage * power, (e) => {
        e.markTimer = Math.max(e.markTimer, effect.mark.duration);
        e.markAmount = Math.max(e.markAmount, effect.mark.amount);
      });
    }
  }
}

/** Fúria Lunar ativa: multiplicadores do ataque do herói (ou null). */
export function heroTransform(state: RunState): Extract<PulseEffect, { kind: 'transform' }> | null {
  const effect = pulseEffect(state);
  return state.pulseFx.transform > 0 && effect.kind === 'transform' ? effect : null;
}
