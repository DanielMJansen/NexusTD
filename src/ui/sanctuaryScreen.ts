import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { ALL_CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { SUPREME_PER_RUN } from '../data/evolution';
import { SANCTUARY, sanctuaryCost } from '../data/sanctuary';
import { canAwaken, type Profile } from '../game/profile';
import { racesInOrder } from './collection';
import { crystals, fragments } from './currency';
import { showOverlay } from './overlay';
import { showIntro } from './stageIntro';

export interface SanctuaryHandlers {
  onUpgrade(id: CreatureId): void;
  onBack(): void;
  /** Rever o tutorial do Santuário. */
  onHelp(): void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Tutorial do Santuário (primeira visita e botão "Como funciona"); textos tirados dos dados. */
export function showSanctuaryIntro(onClose: () => void, closeLabel = 'Entendi'): void {
  showIntro(
    {
      kicker: 'Progresso permanente',
      title: 'Santuário',
      subtitle: 'Fortaleça suas criaturas para sempre e desperte as melhores.',
      color: '#6af0d0',
      tips: [
        { icon: '❖', title: 'Fragmentos', text: `Caem a partir da Fase 2, das raças que você usa na run: ondas vencidas + ${SANCTUARY.perBoss} por chefe.` },
        { icon: '★', title: 'Níveis', text: `Cada nível dá +${pct(SANCTUARY.damagePerLevel)} de dano e +${pct(SANCTUARY.attackSpeedPerLevel)} de velocidade de ataque à criatura, em toda run (até o nível ${SANCTUARY.maxLevel}).` },
        { icon: '◆', title: 'Cristais Ancestrais', text: `Raros: ${SANCTUARY.crystalsPerVictory} por vitória da Fase 2 em diante e 1 a cada ${SANCTUARY.crystalEveryEndlessWaves} ondas do Sem Fim.` },
        { icon: '✦', title: 'Despertar', text: `No nível ${SANCTUARY.maxLevel}, por ${SANCTUARY.awakenCost} ❖ + ${SANCTUARY.awakenCrystals} ◆: +${pct(SANCTUARY.awakenBonus)} de dano e de velocidade em toda run.` },
        { icon: '👑', title: 'Forma Suprema', text: `Na run, uma criatura desperta pode chegar a ★5 e virar a Forma Suprema da vertente: efeito e visual únicos. Até ${SUPREME_PER_RUN} por run; as outras param em ★4.` },
      ],
    },
    onClose,
    closeLabel,
  );
}

/** Bônus total (níveis + despertar), curto. */
function bonusText(level: number, awakened: boolean): string {
  if (!level) return 'Sem bônus ainda';
  const extra = awakened ? SANCTUARY.awakenBonus : 0;
  return `+${pct(SANCTUARY.damagePerLevel * level + extra)} dano · +${pct(SANCTUARY.attackSpeedPerLevel * level + extra)} vel.`;
}

function pipsHtml(level: number, awakened: boolean): string {
  const pips = Array.from({ length: SANCTUARY.maxLevel }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
  return `<span class="sanc-pips">${pips}${level >= SANCTUARY.maxLevel ? `<i class="awake${awakened ? ' on' : ''}" title="Despertar">✦</i>` : ''}</span>`;
}

function footerHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  const race = CREATURES[id].race;
  if (cost === null) {
    if (profile.awakened.includes(id)) return '<span class="sanc-supreme">👑 Forma Suprema em ★5</span>';
    return `<button class="awaken-button" data-action="ask" data-value="${id}"${canAwaken(profile, id) ? '' : ' disabled'}>✦ Despertar <span>${fragments(SANCTUARY.awakenCost)} ${crystals(SANCTUARY.awakenCrystals)}</span></button>`;
  }
  const enough = (profile.fragments[race] ?? 0) >= cost;
  return `<button data-action="ask" data-value="${id}"${enough ? '' : ' disabled'}>Fortalecer ${fragments(cost)}</button>`;
}

function confirmHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const awaken = sanctuaryCost(level) === null;
  const cost = sanctuaryCost(level) ?? SANCTUARY.awakenCost;
  return `<div class="cc-confirm">
    <span>${awaken ? `Despertar por ${fragments(cost)} + ${crystals(SANCTUARY.awakenCrystals)}?` : `Nível ${level + 1} por ${fragments(cost)}?`}</span>
    <button data-action="cancel" data-value="${id}">Cancelar</button>
    <button class="play-button" data-action="buy" data-value="${id}">Confirmar</button>
  </div>`;
}

function cardHtml(profile: Profile, id: CreatureId, highlight?: CreatureId): string {
  const def = CREATURES[id];
  const level = profile.sanctuary[id] ?? 0;
  const awakened = profile.awakened.includes(id);
  return `<div class="sanc-card${awakened ? ' awakened' : ''}${highlight === id ? ' just-unlocked' : ''}" data-card="${id}" style="--card-color:${def.color}">
    <div class="sanc-portrait"><canvas data-sprite="${id}"></canvas>${awakened ? '<span class="sanc-seal" title="Desperta">✦</span>' : ''}</div>
    <div class="sanc-info">
      <b>${def.name}</b>
      ${pipsHtml(level, awakened)}
      <small>${bonusText(level, awakened)}</small>
      <div class="cc-footer">${footerHtml(profile, id)}</div>
    </div>
  </div>`;
}

/** Santuário: nível permanente das criaturas da coleção, pago com Fragmentos da raça; no máximo, Despertar. */
export function showSanctuary(profile: Profile, handlers: SanctuaryHandlers, highlight?: CreatureId): void {
  const races = racesInOrder(profile).filter((race) => ALL_CREATURE_IDS.some((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id)));
  const tabs: Tab[] = races.map((race) => ({ id: race, label: race, badge: `${profile.fragments[race] ?? 0} ❖`, color: CREATURES[ALL_CREATURE_IDS.find((id) => CREATURES[id].race === race)!].color }));
  if (highlight) setTab('sanctuary', CREATURES[highlight].race);
  const race = currentTab('sanctuary', tabs);
  const owned = ALL_CREATURE_IDS.filter((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id));
  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen sanctuary-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Santuário</h2>
        <button data-action="help">? Como funciona</button>
      </div>
      <div class="sanc-balance">${fragments(profile.fragments[race] ?? 0, race)} <span>·</span> ${crystals(profile.crystals)} <small>Cristais Ancestrais</small></div>
      ${tabsHtml(tabs, race)}
      <div class="sanc-grid">${owned.map((id) => cardHtml(profile, id, highlight)).join('')}</div>
    </div>`,
    {
      ask: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = confirmHtml(profile, id as CreatureId);
      },
      cancel: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = footerHtml(profile, id as CreatureId);
      },
      buy: (id) => handlers.onUpgrade(id as CreatureId),
      tab: (id) => {
        setTab('sanctuary', id);
        showSanctuary(profile, handlers);
      },
      help: () => handlers.onHelp(),
      back: () => handlers.onBack(),
    },
    { keepScroll: highlight !== undefined },
  );
}
