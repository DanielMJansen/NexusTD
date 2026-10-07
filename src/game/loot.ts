import { LOOT } from '../data/nexusUpgrades';
import { rollChestChoices } from './choices';
import { random } from './random';
import { distance, type Enemy, type RunState } from './state';

// Loot no chão: moedas extras e baús, coletados pelo herói passando por cima.

/** Ao morrer, o inimigo pode soltar moeda ou baú (chefes sempre soltam baú; elites, às vezes). */
export function dropLoot(state: RunState, enemy: Enemy): void {
  const chestChance = enemy.def.isBoss ? 1 : enemy.elite ? LOOT.eliteChestChance : LOOT.chestChance;
  if (random() < chestChance) {
    state.loot.push({ kind: 'chest', x: enemy.x, y: enemy.y, value: 0, remaining: LOOT.lifetime });
  } else if (random() < LOOT.coinChance) {
    const value = Math.max(2, Math.round(enemy.def.gold * LOOT.coinValue));
    state.loot.push({ kind: 'coin', x: enemy.x, y: enemy.y, value, remaining: LOOT.lifetime });
  }
}

export const pickupRadius = (): number => LOOT.pickupRadius;
/** Raio do ímã: o bônus de coleta (Ímã) aumenta de onde os itens são puxados. */
export const magnetRadius = (state: RunState): number => LOOT.magnetRadius * (1 + state.heroStats.pickup);

function collect(state: RunState, index: number): void {
  const item = state.loot[index]!;
  state.loot.splice(index, 1);
  if (item.kind === 'coin') {
    state.gold += item.value;
  } else {
    state.pendingChests++;
    if (!state.chestChoices.length) rollChestChoices(state);
  }
  state.events.push({ type: 'lootCollected', kind: item.kind, x: item.x, y: item.y, value: item.value });
}

/** Itens somem com o tempo (só conta durante as ondas); o herói vivo coleta o que estiver perto. */
export function updateLoot(state: RunState, dt: number): void {
  const { hero } = state;
  const radius = pickupRadius();
  const magnet = magnetRadius(state);
  for (let i = state.loot.length - 1; i >= 0; i--) {
    const item = state.loot[i]!;
    item.remaining -= dt;
    const d = distance(item, hero);
    if (!hero.dead && d <= magnet && d > radius) {
      // ímã: o item voa até o herói
      const step = Math.min(d, LOOT.magnetSpeed * dt);
      item.x += ((hero.x - item.x) / d) * step;
      item.y += ((hero.y - item.y) / d) * step;
    }
    if (!hero.dead && distance(item, hero) <= radius) collect(state, i);
    else if (item.remaining <= 0) state.loot.splice(i, 1);
  }
}
