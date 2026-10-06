import { onIce } from './ice';
import { weatherRangeFactor } from './mapEvents';
import { HERO_PLACEMENT } from '../data/config';
import { creatureAbility, creatureCooldown, creatureDamage, creatureRange, killHaste } from './creatureStats';
import { applyHitEffects, isHostile, onEnemyKilled, sourceDamageMultiplier, vulnerability } from './hitEffects';
import { terrainAttackFactor, terrainHeroFactor } from './terrain';

const isLure = (enemy: Enemy) => enemy.def.traits.some((t) => t.kind === 'lure');
import { heroTransform } from './pulses';
import { WAVES } from '../data/waves';
import { cutHead, enemyArmor, releaseSwallowed, shieldFactor } from './enemies';
import { grantXp, healHero, heroRange } from './hero';
import { dropLoot } from './loot';
import { spawnEnemyAt } from './spawning';
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
  let armor = enemyArmor(enemy);
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
  if (ability?.kind === 'pierceArmor' && enemyArmor(enemy) > 0) amount *= 1 + ability.bonusVsArmored;
  // marca/vulnerável (todas as fontes) e bônus da criatura (contra fortes, abates acumulados)
  amount *= vulnerability(enemy) * (source ? sourceDamageMultiplier(source, enemy) : 1);
  const raceBonus = state.modifiers.raceBonus;
  if (source && raceBonus.bonus.kind === 'vsStrong' && source.def.race === raceBonus.race && (enemy.elite || enemy.def.isBoss)) {
    amount *= 1 + raceBonus.bonus.value;
  }
  const reduced = (amount - effectiveArmor(state, enemy, source, options)) * shieldFactor(enemy);
  const dealt = options.overTime ? Math.max(0, reduced) : Math.max(1, reduced);
  enemy.hp -= dealt;
  if (!options.overTime) state.events.push({ type: 'enemyDamaged', x: enemy.x, y: enemy.y, amount: dealt, crit: options.crit });
  // Sentença: inimigos comuns com pouca vida morrem na hora
  const execute = state.modifiers.executeBelow;
  if (execute > 0 && enemy.hp > 0 && !enemy.def.isBoss && enemy.hp <= enemy.maxHp * execute) enemy.hp = 0;
  if (!options.overTime) enemy.lastHitAt = state.time;
  if (enemy.hp <= 0 && !enemy.dead && !cutHead(state, enemy)) {
    enemy.dead = true;
    if (enemy.def.traits.some((t) => t.kind === 'swallow')) releaseSwallowed(state, enemy);
    state.kills++;
    state.waveKills++;
    const reward = enemy.elite ? WAVES.elites.reward : 1;
    const gold = Math.round(enemy.def.gold * reward * (1 + state.talents.killGold));
    state.gold += gold;
    grantXp(state, enemy.def.xp * reward);
    state.events.push({
      type: 'enemyKilled',
      enemy: enemy.def.id,
      x: enemy.x,
      y: enemy.y,
      gold,
      color: enemy.def.color,
      elite: enemy.elite,
    });
    if (!enemy.summonedAlly) dropLoot(state, enemy);
    onEnemyKilled(state, enemy, source);
    for (const trait of enemy.def.traits) {
      if (trait.kind === 'split') for (let k = 0; k < trait.count; k++) spawnEnemyAt(state, trait.into, enemy, 8);
    }
    if (source && ability) {
      // sustento vampírico cura o herói (o Nexus não é curado por criaturas)
      if (ability.kind === 'lifesteal') healHero(state, ability.healPerKill);
      if (ability.kind === 'bounty') {
        state.gold += ability.gold;
        state.events.push({ type: 'bountyGold', x: enemy.x, y: enemy.y, gold: ability.gold });
      }
      const { race, bonus } = state.modifiers.raceBonus;
      if (bonus.kind === 'killHeal' && source.def.race === race) healHero(state, bonus.value);
    }
  }
}


/** Guardas seguram os inimigos mais próximos dentro do raio de bloqueio (chefes passam). */
export function applyBlocks(state: RunState): void {
  for (const enemy of state.enemies) enemy.held = false;
  for (const creature of state.creatures) {
    const ability = creatureAbility(creature);
    if (ability.kind !== 'block') continue;
    const caught = state.enemies
      .filter((e) => isHostile(e) && !e.held && !e.def.isBoss && !onIce(state, e) && distance(e, creature) < ability.radius)
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

/** Ângulo entre a direção (de → para) e outra direção, em radianos (0–π). */
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);

/** Distância de um ponto ao segmento a–b. */
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

/** Move o herói (direção do teclado tem prioridade sobre o alvo de toque) e ataca. */
export function updateHero(state: RunState, dt: number, direction: Point): void {
  const { hero } = state;
  if (hero.dead) return;
  const step = hero.def.speed * (1 + state.talents.heroSpeed + state.heroStats.speed) * terrainHeroFactor(state, hero) * dt;
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
  hero.x = Math.min(state.map.width - margin, Math.max(margin, hero.x));
  hero.y = Math.min(state.map.height - margin, Math.max(margin, hero.y));
  const movedX = hero.x - startX;
  hero.moving = Math.hypot(movedX, hero.y - startY) > 0.01;
  if (Math.abs(movedX) > 0.01) hero.facing = movedX > 0 ? 1 : -1;

  hero.attackTimer -= dt;
  if (hero.attackTimer > 0) return;
  const attack = hero.def.attack;
  let target: Enemy | null = null;
  const range = heroRange(state);
  let best = range;
  for (const enemy of state.enemies) {
    if (!isHostile(enemy)) continue;
    const d = distance(enemy, hero);
    if (d < best) {
      best = d;
      target = enemy;
    }
  }
  if (!target) return;

  // Leque: todos dentro do alcance e do ângulo na direção do alvo mais próximo.
  // Fúria Lunar: golpes em leque, mais fortes e mais rápidos, que curam o herói
  const fury = heroTransform(state);
  const pattern = fury && attack.pattern.kind === 'single' ? { kind: 'cone' as const, halfAngle: 0.9 } : attack.pattern;
  const aim = Math.atan2(target.y - hero.y, target.x - hero.x);
  const victims =
    pattern.kind === 'cone'
      ? state.enemies.filter((e) => {
          if (!isHostile(e) || distance(e, hero) > range) return false;
          const diff = Math.abs(((Math.atan2(e.y - hero.y, e.x - hero.x) - aim + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
          return diff <= pattern.halfAngle;
        })
      : [target];
  const crit = random() < state.modifiers.critChance;
  const damage =
    attack.damage * state.modifiers.damage * (1 + state.talents.heroDamage + state.heroStats.damage) * (crit ? 2 : 1) * (1 + (fury?.damage ?? 0));
  for (const victim of victims) damageEnemy(state, victim, damage, undefined, { ignoreArmor: attack.pierceArmor, crit });
  if (attack.healPerHit > 0) healHero(state, attack.healPerHit * victims.length);
  const lifesteal = state.heroStats.lifesteal + (fury?.lifesteal ?? 0);
  if (lifesteal > 0) healHero(state, damage * victims.length * lifesteal);

  hero.attackTimer = attack.cooldown / (state.modifiers.attackSpeed + state.heroStats.attackSpeed) / (1 + (fury?.attackSpeed ?? 0));
  hero.lastAttackAt = state.time;
  if (!hero.moving) hero.facing = target.x >= hero.x ? 1 : -1;
  state.events.push({
    type: 'heroAttack',
    hero: hero.def.id,
    from: { x: hero.x, y: hero.y },
    to: { x: target.x, y: target.y },
    cone: pattern.kind === 'cone' ? pattern.halfAngle : null,
    range,
  });
}

/** Auras: Alfas aceleram e Bênçãos fortalecem as criaturas ao redor (não se somam: vale a maior de cada tipo). */
function applyAuras(state: RunState): void {
  for (const creature of state.creatures) {
    creature.auraBonus = 0;
    creature.blessDamage = 0;
    creature.blessRange = 0;
    creature.blessCrit = 0;
    creature.protected = false;
  }
  for (const source of state.creatures) {
    const ability = creatureAbility(source);
    if (ability.kind !== 'aura' && ability.kind !== 'bless') continue;
    for (const other of state.creatures) {
      if (other === source || distance(other, source) > ability.radius) continue;
      if (ability.kind === 'aura') {
        other.auraBonus = Math.max(other.auraBonus, ability.attackSpeed);
        continue;
      }
      other.auraBonus = Math.max(other.auraBonus, ability.attackSpeed ?? 0);
      other.blessDamage = Math.max(other.blessDamage, ability.damage ?? 0);
      other.blessRange = Math.max(other.blessRange, ability.range ?? 0);
      other.blessCrit = Math.max(other.blessCrit, ability.critDamage ?? 0);
      if (ability.protect) other.protected = true;
    }
  }
  // Proteção: imunes a teia e atordoamento
  for (const creature of state.creatures) {
    if (!creature.protected) continue;
    creature.webTimer = 0;
    creature.stunTimer = 0;
  }
}

/** Veneno, poças e auras que ferem (Juiz): dano contínuo que ignora armadura. */
export function updateDamageOverTime(state: RunState, dt: number): void {
  for (const enemy of state.enemies) {
    if (enemy.poisonTimer <= 0 || enemy.dead) continue;
    enemy.poisonTimer -= dt;
    damageEnemy(state, enemy, enemy.poisonDps * dt, undefined, { ignoreArmor: true, overTime: true });
  }
  for (const pool of state.pools) {
    pool.remaining -= dt;
    for (const enemy of state.enemies) {
      if (isHostile(enemy) && distance(enemy, pool) <= pool.radius) {
        if (pool.slow && !enemy.def.isBoss) {
          enemy.slowTimer = Math.max(enemy.slowTimer, 0.3);
          enemy.slowMultiplier = Math.min(enemy.slowTimer > 0.3 ? enemy.slowMultiplier : 1, 1 - pool.slow);
        }
        if (pool.dps <= 0) continue;
        damageEnemy(state, enemy, pool.dps * dt, undefined, { ignoreArmor: true, overTime: true });
        if (enemy.dead && pool.bounty) {
          state.gold += pool.bounty;
          state.events.push({ type: 'bountyGold', x: enemy.x, y: enemy.y, gold: pool.bounty });
        }
      }
    }
  }
  state.pools = state.pools.filter((p) => p.remaining > 0);
  for (const source of state.creatures) {
    const ability = creatureAbility(source);
    if (ability.kind !== 'bless' || !ability.dps) continue;
    const dps = ability.dps * (creatureDamage(source, state.modifiers) / source.def.damage);
    for (const enemy of state.enemies) {
      if (isHostile(enemy) && distance(enemy, source) <= ability.radius) {
        damageEnemy(state, enemy, dps * dt, source, { ignoreArmor: true, overTime: true });
      }
    }
  }
}

/** Escolhe os alvos no alcance: os mais perto do Nexus (padrão) ou os mais fortes primeiro. */
function pickTargets(state: RunState, creature: Creature, range: number, count: number): Enemy[] {
  const strongest = creature.def.targeting === 'strongest';
  return state.enemies
    .filter((enemy) => isHostile(enemy) && distance(enemy, creature) <= range)
    .sort((a, b) =>
      // Fogo-fátuo (isca) sempre primeiro
      Number(isLure(b)) - Number(isLure(a)) ||
      (strongest
        ? Number(b.def.isBoss) - Number(a.def.isBoss) || Number(b.elite) - Number(a.elite) || b.hp - a.hp
        : distance(a, state.nexus) - distance(b, state.nexus)),
    )
    .slice(0, count);
}

/**
 * Cada criatura ataca o inimigo mais próximo do Nexus dentro do seu alcance
 * (ou os N mais próximos, com multi-tiro; ou o mais forte, com mira nos fortes).
 */
export function updateCreatures(state: RunState, dt: number): void {
  const { modifiers } = state;
  applyAuras(state);
  const { race, bonus } = modifiers.raceBonus;
  for (const creature of state.creatures) {
    creature.frenzyTimer -= dt;
    creature.webTimer = Math.max(0, creature.webTimer - dt);
    if ((creature.swallowTimer ?? 0) > 0) {
      // engolida pelo Rei Sapo: fora de combate
      creature.swallowTimer! -= dt;
      if (creature.swallowTimer! <= 0) state.events.push({ type: 'creatureReleased', x: creature.x, y: creature.y });
      continue;
    }
    if (creature.stunTimer > 0) {
      // atordoada: não ataca nem recarrega
      creature.stunTimer -= dt;
      if (creature.stunTimer <= 0) creature.frozen = false;
      continue;
    }
    creature.attackTimer -= dt * (creature.webTimer > 0 ? 1 - creature.webSlow : 1) * terrainAttackFactor(state, creature);
    if (creature.attackTimer > 0) continue;

    const { def } = creature;
    const ability = creatureAbility(creature);
    const range = creatureRange(creature, modifiers) * weatherRangeFactor(state, creature);
    const reach = ability.kind === 'nova' ? Math.min(range, ability.radius) : range;
    const targets = pickTargets(state, creature, reach, ability.kind === 'multishot' ? ability.targets : 1);
    const target = targets[0];
    if (!target) continue;

    const inFrenzy = ability.kind === 'frenzy' && creature.frenzyTimer > 0;
    // crítico: chance das melhorias + da vertente (Atirador de Elite, Lâmina Carmesim) e dano crítico de auras
    const critBonus = ability.kind === 'crit' ? ability : null;
    const raceCrit = bonus.kind === 'critChance' && def.race === race ? bonus.value : 0;
    const crit = random() < modifiers.critChance + (critBonus?.chance ?? 0) + raceCrit;
    const critMultiplier = (critBonus ? critBonus.multiplier : 2) + creature.blessCrit;
    const damage = creatureDamage(creature, modifiers) * (inFrenzy ? ability.damageMultiplier : 1) * (crit ? critMultiplier : 1);
    const raceSpeed = bonus.kind === 'attackSpeed' && def.race === race ? bonus.value : 0;
    const speed =
      modifiers.attackSpeed *
      (1 + raceSpeed + creature.auraBonus + killHaste(creature) + (state.haste.remaining > 0 ? state.haste.amount : 0)) *
      (inFrenzy ? ability.attackSpeedMultiplier : 1);
    creature.attackTimer = creatureCooldown(creature) / speed;
    creature.lastAttackAt = state.time;
    creature.facing = target.x >= creature.x ? 1 : -1;

    // inimigos atingidos pelo golpe principal (recebem os efeitos de golpe)
    let victims: Enemy[] = targets;
    let showShots = true;
    if (ability.kind === 'nova') {
      victims = state.enemies.filter((e) => isHostile(e) && distance(e, creature) <= reach);
      showShots = false;
      state.events.push({ type: 'nova', source: def.id, x: creature.x, y: creature.y, radius: reach });
    } else if (ability.kind === 'pierce') {
      const base = Math.atan2(target.y - creature.y, target.x - creature.x);
      const hit = new Set<Enemy>();
      for (let b = 0; b < ability.beams; b++) {
        const angle = base + (b - (ability.beams - 1) / 2) * 0.28;
        const end = { x: creature.x + Math.cos(angle) * range, y: creature.y + Math.sin(angle) * range };
        for (const e of state.enemies) {
          if (isHostile(e) && distanceToSegment(e, creature, end) <= ability.width / 2 + e.def.radius * 0.5) hit.add(e);
        }
        state.events.push({ type: 'beam', source: def.id, from: { x: creature.x, y: creature.y }, to: end, width: ability.width });
      }
      victims = [...hit];
      showShots = false;
    }
    for (const t of victims) damageEnemy(state, t, damage, creature, { crit });

    const extra = bonus.kind === 'poisonDuration' && def.race === race ? bonus.value : 0;
    const scale = damage / def.damage;
    for (const t of victims) applyHitEffects(state, creature, t, scale, extra);

    switch (ability.kind) {
      case 'splash':
        for (const other of state.enemies) {
          if (other !== target && isHostile(other) && distance(other, target) < ability.radius) {
            damageEnemy(state, other, damage * ability.damageRatio, creature);
            applyHitEffects(state, creature, other, scale * ability.damageRatio, extra);
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
            .filter((e) => isHostile(e) && !hit.has(e) && distance(e, from) <= ability.radius)
            .sort((a, b) => distance(a, from) - distance(b, from))[0];
          if (!next) break;
          chainDamage *= ability.falloff;
          damageEnemy(state, next, chainDamage, creature);
          applyHitEffects(state, creature, next, scale * (chainDamage / damage), extra);
          state.events.push({ type: 'shot', source: def.id, from: { x: from.x, y: from.y }, to: { x: next.x, y: next.y } });
          hit.add(next);
          from = next;
        }
        break;
      }
      case 'screech': {
        const angle = Math.atan2(target.y - creature.y, target.x - creature.x);
        for (const other of state.enemies) {
          if (!isHostile(other) || other === target || distance(other, creature) > range) continue;
          if (angleDiff(Math.atan2(other.y - creature.y, other.x - creature.x), angle) <= ability.halfAngle) {
            damageEnemy(state, other, damage, creature);
            applyHitEffects(state, creature, other, scale, extra);
          }
        }
        for (const e of state.enemies) {
          if (!isHostile(e) || e.def.isBoss || distance(e, creature) > range) continue;
          if (angleDiff(Math.atan2(e.y - creature.y, e.x - creature.x), angle) > ability.halfAngle) continue;
          if (ability.immunity) {
            if (state.time < (e.screechImmuneUntil ?? 0)) continue;
            e.screechImmuneUntil = state.time + ability.immunity;
          }
          const away = Math.atan2(e.y - state.nexus.y, e.x - state.nexus.x);
          e.x += Math.cos(away) * ability.push;
          e.y += Math.sin(away) * ability.push;
          if (ability.fear) e.fearTimer = Math.max(e.fearTimer, ability.fear);
        }
        state.events.push({ type: 'screech', x: creature.x, y: creature.y, angle, halfAngle: ability.halfAngle, range });
        break;
      }
      case 'poison':
        poisonEnemy(target, ability.dps * scale, ability.duration + extra);
        break;
      case 'pool': {
        const duration = ability.duration + extra;
        state.pools.push({
          x: target.x,
          y: target.y,
          radius: ability.radius,
          remaining: duration,
          duration,
          dps: ability.dps * scale,
          color: ability.bounty ? '#f0c35a' : def.color,
          bounty: ability.bounty,
        });
        state.events.push({ type: 'poolCreated', x: target.x, y: target.y, radius: ability.radius });
        break;
      }
      case 'stun':
        for (const t of targets) {
          if (!t.def.isBoss && !t.dead && random() < ability.chance) t.stunTimer = Math.max(t.stunTimer, ability.duration);
        }
        break;
      case 'fear':
        for (const t of targets) {
          if (!t.def.isBoss && !t.dead && random() < ability.chance) t.fearTimer = Math.max(t.fearTimer, ability.duration);
        }
        break;
      case 'crit':
      case 'bounty':
      case 'multishot':
      case 'block':
      case 'lifesteal':
      case 'aura':
      case 'bless':
      case 'nova':
      case 'pierce':
      case 'pierceArmor':
      case 'none':
        break;
    }

    if (!showShots) continue;
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
