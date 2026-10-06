import { ECONOMY } from '../data/config';
import type { AscendedForm, CreatureAbility, CreatureDef } from '../data/creatures';
import { ENEMIES, type EnemyTrait } from '../data/enemies';
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
      return a.fear
        ? `Grito em leque: atinge todos à frente e os faz fugir do Nexus por ${formatNumber(a.fear)} s (chefes resistem).`
        : `Grito em leque: atinge todos à frente e os empurra ${a.push} para longe do Nexus (chefes resistem).`;
    case 'poison':
      return `Veneno: ${formatNumber(a.dps)} de dano por segundo durante ${formatNumber(a.duration)} s (ignora armadura).`;
    case 'pool':
      if (a.bounty) return `Poça dourada: ${formatNumber(a.dps)} de dano por segundo num raio de ${a.radius} durante ${formatNumber(a.duration)} s; cada inimigo que morre nela rende +${a.bounty} de ouro.`;
      return `Poça: ${formatNumber(a.dps)} de dano por segundo num raio de ${a.radius} durante ${formatNumber(a.duration)} s.`;
    case 'crit':
      return `Crítico: +${Math.round(a.chance * 100)}% de chance de golpe crítico, que causa ×${formatNumber(a.multiplier)} de dano.`;
    case 'stun':
      return `Atordoar: ${Math.round(a.chance * 100)}% de chance de parar o alvo por ${formatNumber(a.duration)} s (chefes resistem).`;
    case 'fear':
      return `Pavor: ${Math.round(a.chance * 100)}% de chance de fazer o alvo fugir do Nexus por ${formatNumber(a.duration)} s (chefes resistem).`;
    case 'bounty':
      return `Alquimia: cada abate desta criatura rende +${a.gold} de ouro.`;
    case 'none':
      return 'Alvo único, alcance alto.';
  }
}

/** Multiplicadores de atributo de uma vertente, em texto (ex.: "+30% de alcance"). */
function formStatsText(form: AscendedForm): string {
  const parts: string[] = [];
  const s = form.stats;
  if (s?.damage) parts.push(`${s.damage > 1 ? '+' : '−'}${Math.round(Math.abs(s.damage - 1) * 100)}% de dano`);
  if (s?.range) parts.push(`${s.range > 1 ? '+' : '−'}${Math.round(Math.abs(s.range - 1) * 100)}% de alcance`);
  if (s?.cooldown) parts.push(s.cooldown > 1 ? `ataca ${Math.round((s.cooldown - 1) * 100)}% mais devagar` : `ataca ${Math.round((1 - s.cooldown) * 100)}% mais rápido`);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

/** As duas vertentes do nível 3, em HTML (fichas, tooltips, escolha). */
/** `portraits`: mostra o desenho de cada vertente (só em telas do overlay, onde os retratos animam). */
export function ascendedFormsHtml(def: CreatureDef, className = 'cc-ability evolved', portraits = false): string {
  return def.ascended
    .map(
      (form, i) => `<p class="${className}">${portraits ? `<canvas class="branch-portrait" data-sprite="${def.id}" data-level="3" data-branch="${i}" style="--branch-color:${form.color}"></canvas>` : ''}<span class="branch-tag" style="--branch-color:${form.color}">${form.icon} ${i === 0 ? 'A' : 'B'}</span> Nível 3 — <b>${form.name}</b>: ${abilityText(form.ability)}${formStatsText(form)}</p>`,
    )
    .join('');
}

/** Texto de uma habilidade de inimigo (códex). */
export function enemyTraitText(t: EnemyTrait): string {
  switch (t.kind) {
    case 'ranged':
      return `Tiro: com o herói a até ${t.range}, avança devagar e atira (${formatNumber(t.damage)} de dano a cada ${formatNumber(t.cooldown)} s).`;
    case 'split':
      return `Divisão: ao morrer, vira ${t.count} ${ENEMIES[t.into].name}s.`;
    case 'stone':
      return `Pedra: voa ${formatNumber(t.fly)} s e pousa ${formatNumber(t.rest)} s com +${t.armor} de armadura.`;
    case 'web':
      return `Teia: a cada ${formatNumber(t.cooldown)} s, prende ${t.targets === 1 ? 'a criatura mais próxima' : `até ${t.targets} criaturas`} (alcance ${t.range}): atacam ${Math.round(t.slow * 100)}% mais devagar por ${formatNumber(t.duration)} s.`;
    case 'summon':
      return `Invocação: a cada ${formatNumber(t.cooldown)} s, ergue ${t.count} ${ENEMIES[t.enemy].name}s.`;
    case 'charge':
      return `Investida: a cada ${formatNumber(t.cooldown)} s, corre ${formatNumber(t.speedMultiplier)}× mais rápido por ${formatNumber(t.duration)} s.`;
    case 'heal':
      return `Lamento: a cada ${formatNumber(t.cooldown)} s, cura ${Math.round(t.amount * 100)}% da vida dos inimigos num raio de ${t.radius} (chefes não).`;
    case 'stomp':
      return `Pisão: a cada ${formatNumber(t.cooldown)} s, atordoa as criaturas num raio de ${t.radius} por ${formatNumber(t.stun)} s.`;
    case 'shield':
      return `Escudo: a cada ${formatNumber(t.cooldown)} s, reduz o dano recebido em ${Math.round(t.reduction * 100)}% por ${formatNumber(t.duration)} s.`;
    case 'enrage':
      return `Fúria: abaixo de ${Math.round(t.below * 100)}% da vida, fica ${Math.round((t.speedMultiplier - 1) * 100)}% mais rápido e usa habilidades mais vezes.`;
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
    case 'nexusUpgradeDiscount':
      return `−${pct(value)} no custo das melhorias do Nexus`;
    case 'startNexusBolt':
      return value > 0 ? 'Raio do Nexus nível 1 desde o início' : 'Inativo';
    case 'startNexusField':
      return value > 0 ? 'Campo de Lentidão nível 1 desde o início' : 'Inativo';
    case 'startNexusShield':
      return value > 0 ? 'Escudo do Nexus nível 1 desde o início' : 'Inativo';
    case 'heroMaxHp':
      return `+${value} de vida do herói`;
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
    case 'heroRespawn':
      return `Herói renasce ${pct(value)} mais rápido`;
    case 'heroXp':
      return `+${pct(value)} de XP do herói`;
  }
}
