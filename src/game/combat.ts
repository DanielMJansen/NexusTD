import { ARENA, HERO_PLACEMENT } from '../data/config';
import { creatureAbility, creatureDamage, creatureRange } from './creatureStats';
import { random } from './random';
import { distance, type Creature, type Enemy, type Point, type RunState } from './state';

export interface HitOptions {
  /** Ignora toda a armadura. */
  ignoreArmor?: boolean;
  /** Dano contínuo (veneno, poça): sem clarão de golpe e sem mínimo de 1 por tique. */
  overTime?: boolean;
  /** Golpe crítico (só para o número na tela; o dano já vem dobrado). */
  crit?: boolean;
}

/** Armadura efetiva contra um golpe (habilidades e bônus de raça que perfuram). */
function effectiveArmor(state: RunState, enemy: Enemy, source: Creature | undefined, options: HitOptions): number {
  if (options.ignoreArmor) return 0;
  let armor = enemy.def.armor;
  if (source) {
    if (creatureAbility(source).kind === 'pierceArmor') return 0;
    const { race, bonus } = state.modifiers.raceBonus;
    if (bonus.kind === 'armorPierce' && source.def.race === race) armor -= bonus.value;
  }
  return Math.max(0, armor);
}

/** Aplica um golpe, já descontando a armadura. Dá a recompensa só uma vez. */
export function damageEnemy(
  state: RunState,
  enemy: Enemy,
  amount: number,
  source?: Creature,
  options: HitOptions = {},
): void {
  if (enemy.dead) return;
  const ability = source ? creatureAbility(source) : null;
  if (ability?.kind === 'pierceArmor' && enemy.def.armor > 0) amount *= 1 + ability.bonusVsArmored;
  const reduced = amount - effectiveArmor(state, enemy, source, options);
  const dealt = options.overTime ? Math.max(0, reduced) : Math.max(1, reduced);
  enemy.hp -= dealt;
  if (!options.overTime) state.events.push({ type: 'enemyDamaged', x: enemy.x, y: enemy.y, amount: dealt, crit: options.crit });
  // Sentença: inimigos comuns com pouca vida morrem na hora
  const execute = state.modifiers.executeBelow;
  if (execute > 0 && enemy.hp > 0 && !enemy.def.isBoss && enemy.hp <= enemy.maxHp * execute) enemy.hp = 0;
  if (!options.overTime) enemy.lastHitAt = state.time;
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    state.kills++;
    state.gold += Math.round(enemy.def.gold * (1 + state.talents.killGold));
    state.events.push({
      type: 'enemyKilled',
      enemy: enemy.def.id,
      x: enemy.x,
      y: enemy.y,
      gold: enemy.def.gold,
      color: enemy.def.color,
    });
    if (source && ability) {
      if (ability.kind === 'lifesteal') healNexus(state, ability.healPerKill);
      const { race, bonus } = state.modifiers.raceBonus;
      if (bonus.kind === 'killHeal' && source.def.race === race) healNexus(state, bonus.value);
    }
  }
}

function healNexus(state: RunState, amount: number): void {
  const healed = Math.min(amount, state.nexus.maxHp - state.nexus.hp);
  if (healed <= 0) return;
  state.nexus.hp += healed;
  state.events.push({ type: 'nexusHealed', amount: healed });
}

/** Guardas seguram os inimigos mais próximos dentro do raio de bloqueio (chefes passam). */
export function applyBlocks(state: RunState): void {
  for (const enemy of state.enemies) enemy.held = false;
  for (const creature of state.creatures) {
    const ability = creatureAbility(creature);
    if (ability.kind !== 'block') continue;
    const caught = state.enemies
      .filter((e) => !e.dead && !e.held && !e.def.isBoss && distance(e, creature) < ability.radius)
      .sort((a, b) => distance(a, creature) - distance(b, creature))
      .slice(0, ability.capacity);
    for (const enemy of caught) enemy.held = true;
  }
}

/** Envenena (o veneno mais forte e mais longo prevalece). */
export function poisonEnemy(enemy: Enemy, dps: number, duration: number): void {
  enemy.poisonDps = Math.max(dps, enemy.poisonTimer > 0 ? enemy.poisonDps : 0);
  enemy.poisonTimer = Math.max(enemy.poisonTimer, duration);
}

/** Distância de um ponto ao segmento a–b. */
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

const clampToArena = (p: Point): Point => {
  const m = HERO_PLACEMENT.edgeMargin;
  return { x: Math.min(ARENA.width - m, Math.max(m, p.x)), y: Math.min(ARENA.height - m, Math.max(m, p.y)) };
};

/** Habilidade do herói (dados em HeroDef.pulse). Devolve false se ainda está recarregando. */
/**
 * `aim`: para onde mirar habilidades direcionais (cursor do mouse ou direção do teclado);
 * sem mira, vai no inimigo mais próximo.
 */
export function firePulse(state: RunState, aim?: Point): boolean {
  if (state.phase !== 'playing' || state.pulse.remaining > 0) return false;
  const { hero } = state;
  const pulse = hero.def.pulse;
  state.pulse.remaining = state.pulse.cooldown;
  const start = { x: hero.x, y: hero.y };
  let end: Point | undefined;
  let isHit: (e: Enemy) => boolean;

  if (pulse.shape?.kind === 'dash') {
    // Investida: atravessa o campo na direção do inimigo mais próximo (ou para onde olha).
    const nearest = state.enemies.filter((e) => !e.dead).sort((a, b) => distance(a, hero) - distance(b, hero))[0];
    const target = aim ?? nearest;
    const angle = target ? Math.atan2(target.y - hero.y, target.x - hero.x) : hero.facing > 0 ? 0 : Math.PI;
    const length = pulse.shape.length * (1 + state.talents.pulseRadius);
    end = clampToArena({ x: hero.x + Math.cos(angle) * length, y: hero.y + Math.sin(angle) * length });
    const halfWidth = pulse.shape.width / 2;
    const segmentEnd = end;
    isHit = (e) => distanceToSegment(e, start, segmentEnd) <= halfWidth;
    hero.x = end.x;
    hero.y = end.y;
    hero.target = { ...end };
  } else {
    isHit = (e) => distance(e, hero) < state.pulse.radius;
  }

  let hit = 0;
  for (const enemy of state.enemies) {
    if (enemy.dead || !isHit(enemy)) continue;
    damageEnemy(state, enemy, pulse.damage * (1 + state.talents.heroDamage), undefined, {
      ignoreArmor: hero.def.attack.pierceArmor,
    });
    if (pulse.fear && !enemy.def.isBoss) enemy.fearTimer = Math.max(enemy.fearTimer, pulse.fear);
    if (pulse.poison) poisonEnemy(enemy, pulse.poison.dps * (1 + state.talents.heroDamage), pulse.poison.duration);
    hit++;
  }
  if (pulse.healPerEnemy > 0 && hit > 0) healNexus(state, pulse.healPerEnemy * hit);
  state.events.push({ type: 'pulse', hero: hero.def.id, x: start.x, y: start.y, radius: state.pulse.radius, to: end });
  return true;
}

/** Move o herói (direção do teclado tem prioridade sobre o alvo de toque) e ataca. */
export function updateHero(state: RunState, dt: number, direction: Point): void {
  const { hero } = state;
  const step = hero.def.speed * (1 + state.talents.heroSpeed) * dt;
  const startX = hero.x;
  const startY = hero.y;
  if (direction.x || direction.y) {
    const length = Math.hypot(direction.x, direction.y);
    hero.x += (direction.x / length) * step;
    hero.y += (direction.y / length) * step;
    hero.target = { x: hero.x, y: hero.y };
  } else {
    const dx = hero.target.x - hero.x;
    const dy = hero.target.y - hero.y;
    const length = Math.hypot(dx, dy);
    if (length > 3) {
      hero.x += (dx / length) * step;
      hero.y += (dy / length) * step;
    }
  }
  const margin = HERO_PLACEMENT.edgeMargin;
  hero.x = Math.min(ARENA.width - margin, Math.max(margin, hero.x));
  hero.y = Math.min(ARENA.height - margin, Math.max(margin, hero.y));
  const movedX = hero.x - startX;
  hero.moving = Math.hypot(movedX, hero.y - startY) > 0.01;
  if (Math.abs(movedX) > 0.01) hero.facing = movedX > 0 ? 1 : -1;

  hero.attackTimer -= dt;
  if (hero.attackTimer > 0) return;
  const attack = hero.def.attack;
  let target: Enemy | null = null;
  let best = attack.range;
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    const d = distance(enemy, hero);
    if (d < best) {
      best = d;
      target = enemy;
    }
  }
  if (!target) return;

  // Leque: todos dentro do alcance e do ângulo na direção do alvo mais próximo.
  const pattern = attack.pattern;
  const aim = Math.atan2(target.y - hero.y, target.x - hero.x);
  const victims =
    pattern.kind === 'cone'
      ? state.enemies.filter((e) => {
          if (e.dead || distance(e, hero) > attack.range) return false;
          const diff = Math.abs(((Math.atan2(e.y - hero.y, e.x - hero.x) - aim + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
          return diff <= pattern.halfAngle;
        })
      : [target];
  const crit = random() < state.modifiers.critChance;
  const damage = attack.damage * state.modifiers.damage * (1 + state.talents.heroDamage) * (crit ? 2 : 1);
  for (const victim of victims) damageEnemy(state, victim, damage, undefined, { ignoreArmor: attack.pierceArmor, crit });
  if (attack.healPerHit > 0) healNexus(state, attack.healPerHit * victims.length);

  hero.attackTimer = attack.cooldown / state.modifiers.attackSpeed;
  hero.lastAttackAt = state.time;
  if (!hero.moving) hero.facing = target.x >= hero.x ? 1 : -1;
  state.events.push({
    type: 'heroAttack',
    hero: hero.def.id,
    from: { x: hero.x, y: hero.y },
    to: { x: target.x, y: target.y },
    cone: pattern.kind === 'cone' ? pattern.halfAngle : null,
    range: attack.range,
  });
}

/** Alfas aceleram as criaturas ao redor (auras não se somam: vale a maior). */
function applyAuras(state: RunState): void {
  for (const creature of state.creatures) creature.auraBonus = 0;
  for (const source of state.creatures) {
    const ability = creatureAbility(source);
    if (ability.kind !== 'aura') continue;
    for (const other of state.creatures) {
      if (other !== source && distance(other, source) <= ability.radius) {
        other.auraBonus = Math.max(other.auraBonus, ability.attackSpeed);
      }
    }
  }
}

/** Veneno e poças: dano contínuo que ignora armadura. */
export function updateDamageOverTime(state: RunState, dt: number): void {
  for (const enemy of state.enemies) {
    if (enemy.poisonTimer <= 0 || enemy.dead) continue;
    enemy.poisonTimer -= dt;
    damageEnemy(state, enemy, enemy.poisonDps * dt, undefined, { ignoreArmor: true, overTime: true });
  }
  for (const pool of state.pools) {
    pool.remaining -= dt;
    for (const enemy of state.enemies) {
      if (!enemy.dead && distance(enemy, pool) <= pool.radius) {
        damageEnemy(state, enemy, pool.dps * dt, undefined, { ignoreArmor: true, overTime: true });
      }
    }
  }
  state.pools = state.pools.filter((p) => p.remaining > 0);
}

/**
 * Cada criatura ataca o inimigo mais próximo do Nexus dentro do seu alcance
 * (ou os N mais próximos, com multi-tiro).
 */
export function updateCreatures(state: RunState, dt: number): void {
  const { modifiers } = state;
  applyAuras(state);
  const { race, bonus } = modifiers.raceBonus;
  for (const creature of state.creatures) {
    creature.attackTimer -= dt;
    creature.frenzyTimer -= dt;
    if (creature.attackTimer > 0) continue;

    const { def } = creature;
    const ability = creatureAbility(creature);
    const range = creatureRange(creature, modifiers);
    const inRange = state.enemies
      .filter((enemy) => !enemy.dead && distance(enemy, creature) <= range)
      .sort((a, b) => distance(a, ARENA.center) - distance(b, ARENA.center));
    const targets = inRange.slice(0, ability.kind === 'multishot' ? ability.targets : 1);
    const target = targets[0];
    if (!target) continue;

    const inFrenzy = ability.kind === 'frenzy' && creature.frenzyTimer > 0;
    const crit = random() < modifiers.critChance;
    const damage = creatureDamage(creature, modifiers) * (inFrenzy ? ability.damageMultiplier : 1) * (crit ? 2 : 1);
    const raceSpeed = bonus.kind === 'attackSpeed' && def.race === race ? bonus.value : 0;
    const speed = modifiers.attackSpeed * (1 + raceSpeed + creature.auraBonus) * (inFrenzy ? ability.attackSpeedMultiplier : 1);
    creature.attackTimer = def.cooldown / speed;
    for (const t of targets) damageEnemy(state, t, damage, creature, { crit });
    creature.lastAttackAt = state.time;
    creature.facing = target.x >= creature.x ? 1 : -1;

    switch (ability.kind) {
      case 'splash':
        for (const other of state.enemies) {
          if (other !== target && !other.dead && distance(other, target) < ability.radius) {
            damageEnemy(state, other, damage * ability.damageRatio, creature);
          }
        }
        break;
      case 'slow':
        target.slowTimer = ability.duration;
        target.slowMultiplier = ability.speedMultiplier;
        break;
      case 'frenzy':
        if (!inFrenzy && ++creature.hitCount >= ability.hitsToTrigger) {
          creature.hitCount = 0;
          creature.frenzyTimer = ability.duration;
        }
        break;
      case 'chain': {
        // salta do alvo para o inimigo mais próximo ainda não atingido
        const hit = new Set<Enemy>([target]);
        let from: Enemy = target;
        let chainDamage = damage;
        for (let i = 0; i < ability.jumps; i++) {
          const next = state.enemies
            .filter((e) => !e.dead && !hit.has(e) && distance(e, from) <= ability.radius)
            .sort((a, b) => distance(a, from) - distance(b, from))[0];
          if (!next) break;
          chainDamage *= ability.falloff;
          damageEnemy(state, next, chainDamage, creature);
          state.events.push({ type: 'shot', source: def.id, from: { x: from.x, y: from.y }, to: { x: next.x, y: next.y } });
          hit.add(next);
          from = next;
        }
        break;
      }
      case 'screech': {
        const angle = Math.atan2(target.y - creature.y, target.x - creature.x);
        for (const other of state.enemies) {
          if (other.dead || other === target || distance(other, creature) > range) continue;
          const diff = Math.abs(((Math.atan2(other.y - creature.y, other.x - creature.x) - angle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
          if (diff <= ability.halfAngle) damageEnemy(state, other, damage, creature);
        }
        for (const e of state.enemies) {
          if (e.dead || e.def.isBoss || distance(e, creature) > range) continue;
          const diff = Math.abs(((Math.atan2(e.y - creature.y, e.x - creature.x) - angle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
          if (diff > ability.halfAngle) continue;
          const away = Math.atan2(e.y - ARENA.center.y, e.x - ARENA.center.x);
          e.x += Math.cos(away) * ability.push;
          e.y += Math.sin(away) * ability.push;
        }
        state.events.push({ type: 'screech', x: creature.x, y: creature.y, angle, halfAngle: ability.halfAngle, range });
        break;
      }
      case 'poison': {
        const extra = bonus.kind === 'poisonDuration' && def.race === race ? bonus.value : 0;
        const scale = damage / def.damage;
        poisonEnemy(target, ability.dps * scale, ability.duration + extra);
        break;
      }
      case 'pool': {
        const extra = bonus.kind === 'poisonDuration' && def.race === race ? bonus.value : 0;
        const scale = damage / def.damage;
        const duration = ability.duration + extra;
        state.pools.push({ x: target.x, y: target.y, radius: ability.radius, remaining: duration, duration, dps: ability.dps * scale, color: def.color });
        state.events.push({ type: 'poolCreated', x: target.x, y: target.y, radius: ability.radius });
        break;
      }
      case 'multishot':
      case 'block':
      case 'lifesteal':
      case 'aura':
      case 'pierceArmor':
      case 'none':
        break;
    }

    for (const t of targets) {
      state.events.push({
        type: 'shot',
        source: def.id,
        from: { x: creature.x, y: creature.y },
        to: { x: t.x, y: t.y },
      });
    }
  }
}
