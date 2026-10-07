import { syncTwins } from './objectives';

import { findNexusUpgrade, NEXUS_UPGRADES, type NexusLevel, type NexusUpgradeId } from '../data/nexusUpgrades';
import { damageEnemy } from './combat';
import { distance, type Enemy, type RunState } from './state';

// Nexus da run: melhorias compradas com ouro (vida, muralha, raio, escudo, campo de lentidão).

/** Valores do nível atual de uma melhoria (null se não comprada). */
export function nexusLevel<K extends NexusLevel['kind']>(state: RunState, id: K): Extract<NexusLevel, { kind: K }> | null {
  const level = state.nexusLevels[id];
  return level > 0 ? (findNexusUpgrade(id).levels[level - 1] as Extract<NexusLevel, { kind: K }>) : null;
}

/** Custo do próximo nível (com o desconto do Nexus+); null se já está no máximo. */
export function nexusUpgradeCost(state: RunState, id: NexusUpgradeId): number | null {
  const cost = findNexusUpgrade(id).costs[state.nexusLevels[id]];
  return cost === undefined ? null : Math.round(cost * (1 - state.talents.nexusUpgradeDiscount));
}

export function canBuyNexusUpgrade(state: RunState, id: NexusUpgradeId): boolean {
  const cost = nexusUpgradeCost(state, id);
  return state.phase !== 'ended' && cost !== null && state.gold >= cost;
}

export function buyNexusUpgrade(state: RunState, id: NexusUpgradeId): boolean {
  const cost = nexusUpgradeCost(state, id);
  if (cost === null || !canBuyNexusUpgrade(state, id)) return false;
  const before = nexusLevel(state, 'vitality')?.maxHp ?? 0;
  state.gold -= cost;
  state.nexusLevels[id]++;
  if (id === 'vitality') {
    const gained = (nexusLevel(state, 'vitality')?.maxHp ?? 0) - before;
    state.nexus.maxHp += gained;
    state.nexus.hp += gained;
    syncTwins(state, { grow: gained });
  }
  if (id === 'shield' && state.nexusLevels.shield === 1) state.nexusShield.cooldown = 0;
  state.events.push({ type: 'nexusUpgraded', upgrade: id, level: state.nexusLevels[id] });
  return true;
}

/** Ouro total (sem desconto) correspondente aos níveis do Nexus nesta run (simulação). */
export const nexusInvestment = (state: RunState): number =>
  NEXUS_UPGRADES.reduce((sum, u) => sum + u.costs.slice(0, state.nexusLevels[u.id]).reduce((a, b) => a + b, 0), 0);

/** Golpe de um inimigo no Nexus: Égide, Escudo e Muralha, nessa ordem. */
export function damageNexus(state: RunState, amount: number): void {
  if (state.wardReady) {
    state.wardReady = false;
    state.events.push({ type: 'wardBlocked' });
    return;
  }
  if (state.nexusShield.active > 0) {
    state.events.push({ type: 'nexusShieldBlocked' });
    return;
  }
  const shield = nexusLevel(state, 'shield');
  if (shield && state.nexusShield.cooldown <= 0) {
    // o escudo pronto anula este golpe e os próximos por alguns segundos
    state.nexusShield.active = shield.duration;
    state.nexusShield.cooldown = shield.cooldown;
    state.events.push({ type: 'nexusShieldUp', duration: shield.duration });
    return;
  }
  const reduction = nexusLevel(state, 'armor')?.reduction ?? 0;
  const damage = Math.max(1, Math.round(amount * (1 - reduction) * (1 - state.modifiers.synergy.nexusArmor)));
  state.nexus.hp -= damage;
  state.lowestNexusRatio = Math.min(state.lowestNexusRatio, Math.max(0, state.nexus.hp) / state.nexus.maxHp);
  state.events.push({ type: 'nexusHit', damage });
}

/** Fator de velocidade do Campo de Lentidão para um inimigo (1 = fora do campo). */
export function nexusSlowFactor(state: RunState, enemy: Enemy): number {
  const field = nexusLevel(state, 'slowField');
  if (!field || distance(enemy, state.nexus) > field.radius) return 1;
  return 1 - field.slow;
}

/** Recargas do escudo e disparos do Raio. */
export function updateNexus(state: RunState, dt: number): void {
  const shield = state.nexusShield;
  shield.active = Math.max(0, shield.active - dt);
  if (shield.active <= 0) shield.cooldown = Math.max(0, shield.cooldown - dt);

  const bolt = nexusLevel(state, 'bolt');
  if (!bolt) return;
  state.nexusBoltTimer -= dt;
  if (state.nexusBoltTimer > 0) return;
  let target: Enemy | null = null;
  let best = bolt.range;
  for (const enemy of state.enemies) {
    if (enemy.dead || enemy.allyTimer > 0) continue;
    const d = distance(enemy, state.nexus);
    if (d < best) {
      best = d;
      target = enemy;
    }
  }
  if (!target) return;
  state.nexusBoltTimer = bolt.cooldown;
  state.events.push({ type: 'nexusBolt', to: { x: target.x, y: target.y } });
  damageEnemy(state, target, bolt.damage * state.modifiers.damage);
}
