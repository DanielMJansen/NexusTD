import { ARENA, NEXUS } from '../data/config';
import type { EnemyTrait } from '../data/enemies';
import { damageHero } from './hero';
import { updateAlly, updateStatusTimers } from './hitEffects';
import { damageNexus, nexusSlowFactor } from './nexus';
import { spawnEnemyAt } from './spawning';
import { distance, type Enemy, type RunState } from './state';

// Inimigos: habilidades (tiro, teia, invocação, investida, cura, pisão, escudo, fúria) e movimento.

const findTrait = <K extends EnemyTrait['kind']>(enemy: Enemy, kind: K) =>
  enemy.def.traits.find((t): t is Extract<EnemyTrait, { kind: K }> => t.kind === kind);

/** Armadura atual (Gárgula pousada como pedra ganha armadura extra). */
export function enemyArmor(enemy: Enemy): number {
  const stone = enemy.stone ? findTrait(enemy, 'stone') : undefined;
  return Math.max(0, enemy.def.armor + (stone?.armor ?? 0) - enemy.corrodeAmount);
}

/** Fração do dano que passa pelo escudo do Lich (1 = sem escudo). */
export function shieldFactor(enemy: Enemy): number {
  if (enemy.shield <= 0) return 1;
  return 1 - (findTrait(enemy, 'shield')?.reduction ?? 0);
}

const onScreen = (e: Enemy) => e.x > 0 && e.x < ARENA.width && e.y > 0 && e.y < ARENA.height;

/** Atiradores andam devagar enquanto têm o herói na mira. */
const AIMING_SPEED = 0.35;

/** Habilidades de cada inimigo. Retorna o fator de velocidade deste quadro (0 = parado). */
function useTraits(state: RunState, enemy: Enemy, dt: number): number {
  const { hero } = state;
  const enrage = findTrait(enemy, 'enrage');
  if (enrage && !enemy.enraged && enemy.hp < enemy.maxHp * enrage.below) {
    enemy.enraged = true;
    state.events.push({ type: 'bossEnraged', enemy: enemy.def.id, x: enemy.x, y: enemy.y });
  }
  const tick = dt / (enemy.enraged && enrage ? enrage.cooldownMultiplier : 1);
  enemy.charging = Math.max(0, enemy.charging - dt);
  enemy.shield = Math.max(0, enemy.shield - dt);
  let pace = 1;

  enemy.def.traits.forEach((trait, i) => {
    enemy.timers[i] = (enemy.timers[i] ?? 0) - tick;
    const ready = enemy.timers[i]! <= 0;
    switch (trait.kind) {
      case 'ranged': {
        // só mira de dentro da tela; mirando, anda devagar (nunca fica parado para sempre)
        const inRange = !hero.dead && onScreen(enemy) && distance(enemy, hero) <= trait.range;
        if (inRange) pace = Math.min(pace, AIMING_SPEED);
        if (inRange && ready) {
          damageHero(state, trait.damage * enemy.damageScale);
          state.events.push({ type: 'enemyShot', kind: enemy.def.isBoss ? 'bolt' : 'arrow', from: { x: enemy.x, y: enemy.y - 8 }, to: { x: hero.x, y: hero.y - 6 } });
          enemy.timers[i] = trait.cooldown;
        }
        break;
      }
      case 'stone':
        if (enemy.stone) pace = 0;
        if (ready) {
          enemy.stone = !enemy.stone;
          enemy.timers[i] = enemy.stone ? trait.rest : trait.fly;
          // pousar só dentro da tela (fora dela continua voando)
          if (enemy.stone && !onScreen(enemy)) {
            enemy.stone = false;
            enemy.timers[i] = 0.3;
          }
        }
        break;
      case 'web': {
        if (!ready || !onScreen(enemy)) break;
        const caught = state.creatures
          .filter((c) => distance(c, enemy) <= trait.range)
          .sort((a, b) => a.webTimer - b.webTimer || distance(a, enemy) - distance(b, enemy))
          .slice(0, trait.targets);
        if (!caught.length) break;
        for (const c of caught) {
          c.webTimer = trait.duration;
          c.webSlow = trait.slow;
          state.events.push({ type: 'enemyShot', kind: 'web', from: { x: enemy.x, y: enemy.y - 4 }, to: { x: c.x, y: c.y - 6 } });
        }
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'summon':
        if (!ready || !onScreen(enemy)) break;
        for (let k = 0; k < trait.count; k++) spawnEnemyAt(state, trait.enemy, enemy, 16);
        state.events.push({ type: 'enemySummoned', x: enemy.x, y: enemy.y, color: enemy.def.color });
        enemy.timers[i] = trait.cooldown;
        break;
      case 'charge':
        if (!ready || !onScreen(enemy)) break;
        enemy.charging = trait.duration;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'enemyCharge', x: enemy.x, y: enemy.y });
        break;
      case 'heal': {
        if (!ready || !onScreen(enemy)) break;
        const hurt = state.enemies.filter(
          (e) => e !== enemy && !e.dead && !e.def.isBoss && e.hp < e.maxHp && distance(e, enemy) <= trait.radius,
        );
        if (!hurt.length) break;
        for (const e of hurt) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * trait.amount);
        state.events.push({ type: 'enemyHealed', x: enemy.x, y: enemy.y, radius: trait.radius });
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'stomp': {
        if (!ready) break;
        const near = state.creatures.filter((c) => distance(c, enemy) <= trait.radius);
        if (!near.length) break;
        for (const c of near) c.stunTimer = Math.max(c.stunTimer, trait.stun);
        state.events.push({ type: 'stomp', x: enemy.x, y: enemy.y, radius: trait.radius });
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'shield':
        if (!ready || !onScreen(enemy)) break;
        enemy.shield = trait.duration;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'bossShield', x: enemy.x, y: enemy.y });
        break;
      case 'split':
      case 'enrage':
        break;
    }
  });
  return pace;
}

/** Inimigos usam habilidades e andam até o Nexus; ao encostar, causam dano e somem (sem recompensa). */
export function updateEnemies(state: RunState, dt: number): void {
  const center = ARENA.center;
  // índice fixo: invocações entram no fim da lista e só agem no próximo quadro
  const count = state.enemies.length;
  for (let n = 0; n < count; n++) {
    const enemy = state.enemies[n]!;
    if (enemy.dead) continue;
    updateStatusTimers(enemy, dt);
    if (enemy.allyTimer > 0) {
      updateAlly(state, enemy, dt);
      continue;
    }
    const pace = useTraits(state, enemy, dt);
    enemy.slowTimer -= dt;
    const charge = enemy.charging > 0 ? findTrait(enemy, 'charge') : undefined;
    const enrage = enemy.enraged ? findTrait(enemy, 'enrage') : undefined;
    const speedFactor =
      (enemy.slowTimer > 0 ? enemy.slowMultiplier : 1) * (charge?.speedMultiplier ?? 1) * (enrage?.speedMultiplier ?? 1) * pace * nexusSlowFactor(state, enemy) * (1 - enemy.weakenSlow);
    const dx = center.x - enemy.x;
    const dy = center.y - enemy.y;
    const length = Math.hypot(dx, dy);
    if (enemy.fearTimer > 0) {
      // com medo: foge do Nexus (sem sair muito da arena)
      enemy.fearTimer -= dt;
      const flee = enemy.speed * speedFactor * 0.8 * dt;
      enemy.x = Math.min(ARENA.width + 20, Math.max(-20, enemy.x - (dx / length) * flee));
      enemy.y = Math.min(ARENA.height + 20, Math.max(-20, enemy.y - (dy / length) * flee));
      continue;
    }
    if (enemy.stunTimer > 0) {
      enemy.stunTimer -= dt;
      continue;
    }
    if (enemy.held || pace === 0) continue;
    if (length < NEXUS.contactRadius) {
      damageNexus(state, enemy.nexusDamage * (1 - enemy.weakenDamage));
      enemy.dead = true;
      continue;
    }
    const zigzag = enemy.def.zigzag;
    const lateral = zigzag
      ? Math.sin(state.time * zigzag.frequency + enemy.animationOffset) * zigzag.lateralSpeed
      : 0;
    const speed = enemy.speed * speedFactor;
    enemy.x += ((dx / length) * speed - (dy / length) * lateral) * dt;
    enemy.y += ((dy / length) * speed + (dx / length) * lateral) * dt;
  }
}
