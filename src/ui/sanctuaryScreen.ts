import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { ALL_CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { SUPREME_PER_RUN } from '../data/evolution';
import { SANCTUARY, sanctuaryCost } from '../data/sanctuary';
import { canAwaken, type Profile } from '../game/profile';
import { racesInOrder } from './collection';
import { crystals, fragments } from './currency';
import { showOverlay } from './overlay';
import { showIntro } from './stageIntro';
import { t } from '../i18n/i18n';

export interface SanctuaryHandlers {
  onUpgrade(id: CreatureId): void;
  onBack(): void;
  /** Rever o tutorial do Santuário. */
  onHelp(): void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Tutorial do Santuário (primeira visita e botão "Como funciona"); textos tirados dos dados. */
export function showSanctuaryIntro(onClose: () => void, closeLabel = t('Entendi')): void {
  showIntro(
    {
      kicker: t('Progresso permanente'),
      title: t('Santuário'),
      subtitle: t('Fortaleça suas criaturas para sempre e desperte as melhores.'),
      color: '#6af0d0',
      demo: 'sanctuary',
      tips: [
        { icon: '❖', title: t('Fragmentos'), text: t('Caem a partir da Fase 2, das raças que você usa na run: ondas vencidas + {n} por chefe.', { n: SANCTUARY.perBoss }) },
        {
          icon: '★',
          title: t('Níveis'),
          text: t('Cada nível dá +{d} de dano e +{s} de velocidade de ataque à criatura, em toda run (até o nível {max}).', {
            d: pct(SANCTUARY.damagePerLevel),
            s: pct(SANCTUARY.attackSpeedPerLevel),
            max: SANCTUARY.maxLevel,
          }),
        },
        {
          icon: '◆',
          title: t('Cristais Ancestrais'),
          text: t('Raros: {n} por vitória da Fase 2 em diante e 1 a cada {w} ondas do Sem Fim.', { n: SANCTUARY.crystalsPerVictory, w: SANCTUARY.crystalEveryEndlessWaves }),
        },
        {
          icon: '✦',
          title: t('Despertar'),
          text: t('No nível {max}, por {f} ❖ + {c} ◆: +{p} de dano e de velocidade em toda run.', {
            max: SANCTUARY.maxLevel,
            f: SANCTUARY.awakenCost,
            c: SANCTUARY.awakenCrystals,
            p: pct(SANCTUARY.awakenBonus),
          }),
        },
        {
          icon: '👑',
          title: t('Forma Suprema'),
          text: t('Na run, uma criatura desperta pode chegar a ★5 e virar a Forma Suprema da vertente: efeito e visual únicos. Até {n} por run; as outras param em ★4.', { n: SUPREME_PER_RUN }),
        },
      ],
    },
    onClose,
    closeLabel,
  );
}

/** Bônus total (níveis + despertar), curto. */
function bonusText(level: number, awakened: boolean): string {
  if (!level) return t('Sem bônus ainda');
  const extra = awakened ? SANCTUARY.awakenBonus : 0;
  return t('+{d} dano · +{s} vel.', { d: pct(SANCTUARY.damagePerLevel * level + extra), s: pct(SANCTUARY.attackSpeedPerLevel * level + extra) });
}

function pipsHtml(level: number, awakened: boolean): string {
  const pips = Array.from({ length: SANCTUARY.maxLevel }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
  return `<span class="sanc-pips">${pips}${level >= SANCTUARY.maxLevel ? `<i class="awake${awakened ? ' on' : ''}" title="${t('Despertar')}">✦</i>` : ''}</span>`;
}

function footerHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  const race = CREATURES[id].race;
  if (cost === null) {
    if (profile.awakened.includes(id)) return `<span class="sanc-supreme">👑 ${t('Forma Suprema em ★5')}</span>`;
    return `<button class="awaken-button" data-action="ask" data-value="${id}"${canAwaken(profile, id) ? '' : ' disabled'}>✦ ${t('Despertar')} <span>${fragments(SANCTUARY.awakenCost)} ${crystals(SANCTUARY.awakenCrystals)}</span></button>`;
  }
  const enough = (profile.fragments[race] ?? 0) >= cost;
  return `<button data-action="ask" data-value="${id}"${enough ? '' : ' disabled'}>${t('Fortalecer')} ${fragments(cost)}</button>`;
}

function confirmHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const awaken = sanctuaryCost(level) === null;
  const cost = sanctuaryCost(level) ?? SANCTUARY.awakenCost;
  return `<div class="cc-confirm">
    <span>${awaken ? t('Despertar por {f} + {c}?', { f: fragments(cost), c: crystals(SANCTUARY.awakenCrystals) }) : t('Nível {n} por {f}?', { n: level + 1, f: fragments(cost) })}</span>
    <button data-action="cancel" data-value="${id}">${t('Cancelar')}</button>
    <button class="play-button" data-action="buy" data-value="${id}">${t('Confirmar')}</button>
  </div>`;
}

function cardHtml(profile: Profile, id: CreatureId, highlight?: CreatureId): string {
  const def = CREATURES[id];
  const level = profile.sanctuary[id] ?? 0;
  const awakened = profile.awakened.includes(id);
  return `<div class="sanc-card${awakened ? ' awakened' : ''}${highlight === id ? ' just-unlocked' : ''}" data-card="${id}" style="--card-color:${def.color}">
    <div class="sanc-portrait"><canvas data-sprite="${id}"></canvas>${awakened ? `<span class="sanc-seal" title="${t('Desperta')}">✦</span>` : ''}</div>
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
  const tabs: Tab[] = races.map((race) => ({ id: race, label: t(race), badge: `${profile.fragments[race] ?? 0} ❖`, color: CREATURES[ALL_CREATURE_IDS.find((id) => CREATURES[id].race === race)!].color }));
  if (highlight) setTab('sanctuary', CREATURES[highlight].race);
  const race = currentTab('sanctuary', tabs);
  const owned = ALL_CREATURE_IDS.filter((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id));
  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen sanctuary-screen">
      <div class="screen-head">
        <button data-action="back">${t('← Voltar')}</button>
        <h2>${t('Santuário')}</h2>
        <button data-action="help">${t('Como funciona?')}</button>
      </div>
      <div class="sanc-balance">${fragments(profile.fragments[race] ?? 0, race)} <span>·</span> ${crystals(profile.crystals)} <small>${t('Cristais Ancestrais')}</small></div>
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
