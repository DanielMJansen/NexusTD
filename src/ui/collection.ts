import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { VARIANTS, type VariantTier } from '../data/altar';
import { CREATURES, CREATURE_IDS, type CreatureDef, type CreatureId } from '../data/creatures';
import { ownsCreature, type Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
import { abilityText, ascendedFormsHtml, creatureStats } from './describe';
import { showOverlay } from './overlay';

export interface CollectionHandlers {
  onBuy(id: CreatureId): void;
  onVariant(id: CreatureId, tier: VariantTier | null): void;
  onBack(): void;
}

/** Raças na ordem em que aparecem nos dados. */
export function racesInOrder(): string[] {
  return [...new Set(CREATURE_IDS.map((id) => CREATURES[id].race))];
}

/** Variantes do Altar já obtidas: clicar escolhe a usada na arena. */
function variantRow(profile: Profile, id: CreatureId): string {
  const owned = profile.variants[id] ?? [];
  if (!owned.length) return '';
  const current = profile.selectedVariants[id] ?? '';
  const button = (tier: VariantTier | '', label: string, color: string) =>
    `<button class="variant-chip${current === tier ? ' selected' : ''}" style="--chip-color:${color}" data-action="variant" data-value="${id}:${tier}">${label}</button>`;
  return `<div class="variant-row"><span>Variante:</span>${button('', 'Normal', '#9a8ab8')}${owned.map((t) => button(t, VARIANTS[t].name, VARIANTS[t].color)).join('')}</div>`;
}

/** Rodapé do card: na equipe/coleção ou o botão de desbloquear. */
function footerHtml(profile: Profile, def: CreatureDef): string {
  if (ownsCreature(profile, def.id)) return `<span class="cc-tag">${profile.team.includes(def.id) ? '✓ Na equipe' : '✓ Na coleção'}</span>`;
  if (def.unlock.kind !== 'essence') return '';
  return `<button data-action="ask" data-value="${def.id}"${profile.essence >= def.unlock.cost ? '' : ' disabled'}>
      Desbloquear ${essence(def.unlock.cost)}</button>`;
}

function cardHtml(profile: Profile, def: CreatureDef, justUnlocked: boolean): string {
  const owned = ownsCreature(profile, def.id);
  const stats = creatureStats(def)
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');
  const footer = footerHtml(profile, def);
  return `<div class="creature-card${owned ? '' : ' locked'}${justUnlocked ? ' just-unlocked' : ''}" data-card="${def.id}" style="--card-color:${def.color}">
    <div class="cc-portraits">
      <canvas data-sprite="${def.id}"${owned ? (profile.selectedVariants[def.id] ? ` data-variant="${profile.selectedVariants[def.id]}"` : '') : ' data-silhouette'}></canvas>
      <span class="cc-evolve-label">Nível 3</span>
      <div class="cc-branches">${def.ascended
        .map(
          (form, i) => `<figure style="--branch-color:${form.color}">
            <canvas data-sprite="${def.id}" data-level="3" data-branch="${i}"${owned ? '' : ' data-silhouette'}></canvas>
            <figcaption>${form.icon} ${form.name}</figcaption>
          </figure>`,
        )
        .join('')}</div>
    </div>
    <div class="cc-body">
      <div class="cc-head"><b>${def.name}</b><span>${def.race} · ${def.role}</span></div>
      <p class="cc-desc">${def.description}</p>
      <p class="cc-lore">“${def.lore}”</p>
      <dl class="cc-stats">${stats}</dl>
      <p class="cc-ability">${abilityText(def.ability, def.effects)}</p>
      ${ascendedFormsHtml(def)}
      ${variantRow(profile, def.id)}
      <div class="cc-footer">${footer}</div>
    </div>
  </div>`;
}

/**
 * Coleção: ficha de cada criatura, agrupada por raça; desbloqueio com Essência (pede confirmação).
 * justUnlocked: criatura recém-liberada; a tela é redesenhada na mesma posição, com ela em destaque.
 */
export function showCollection(profile: Profile, handlers: CollectionHandlers, justUnlocked?: CreatureId): void {
  // uma raça por aba (com quantas criaturas dela o jogador já tem)
  const tabs: Tab[] = racesInOrder().map((race) => {
    const ids = CREATURE_IDS.filter((id) => CREATURES[id].race === race);
    return { id: race, label: race, badge: `${ids.filter((id) => profile.ownedCreatures.includes(id)).length}/${ids.length}`, color: CREATURES[ids[0]!].color };
  });
  if (justUnlocked) setTab('collection', CREATURES[justUnlocked].race);
  const race = currentTab('collection', tabs);
  const cards = CREATURE_IDS.filter((id) => CREATURES[id].race === race)
    .map((id) => cardHtml(profile, CREATURES[id], id === justUnlocked))
    .join('');
  const groups = `${tabsHtml(tabs, race)}<div class="creature-grid three">${cards}</div>`;

  // troca o rodapé de um card entre o botão de desbloquear e a confirmação, sem redesenhar a tela
  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Coleção</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      ${groups}
    </div>`,
    {
      ask: (id) => {
        const target = footer(id);
        {
          const def = CREATURES[id as CreatureId];
          if (target) target.innerHTML = confirmPurchaseHtml(id, def.unlock.kind === 'essence' ? def.unlock.cost : 0, profile.essence);
        }
      },
      cancel: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = footerHtml(profile, CREATURES[id as CreatureId]);
      },
      buy: (id) => handlers.onBuy(id as CreatureId),
      tab: (id) => {
        setTab('collection', id);
        showCollection(profile, handlers);
      },
      variant: (value) => {
        const [id, tier] = value.split(':');
        handlers.onVariant(id as CreatureId, (tier || null) as VariantTier | null);
      },
      back: () => handlers.onBack(),
    },
    { keepScroll: justUnlocked !== undefined },
  );
}
