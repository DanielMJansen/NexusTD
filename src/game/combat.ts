import { ARENA, HERO, PULSE } from '../data/config';
import { creatureAbility, creatureDamage, creatureRange } from './creatureStats';
import { distance, type Creature, type Enemy, type Point, type RunState } from './state';

/** Aplica um golpe, já descontando a armadura. Dá a recompensa só uma vez. */
export function damageEnemy(state: RunState, enemy: Enemy, amount: number, source?: Creature): void {
  enemy.hp -= Math.max(1, amount - enemy.def.armor);
  enemy.lastHitAt = state.time;
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    state.kills++;
    state.gold += enemy.def.gold;
    state.events.push({
      type: 'enemyKilled',
      enemy: enemy.def.id,
      x: enemy.x,
      y: enemy.y,
      gold: enemy.def.gold,
      color: enemy.def.color,
    });
    const ability = source ? creatureAbility(source) : null;
    if (ability?.kind === 'lifesteal') healNexus(state, ability.healPerKill);
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
  state.pulse.remaining = state.pulse.cooldown;
  for (const enemy of state.enemies) {
    if (distance(enemy, hero) < PULSE.radius) damageEnemy(state, enemy, PULSE.damage);
  }
  state.events.push({ type: 'pulse', x: hero.x, y: hero.y });
  return true;
}

/** Move o herói (direção do teclado tem prioridade sobre o alvo de toque) e ataca. */
export function updateHero(state: RunState, dt: number, direction: Point): void {
  const { hero } = state;
  const step = HERO.speed * dt;
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
  const margin = HERO.edgeMargin;
  hero.x = Math.min(ARENA.width - margin, Math.max(margin, hero.x));
  hero.y = Math.min(ARENA.height - margin, Math.max(margin, hero.y));
  const movedX = hero.x - startX;
  hero.moving = Math.hypot(movedX, hero.y - startY) > 0.01;
  if (Math.abs(movedX) > 0.01) hero.facing = movedX > 0 ? 1 : -1;

  hero.attackTimer -= dt;
  if (hero.attackTimer > 0) return;
  let target: Enemy | null = null;
  let best = HERO.range;
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    const d = distance(enemy, hero);
    if (d < best) {
      best = d;
      target = enemy;
    }
  }
  if (!target) return;
  damageEnemy(state, target, HERO.damage * state.modifiers.damage);
  hero.attackTimer = HERO.cooldown / state.modifiers.attackSpeed;
  hero.lastAttackAt = state.time;
  if (!hero.moving) hero.facing = target.x >= hero.x ? 1 : -1;
  state.events.push({ type: 'shot', source: 'hero', from: { x: hero.x, y: hero.y }, to: { x: target.x, y: target.y } });
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
