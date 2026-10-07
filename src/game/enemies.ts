import { racePure } from '../data/races';
import { NEXUS } from '../data/config';
import type { EnemyTrait } from '../data/enemies';
import { damageHero } from './hero';
import { updateAlly, updateStatusTimers } from './hitEffects';
import { damageNexus, nexusSlowFactor } from './nexus';
import { spawnEnemyAt } from './spawning';
import { inMud } from './terrain';
import { breakIce, iceSpeed, onIce } from './ice';
import { enemyGoal, joinNearestPath } from './paths';
import { damageGuard, defendTarget } from './objectives';
import { distance, type Enemy, type RunState } from './state';

// Inimigos: habilidades (tiro, teia, invocação, investida, cura, pisão, escudo, fúria) e movimento.

export const findTrait = <K extends EnemyTrait['kind']>(enemy: Enemy, kind: K) =>
  enemy.def.traits.find((t): t is Extract<EnemyTrait, { kind: K }> => t.kind === kind);

/** Registra um ataque (só para a animação): quando e em que direção. */
export function markAttack(enemy: Enemy, time: number, target: { x: number; y: number }): void {
  enemy.lastAttackAt = time;
  enemy.attackAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
}

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

/** Já entrou no mapa (fora dele, inimigos não usam habilidades). */
const onScreen = (state: RunState, e: Enemy) => e.x > 0 && e.x < state.map.width && e.y > 0 && e.y < state.map.height;

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
        const inRange = !hero.dead && onScreen(state, enemy) && distance(enemy, hero) <= trait.range;
        if (inRange) pace = Math.min(pace, AIMING_SPEED);
        if (inRange && ready) {
          // a Hidra cospe por cabeça
          const heads = enemy.heads ?? 1;
          damageHero(state, trait.damage * enemy.damageScale * heads);
          markAttack(enemy, state.time, hero);
          const kind = findTrait(enemy, 'heads') ? 'acid' : enemy.def.isBoss ? 'bolt' : 'arrow';
          state.events.push({ type: 'enemyShot', kind, from: { x: enemy.x, y: enemy.y - 8 }, to: { x: hero.x, y: hero.y - 6 } });
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
          if (enemy.stone && !onScreen(state, enemy)) {
            enemy.stone = false;
            enemy.timers[i] = 0.3;
          }
        }
        break;
      case 'leap': {
        // pula para a frente (por cima de bloqueios), se ainda estiver longe do Nexus
        if (!ready || !onScreen(state, enemy) || (enemy.leapTime ?? 0) > 0) break;
        if (distance(enemy, state.nexus) < NEXUS.contactRadius + trait.distance * 0.6) break;
        enemy.leapTime = trait.duration;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'enemyLeap', x: enemy.x, y: enemy.y });
        break;
      }
      case 'swallow': {
        // cospe a criatura se levou dano suficiente desde que engoliu
        const inside = state.creatures.filter((c) => (c.swallowTimer ?? 0) > 0);
        if (inside.length && enemy.hp < (enemy.swallowHp ?? enemy.hp) - enemy.maxHp * trait.breakDamage) releaseSwallowed(state, enemy);
        if (!ready || !onScreen(state, enemy) || inside.length) break;
        const prey = state.creatures
          .filter((c) => !(c.swallowTimer! > 0) && !racePure(c.def.race) && distance(c, enemy) <= trait.range)
          .sort((a, b) => distance(a, enemy) - distance(b, enemy))[0];
        if (!prey) break;
        prey.swallowTimer = trait.duration;
        enemy.swallowHp = enemy.hp;
        markAttack(enemy, state.time, prey);
        state.events.push({ type: 'creatureSwallowed', x: prey.x, y: prey.y });
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'burrow': {
        if ((enemy.burrowTime ?? 0) > 0) {
          pace = 0;
          enemy.burrowTime! -= dt;
          if (enemy.burrowTime! <= 0) {
            // reaparece perto do Nexus, na mesma direção, já em investida
            const angle = Math.atan2(enemy.y - state.nexus.y, enemy.x - state.nexus.x);
            enemy.x = state.nexus.x + Math.cos(angle) * trait.landAt;
            enemy.y = state.nexus.y + Math.sin(angle) * trait.landAt;
            const charge = findTrait(enemy, 'charge');
            if (charge) enemy.charging = charge.duration;
            state.events.push({ type: 'enemyBurrow', x: enemy.x, y: enemy.y, surfacing: true });
          }
          break;
        }
        if (!ready || !onScreen(state, enemy) || distance(enemy, state.nexus) < trait.landAt + 30) break;
        enemy.burrowTime = trait.hide;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'enemyBurrow', x: enemy.x, y: enemy.y, surfacing: false });
        break;
      }
      case 'freeze': {
        // congela as criaturas mais próximas (toque ou bola de neve)
        if (!ready || !onScreen(state, enemy)) break;
        const targets = state.creatures
          .filter((c) => c.stunTimer <= 0 && distance(c, enemy) <= trait.range)
          .sort((a, b) => distance(a, enemy) - distance(b, enemy))
          .slice(0, trait.targets);
        if (!targets.length) break;
        for (const c of targets) {
          c.stunTimer = trait.duration;
          c.frozen = true;
          markAttack(enemy, state.time, c);
          if (trait.range > 50) state.events.push({ type: 'enemyShot', kind: 'snowball', from: { x: enemy.x, y: enemy.y - 10 }, to: { x: c.x, y: c.y - 6 } });
          state.events.push({ type: 'creatureFrozen', x: c.x, y: c.y });
        }
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'regen':
        enemy.fireHitTimer = Math.max(0, (enemy.fireHitTimer ?? 0) - dt);
        if (enemy.fireHitTimer <= 0 && enemy.hp < enemy.maxHp) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * trait.perSecond * dt);
        break;
      case 'dive': {
        // só mergulha sobre o gelo; ao emergir racha o gelo e congela quem estiver perto
        enemy.diveTime = (enemy.diveTime ?? trait.surface) - dt;
        if (enemy.diving && !onIce(state, enemy)) enemy.diveTime = 0;
        if (enemy.diveTime > 0) break;
        if (enemy.diving) {
          enemy.diving = false;
          enemy.diveTime = trait.surface;
          breakIce(state, enemy, trait.radius * 0.6);
          for (const c of state.creatures) {
            if (distance(c, enemy) <= trait.radius) {
              c.stunTimer = Math.max(c.stunTimer, trait.freeze);
              c.frozen = true;
            }
          }
          state.events.push({ type: 'wyrmSurfaced', x: enemy.x, y: enemy.y, radius: trait.radius });
        } else if (onIce(state, enemy)) {
          enemy.diving = true;
          enemy.diveTime = trait.dive;
        } else enemy.diveTime = 0.5;
        break;
      }
      case 'heads':
        // cabeças cortadas renascem em dobro se a Hidra não morrer a tempo
        if ((enemy.cutHeads ?? 0) > 0) {
          enemy.regrowTimer = (enemy.regrowTimer ?? trait.regrow) - dt;
          if (enemy.regrowTimer <= 0) {
            enemy.heads = Math.min(trait.max, (enemy.heads ?? 1) + enemy.cutHeads! * 2);
            enemy.cutHeads = 0;
            enemy.regrowTimer = undefined;
            state.events.push({ type: 'headsRegrown', x: enemy.x, y: enemy.y, heads: enemy.heads });
          }
        }
        break;
      case 'web': {
        if (!ready || !onScreen(state, enemy)) break;
        const caught = state.creatures
          .filter((c) => distance(c, enemy) <= trait.range)
          .sort((a, b) => a.webTimer - b.webTimer || distance(a, enemy) - distance(b, enemy))
          .slice(0, trait.targets);
        if (!caught.length) break;
        for (const c of caught) {
          c.webTimer = trait.duration;
          c.webSlow = trait.slow;
          c.webLook = trait.look ?? 'web';
          markAttack(enemy, state.time, c);
          state.events.push({ type: 'enemyShot', kind: trait.look ?? 'web', from: { x: enemy.x, y: enemy.y - 4 }, to: { x: c.x, y: c.y - 6 } });
        }
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'summon':
        if (!ready || !onScreen(state, enemy)) break;
        for (let k = 0; k < trait.count; k++) spawnEnemyAt(state, trait.enemy, enemy, 16);
        enemy.lastAttackAt = state.time;
        state.events.push({ type: 'enemySummoned', x: enemy.x, y: enemy.y, color: enemy.def.color });
        enemy.timers[i] = trait.cooldown;
        break;
      case 'charge':
        if (!ready || !onScreen(state, enemy)) break;
        enemy.charging = trait.duration;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'enemyCharge', x: enemy.x, y: enemy.y });
        break;
      case 'heal': {
        if (!ready || !onScreen(state, enemy)) break;
        const hurt = state.enemies.filter(
          (e) => e !== enemy && !e.dead && !e.def.isBoss && e.hp < e.maxHp && distance(e, enemy) <= trait.radius,
        );
        if (!hurt.length) break;
        for (const e of hurt) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * trait.amount);
        enemy.lastAttackAt = state.time;
        state.events.push({ type: 'enemyHealed', x: enemy.x, y: enemy.y, radius: trait.radius });
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'stomp': {
        if (!ready) break;
        const near = state.creatures.filter((c) => distance(c, enemy) <= trait.radius);
        if (!near.length) break;
        for (const c of near) c.stunTimer = Math.max(c.stunTimer, trait.stun);
        enemy.lastAttackAt = state.time;
        state.events.push({ type: 'stomp', x: enemy.x, y: enemy.y, radius: trait.radius });
        enemy.timers[i] = trait.cooldown;
        break;
      }
      case 'shield':
        if (!ready || !onScreen(state, enemy)) break;
        enemy.shield = trait.duration;
        enemy.timers[i] = trait.cooldown;
        state.events.push({ type: 'bossShield', x: enemy.x, y: enemy.y });
        break;
      case 'split':
      case 'enrage':
      case 'drain':
      case 'submerge':
      case 'lure':
        break;
    }
  });
  return pace;
}

/** Inimigos usam habilidades e andam até o Nexus; ao encostar, causam dano e somem (sem recompensa). */
export function updateEnemies(state: RunState, dt: number): void {
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
    // sapo: sem habilidades e bem devagar
    const pace = enemy.hexTimer > 0 ? 0.4 : useTraits(state, enemy, dt);
    // Pântano: intocável na lama (Crocodilo) ou mergulhado (Crocodilo Ancião)
    enemy.submerged = (enemy.burrowTime ?? 0) > 0 || !!enemy.diving || (!!findTrait(enemy, 'submerge') && inMud(state, enemy));
    // salto: avança por cima de bloqueios, sem parar por atordoamento
    if ((enemy.leapTime ?? 0) > 0) {
      const leap = findTrait(enemy, 'leap');
      enemy.leapTime! -= dt;
      // salta na direção em que está andando (próximo ponto da trilha ou o Nexus)
      const goal = enemyGoal(state, enemy);
      const dxl = goal.x - enemy.x;
      const dyl = goal.y - enemy.y;
      const len = Math.hypot(dxl, dyl) || 1;
      const step = Math.min(len - NEXUS.contactRadius * 0.9, ((leap?.distance ?? 0) / (leap?.duration ?? 1)) * dt);
      if (step > 0) {
        enemy.x += (dxl / len) * step;
        enemy.y += (dyl / len) * step;
      }
      continue;
    }
    enemy.slowTimer -= dt;
    // agarrado pelas Garras: sem deslizar no gelo e mais lento
    const gripped = (enemy.gripTimer ?? 0) > 0;
    const charge = enemy.charging > 0 ? findTrait(enemy, 'charge') : undefined;
    const enrage = enemy.enraged ? findTrait(enemy, 'enrage') : undefined;
    const speedFactor =
      (enemy.slowTimer > 0 ? enemy.slowMultiplier : 1) * (charge?.speedMultiplier ?? 1) * (enrage?.speedMultiplier ?? 1) * pace * nexusSlowFactor(state, enemy) * (1 - enemy.weakenSlow) * (gripped ? 1 - enemy.gripSlow : iceSpeed(state, enemy)) * (enemy.diving ? 1.5 : 1);
    // alvo a defender mais próximo (Nexus ou ponto extra)
    const target = defendTarget(state, enemy);
    const dx = target.at.x - enemy.x;
    const dy = target.at.y - enemy.y;
    const length = Math.hypot(dx, dy);
    if (enemy.fearTimer > 0) {
      // depois de fugir, volta para a trilha mais próxima
      if (enemy.path !== undefined) joinNearestPath(state, enemy);
      // com medo: foge do Nexus (sem sair muito da arena)
      enemy.fearTimer -= dt;
      const flee = enemy.speed * speedFactor * 0.8 * dt;
      enemy.x = Math.min(state.map.width + 20, Math.max(-20, enemy.x - (dx / length) * flee));
      enemy.y = Math.min(state.map.height + 20, Math.max(-20, enemy.y - (dy / length) * flee));
      continue;
    }
    if (enemy.stunTimer > 0) {
      enemy.stunTimer -= dt;
      continue;
    }
    if (enemy.held || pace === 0) continue;
    if (length < NEXUS.contactRadius) {
      // colado no Nexus: para e golpeia até morrer (sapos não ferem)
      enemy.nexusTimer -= dt;
      if (enemy.nexusTimer <= 0) {
        enemy.nexusTimer = enemy.def.isBoss ? NEXUS.bossAttackInterval : NEXUS.enemyAttackInterval;
        if (enemy.hexTimer <= 0) {
          if (target.kind === 'guard') damageGuard(state, target.index, enemy.nexusDamage * (1 - enemy.weakenDamage));
          else damageNexus(state, enemy.nexusDamage * (1 - enemy.weakenDamage));
          markAttack(enemy, state.time, target.at);
          const drain = findTrait(enemy, 'drain');
          if (drain) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * drain.amount);
        }
      }
      continue;
    }
    const zigzag = enemy.def.zigzag;
    const lateral = zigzag
      ? Math.sin(state.time * zigzag.frequency + enemy.animationOffset) * zigzag.lateralSpeed
      : 0;
    const speed = enemy.speed * speedFactor;
    // anda até o próximo ponto da trilha (ou direto ao Nexus)
    const goal = enemyGoal(state, enemy);
    const gx = goal.x - enemy.x;
    const gy = goal.y - enemy.y;
    const gl = Math.hypot(gx, gy) || 1;
    enemy.x += ((gx / gl) * speed - (gy / gl) * lateral) * dt;
    enemy.y += ((gy / gl) * speed + (gx / gl) * lateral) * dt;
  }
}

/** Rei Sapo cospe as criaturas engolidas (levou dano suficiente ou morreu). */
export function releaseSwallowed(state: RunState, enemy: Enemy): void {
  for (const c of state.creatures) {
    if ((c.swallowTimer ?? 0) <= 0) continue;
    c.swallowTimer = 0;
    state.events.push({ type: 'creatureReleased', x: c.x, y: c.y });
  }
  enemy.swallowHp = undefined;
}

/**
 * Hidra: ao zerar a vida, corta uma cabeça e segue com a próxima (vida cheia).
 * Retorna true se ainda sobrou cabeça (não morre).
 */
export function cutHead(state: RunState, enemy: Enemy): boolean {
  const heads = findTrait(enemy, 'heads');
  if (!heads || (enemy.heads ?? 1) <= 1) return false;
  enemy.heads = (enemy.heads ?? 1) - 1;
  enemy.cutHeads = (enemy.cutHeads ?? 0) + 1;
  if (enemy.regrowTimer === undefined) enemy.regrowTimer = heads.regrow;
  enemy.hp = enemy.maxHp;
  state.events.push({ type: 'headCut', x: enemy.x, y: enemy.y, heads: enemy.heads });
  return true;
}
