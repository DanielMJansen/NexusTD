import { RELIC_DROPS, RELIC_IDS, relicLevel, type EquippedRelic } from '../data/relics';
import { STAGES } from '../data/stages';
import { random } from './random';
import type { Enemy, RunState } from './state';
import type { TalentBonuses } from './talents';

// Relíquias na run: bônus somados aos talentos, baús deixados pelos chefes e o Ankh.

/** Soma os bônus das Relíquias equipadas (no nível de cada uma) aos dos talentos. */
export function withRelicBonuses(base: TalentBonuses, equipped: readonly EquippedRelic[]): TalentBonuses {
  const result = { ...base };
  for (const { id, level } of equipped) {
    for (const [kind, value] of Object.entries(relicLevel(id, level).bonuses)) result[kind as keyof TalentBonuses] += value;
  }
  return result;
}

/** Chance de um chefe deixar um baú de Relíquia (maior no final e nas fases avançadas). */
export function relicDropChance(state: RunState, enemy: Enemy): number {
  const stage = STAGES[state.stage];
  const final = stage.bosses.at(-1)?.enemy === enemy.def.id;
  const odds = final ? RELIC_DROPS.final : RELIC_DROPS.mid;
  return odds.base + odds.perStage * (stage.number - 1);
}

/** Chefe morto: sorteia o baú (com garantia depois de vários chefes sem nenhum); o baú traz qualquer Relíquia. */
export function rollRelicDrop(state: RunState, enemy: Enemy): void {
  const relics = state.relics;
  if (!relics?.unlocked || !enemy.def.isBoss || enemy.summonedAlly) return;
  state.relicPity++;
  if (state.relicPity < RELIC_DROPS.pity && random() >= relicDropChance(state, enemy)) return;
  state.relicPity = 0;
  const relic = RELIC_IDS[Math.floor(random() * RELIC_IDS.length)]!;
  const fresh = !relics.owned.includes(relic) && !state.relicsFound.includes(relic);
  state.relicsFound.push(relic);
  state.events.push({ type: 'relicFound', relic, fresh, x: enemy.x, y: enemy.y });
}

/**
 * Ankh: o Nexus ou Obelisco que caiu volta com parte da vida (uma vez por run).
 * Retorna true se salvou.
 */
export function tryAnkh(state: RunState): boolean {
  if (!state.ankh || state.ankh.used) return false;
  const hp = state.ankh.hp;
  let saved = false;
  if (state.nexus.hp <= 0) {
    state.nexus.hp = state.nexus.maxHp * hp;
    saved = true;
  }
  for (const g of state.guards) {
    if (g.vital && g.hp <= 0) {
      g.hp = g.maxHp * hp;
      saved = true;
    }
  }
  if (!saved) return false;
  state.ankh.used = true;
  state.events.push({ type: 'ankhSaved' });
  return true;
}
