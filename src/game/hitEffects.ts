import { raceGrip } from '../data/races';
import { SYNERGY_RAISE_DURATION } from '../data/synergies';

import type { HitEffect } from '../data/creatures';
import { damageEnemy } from './combat';
import { creatureEffects } from './creatureStats';
import { random } from './random';
import { spawnEnemyAt } from './spawning';
import { distance, type Creature, type Enemy, type RunState } from './state';

// Efeitos de golpe das criaturas (veneno, atordoar, marca, corrosão, possessão...) e aliados temporários.

/** Inimigo que ainda luta contra o Nexus (vivo e não possuído/erguido como aliado). */
/** Inimigo que pode ser alvo e levar dano (não morto, não aliado, não submerso na lama). */
export const isHostile = (enemy: Enemy): boolean => !enemy.dead && enemy.allyTimer <= 0 && !enemy.submerged;

const findEffect = <K extends HitEffect['kind']>(creature: Creature, kind: K) =>
  creatureEffects(creature).find((e): e is Extract<HitEffect, { kind: K }> => e.kind === kind);

/** Multiplicador de dano de uma criatura contra este inimigo (contra fortes, abates acumulados). */
export function sourceDamageMultiplier(state: RunState, creature: Creature, enemy: Enemy): number {
  let multiplier = 1;
  // sinergia dos Anjos: mais dano contra chefes
  if (enemy.def.isBoss) multiplier *= 1 + (state.modifiers.synergy.vsBoss[creature.def.race] ?? 0);
  const strong = findEffect(creature, 'vsStrong');
  if (strong && (enemy.elite || enemy.def.isBoss)) multiplier *= 1 + strong.bonus;
  // fogo contra gelo: +25% e corta a regeneração por 3 s
  if (creature.def.element === 'fire' && enemy.def.frost) {
    multiplier *= 1.25;
    enemy.fireHitTimer = 3;
  }
  const stacking = findEffect(creature, 'killDamage');
  if (stacking) multiplier *= 1 + Math.min(stacking.max, stacking.perKill * creature.killStacks);
  return multiplier;
}

/** Multiplicador de dano recebido por marca e vulnerabilidade. */
export const vulnerability = (enemy: Enemy): number =>
  (enemy.markTimer > 0 ? 1 + enemy.markAmount : 1) *
  (enemy.vulnTimer > 0 ? 1 + enemy.vulnAmount : 1) *
  (enemy.hexTimer > 0 ? 1 + enemy.hexVuln : 1);

/** Aplica os efeitos de golpe da criatura num inimigo atingido. `scale` = força do golpe (nível, melhorias). */
export function applyHitEffects(state: RunState, creature: Creature, enemy: Enemy, scale: number, extraDuration = 0): void {
  if (enemy.dead) return;
  // sinergias: bruxas (duração) e górgonas (chance)
  const syn = state.modifiers.synergy;
  const lasting = 1 + (syn.effectDuration[creature.def.race] ?? 0);
  const likely = 1 + (syn.effectChance[creature.def.race] ?? 0);
  const dur = (d: number) => d * lasting + extraDuration;
  const boss = enemy.def.isBoss;
  const grip = raceGrip(creature.def.race);
  if (grip) {
    enemy.gripTimer = Math.max(enemy.gripTimer ?? 0, grip.duration);
    enemy.gripSlow = grip.slow;
  }
  for (const effect of creatureEffects(creature)) {
    switch (effect.kind) {
      case 'poison': {
        const dps = effect.dps * scale;
        enemy.poisonDps = Math.max(dps, enemy.poisonTimer > 0 ? enemy.poisonDps : 0);
        enemy.poisonTimer = Math.max(enemy.poisonTimer, dur(effect.duration));
        break;
      }
      case 'stun':
        if (!boss && random() < effect.chance * likely) {
          enemy.stunTimer = Math.max(enemy.stunTimer, dur(effect.duration));
          enemy.stunLook = effect.look ?? 'stun';
        }
        break;
      case 'fear':
        if (!boss && random() < effect.chance * likely) {
          enemy.fearTimer = Math.max(enemy.fearTimer, dur(effect.duration));
          enemy.fearLook = effect.look ?? 'fear';
        }
        break;
      case 'mark':
        enemy.markTimer = Math.max(enemy.markTimer, dur(effect.duration));
        enemy.markAmount = Math.max(enemy.markAmount, effect.amount);
        if (effect.explode) enemy.markExplode = effect.explode;
        break;
      case 'vulnerable':
        enemy.vulnTimer = Math.max(enemy.vulnTimer, dur(effect.duration));
        enemy.vulnAmount = Math.max(enemy.vulnAmount, effect.amount);
        break;
      case 'corrode':
        enemy.corrodeTimer = Math.max(enemy.corrodeTimer, dur(effect.duration));
        enemy.corrodeAmount = Math.max(enemy.corrodeAmount, effect.armor);
        break;
      case 'weaken':
        enemy.weakenTimer = Math.max(enemy.weakenTimer, dur(effect.duration));
        enemy.weakenSlow = Math.max(enemy.weakenSlow, effect.slow);
        enemy.weakenDamage = Math.max(enemy.weakenDamage, effect.damage);
        break;
      case 'pull': {
        if (boss) break;
        const d = distance(enemy, creature);
        const step = Math.min(effect.distance, Math.max(0, d - 14));
        if (d > 0) {
          enemy.x += ((creature.x - enemy.x) / d) * step;
          enemy.y += ((creature.y - enemy.y) / d) * step;
        }
        break;
      }
      case 'possess':
        if (!boss && enemy.allyTimer <= 0) {
          enemy.allyTimer = dur(effect.duration);
          enemy.allyExplode = effect.explode ?? null;
          state.events.push({ type: 'possessed', x: enemy.x, y: enemy.y });
        }
        break;
      case 'steal':
        if (random() < effect.chance * likely) {
          state.gold += effect.gold;
          state.events.push({ type: 'bountyGold', x: enemy.x, y: enemy.y, gold: effect.gold });
        }
        break;
      case 'execute':
        if (!boss && enemy.hp > 0 && enemy.hp <= enemy.maxHp * effect.below) {
          enemy.executed = true;
          state.events.push({ type: 'executed', x: enemy.x, y: enemy.y });
          damageEnemy(state, enemy, enemy.hp + 1000, creature, { ignoreArmor: true, overTime: true });
        }
        break;
      case 'vsStrong':
      case 'killHaste':
      case 'killDamage':
      case 'goldOnKill':
      case 'raiseOnKill':
        break;
    }
  }
}

/** Explosão (marcado que morre, possuído que estoura): fere os inimigos ao redor. */
function explode(state: RunState, at: Enemy, radius: number, damage: number): void {
  state.events.push({ type: 'explosion', x: at.x, y: at.y, radius });
  for (const other of state.enemies) {
    if (other !== at && isHostile(other) && distance(other, at) <= radius) {
      damageEnemy(state, other, damage, undefined, { ignoreArmor: true });
    }
  }
}

/** Efeitos ao abater: explosão de marcados, ouro extra, esqueleto erguido, abates acumulados. */
export function onEnemyKilled(state: RunState, enemy: Enemy, source?: Creature): void {
  if (!enemy.summonedAlly) {
    state.recentDeaths.push({ x: enemy.x, y: enemy.y, at: state.time });
    if (state.recentDeaths.length > 12) state.recentDeaths.shift();
  }
  if (enemy.markTimer > 0 && enemy.markExplode) explode(state, enemy, enemy.markExplode.radius, enemy.maxHp * enemy.markExplode.ratio);
  // petrificado que morre se despedaça, ferindo os vizinhos
  if (enemy.stunTimer > 0 && enemy.stunLook === 'stone' && !enemy.def.isBoss) explode(state, enemy, 30, enemy.maxHp * 0.25);
  if (state.modifiers.synergy.raise > 0 && !enemy.summonedAlly && !enemy.killedByAlly && !enemy.def.isBoss && random() < state.modifiers.synergy.raise) {
    raiseSkeleton(state, enemy, SYNERGY_RAISE_DURATION);
  }
  if (!source) return;
  source.killStacks++;
  for (const effect of creatureEffects(source)) {
    if (effect.kind === 'goldOnKill') {
      const ok = effect.when === 'any' || (effect.when === 'executed' && enemy.executed) || (effect.when === 'feared' && enemy.fearTimer > 0);
      if (ok) {
        state.gold += effect.gold;
        state.events.push({ type: 'bountyGold', x: enemy.x, y: enemy.y, gold: effect.gold });
      }
    } else if (effect.kind === 'raiseOnKill' && random() < effect.chance) {
      raiseSkeleton(state, enemy, effect.duration);
    }
  }
}

/** Máximo de esqueletos aliados ao mesmo tempo. */
const MAX_SKELETONS = 12;

/** Ergue um esqueleto aliado temporário (some ao fim, sem recompensa). */
export function raiseSkeleton(state: RunState, at: { x: number; y: number }, duration: number): void {
  // teto de esqueletos ao mesmo tempo (evita reação em cadeia e queda de desempenho)
  if (state.enemies.filter((e) => e.summonedAlly && e.allyTimer > 0).length >= MAX_SKELETONS) return;
  const ally = spawnEnemyAt(state, 'boneWarrior', at, 6);
  ally.allyTimer = duration;
  ally.summonedAlly = true;
  ally.raisedAt = state.time;
  state.events.push({ type: 'skeletonRaised', x: ally.x, y: ally.y });
}

/** Timers de marca, vulnerabilidade, corrosão e enfraquecimento. */
export function updateStatusTimers(enemy: Enemy, dt: number): void {
  if (enemy.markTimer > 0 && (enemy.markTimer -= dt) <= 0) {
    enemy.markAmount = 0;
    enemy.markExplode = null;
  }
  if (enemy.vulnTimer > 0 && (enemy.vulnTimer -= dt) <= 0) enemy.vulnAmount = 0;
  if (enemy.corrodeTimer > 0 && (enemy.corrodeTimer -= dt) <= 0) enemy.corrodeAmount = 0;
  if (enemy.hexTimer > 0 && (enemy.hexTimer -= dt) <= 0) enemy.hexVuln = 0;
  if ((enemy.gripTimer ?? 0) > 0) enemy.gripTimer -= dt;
  if (enemy.weakenTimer > 0 && (enemy.weakenTimer -= dt) <= 0) {
    enemy.weakenSlow = 0;
    enemy.weakenDamage = 0;
  }
}

/** Aliado temporário: persegue o inimigo hostil mais próximo e o fere por contato. */
export function updateAlly(state: RunState, ally: Enemy, dt: number): void {
  ally.allyTimer -= dt;
  if (ally.allyTimer <= 0) {
    ally.allyTimer = 0;
    if (ally.summonedAlly) {
      ally.dead = true;
      state.events.push({ type: 'allyFaded', x: ally.x, y: ally.y });
    } else if (ally.allyExplode) {
      explode(state, ally, ally.allyExplode.radius, ally.maxHp * ally.allyExplode.ratio);
      damageEnemy(state, ally, ally.hp + 1000, undefined, { ignoreArmor: true, overTime: true });
    }
    return;
  }
  let target: Enemy | null = null;
  let best = Infinity;
  for (const other of state.enemies) {
    if (!isHostile(other)) continue;
    const d = distance(other, ally);
    if (d < best) {
      best = d;
      target = other;
    }
  }
  if (!target) {
    // sem inimigos: espera perto de onde está, sem ir ao Nexus
    return;
  }
  const reach = ally.def.radius + target.def.radius + 2;
  if (best > reach) {
    const step = Math.max(ally.speed, 30) * dt;
    ally.x += ((target.x - ally.x) / best) * step;
    ally.y += ((target.y - ally.y) / best) * step;
  } else {
    // dano de contato contra o inimigo (mínimo razoável para inimigos fracos)
    target.killedByAlly = true;
    damageEnemy(state, target, Math.max(8, ally.heroDps) * dt, undefined, { ignoreArmor: true, overTime: true });
    if (!target.dead) target.killedByAlly = false;
  }
  ally.x = Math.min(state.map.width + 20, Math.max(-20, ally.x));
  ally.y = Math.min(state.map.height + 20, Math.max(-20, ally.y));
}
