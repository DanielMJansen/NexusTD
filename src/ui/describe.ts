import { ECONOMY } from '../data/config';
import type { CreatureAbility, CreatureDef } from '../data/creatures';
import type { TalentEffectKind } from '../data/talents';

export const formatNumber = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Texto de uma habilidade, gerado a partir dos dados. */
export function abilityText(a: CreatureAbility): string {
  switch (a.kind) {
    case 'frenzy':
      return `Frenesi: a cada ${a.hitsToTrigger} golpes, ${formatNumber(a.duration)} s com ×${formatNumber(a.damageMultiplier)} de dano e ataques ${formatNumber(a.attackSpeedMultiplier)}× mais rápidos.`;
    case 'splash':
      return `Área: atinge inimigos num raio de ${a.radius} ao redor do alvo com ${Math.round(a.damageRatio * 100)}% do dano.`;
    case 'slow':
      return `Lentidão: o alvo fica ${Math.round((1 - a.speedMultiplier) * 100)}% mais lento por ${formatNumber(a.duration)} s.`;
    case 'multishot':
      return `Multi-tiro: ataca ${a.targets} inimigos de uma vez.`;
    case 'block':
      return `Bloqueio: segura até ${a.capacity} inimigos num raio de ${a.radius} (chefes não param).`;
    case 'lifesteal':
      return `Sustento: cada abate desta criatura cura ${a.healPerKill} de vida do Nexus.`;
    case 'chain':
      return `Garras em cadeia: o golpe salta para até ${a.jumps} inimigos próximos (${Math.round(a.falloff * 100)}% do dano a cada salto).`;
    case 'aura':
      return `Aura: criaturas num raio de ${a.radius} atacam ${Math.round(a.attackSpeed * 100)}% mais rápido.`;
    case 'pierceArmor':
      return a.bonusVsArmored > 0
        ? `Ignora armadura e causa +${Math.round(a.bonusVsArmored * 100)}% de dano em inimigos com armadura.`
        : 'Ignora toda a armadura do alvo.';
    case 'screech':
      return `Grito em leque: atinge todos à frente e os empurra ${a.push} para longe do Nexus (chefes resistem).`;
    case 'poison':
      return `Veneno: ${formatNumber(a.dps)} de dano por segundo durante ${formatNumber(a.duration)} s (ignora armadura).`;
    case 'pool':
      return `Poça: ${formatNumber(a.dps)} de dano por segundo num raio de ${a.radius} durante ${formatNumber(a.duration)} s.`;
    case 'none':
      return 'Alvo único, alcance alto.';
  }
}

export function creatureStats(def: CreatureDef): [string, string][] {
  return [
    ['Dano', formatNumber(def.damage)],
    ['Alcance', formatNumber(def.range)],
    ['Recarga', `${formatNumber(def.cooldown)} s`],
    ['Custo', `${def.baseCost} ouro`],
  ];
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Efeito total de um talento num nível, em texto (ex.: "+30 vida do Nexus"). */
export function talentEffectText(kind: TalentEffectKind, value: number): string {
  switch (kind) {
    case 'nexusMaxHp':
      return `+${value} de vida do Nexus`;
    case 'nexusHeal':
      return `+${value} de cura entre ondas`;
    case 'nexusRegen':
      return `${formatNumber(value)} de vida por segundo`;
    case 'nexusWard':
      return value > 0 ? 'Anula o 1º golpe de cada onda' : 'Inativa';
    case 'startGold':
      return `+${value} de ouro inicial`;
    case 'incomeInterval':
      return `+1 ouro a cada ${formatNumber(ECONOMY.passiveIncome.interval - value)} s`;
    case 'evolveDiscount':
      return `−${pct(value)} no custo de evoluir`;
    case 'killGold':
      return `+${pct(value)} de ouro por abate`;
    case 'damage':
      return `+${pct(value)} de dano`;
    case 'attackSpeed':
      return `+${pct(value)} de velocidade de ataque`;
    case 'range':
      return `+${pct(value)} de alcance`;
    case 'creatureSlots':
      return `+${value} vaga de criatura`;
    case 'heroDamage':
      return `+${pct(value)} de dano do herói`;
    case 'pulseCooldown':
      return `−${pct(value)} na recarga do Pulso`;
    case 'heroSpeed':
      return `+${pct(value)} de velocidade do herói`;
    case 'pulseRadius':
      return `+${pct(value)} de raio do Pulso`;
    case 'essenceGain':
      return `+${pct(value)} de Essência por run`;
    case 'victoryEssence':
      return `+${value} de Essência ao vencer`;
    case 'essencePerWave':
      return `+${value} de Essência por onda`;
  }
}
