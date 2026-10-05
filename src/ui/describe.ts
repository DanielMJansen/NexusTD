import type { CreatureAbility, CreatureDef } from '../data/creatures';

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
