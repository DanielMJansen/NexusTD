import { ASCENDED_LEVEL } from '../data/evolution';
import { endWeather } from './mapEvents';
import { scriptedWave, stageWaveCount } from '../data/stages';
import { LOOT } from '../data/nexusUpgrades';
import { CHOICES, NEXUS } from '../data/config';
import { CREATURES } from '../data/creatures';
import {
  TIER_ORDER,
  tierWeights,
  UPGRADE_FAMILIES,
  type OfferedUpgrade,
  type Tier,
  type UpgradeFamily,
} from '../data/upgrades';
import { promoteCreature } from './economy';
import { random } from './random';
import { startWave } from './spawning';
import type { Choice, RunState } from './state';

/** Fim de onda: cura o Nexus e sorteia as melhorias oferecidas. */
export function offerChoices(state: RunState): void {
  if (state.weather.forced) endWeather(state);
  state.phase = 'choosing';
  state.choiceReason = 'waveCleared';
  state.nexus.hp = Math.min(state.nexus.maxHp, state.nexus.hp + NEXUS.healBetweenWaves + state.talents.nexusHeal);
  rollWaveChoices(state);
  state.events.push({ type: 'choicesOffered', reason: 'waveCleared', wave: state.wave });
}

/** Raças presentes na equipe (para as sinergias). */
const teamRaces = (state: RunState): string[] => [...new Set(state.team.map((id) => CREATURES[id].race))];

/** Total atual que o teto da família limita (talentos + melhorias); `race` para as de raça. */
export function upgradeCurrent(state: RunState, family: UpgradeFamily, race?: string): number {
  const m = state.modifiers;
  const t = state.talents;
  switch (family.kind) {
    case 'damage':
      return m.damage - 1;
    case 'attackSpeed':
      return m.attackSpeed - 1;
    case 'range':
      return m.range - 1;
    case 'pulseCooldown':
      return t.pulseCooldown;
    case 'nexusRegen':
      return t.nexusRegen;
    case 'killGold':
      return t.killGold;
    case 'heroXp':
      return t.heroXp;
    case 'evolveDiscount':
      return t.evolveDiscount;
    case 'raceDamage':
      return race ? (m.raceDamage[race] ?? 0) : 0;
    case 'critChance':
      return m.critChance;
    case 'heroDamage':
      return t.heroDamage;
    default:
      return 0;
  }
}

/** Quanto ainda cabe até o teto (Infinity sem teto). */
export const capRoom = (state: RunState, family: UpgradeFamily, race?: string): number =>
  family.cap === undefined ? Infinity : Math.max(0, family.cap - upgradeCurrent(state, family, race));

/** Raças da equipe que ainda cabem no teto da família de raça. */
const racesBelowCap = (state: RunState, family: UpgradeFamily): string[] => teamRaces(state).filter((race) => capRoom(state, family, race) > 1e-9);

/** A família pode ser oferecida agora? (limite de escolhas, teto e efeitos que não fariam nada) */
function isAvailable(state: RunState, family: UpgradeFamily): boolean {
  if (family.maxPicks !== undefined && (state.upgradePicks[family.id] ?? 0) >= family.maxPicks) return false;
  switch (family.kind) {
    case 'ascendAll':
      return state.creatures.length > 0;
    case 'ward':
      return state.talents.nexusWard <= 0;
    case 'raceDamage':
      return racesBelowCap(state, family).length > 0;
    default:
      return capRoom(state, family) > 1e-9;
  }
}

function rollTier(state: RunState, minTier = 0): Tier {
  const progress = (state.wave - 1) / Math.max(1, stageWaveCount(state.stage) - 1);
  const weights = tierWeights(progress).map((w, i) => (i < minTier ? 0 : w));
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < TIER_ORDER.length; i++) {
    roll -= weights[i]!;
    if (roll < 0) return TIER_ORDER[i]!;
  }
  return 'common';
}

/** Monta a carta: família + tier (+ raça). Se nenhuma família tiver o tier sorteado, desce de tier. */
function rollUpgrade(state: RunState, exclude: Set<string>, minTier = 0): OfferedUpgrade | null {
  const families = UPGRADE_FAMILIES.filter((f) => !exclude.has(f.id) && isAvailable(state, f));
  if (!families.length) return null;
  let tierIndex = TIER_ORDER.indexOf(rollTier(state, minTier));
  for (; tierIndex >= 0; tierIndex--) {
    const tier = TIER_ORDER[tierIndex]!;
    const options = families.filter((f) => f.values[tier] !== undefined);
    if (!options.length) continue;
    const family = options[Math.floor(random() * options.length)]!;
    const races = racesBelowCap(state, family);
    return {
      family,
      tier,
      value: family.values[tier]!,
      race: family.perRace ? races[Math.floor(random() * races.length)] : undefined,
    };
  }
  return null;
}

/** Sorteia uma mão de cartas (sem repetir família na mesma mão). */
function rollHand(state: RunState, minTier = 0): Choice[] {
  const exclude = new Set<string>();
  const hand: Choice[] = [];
  for (let i = 0; i < CHOICES.count; i++) {
    const upgrade = rollUpgrade(state, exclude, minTier);
    if (!upgrade) break;
    exclude.add(upgrade.family.id);
    hand.push({ kind: 'upgrade', upgrade });
  }
  return hand;
}

export function rollWaveChoices(state: RunState): void {
  // depois de uma trégua do roteiro, a loja só tem melhorias Raras ou melhores
  const truce = scriptedWave(state.stage, state.wave)?.kind === 'truce';
  state.choices = rollHand(state, truce ? TIER_ORDER.indexOf('rare') : 0);
}

/** Baú: 3 melhorias de tier alto (Rara ou melhor). */
export function rollChestChoices(state: RunState): void {
  state.chestChoices = rollHand(state, TIER_ORDER.indexOf(LOOT.chestMinTier));
}

/** Escolhe a melhoria do baú; abre o próximo baú pendente, se houver. */
export function chooseChest(state: RunState, index: number): void {
  const choice = state.chestChoices[index];
  if (!choice) return;
  applyChoice(state, choice);
  state.pendingChests = Math.max(0, state.pendingChests - 1);
  state.chestChoices = [];
  if (state.pendingChests > 0) rollChestChoices(state);
  state.events.push({ type: 'choiceMade' });
}

/** Ainda existem famílias diferentes das mostradas? (para o botão de sortear de novo) */
export function canRollDifferent(state: RunState): boolean {
  return UPGRADE_FAMILIES.filter((f) => isAvailable(state, f)).length > 0;
}

/** Recalcula a recarga do Pulso a partir da redução total (talentos + melhorias), com piso de 35%. */
export function refreshPulseCooldown(state: RunState): void {
  state.pulse.cooldown = state.hero.def.pulse.cooldown * Math.max(0.35, 1 - state.talents.pulseCooldown);
}

export function applyChoice(state: RunState, choice: Choice): void {
  const { family, race } = choice.upgrade;
  // nunca passa do teto da família
  const value = Math.min(choice.upgrade.value, capRoom(state, family, race));
  const m = state.modifiers;
  switch (family.kind) {
    case 'damage':
      m.damage += value;
      break;
    case 'attackSpeed':
      m.attackSpeed += value;
      break;
    case 'range':
      m.range += value;
      break;
    case 'gold':
      state.gold += value;
      break;
    case 'nexusMaxHp':
      state.nexus.maxHp += value;
      state.nexus.hp += value;
      break;
    case 'nexusHeart':
      state.nexus.maxHp += value;
      state.nexus.hp = state.nexus.maxHp;
      break;
    case 'pulseCooldown':
      state.talents.pulseCooldown += value;
      refreshPulseCooldown(state);
      break;
    case 'nexusRegen':
      state.talents.nexusRegen += value;
      break;
    case 'killGold':
      state.talents.killGold += value;
      break;
    case 'heroXp':
      state.talents.heroXp += value;
      break;
    case 'evolveDiscount':
      state.talents.evolveDiscount += value;
      break;
    case 'raceDamage':
      if (race) m.raceDamage[race] = (m.raceDamage[race] ?? 0) + value;
      break;
    case 'critChance':
      m.critChance += value;
      break;
    case 'heroDamage':
      state.talents.heroDamage += value;
      break;
    case 'creatureSlot':
      state.creatureLimit += value;
      break;
    case 'ascendAll':
      // sobe até a forma evoluída; estrelas só pagando ouro
      for (let i = 0; i < value; i++) for (const creature of state.creatures) promoteCreature(state, creature, undefined, ASCENDED_LEVEL);
      break;
    case 'ward':
      state.talents.nexusWard = 1;
      break;
    case 'execute':
      m.executeBelow = Math.max(m.executeBelow, value);
      break;
  }
  state.upgradePicks[family.id] = (state.upgradePicks[family.id] ?? 0) + 1;
}

/** O jogador escolhe uma das opções oferecidas; a próxima onda começa em seguida. */
export function chooseOption(state: RunState, index: number): void {
  const choice = state.choices[index];
  if (state.phase !== 'choosing' || !choice) return;
  applyChoice(state, choice);
  state.choices = [];
  state.events.push({ type: 'choiceMade' });
  startWave(state);
}
