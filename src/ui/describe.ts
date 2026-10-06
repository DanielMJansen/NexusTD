import { heroMaxHp, heroRange } from '../game/hero';
import { pulsePower } from '../game/pulses';
import type { RunState } from '../game/state';
import { ECONOMY } from '../data/config';
import type { AscendedForm, CreatureAbility, CreatureDef, HitEffect } from '../data/creatures';
import { ENEMIES, type EnemyTrait } from '../data/enemies';
import type { HeroDef, RaceBonus } from '../data/heroes';
import type { HeroStat } from '../data/heroUpgrades';
import type { TalentEffectKind } from '../data/talents';

export const formatNumber = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

const pctOf = (v: number) => `${Math.round(v * 100)}%`;

/** Texto de um efeito de golpe. */
export function hitEffectText(e: HitEffect): string {
  switch (e.kind) {
    case 'poison':
      return `Dano contínuo: ${formatNumber(e.dps)}/s por ${formatNumber(e.duration)} s (ignora armadura).`;
    case 'stun': {
      const what = e.look === 'root' ? 'prender em raízes' : e.look === 'stone' ? 'petrificar' : 'atordoar';
      return `${pctOf(e.chance)} de chance de ${what} por ${formatNumber(e.duration)} s (chefes resistem).`;
    }
    case 'fear':
      return e.look === 'confuse'
        ? `${pctOf(e.chance)} de chance de confundir: o inimigo anda para trás por ${formatNumber(e.duration)} s (chefes resistem).`
        : `${pctOf(e.chance)} de chance de assustar: o inimigo foge do Nexus por ${formatNumber(e.duration)} s (chefes resistem).`;
    case 'mark':
      return `Marca o alvo: +${pctOf(e.amount)} de dano recebido por ${formatNumber(e.duration)} s${e.explode ? `; se morrer marcado, explode (raio ${e.explode.radius}, ${pctOf(e.explode.ratio)} da vida dele)` : ''}.`;
    case 'vulnerable':
      return `O alvo recebe +${pctOf(e.amount)} de dano por ${formatNumber(e.duration)} s.`;
    case 'corrode':
      return `Corrói ${e.armor} de armadura por ${formatNumber(e.duration)} s.`;
    case 'weaken':
      return `Enfraquece por ${formatNumber(e.duration)} s: ${pctOf(e.slow)} mais lento e −${pctOf(e.damage)} de dano ao Nexus.`;
    case 'pull':
      return `Puxa o alvo ${e.distance} na direção da criatura (chefes resistem).`;
    case 'possess':
      return `Possui o alvo por ${formatNumber(e.duration)} s: ele luta contra os outros inimigos${e.explode ? ` e explode no fim (raio ${e.explode.radius})` : ''} (chefes resistem).`;
    case 'execute':
      return `Executa inimigos comuns abaixo de ${pctOf(e.below)} de vida.`;
    case 'vsStrong':
      return `+${pctOf(e.bonus)} de dano contra elites e chefes.`;
    case 'killHaste':
      return `Cada abate: +${pctOf(e.perKill)} de velocidade de ataque até o fim da onda (máx. +${pctOf(e.max)}).`;
    case 'killDamage':
      return `Cada abate: +${pctOf(e.perKill)} de dano até o fim da onda (máx. +${pctOf(e.max)}).`;
    case 'steal':
      return `${pctOf(e.chance)} de chance de roubar ${e.gold} de ouro a cada golpe.`;
    case 'goldOnKill':
      return e.when === 'executed'
        ? `Cada execução rende +${e.gold} de ouro.`
        : e.when === 'feared'
          ? `Inimigos confusos ou assustados que morrem rendem +${e.gold} de ouro.`
          : `Cada abate rende +${e.gold} de ouro.`;
    case 'raiseOnKill':
      return `${pctOf(e.chance)} de chance de erguer um esqueleto aliado por ${formatNumber(e.duration)} s ao abater.`;
  }
}

/** Texto de uma habilidade (e dos efeitos de golpe, se houver), gerado a partir dos dados. */
export function abilityText(a: CreatureAbility, effects: readonly HitEffect[] = []): string {
  const extra = effects.map(hitEffectText).join(' ');
  if (a.kind === 'none' && extra) return extra;
  const base = baseAbilityText(a);
  return extra ? `${base} ${extra}` : base;
}

function baseAbilityText(a: CreatureAbility): string {
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
    case 'screech': {
      const again = a.immunity ? ` O mesmo inimigo só sofre o efeito de novo após ${formatNumber(a.immunity)} s.` : '';
      return a.fear
        ? `Grito em leque: atinge todos à frente e os faz fugir do Nexus por ${formatNumber(a.fear)} s (chefes resistem).${again}`
        : a.push > 0
          ? `Grito em leque: atinge todos à frente e os empurra ${a.push} para longe do Nexus (chefes resistem).${again}`
          : 'Golpe em leque: atinge todos à frente.';
    }
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
    case 'bless': {
      const parts: string[] = [];
      if (a.damage) parts.push(`+${pctOf(a.damage)} de dano`);
      if (a.range) parts.push(`+${pctOf(a.range)} de alcance`);
      if (a.attackSpeed) parts.push(`+${pctOf(a.attackSpeed)} de velocidade de ataque`);
      if (a.critDamage) parts.push(`+${formatNumber(a.critDamage)}× de dano crítico`);
      if (a.protect) parts.push('imunidade a teia e atordoamento');
      const allies = parts.length ? `Bênção: criaturas num raio de ${a.radius} ganham ${parts.join(', ')}.` : '';
      const hurt = a.dps ? ` Inimigos dentro da aura sofrem ${formatNumber(a.dps)} de dano por segundo.` : '';
      return (allies + hurt).trim();
    }
    case 'nova':
      return `Golpe em área: atinge todos num raio de ${a.radius} ao redor dela.`;
    case 'pierce':
      return a.beams > 1
        ? `Raio em leque: ${a.beams} raios que atravessam todos os inimigos no caminho.`
        : 'Raio que atravessa todos os inimigos em linha.';
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
      (form, i) => `<p class="${className}">${portraits ? `<canvas class="branch-portrait" data-sprite="${def.id}" data-level="3" data-branch="${i}" style="--branch-color:${form.color}"></canvas>` : ''}<span class="branch-tag" style="--branch-color:${form.color}">${form.icon} ${i === 0 ? 'A' : 'B'}</span> Nível 3 — <b>${form.name}</b>: ${abilityText(form.ability, form.effects ?? def.effects)}${formStatsText(form)}</p>`,
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
      if (t.look === 'curse') return `Praga: a cada ${formatNumber(t.cooldown)} s, amaldiçoa ${t.targets === 1 ? 'a criatura mais próxima' : `até ${t.targets} criaturas`} (alcance ${t.range}): atacam ${Math.round(t.slow * 100)}% mais devagar por ${formatNumber(t.duration)} s.`;
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
    case 'leap':
      return `Salto: a cada ${formatNumber(t.cooldown)} s, pula ${t.distance} para a frente, por cima de bloqueios.`;
    case 'drain':
      return `Suga: cada golpe no Nexus cura ${Math.round(t.amount * 100)}% da vida; encostada no herói, cura ${Math.round(t.amount * 100)}% por segundo.`;
    case 'submerge':
      return 'Submerso: dentro da lama fica intocável (não é alvo nem leva dano).';
    case 'lure':
      return 'Isca: as criaturas que o alcançam atiram nele primeiro.';
    case 'swallow':
      return `Engolir: a cada ${formatNumber(t.cooldown)} s, engole a criatura mais próxima (alcance ${t.range}), que fica fora de combate por ${formatNumber(t.duration)} s ou até ele levar ${Math.round(t.breakDamage * 100)}% da vida em dano.`;
    case 'burrow':
      return `Mergulho: a cada ${formatNumber(t.cooldown)} s, some na lama por ${formatNumber(t.hide)} s e reaparece perto do Nexus em investida.`;
    case 'heads':
      return `Cabeças: nasce com ${t.start}; cada cabeça é uma barra de vida. Cabeças cortadas renascem em dobro após ${formatNumber(t.regrow)} s (até ${t.max}), a não ser que a Hidra morra antes.`;
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

/** Bônus do herói para as criaturas da raça dele, em texto. */
export function raceBonusText(race: string, bonus: RaceBonus): string {
  const plural = `Criaturas da raça ${race}`;
  switch (bonus.kind) {
    case 'range':
      return `${plural}: +${Math.round(bonus.value * 100)}% de alcance.`;
    case 'damage':
      return `${plural}: +${Math.round(bonus.value * 100)}% de dano.`;
    case 'killHeal':
      return `${plural}: cada abate cura ${bonus.value} de vida do Nexus.`;
    case 'attackSpeed':
      return `${plural}: +${Math.round(bonus.value * 100)}% de velocidade de ataque.`;
    case 'armorPierce':
      return `${plural}: ignoram ${bonus.value} de armadura.`;
    case 'poisonDuration':
      return `${plural}: venenos, poças e efeitos de golpe duram +${bonus.value} s.`;
    case 'critChance':
      return `${plural}: +${Math.round(bonus.value * 100)}% de chance de crítico.`;
    case 'vsStrong':
      return `${plural}: +${Math.round(bonus.value * 100)}% de dano contra elites e chefes.`;
  }
}

/** Ataque básico do herói, em texto. */
export function attackText(def: HeroDef): string {
  const a = def.attack;
  const area = a.pattern.kind === 'cone' ? 'em leque (todos à frente)' : 'num alvo';
  const heal =
    (a.healPerHit > 0 ? ` Cada golpe cura ${formatNumber(a.healPerHit)} do Nexus.` : '') +
    (a.pierceArmor ? ' Ignora armadura.' : '');
  return `${a.damage} de dano ${area} a cada ${formatNumber(a.cooldown)} s, alcance ${a.range}.${heal}`;
}

/** Pulso do herói, em texto (com o nome em negrito). */
/** Valores do Pulso na run atual (nível do herói, melhorias e talentos). Sem eles, mostra os valores base. */
export interface PulseLive {
  /** Multiplicador de dano (talentos, melhorias e nível do herói). */
  power: number;
  /** Pulso Ampliado: multiplicador de área, alcance, duração e quantidade. */
  size: number;
  radius: number;
  cooldown: number;
}

export function pulseText(def: HeroDef, live?: PulseLive): string {
  const base = def.pulse;
  const size = live?.size ?? 1;
  const grow = (n: number) => Math.round(n * size * 10) / 10;
  const more = (n: number) => Math.round(n * size);
  // mesmos campos do Pulso, já com os valores da run (quando houver)
  const p = { ...base, damage: Math.round(base.damage * (live?.power ?? 1)), radius: Math.round(live?.radius ?? base.radius), cooldown: Math.round((live?.cooldown ?? base.cooldown) * 10) / 10 };
  const raw = base.effect;
  const e = (
    raw.kind === 'charge' || raw.kind === 'glide' || raw.kind === 'cone' || raw.kind === 'fissure'
      ? { ...raw, length: Math.round(raw.length * size) }
      : raw.kind === 'swarm'
        ? { ...raw, count: more(raw.count), range: Math.round(raw.range * size) }
        : raw.kind === 'flame'
          ? { ...raw, duration: grow(raw.duration), length: Math.round(raw.length * size) }
          : raw.kind === 'transform' || raw.kind === 'hex' || raw.kind === 'haste'
            ? { ...raw, duration: grow(raw.duration) }
            : raw.kind === 'raise'
              ? { ...raw, count: more(raw.count), fallback: more(raw.fallback) }
              : raw.kind === 'meteors'
                ? { ...raw, count: more(raw.count), radius: Math.round(raw.radius * size) }
                : raw.kind === 'judgment'
                  ? { ...raw, radius: Math.round(raw.radius * size) }
                  : raw
  ) as typeof raw;
  const d = formatNumber(p.damage);
  const pctOf = (v: number) => `${Math.round(v * 100)}%`;
  let what: string;
  switch (e.kind) {
    case 'burst':
      what = `explosão de ${d} de dano num raio de ${p.radius}.`;
      break;
    case 'charge':
      what = `avança ${e.length} com o escudo na direção da mira: ${d} de dano em quem está no caminho, que é arremessado ${e.knockback} para longe do Nexus (chefes resistem ao arremesso).`;
      break;
    case 'glide':
      what = `desliza translúcido ${e.length} na direção da mira em ${formatNumber(e.duration)} s: ${d} de dano em quem atravessa.`;
      break;
    case 'cone':
      what = `leque à frente (alcance ${e.length}): ${d} de dano.`;
      break;
    case 'swarm':
      what = `morcegos caçam os ${e.count} inimigos mais próximos (até ${e.range}): ${d} de dano e sangramento ${formatNumber(e.bleed.dps)}/s por ${formatNumber(e.bleed.duration)} s.`;
      break;
    case 'flame':
      what = `jato de fogo por ${formatNumber(e.duration)} s que segue a mira (alcance ${e.length}): ${d} de dano por segundo e queimadura ${formatNumber(e.burn.dps)}/s.`;
      break;
    case 'transform':
      what = `vira um lobisomem gigante por ${formatNumber(e.duration)} s: ataca ${pctOf(e.attackSpeed)} mais rápido, com +${pctOf(e.damage)} de dano, em leque, e cada golpe cura ${pctOf(e.lifesteal)} do dano. Ao transformar, uiva (${d} de dano num raio de ${p.radius}).`;
      break;
    case 'hex':
      what = `inimigos comuns num raio de ${p.radius} viram sapos por ${formatNumber(e.duration)} s: andam devagar, levam +${pctOf(e.vulnerable)} de dano e não ferem o herói nem o Nexus. Chefes só levam ${d} de dano.`;
      break;
    case 'haste':
      what = `todas as criaturas atacam ${pctOf(e.amount)} mais rápido por ${formatNumber(e.duration)} s; ${d} de dano num raio de ${p.radius}.`;
      break;
    case 'fissure':
      what = `soca o chão e abre uma fenda de ${e.length} na direção da mira: ${d} de dano; a fenda fica ${formatNumber(e.duration)} s deixando quem passa ${pctOf(e.slow)} mais lento.`;
      break;
    case 'raise':
      what = `ergue até ${e.count} esqueletos aliados onde inimigos morreram nos últimos segundos (sem corpos, ${e.fallback} ao redor do herói) por ${formatNumber(e.duration)} s.`;
      break;
    case 'meteors':
      what = `${e.count} meteoros caem em sequência ao redor da mira: ${d} de dano cada (raio ${e.radius}) e chão em chamas.`;
      break;
    case 'judgment':
      what = `após ${formatNumber(e.delay)} s, uma coluna de luz desce na mira: ${d} de dano (raio ${e.radius}) e marca quem atinge (+${pctOf(e.mark.amount)} de dano recebido por ${formatNumber(e.mark.duration)} s).`;
      break;
  }
  const extras = [
    p.stun ? `${p.stun.look === 'stone' ? 'Petrifica' : 'Atordoa'} por ${formatNumber(p.stun.duration)} s (chefes resistem).` : '',
    p.fear ? `Inimigos atingidos fogem do Nexus por ${formatNumber(p.fear)} s.` : '',
    p.healPerEnemy > 0 ? `Cura ${p.healPerEnemy} de vida do herói por inimigo atingido.` : '',
    p.selfDamage ? `Custa ${pctOf(p.selfDamage)} da vida do herói.` : '',
    p.damage > 0 && !live ? 'O dano cresce +10% por nível do herói.' : '',
    live && base.damage > 0 && p.damage !== base.damage ? `(dano base ${base.damage}; nível e melhorias ×${formatNumber(Math.round((live.power) * 100) / 100)})` : '',
  ].filter(Boolean);
  return `<b>${p.name}</b> (recarga ${p.cooldown} s): ${what}${extras.length ? ' ' + extras.join(' ') : ''}`;
}

const pctText = (v: number) => `${Math.round(v * 100)}%`;

/** Total de um atributo de melhoria do herói, em texto curto (ex.: "+36% de alcance"). */
export function heroStatText(stat: HeroStat, value: number): string {
  switch (stat) {
    case 'damage':
      return `+${pctText(value)} de dano`;
    case 'attackSpeed':
      return `+${pctText(value)} de vel. de ataque`;
    case 'range':
      return `+${pctText(value)} de alcance`;
    case 'maxHp':
      return `+${formatNumber(value)} de vida máxima`;
    case 'regen':
      return `+${formatNumber(Math.round(value * 10) / 10)} de vida/s`;
    case 'speed':
      return `+${pctText(value)} de velocidade`;
    case 'pulseCooldown':
      return `−${pctText(value)} na recarga do Pulso`;
    case 'pulseDamage':
      return `+${pctText(value)} de dano do Pulso`;
    case 'lifesteal':
      return `${pctText(value)} do dano vira vida`;
    case 'thorns':
      return `${formatNumber(value)} de dano/s em quem encosta`;
    case 'armor':
      return `−${pctText(Math.min(0.6, value))} de dano recebido`;
    case 'pickup':
      return `+${pctText(value)} de raio de coleta`;
    case 'pulseSize':
      return `Pulso +${pctText(value)} maior`;
    case 'pulseEcho':
      return `${pctText(value)} de chance de eco do Pulso`;
  }
}

/** Totais atuais das melhorias do herói (só as que ele já tem). */
export function heroStatRows(stats: Record<HeroStat, number>): string[] {
  return (Object.keys(stats) as HeroStat[]).filter((k) => stats[k] > 0).map((k) => heroStatText(k, stats[k]));
}

/** Ficha do herói na run: valores atuais com nível, melhorias, talentos e bônus da run. */
export function heroSheetRows(run: RunState): [string, string][] {
  const def = run.hero.def;
  const s = run.heroStats;
  const t = run.talents;
  const damage = def.attack.damage * run.modifiers.damage * (1 + t.heroDamage + s.damage);
  const perSecond = (run.modifiers.attackSpeed + s.attackSpeed) / def.attack.cooldown;
  const rows: [string, string][] = [
    ['Nível', `${run.hero.level}`],
    ['Vida', `${Math.ceil(run.hero.hp)}/${Math.round(heroMaxHp(run))}`],
    ['Dano', formatNumber(Math.round(damage * 10) / 10)],
    ['Ataques/s', formatNumber(Math.round(perSecond * 100) / 100)],
    ['Alcance', `${Math.round(heroRange(run))}`],
    ['Velocidade', `${Math.round(def.speed * (1 + t.heroSpeed + s.speed))}`],
  ];
  if (run.modifiers.critChance > 0) rows.push(['Crítico', `${Math.round(run.modifiers.critChance * 100)}%`]);
  if (s.regen > 0) rows.push(['Regeneração', `${formatNumber(Math.round(s.regen * 10) / 10)}/s`]);
  if (s.lifesteal > 0) rows.push(['Roubo de vida', `${Math.round(s.lifesteal * 100)}%`]);
  if (s.armor > 0) rows.push(['Couraça', `−${Math.round(Math.min(0.6, s.armor) * 100)}% de dano`]);
  if (s.thorns > 0) rows.push(['Espinhos', `${formatNumber(s.thorns)}/s`]);
  if (def.pulse.damage > 0) rows.push(['Dano do Pulso', `${Math.round(def.pulse.damage * pulsePower(run))}`]);
  rows.push(['Recarga do Pulso', `${formatNumber(Math.round(run.pulse.cooldown * 10) / 10)} s`]);
  return rows;
}

export function heroSheetHtml(run: RunState): string {
  return `<dl class="hero-sheet-list">${heroSheetRows(run)
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('')}</dl>`;
}
