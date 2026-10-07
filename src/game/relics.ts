import { RELIC_DROPS, RELIC_IDS, RELICS, type RelicId } from '../data/relics';
import { STAGES } from '../data/stages';
import { random } from './random';
import type { Enemy, RunState } from './state';
import type { TalentBonuses } from './talents';

// Relíquias na run: bônus somados aos talentos, queda nos chefes e o Ankh.

/** Soma os bônus das Relíquias equipadas aos dos talentos. */
export function withRelicBonuses(base: TalentBonuses, equipped: readonly RelicId[]): TalentBonuses {
  const result = { ...base };
  for (const id of equipped) {
    for (const [kind, value] of Object.entries(RELICS[id].bonuses)) result[kind as keyof TalentBonuses] += value;
  }
  return result;
}

/** Chance de um chefe deixar Relíquia depois do 1º abate (maior no final e nas fases avançadas). */
export function relicDropChance(state: RunState, enemy: Enemy): number {
  const stage = STAGES[state.stage];
  const final = stage.bosses.at(-1)?.enemy === enemy.def.id;
  return (final ? RELIC_DROPS.finalChance : RELIC_DROPS.midChance) * (1 + RELIC_DROPS.perStage * (stage.number - 1));
}

/** Chefe morto: 1º abate garante uma Relíquia nova; depois, sorteio pela chance. */
export function rollRelicDrop(state: RunState, enemy: Enemy): void {
  const relics = state.relics;
  if (!relics?.unlocked || !enemy.def.isBoss || enemy.summonedAlly) return;
  const missing = RELIC_IDS.filter((id) => !relics.owned.includes(id) && !state.relicsFound.includes(id));
  if (!missing.length) return;
  const first = !relics.firstKills.includes(enemy.def.id) && !state.relicBosses.includes(enemy.def.id);
  if (first) state.relicBosses.push(enemy.def.id);
  if (!first && random() >= relicDropChance(state, enemy)) return;
  const relic = missing[Math.floor(random() * missing.length)]!;
  state.relicsFound.push(relic);
  state.events.push({ type: 'relicFound', relic, x: enemy.x, y: enemy.y });
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
