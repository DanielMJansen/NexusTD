import { ARENA, HERO_PLACEMENT } from '../data/config';
import {
  HERO_CONTACT_RANGE,
  HERO_RESPAWN_TIME,
  HERO_UPGRADES,
  xpToNextLevel,
  type HeroUpgradeDef,
} from '../data/heroUpgrades';
import { refreshPulseCooldown } from './choices';
import { damageEnemy } from './combat';
import { markAttack } from './enemies';
import { shuffle } from './random';
import { distance, type RunState } from './state';

// Vida, XP e níveis do herói durante a run.

export const heroMaxHp = (state: RunState): number =>
  state.hero.def.maxHp + state.talents.heroMaxHp + state.heroStats.maxHp;

/** Cura o herói (sem passar do máximo). */
export function healHero(state: RunState, amount: number): void {
  if (state.hero.dead) return;
  state.hero.hp = Math.min(heroMaxHp(state), state.hero.hp + amount);
}

/** Regeneração, dano de contato dos inimigos, espinhos, morte e renascimento. */
export function updateHeroVitals(state: RunState, dt: number): void {
  const { hero } = state;
  if (hero.dead) {
    hero.respawnTimer -= dt;
    if (hero.respawnTimer <= 0) {
      hero.dead = false;
      hero.hp = heroMaxHp(state);
      hero.x = ARENA.center.x;
      hero.y = ARENA.center.y + HERO_PLACEMENT.startOffsetY;
      hero.target = { x: hero.x, y: hero.y };
      state.events.push({ type: 'heroRespawned', x: hero.x, y: hero.y });
    }
    return;
  }

  healHero(state, state.heroStats.regen * dt);
  let incoming = 0;
  for (const enemy of state.enemies) {
    if (enemy.dead || enemy.allyTimer > 0 || enemy.hexTimer > 0 || distance(enemy, hero) > enemy.def.radius + HERO_CONTACT_RANGE) continue;
    incoming += enemy.heroDps * dt;
    if (state.time - enemy.lastAttackAt > 0.8) markAttack(enemy, state.time, hero);
    if (state.heroStats.thorns > 0) {
      damageEnemy(state, enemy, state.heroStats.thorns * dt, undefined, { ignoreArmor: true, overTime: true });
    }
  }
  if (incoming > 0) damageHero(state, incoming);
}

/** Dano ao herói (contato ou tiros), reduzido pela Couraça; pode derrubá-lo. */
export function damageHero(state: RunState, amount: number): void {
  const { hero } = state;
  if (hero.dead || amount <= 0) return;
  hero.hp -= amount * (1 - Math.min(0.6, state.heroStats.armor));
  hero.lastHitAt = state.time;
  if (hero.hp <= 0) {
    hero.hp = 0;
    hero.dead = true;
    hero.respawnTimer = HERO_RESPAWN_TIME * (1 - state.talents.heroRespawn);
    state.events.push({ type: 'heroDied', x: hero.x, y: hero.y, respawn: hero.respawnTimer });
  }
}

/** XP de um abate; cada nível ganho abre uma escolha de melhoria do herói. */
export function grantXp(state: RunState, amount: number): void {
  const { hero } = state;
  hero.xp += amount * (1 + state.talents.heroXp);
  while (hero.xp >= xpToNextLevel(hero.level)) {
    hero.xp -= xpToNextLevel(hero.level);
    hero.level++;
    state.pendingLevels++;
    state.events.push({ type: 'heroLevelUp', level: hero.level });
  }
  if (state.pendingLevels > 0 && !state.heroChoices.length) rollHeroChoices(state);
}

function rollHeroChoices(state: RunState): void {
  const available = HERO_UPGRADES.filter(
    (u) => u.maxPicks === undefined || (state.heroUpgradePicks[u.id] ?? 0) < u.maxPicks,
  );
  state.heroChoices = shuffle(available).slice(0, 3);
}

function applyHeroUpgrade(state: RunState, upgrade: HeroUpgradeDef): void {
  const s = state.heroStats;
  s[upgrade.stat] += upgrade.value;
  if (upgrade.stat === 'maxHp') healHero(state, upgrade.value);
  if (upgrade.stat === 'pulseSize') {
    state.pulse.radius = state.hero.def.pulse.radius * (1 + state.talents.pulseRadius) * (1 + s.pulseSize);
  }
  if (upgrade.stat === 'pulseCooldown') {
    state.talents.pulseCooldown += upgrade.value;
    refreshPulseCooldown(state);
  }
  state.heroUpgradePicks[upgrade.id] = (state.heroUpgradePicks[upgrade.id] ?? 0) + 1;
}

/** Escolhe a melhoria do herói; se ainda houver níveis pendentes, sorteia a próxima escolha. */
export function chooseHeroUpgrade(state: RunState, index: number): void {
  const upgrade = state.heroChoices[index];
  if (!upgrade) return;
  applyHeroUpgrade(state, upgrade);
  state.pendingLevels--;
  state.heroChoices = [];
  if (state.pendingLevels > 0) rollHeroChoices(state);
  state.events.push({ type: 'choiceMade' });
}
