import { ARENA, HERO_PLACEMENT } from '../data/config';
import { creatureAbility, creatureDamage, creatureRange } from './creatureStats';
import { distance, type Creature, type Enemy, type Point, type RunState } from './state';

/** Aplica um golpe, já descontando a armadura. Dá a recompensa só uma vez. */
export function damageEnemy(state: RunState, enemy: Enemy, amount: number, source?: Creature): void {
  enemy.hp -= Math.max(1, amount - enemy.def.armor);
  enemy.lastHitAt = state.time;
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
    if (source) {
      const ability = creatureAbility(source);
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

/** Habilidade do herói: dano em área ao redor dele. Devolve false se ainda está recarregando. */
export function firePulse(state: RunState): boolean {
  if (state.phase !== 'playing' || state.pulse.remaining > 0) return false;
  const { hero } = state;
  const pulse = hero.def.pulse;
  state.pulse.remaining = state.pulse.cooldown;
  let hit = 0;
  for (const enemy of state.enemies) {
    if (enemy.dead || distance(enemy, hero) >= state.pulse.radius) continue;
    damageEnemy(state, enemy, pulse.damage * (1 + state.talents.heroDamage));
    hit++;
  }
  if (pulse.healPerEnemy > 0 && hit > 0) healNexus(state, pulse.healPerEnemy * hit);
  state.events.push({ type: 'pulse', hero: hero.def.id, x: hero.x, y: hero.y, radius: state.pulse.radius });
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
  const damage = attack.damage * state.modifiers.damage * (1 + state.talents.heroDamage);
  for (const victim of victims) damageEnemy(state, victim, damage);
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

/**
 * Cada criatura ataca o inimigo mais próximo do Nexus dentro do seu alcance
 * (ou os N mais próximos, com multi-tiro).
 */
export function updateCreatures(state: RunState, dt: number): void {
  const { modifiers } = state;
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
    const damage = creatureDamage(creature, modifiers) * (inFrenzy ? ability.damageMultiplier : 1);
    creature.attackTimer = def.cooldown / modifiers.attackSpeed / (inFrenzy ? ability.attackSpeedMultiplier : 1);
    for (const t of targets) damageEnemy(state, t, damage, creature);
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
      case 'multishot':
      case 'block':
      case 'lifesteal':
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
