import { RACE_PASSIVES } from '../data/races';
import { heroMaxHp, heroRange } from '../game/hero';
import { pulsePower } from '../game/pulses';
import type { RunState } from '../game/state';
import { ECONOMY } from '../data/config';
import { CREATURE_CLASSES, type AscendedForm, type CreatureAbility, type CreatureDef, type HitEffect } from '../data/creatures';
import { ENEMIES, type EnemyTrait } from '../data/enemies';
import type { HeroDef, RaceBonus } from '../data/heroes';
import type { HeroStat } from '../data/heroUpgrades';
import type { TalentEffectKind } from '../data/talents';
import { getLang, t } from '../i18n/i18n';

// Todas as frases passam por t() com o português como chave e marcadores nomeados ({d}, {s}...),
// para cada idioma montar a frase na própria ordem. Os números saem no formato do idioma (vírgula ou ponto).
const LOCALES = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' } as const;
export const formatNumber = (n: number): string => n.toLocaleString(LOCALES[getLang()], { maximumFractionDigits: 2 });

const pctOf = (v: number) => `${Math.round(v * 100)}%`;
const f = formatNumber;

/** "a criatura mais próxima" ou "até N criaturas". */
const whichCreatures = (n: number) => (n === 1 ? t('a criatura mais próxima') : t('até {n} criaturas', { n }));

/** Texto de um efeito de golpe. */
export function hitEffectText(e: HitEffect): string {
  switch (e.kind) {
    case 'poison':
      return t('Dano contínuo: {dps}/s por {s} s (ignora armadura).', { dps: f(e.dps), s: f(e.duration) });
    case 'stun': {
      const vars = { c: pctOf(e.chance), s: f(e.duration) };
      if (e.look === 'root') return t('Raízes: {c} de chance de prender o alvo no lugar por {s} s (chefes resistem).', vars);
      if (e.look === 'stone') return t('Petrificar: {c} de chance de transformar o alvo em pedra por {s} s (chefes resistem).', vars);
      return t('Atordoar: {c} de chance de parar o alvo por {s} s (chefes resistem).', vars);
    }
    case 'fear':
      return e.look === 'confuse'
        ? t('Confusão: {c} de chance de o inimigo andar para trás por {s} s (chefes resistem).', { c: pctOf(e.chance), s: f(e.duration) })
        : t('Medo: {c} de chance de o inimigo fugir do Nexus por {s} s (chefes resistem).', { c: pctOf(e.chance), s: f(e.duration) });
    case 'mark':
      return e.explode
        ? t('Marca: o alvo recebe +{a} de dano por {s} s; se morrer marcado, explode (raio {r}, {ratio} da vida dele).', {
            a: pctOf(e.amount),
            s: f(e.duration),
            r: e.explode.radius,
            ratio: pctOf(e.explode.ratio),
          })
        : t('Marca: o alvo recebe +{a} de dano por {s} s.', { a: pctOf(e.amount), s: f(e.duration) });
    case 'vulnerable':
      return t('Vulnerável: o alvo recebe +{a} de dano por {s} s.', { a: pctOf(e.amount), s: f(e.duration) });
    case 'corrode':
      return t('Corrosão: tira {a} de armadura do alvo por {s} s.', { a: e.armor, s: f(e.duration) });
    case 'weaken':
      return t('Enfraquecer: por {s} s, o alvo fica {slow} mais lento e causa −{d} de dano ao Nexus.', { s: f(e.duration), slow: pctOf(e.slow), d: pctOf(e.damage) });
    case 'pull':
      return t('Puxão: puxa o alvo {n} na direção da criatura (chefes resistem).', { n: e.distance });
    case 'possess':
      return e.explode
        ? t('Possessão: por {s} s, o alvo luta contra os outros inimigos e explode no fim (raio {r}) (chefes resistem).', { s: f(e.duration), r: e.explode.radius })
        : t('Possessão: por {s} s, o alvo luta contra os outros inimigos (chefes resistem).', { s: f(e.duration) });
    case 'execute':
      return t('Execução: inimigos comuns abaixo de {p} de vida morrem na hora.', { p: pctOf(e.below) });
    case 'vsStrong':
      return t('Caçadora: +{p} de dano contra elites e chefes.', { p: pctOf(e.bonus) });
    case 'killHaste':
      return t('Embalo: cada abate dá +{p} de velocidade de ataque até o fim da onda (máx. +{max}).', { p: pctOf(e.perKill), max: pctOf(e.max) });
    case 'killDamage':
      return t('Fúria: cada abate dá +{p} de dano até o fim da onda (máx. +{max}).', { p: pctOf(e.perKill), max: pctOf(e.max) });
    case 'steal':
      return t('Roubo: {c} de chance de roubar {g} de ouro a cada golpe.', { c: pctOf(e.chance), g: e.gold });
    case 'goldOnKill':
      return e.when === 'executed'
        ? t('Recompensa: cada execução rende +{g} de ouro.', { g: e.gold })
        : e.when === 'feared'
          ? t('Recompensa: inimigos confusos ou assustados que morrem rendem +{g} de ouro.', { g: e.gold })
          : t('Recompensa: cada abate rende +{g} de ouro.', { g: e.gold });
    case 'raiseOnKill':
      return t('Erguer mortos: {c} de chance de erguer um esqueleto aliado por {s} s ao abater.', { c: pctOf(e.chance), s: f(e.duration) });
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
      return t('Frenesi: a cada {n} golpes, fica {s} s atacando {x}× mais rápido e com +{d}% de dano.', {
        n: a.hitsToTrigger,
        s: f(a.duration),
        x: f(a.attackSpeedMultiplier),
        d: Math.round((a.damageMultiplier - 1) * 100),
      });
    case 'splash':
      return t('Área: atinge inimigos num raio de {r} ao redor do alvo com {p}% do dano.', { r: a.radius, p: Math.round(a.damageRatio * 100) });
    case 'slow':
      return t('Lentidão: o alvo fica {p}% mais lento por {s} s.', { p: Math.round((1 - a.speedMultiplier) * 100), s: f(a.duration) });
    case 'multishot':
      return t('Multi-tiro: ataca {n} inimigos de uma vez.', { n: a.targets });
    case 'block':
      return t('Bloqueio: segura até {n} inimigos num raio de {r} (chefes não param).', { n: a.capacity, r: a.radius });
    case 'lifesteal':
      return t('Sustento: cada abate desta criatura cura {n} de vida do herói.', { n: a.healPerKill });
    case 'chain':
      return t('Em cadeia: o golpe salta para até {n} inimigos próximos ({p}% do dano a cada salto).', { n: a.jumps, p: Math.round(a.falloff * 100) });
    case 'aura':
      return t('Aura: criaturas num raio de {r} atacam {p}% mais rápido.', { r: a.radius, p: Math.round(a.attackSpeed * 100) });
    case 'pierceArmor':
      return a.bonusVsArmored > 0
        ? t('Ignora armadura e causa +{p}% de dano em inimigos com armadura.', { p: Math.round(a.bonusVsArmored * 100) })
        : t('Ignora toda a armadura do alvo.');
    case 'screech': {
      const again = a.immunity ? ` ${t('O mesmo inimigo só sofre o efeito de novo após {s} s.', { s: f(a.immunity) })}` : '';
      if (a.dive) return t('Rasante: atinge todos numa faixa à frente e os empurra {n} para longe do Nexus (chefes resistem).', { n: a.push }) + again;
      return a.fear
        ? t('Grito em leque: atinge todos à frente e os faz fugir do Nexus por {s} s (chefes resistem).', { s: f(a.fear) }) + again
        : a.push > 0
          ? t('Grito em leque: atinge todos à frente e os empurra {n} para longe do Nexus (chefes resistem).', { n: a.push }) + again
          : t('Golpe em leque: atinge todos à frente.');
    }
    case 'poison':
      return t('Veneno: {dps} de dano por segundo durante {s} s (ignora armadura).', { dps: f(a.dps), s: f(a.duration) });
    case 'pool':
      if (a.bounty)
        return t('Poça dourada: {dps} de dano por segundo num raio de {r} durante {s} s; cada inimigo que morre nela rende +{g} de ouro.', {
          dps: f(a.dps),
          r: a.radius,
          s: f(a.duration),
          g: a.bounty,
        });
      return t('Poça: {dps} de dano por segundo num raio de {r} durante {s} s.', { dps: f(a.dps), r: a.radius, s: f(a.duration) });
    case 'crit':
      return t('Crítico: +{c}% de chance de golpe crítico, que causa ×{x} de dano.', { c: Math.round(a.chance * 100), x: f(a.multiplier) });
    case 'stun':
      return t('Atordoar: {c}% de chance de parar o alvo por {s} s (chefes resistem).', { c: Math.round(a.chance * 100), s: f(a.duration) });
    case 'fear':
      return t('Pavor: {c}% de chance de fazer o alvo fugir do Nexus por {s} s (chefes resistem).', { c: Math.round(a.chance * 100), s: f(a.duration) });
    case 'bounty':
      return t('Alquimia: cada abate desta criatura rende +{g} de ouro.', { g: a.gold });
    case 'bless': {
      const parts: string[] = [];
      if (a.damage) parts.push(t('+{p} de dano', { p: pctOf(a.damage) }));
      if (a.range) parts.push(t('+{p} de alcance', { p: pctOf(a.range) }));
      if (a.attackSpeed) parts.push(t('+{p} de velocidade de ataque', { p: pctOf(a.attackSpeed) }));
      if (a.critDamage) parts.push(t('+{x}× de dano crítico', { x: f(a.critDamage) }));
      if (a.protect) parts.push(t('imunidade a teia e atordoamento'));
      const allies = parts.length ? t('Bênção: criaturas num raio de {r} ganham {what}.', { r: a.radius, what: parts.join(', ') }) : '';
      const hurt = a.dps ? ` ${t('Inimigos dentro da aura sofrem {dps} de dano por segundo.', { dps: f(a.dps) })}` : '';
      return (allies + hurt).trim();
    }
    case 'nova':
      return t('Golpe em área: atinge todos num raio de {r} ao redor dela.', { r: a.radius });
    case 'pierce':
      return a.beams > 1 ? t('Raio em leque: {n} raios que atravessam todos os inimigos no caminho.', { n: a.beams }) : t('Raio que atravessa todos os inimigos em linha.');
    case 'none':
      return t('Alvo único, alcance alto.');
  }
}

/** Multiplicadores de atributo de uma vertente, em texto (ex.: "+30% de alcance"). */
function formStatsText(form: AscendedForm): string {
  const parts: string[] = [];
  const s = form.stats;
  const signed = (m: number) => `${m > 1 ? '+' : '−'}${Math.round(Math.abs(m - 1) * 100)}%`;
  if (s?.damage) parts.push(t('{p} de dano', { p: signed(s.damage) }));
  if (s?.range) parts.push(t('{p} de alcance', { p: signed(s.range) }));
  if (s?.cooldown)
    parts.push(
      s.cooldown > 1 ? t('ataca {p}% mais devagar', { p: Math.round((s.cooldown - 1) * 100) }) : t('ataca {p}% mais rápido', { p: Math.round((1 - s.cooldown) * 100) }),
    );
  return parts.length ? ` (${parts.join(', ')})` : '';
}

/** As duas vertentes do nível 3, em HTML (fichas, tooltips, escolha). */
/** `portraits`: mostra o desenho de cada vertente (só em telas do overlay, onde os retratos animam). */
export function ascendedFormsHtml(def: CreatureDef, className = 'cc-ability evolved', portraits = false): string {
  return def.ascended
    .map(
      (form, i) =>
        `<p class="${className}">${portraits ? `<canvas class="branch-portrait" data-sprite="${def.id}" data-level="3" data-branch="${i}" style="--branch-color:${form.color}"></canvas>` : ''}<span class="branch-tag" style="--branch-color:${form.color}">${i === 0 ? 'A' : 'B'}</span> ${t('Nível 3')} — <b>${form.name}</b>: ${abilityText(form.ability, form.effects ?? def.effects)}${formStatsText(form)}${
          form.supreme ? `<br><small class="supreme-line">✦ ${t('Forma Suprema (despertada, ★5):')} <b>${form.supreme.name}</b> — ${form.supreme.description}</small>` : ''
        }</p>`,
    )
    .join('');
}

/** Texto de uma habilidade de inimigo (códex). */
export function enemyTraitText(tr: EnemyTrait): string {
  switch (tr.kind) {
    case 'ranged':
      return t('Tiro: com o herói a até {r}, avança devagar e atira ({d} de dano a cada {s} s).', { r: tr.range, d: f(tr.damage), s: f(tr.cooldown) });
    case 'split':
      return t('Divisão: ao morrer, vira {n} × {name}.', { n: tr.count, name: ENEMIES[tr.into].name });
    case 'stone':
      return t('Pedra: voa {fly} s e pousa {rest} s com +{a} de armadura.', { fly: f(tr.fly), rest: f(tr.rest), a: tr.armor });
    case 'web': {
      const vars = { s: f(tr.cooldown), who: whichCreatures(tr.targets), r: tr.range, p: Math.round(tr.slow * 100), d: f(tr.duration) };
      if (tr.look === 'curse') return t('Praga: a cada {s} s, amaldiçoa {who} (alcance {r}): atacam {p}% mais devagar por {d} s.', vars);
      return t('Teia: a cada {s} s, prende {who} (alcance {r}): atacam {p}% mais devagar por {d} s.', vars);
    }
    case 'summon':
      return t('Invocação: a cada {s} s, ergue {n} × {name}.', { s: f(tr.cooldown), n: tr.count, name: ENEMIES[tr.enemy].name });
    case 'charge':
      return t('Investida: a cada {s} s, corre {x}× mais rápido por {d} s.', { s: f(tr.cooldown), x: f(tr.speedMultiplier), d: f(tr.duration) });
    case 'heal':
      return t('Lamento: a cada {s} s, cura {p}% da vida dos inimigos num raio de {r} (chefes não).', { s: f(tr.cooldown), p: Math.round(tr.amount * 100), r: tr.radius });
    case 'stomp':
      return t('Pisão: a cada {s} s, atordoa as criaturas num raio de {r} por {d} s.', { s: f(tr.cooldown), r: tr.radius, d: f(tr.stun) });
    case 'shield':
      return t('Escudo: a cada {s} s, reduz o dano recebido em {p}% por {d} s.', { s: f(tr.cooldown), p: Math.round(tr.reduction * 100), d: f(tr.duration) });
    case 'enrage':
      return t('Fúria: abaixo de {b}% da vida, fica {p}% mais rápido e usa habilidades mais vezes.', { b: Math.round(tr.below * 100), p: Math.round((tr.speedMultiplier - 1) * 100) });
    case 'leap':
      return t('Salto: a cada {s} s, pula {n} para a frente, por cima de bloqueios.', { s: f(tr.cooldown), n: tr.distance });
    case 'drain':
      return t('Suga: cada golpe no Nexus cura {p}% da vida; encostada no herói, cura {p}% por segundo.', { p: Math.round(tr.amount * 100) });
    case 'submerge':
      return t('Submerso: dentro da lama fica intocável (não é alvo nem leva dano).');
    case 'lure':
      return t('Isca: as criaturas que o alcançam atiram nele primeiro.');
    case 'swallow':
      return t('Engolir: a cada {s} s, engole a criatura mais próxima (alcance {r}), que fica fora de combate por {d} s ou até ele levar {p}% da vida em dano.', {
        s: f(tr.cooldown),
        r: tr.range,
        d: f(tr.duration),
        p: Math.round(tr.breakDamage * 100),
      });
    case 'burrow':
      if (tr.radius && tr.stun)
        return t('Bote: a cada {s} s, some sob a areia por {h} s e emerge perto do Obelisco, atordoando as criaturas num raio de {r} por {d} s.', {
          s: f(tr.cooldown),
          h: f(tr.hide),
          r: tr.radius,
          d: f(tr.stun),
        });
      return t('Mergulho: a cada {s} s, some na lama por {h} s e reaparece perto do Nexus em investida.', { s: f(tr.cooldown), h: f(tr.hide) });
    case 'freeze': {
      const vars = { s: f(tr.cooldown), who: whichCreatures(tr.targets), r: tr.range, d: f(tr.duration) };
      if (tr.look === 'sting') return t('Ferrão: a cada {s} s, atordoa {who} (alcance {r}) por {d} s.', vars);
      return tr.range > 50 ? t('Bola de neve: a cada {s} s, congela {who} (alcance {r}) por {d} s.', vars) : t('Toque gélido: a cada {s} s, congela a criatura que tocar por {d} s.', vars);
    }
    case 'regen':
      return t('Regeneração: recupera {p}% da vida por segundo, a não ser que leve dano de fogo.', { p: Math.round(tr.perSecond * 100) });
    case 'dive':
      return t('Mergulho: nada sob o gelo (intocável) e emerge rachando o gelo e congelando as criaturas num raio de {r} por {d} s.', { r: tr.radius, d: f(tr.freeze) });
    case 'heads':
      return t('Cabeças: nasce com {n}; cada cabeça é uma barra de vida. Cabeças cortadas renascem em dobro após {s} s (até {max}), a não ser que a Hidra morra antes.', {
        n: tr.start,
        s: f(tr.regrow),
        max: tr.max,
      });
    case 'revive':
      return tr.fireStops
        ? t('Imortal: ao cair, levanta uma vez com {p}% da vida após {s} s, a não ser que tenha levado dano de fogo há pouco.', { p: Math.round(tr.hp * 100), s: f(tr.delay) })
        : t('Imortal: ao cair, levanta uma vez com {p}% da vida após {s} s.', { p: Math.round(tr.hp * 100), s: f(tr.delay) });
    case 'steal':
      return t('Saque: cada golpe num Nexus rouba {g} de ouro; matá-lo devolve tudo.', { g: tr.gold });
    case 'aegis':
      return t('Égide: a cada {s} s, cobre os inimigos num raio de {r} com um escudo que reduz o dano em {p}% por {d} s.', {
        s: f(tr.cooldown),
        r: tr.radius,
        p: Math.round(tr.reduction * 100),
        d: f(tr.duration),
      });
    case 'evade':
      return t('Esquiva: {p}% dos golpes diretos passam sem causar dano (veneno e poças pegam sempre).', { p: Math.round(tr.chance * 100) });
    case 'riftcall':
      return t('Fenda: a cada {s} s, abre {n} portais que soltam {name}.', { s: f(tr.cooldown), n: tr.count, name: ENEMIES[tr.enemy].name });
    case 'blink':
      return t('Teleporte: a cada {s} s, salta {n} em direção ao Nexus mais ferido.', { s: f(tr.cooldown), n: tr.distance });
  }
}

// ---------- ficha nova da criatura (em revisão: vale para quem já tem `classe`) ----------

/** "Vampiro · Atacante corpo a corpo, alvo único". */
export function creatureClassLine(def: CreatureDef): string {
  return `${t(def.race)} · ${CREATURE_CLASSES[def.classe]}${def.classDetail ? `, ${def.classDetail}` : ''}`;
}

/** Texto de habilidade com o termo próprio em negrito ("<b>Frenesi:</b> ..."). */
function termHtml(text: string): string {
  // cada "Termo:" no começo de uma frase vira negrito
  return text.replace(/(^|[.;] )([A-ZÁÉÍÓÚÂÊÔÃÕÇÑ][^:.;]{1,26}):/g, '$1<b>$2:</b>');
}

/** Distância de combate pelo alcance (criatura e herói). */
const whereText = (range: number, melee: boolean, mid: number) => (melee || range < 70 ? t('de perto') : range < mid ? t('a média distância') : t('de longe'));

/** "Como luta": ritmo e distância, a partir dos atributos. */
export function fightText(def: CreatureDef): string {
  const perSecond = f(Math.round((1 / def.cooldown) * 10) / 10);
  const rhythm = def.cooldown < 1 ? t('{n} ataques por segundo', { n: perSecond }) : t('1 ataque a cada {s} s', { s: f(def.cooldown) });
  return `<b>${t('Como luta:')}</b> ${t('{rhythm}, {where} (alcance {r}).', { rhythm, where: whereText(def.range, def.classe === 'melee', 110), r: def.range })}`;
}

/** A mecânica própria da criatura (o termo definido uma vez), ou vazio se ela não tem. */
export function mechanicHtml(def: CreatureDef): string {
  if (def.ability.kind === 'none' && !def.effects?.length) return '';
  return termHtml(abilityText(def.ability, def.effects));
}

/** O que uma forma (ou Suprema) muda, curto: só os números quando a mecânica é a mesma da base. */
function changeText(def: CreatureDef, ability: CreatureAbility, stats: AscendedForm['stats'], effects?: readonly HitEffect[]): string {
  const base = def.ability;
  let mech: string;
  if (ability.kind === 'frenzy' && base.kind === 'frenzy') {
    mech = t('Frenesi a cada {n} golpes, {s} s, +{d}% de dano', { n: ability.hitsToTrigger, s: f(ability.duration), d: Math.round((ability.damageMultiplier - 1) * 100) });
  } else if (ability.kind === 'multishot') {
    mech = t('{n} alvos por disparo', { n: ability.targets });
  } else if (ability.kind === 'crit') {
    mech = `<b>${t('Crítico:')}</b> ${t('{c} de chance de ×{x} de dano', { c: pctOf(ability.chance), x: f(ability.multiplier) })}`;
  } else {
    mech = termHtml(abilityText(ability, effects ?? def.effects)).replace(/\.$/, '');
  }
  const extra = formStatsText({ stats } as AscendedForm).replace(/^ \((.*)\)$/, '$1');
  return extra ? `${mech}; ${extra}.` : `${mech}.`;
}

/**
 * Evoluções na Coleção, em linhas de altura fixa (alinhadas entre fichas): retrato da evolução (A/B),
 * nome e frase curta (até 2 linhas), e a desperta ★5 na linha de baixo. Texto inteiro e números no balão.
 * `portrait(i)` devolve o retrato da evolução i.
 */
export function evolutionRowsHtml(def: CreatureDef, portrait: (i: number) => string): string {
  return def.ascended
    .map((form, i) => {
      const sup = form.supreme;
      // balão em dois blocos (nível 3 e desperta ★5): nome, frase e os números numa faixa destacada
      const block = (level: string, name: string, text: string, numbers: string, awake = false) =>
        `<div class="tip-block${awake ? ' awake' : ''}"><p class="tip-head"><small>${level}</small><b>${name}</b></p><p>${text}</p><p class="tip-nums">${numbers}</p></div>`;
      const tip =
        block(`${i === 0 ? 'A' : 'B'} · ${t('nível 3')}`, form.name, form.description, changeText(def, form.ability, form.stats, form.effects)) +
        (sup ? block(`✦ ${t('Desperta ★5')}`, sup.name, sup.description, changeText(def, sup.ability ?? form.ability, sup.stats ?? form.stats, sup.effects ?? form.effects), true) : '');
      return `<div class="evo-row" style="--branch-color:${form.color}">
        ${portrait(i)}
        <div class="evo-text">
          <p class="evo-main"><span class="branch-tag">${i === 0 ? 'A' : 'B'}</span> <b>${form.name}</b>: ${form.description}</p>
          ${sup ? `<p class="evo-awake">✦ ${t('Desperta ★5')} · <b>${sup.name}</b></p>` : '<p class="evo-awake"></p>'}
        </div>
        <button type="button" class="evo-info" data-toggle-tip title="${t('Ver detalhes e números')}">i</button>
        <div class="tip"><button type="button" class="tip-close" data-close-tip title="${t('Fechar')}">✕</button>${tip}</div>
      </div>`;
    })
    .join('');
}

/** As evoluções (nível 3) com as despertas (★5) logo abaixo, com os números (tooltip da barra de invocar). */
export function formsChangeHtml(def: CreatureDef): string {
  const line = (cls: string, head: string, desc: string, nums: string) => `<p class="${cls}">${head}: ${desc} <span class="sheet-num">${nums}</span></p>`;
  return def.ascended
    .map((form, i) => {
      const sup = form.supreme;
      const supLine = sup
        ? line('sheet-supreme', `✦ ${t('Desperta ★5')} · <b>${sup.name}</b>`, sup.description, changeText(def, sup.ability ?? form.ability, sup.stats ?? form.stats, sup.effects ?? form.effects))
        : '';
      return `<div class="sheet-form" style="--branch-color:${form.color}">
        ${line('', `<span class="branch-tag">${i === 0 ? 'A' : 'B'}</span> <b>${form.name}</b>`, form.description, changeText(def, form.ability, form.stats, form.effects))}
        ${supLine}
      </div>`;
    })
    .join('');
}

export function creatureStats(def: CreatureDef): [string, string][] {
  return [
    [t('Dano'), f(def.damage)],
    [t('Alcance'), f(def.range)],
    [t('Recarga'), `${f(def.cooldown)} s`],
    [t('Custo'), t('{n} ouro', { n: def.baseCost })],
  ];
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Efeito total de um talento num nível, em texto (ex.: "+30 vida do Nexus"). */
export function talentEffectText(kind: TalentEffectKind, value: number): string {
  const v = value;
  switch (kind) {
    case 'nexusMaxHp':
      return t('+{v} de vida do Nexus', { v });
    case 'nexusHeal':
      return t('+{v} de cura entre ondas', { v });
    case 'nexusRegen':
      return t('{v} de vida por segundo', { v: f(v) });
    case 'nexusWard':
      return v > 0 ? t('Anula o 1º golpe de cada onda') : t('Inativa');
    case 'nexusUpgradeDiscount':
      return t('−{p} no custo das melhorias do Nexus', { p: pct(v) });
    case 'startNexusBolt':
      return v > 0 ? t('Raio do Nexus nível 1 desde o início') : t('Inativo');
    case 'startNexusField':
      return v > 0 ? t('Campo de Lentidão nível 1 desde o início') : t('Inativo');
    case 'startNexusShield':
      return v > 0 ? t('Escudo do Nexus nível 1 desde o início') : t('Inativo');
    case 'heroMaxHp':
      return t('+{v} de vida do herói', { v });
    case 'startGold':
      return t('+{v} de ouro inicial', { v });
    case 'incomeInterval':
      return t('+1 ouro a cada {s} s', { s: f(ECONOMY.passiveIncome.interval - v) });
    case 'evolveDiscount':
      return t('−{p} no custo de evoluir', { p: pct(v) });
    case 'killGold':
      return t('+{p} de ouro por abate', { p: pct(v) });
    case 'damage':
      return t('+{p} de dano', { p: pct(v) });
    case 'attackSpeed':
      return t('+{p} de velocidade de ataque', { p: pct(v) });
    case 'range':
      return t('+{p} de alcance', { p: pct(v) });
    case 'creatureSlots':
      return t('+{v} vaga de criatura', { v });
    case 'heroDamage':
      return t('+{p} de dano do herói', { p: pct(v) });
    case 'pulseCooldown':
      return t('−{p} na recarga do Pulso', { p: pct(v) });
    case 'heroSpeed':
      return t('+{p} de velocidade do herói', { p: pct(v) });
    case 'pulseRadius':
      return t('+{p} de raio do Pulso', { p: pct(v) });
    case 'essenceGain':
      return t('+{p} de Essência por run', { p: pct(v) });
    case 'victoryEssence':
      return t('+{v} de Essência ao vencer', { v });
    case 'essencePerWave':
      return t('+{v} de Essência por onda', { v });
    case 'heroRespawn':
      return t('Herói renasce {p} mais rápido', { p: pct(v) });
    case 'heroXp':
      return t('+{p} de XP do herói', { p: pct(v) });
  }
}

/** Bônus do herói para as criaturas da raça dele, em texto. */
export function raceBonusText(race: string, bonus: RaceBonus): string {
  const who = t('Criaturas da raça {race}', { race: t(race) });
  const p = Math.round(bonus.value * 100);
  switch (bonus.kind) {
    case 'range':
      return `${who}: ${t('+{p}% de alcance.', { p })}`;
    case 'damage':
      return `${who}: ${t('+{p}% de dano.', { p })}`;
    case 'killHeal':
      return `${who}: ${t('cada abate cura {n} de vida do herói.', { n: bonus.value })}`;
    case 'attackSpeed':
      return `${who}: ${t('+{p}% de velocidade de ataque.', { p })}`;
    case 'armorPierce':
      return `${who}: ${t('ignoram {n} de armadura.', { n: bonus.value })}`;
    case 'poisonDuration':
      return `${who}: ${t('venenos, poças e efeitos de golpe duram +{n} s.', { n: bonus.value })}`;
    case 'critChance':
      return `${who}: ${t('+{p}% de chance de crítico.', { p })}`;
    case 'vsStrong':
      return `${who}: ${t('+{p}% de dano contra elites e chefes.', { p })}`;
  }
}

/** Ataque básico do herói, em texto (o ritmo e o alcance ficam no "Como luta"). */
export function attackText(def: HeroDef): string {
  const a = def.attack;
  const main = a.pattern.kind === 'cone' ? t('{d} de dano em leque (todos à frente).', { d: a.damage }) : t('{d} de dano num alvo.', { d: a.damage });
  const extra =
    (a.healPerHit > 0 ? ` <b>${t('Roubo de vida:')}</b> ${t('cada golpe cura {n} de vida do herói.', { n: f(a.healPerHit) })}` : '') +
    (a.pierceArmor ? ` ${t('Ignora a armadura dos inimigos.')}` : '');
  return main + extra;
}

/** "Como luta" do herói: ritmo e distância, a partir dos atributos. */
export function heroFightText(def: HeroDef): string {
  const a = def.attack;
  const perSecond = f(Math.round((1 / a.cooldown) * 10) / 10);
  return `<b>${t('Como luta:')}</b> ${t('{n} golpes por segundo, {where} (alcance {r}).', { n: perSecond, where: whereText(a.range, false, 100), r: a.range })}`;
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
  const d = f(p.damage);
  const term = (name: string) => `<b>${t(name)}</b>`;
  let what: string;
  switch (e.kind) {
    case 'burst':
      what = t('explosão de {d} de dano num raio de {r}.', { d, r: p.radius });
      break;
    case 'charge':
      what = `${t('avança {n} com o escudo na direção da mira, causando {d} de dano em quem está no caminho.', { n: e.length, d })} ${term('Arremesso:')} ${t('joga o inimigo {n} para longe do Nexus (chefes resistem).', { n: e.knockback })}`;
      break;
    case 'glide':
      what = t('desliza translúcido {n} na direção da mira em {s} s: {d} de dano em quem atravessa.', { n: e.length, s: f(e.duration), d });
      break;
    case 'cone':
      what = t('leque à frente (alcance {n}): {d} de dano.', { n: e.length, d });
      break;
    case 'swarm':
      what = `${t('morcegos caçam os {n} inimigos mais próximos (até {r}), causando {d} de dano.', { n: e.count, r: e.range, d })} ${term('Sangramento:')} ${t('o inimigo perde {dps} de vida por segundo por {s} s.', { dps: f(e.bleed.dps), s: f(e.bleed.duration) })}`;
      break;
    case 'flame':
      what = `${t('jato de fogo por {s} s que segue a mira (alcance {n}), causando {d} de dano por segundo.', { s: f(e.duration), n: e.length, d })} ${term('Queimadura:')} ${t('quem é atingido continua perdendo {dps} de vida por segundo por {s} s.', { dps: f(e.burn.dps), s: f(e.burn.duration) })}`;
      break;
    case 'transform':
      what = `${term('Fúria:')} ${t('vira um lobisomem gigante por {s} s, que ataca {as} mais rápido, com +{dmg} de dano, em leque, e cada golpe cura {ls} do dano. Ao transformar, uiva ({d} de dano num raio de {r}).', {
        s: f(e.duration),
        as: pctOf(e.attackSpeed),
        dmg: pctOf(e.damage),
        ls: pctOf(e.lifesteal),
        d,
        r: p.radius,
      })}`;
      break;
    case 'hex':
      what = `${term('Sapo:')} ${t('inimigos comuns num raio de {r} viram sapos por {s} s, que andam devagar, levam +{v} de dano e não ferem o herói nem o Nexus. Chefes só levam {d} de dano.', {
        r: p.radius,
        s: f(e.duration),
        v: pctOf(e.vulnerable),
        d,
      })}`;
      break;
    case 'haste':
      what = t('todas as criaturas atacam {a} mais rápido por {s} s; {d} de dano num raio de {r}.', { a: pctOf(e.amount), s: f(e.duration), d, r: p.radius });
      break;
    case 'fissure':
      what = `${t('soca o chão e abre uma fenda de {n} na direção da mira: {d} de dano; a fenda fica {s} s no chão.', { n: e.length, d, s: f(e.duration) })} ${term('Lentidão:')} ${t('quem passa por ela anda {p} mais devagar.', { p: pctOf(e.slow) })}`;
      break;
    case 'raise':
      what = t('ergue até {n} esqueletos aliados onde inimigos morreram nos últimos segundos (sem corpos, {fb} ao redor do herói) por {s} s.', { n: e.count, fb: e.fallback, s: f(e.duration) });
      break;
    case 'meteors':
      what = `${t('{n} meteoros caem em sequência ao redor da mira, com {d} de dano cada (raio {r}).', { n: e.count, d, r: e.radius })} ${term('Queimadura:')} ${t('o chão fica em chamas, e quem pisa perde {dps} de vida por segundo por {s} s.', { dps: f(e.burn.dps), s: f(e.burn.duration) })}`;
      break;
    case 'rainbow':
      what = `${t('feixe de arco-íris de {n} na direção da mira, causando {d} de dano.', { n: e.length, d })} ${term('Encanto:')} ${t('inimigos comuns atingidos lutam do seu lado por {s} s (chefes resistem).', { s: f(e.charm) })}`;
      break;
    case 'judgment':
      what = `${t('após {delay} s, uma coluna de luz desce na mira, causando {d} de dano (raio {r}).', { delay: f(e.delay), d, r: e.radius })} ${term('Marca:')} ${t('quem é atingido recebe +{p} de dano por {s} s.', { p: pctOf(e.mark.amount), s: f(e.mark.duration) })}`;
      break;
  }
  const extras = [
    p.stun ? `${term(p.stun.look === 'stone' ? 'Petrificar:' : 'Atordoar:')} ${t('os atingidos ficam parados por {s} s (chefes resistem).', { s: f(p.stun.duration) })}` : '',
    p.fear ? `${term('Medo:')} ${t('os atingidos fogem do Nexus por {s} s.', { s: f(p.fear) })}` : '',
    p.healPerEnemy > 0 ? t('Cura {n} de vida do herói por inimigo atingido.', { n: p.healPerEnemy }) : '',
    p.selfDamage ? t('Custa {p} da vida do herói.', { p: pctOf(p.selfDamage) }) : '',
    p.damage > 0 && !live ? t('O dano cresce +10% por nível do herói.') : '',
    live && base.damage > 0 && p.damage !== base.damage ? t('(dano base {d}; nível e melhorias ×{x})', { d: base.damage, x: f(Math.round(live.power * 100) / 100) }) : '',
  ].filter(Boolean);
  return `<b>${p.name}</b> (${t('recarga {s} s', { s: f(p.cooldown) })}): ${what}${extras.length ? ' ' + extras.join(' ') : ''}`;
}

const pctText = (v: number) => `${Math.round(v * 100)}%`;

/** Total de um atributo de melhoria do herói, em texto curto (ex.: "+36% de alcance"). */
export function heroStatText(stat: HeroStat, value: number): string {
  const p = pctText(value);
  switch (stat) {
    case 'damage':
      return t('+{p} de dano', { p });
    case 'attackSpeed':
      return t('+{p} de vel. de ataque', { p });
    case 'range':
      return t('+{p} de alcance', { p });
    case 'maxHp':
      return t('+{n} de vida máxima', { n: f(value) });
    case 'regen':
      return t('+{n} de vida/s', { n: f(Math.round(value * 10) / 10) });
    case 'speed':
      return t('+{p} de velocidade', { p });
    case 'pulseCooldown':
      return t('−{p} na recarga do Pulso', { p });
    case 'pulseDamage':
      return t('+{p} de dano do Pulso', { p });
    case 'lifesteal':
      return t('{p} do dano vira vida', { p });
    case 'thorns':
      return t('{n} de dano/s em quem encosta', { n: f(value) });
    case 'armor':
      return t('−{p} de dano recebido', { p: pctText(Math.min(0.6, value)) });
    case 'pickup':
      return t('+{p} no raio do ímã de moedas e baús', { p });
    case 'pulseSize':
      return t('Pulso +{p} maior', { p });
    case 'pulseEcho':
      return t('{p} de chance de eco do Pulso', { p });
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
  const tal = run.talents;
  const damage = def.attack.damage * run.modifiers.damage * (1 + tal.heroDamage + s.damage);
  const perSecond = (run.modifiers.attackSpeed + s.attackSpeed) / def.attack.cooldown;
  const rows: [string, string][] = [
    [t('Nível'), `${run.hero.level}`],
    [t('Vida'), `${Math.ceil(run.hero.hp)}/${Math.round(heroMaxHp(run))}`],
    [t('Dano'), f(Math.round(damage * 10) / 10)],
    [t('Ataques/s'), f(Math.round(perSecond * 100) / 100)],
    [t('Alcance'), `${Math.round(heroRange(run))}`],
    [t('Velocidade'), `${Math.round(def.speed * (1 + tal.heroSpeed + s.speed))}`],
  ];
  if (run.modifiers.critChance > 0) rows.push([t('Crítico'), `${Math.round(run.modifiers.critChance * 100)}%`]);
  if (s.regen > 0) rows.push([t('Regeneração'), `${f(Math.round(s.regen * 10) / 10)}/s`]);
  if (s.lifesteal > 0) rows.push([t('Roubo de vida'), `${Math.round(s.lifesteal * 100)}%`]);
  if (s.armor > 0) rows.push([t('Couraça'), t('−{p} de dano', { p: `${Math.round(Math.min(0.6, s.armor) * 100)}%` })]);
  if (s.thorns > 0) rows.push([t('Espinhos'), `${f(s.thorns)}/s`]);
  if (def.pulse.damage > 0) rows.push([t('Dano do Pulso'), `${Math.round(def.pulse.damage * pulsePower(run))}`]);
  rows.push([t('Recarga do Pulso'), `${f(Math.round(run.pulse.cooldown * 10) / 10)} s`]);
  return rows;
}

export function heroSheetHtml(run: RunState): string {
  return `<dl class="hero-sheet-list">${heroSheetRows(run)
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('')}</dl>`;
}

/** Passiva da raça em HTML (vazio se a raça não tiver). */
export function racePassiveHtml(race: string, className = 'cc-ability race-passive'): string {
  const def = RACE_PASSIVES[race];
  if (!def) return '';
  const p = def.passive;
  const text =
    p.kind === 'evolveDiscount'
      ? t('evolui {p} mais barato', { p: pctText(p.value) })
      : p.kind === 'pure'
        ? t('imune a teia, maldição, atordoamento, congelamento e a ser engolido')
        : t('golpes ignoram armadura e agarram o alvo por {s} s: ele fica {p} mais lento e não desliza no gelo', { s: f(p.duration), p: pctText(p.slow) }) +
          (p.leap ? t('. Sem inimigo no alcance, salta até um a {r} de distância, golpeia com {x}× de dano e volta (a cada {s} s)', { r: p.leap.range, x: f(p.leap.damage), s: f(p.leap.cooldown) }) : '');
  return `<p class="${className}"><b>${def.name}</b> (${t('raça {race}', { race: t(race) })}): ${text}.</p>`;
}
