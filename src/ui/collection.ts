import { variantTheme } from '../data/variantThemes';
import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { VARIANTS, VARIANT_TIERS, type VariantTier } from '../data/altar';
import { ALL_CREATURE_IDS, CREATURES, isGiftCreature, type CreatureDef, type CreatureId } from '../data/creatures';
import { ownsCreature, type Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
import { abilityText, ascendedFormsHtml, creatureClassLine, creatureStats, fightText, formsChangeHtml, mechanicHtml, racePassiveHtml } from './describe';
import { showOverlay } from './overlay';

export interface CollectionHandlers {
  onBuy(id: CreatureId): void;
  onVariant(id: CreatureId, tier: VariantTier | null): void;
  onBack(): void;
}

/** Criaturas que aparecem para este jogador: as públicas e as exclusivas que ele tem. */
export const visibleCreatureIds = (profile: Profile): CreatureId[] =>
  ALL_CREATURE_IDS.filter((id) => !isGiftCreature(id) || profile.ownedCreatures.includes(id));

/** Raças na ordem em que aparecem nos dados (com as exclusivas que o jogador tem). */
export function racesInOrder(profile: Profile): string[] {
  return [...new Set(visibleCreatureIds(profile).map((id) => CREATURES[id].race))];
}

/** Variantes do Altar já obtidas: clicar escolhe a usada na arena. */
function variantRow(profile: Profile, id: CreatureId): string {
  const owned = profile.variants[id] ?? [];
  if (!owned.length) return '';
  const current = profile.selectedVariants[id] ?? '';
  // só o nome da variante no botão (a raridade vem da cor e do título), para caber numa linha
  const button = (tier: VariantTier | '', label: string, color: string, title: string) =>
    `<button class="variant-chip${current === tier ? ' selected' : ''}" style="--chip-color:${color}" title="${title}" data-action="variant" data-value="${id}:${tier}">${label}</button>`;
  return `<div class="variant-row"><span>Variante:</span>${button('', 'Normal', '#9a8ab8', 'Visual original')}${owned.map((t) => button(t, variantTheme(id, t).name, VARIANTS[t].color, `${VARIANTS[t].name} · ${variantTheme(id, t).name}`)).join('')}</div>`;
}

/** Rodapé do card: na equipe/coleção ou o botão de desbloquear. */
function footerHtml(profile: Profile, def: CreatureDef): string {
  if (ownsCreature(profile, def.id)) return `<span class="cc-tag">${profile.team.includes(def.id) ? '✓ Na equipe' : '✓ Na coleção'}</span>`;
  if (def.unlock.kind !== 'essence') return '';
  return `<button data-action="ask" data-value="${def.id}"${profile.essence >= def.unlock.cost ? '' : ' disabled'}>
      Desbloquear ${essence(def.unlock.cost)}</button>`;
}

/** Linha das variantes do Altar (as que o jogador tem ficam marcadas). */
function variantsLineHtml(profile: Profile, def: CreatureDef): string {
  const owned = profile.variants[def.id] ?? [];
  const items = VARIANT_TIERS.map((tier) => {
    const has = owned.includes(tier);
    return `<span class="sheet-variant${has ? ' owned' : ''}" style="--chip-color:${VARIANTS[tier].color}" title="${VARIANTS[tier].name}${has ? ' · você tem' : ''}">${has ? '✓ ' : ''}${variantTheme(def.id, tier).name} <small>(${VARIANTS[tier].name.toLowerCase()})</small></span>`;
  }).join(' · ');
  return `<p class="sheet-variants"><b>Variantes:</b> ${items}</p>`;
}

/** Janela das formas despertas (ao passar o mouse no nível 3): A, B e as Supremas, normal e com cada variante que o jogador tem. */
function formsPopHtml(profile: Profile, def: CreatureDef): string {
  const rows: [string, string][] = [['none', 'Normal'], ...(profile.variants[def.id] ?? []).map((t): [string, string] => [t, variantTheme(def.id, t).name])];
  const cols = def.ascended.flatMap((form, i) => [
    { label: `${i === 0 ? 'A' : 'B'} · ${form.name}`, branch: i, supreme: false, color: form.color },
    ...(form.supreme ? [{ label: `✦ ${form.supreme.name}`, branch: i, supreme: true, color: form.color }] : []),
  ]);
  const head = `<span></span>${cols.map((c) => `<b style="color:${c.color}">${c.label}</b>`).join('')}`;
  const body = rows
    .map(([tier, label]) => `<span class="fp-row">${label}</span>${cols.map((c) => `<canvas data-sprite="${def.id}" data-level="3" data-branch="${c.branch}"${c.supreme ? ' data-supreme' : ''} data-variant="${tier}"></canvas>`).join('')}`)
    .join('');
  const hint = rows.length === 1 ? '<p class="fp-hint">Variantes do Altar aparecem aqui quando você tiver alguma.</p>' : '';
  return `<div class="forms-pop" style="--cols:${cols.length}"><div class="fp-grid">${head}${body}</div>${hint}</div>`;
}

/** Ficha nova (em revisão): classe padronizada, como luta, termo próprio, formas e variantes. */
function newSheetBody(profile: Profile, def: CreatureDef): string {
  const stats = creatureStats(def)
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');
  const mechanic = mechanicHtml(def);
  return `<div class="cc-head"><b>${def.name}</b><span><canvas class="inline-badge" data-race="${def.race}"></canvas>${creatureClassLine(def)}</span></div>
      <p class="cc-desc">${def.description}</p>
      <p class="cc-lore">“${def.lore}”</p>
      <dl class="cc-stats">${stats}</dl>
      <p class="sheet-line">${fightText(def)}</p>
      ${mechanic ? `<p class="sheet-line">${mechanic}</p>` : ''}
      ${racePassiveHtml(def.race)}
      <p class="sheet-section" title="Passe o mouse nos retratos do nível 3 para ver todas as formas">Formas despertas <small>nível 3 · ver todas nos retratos ↖</small></p>
      ${formsChangeHtml(def)}
      ${variantsLineHtml(profile, def)}
      ${variantRow(profile, def.id)}`;
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
            <canvas data-sprite="${def.id}" data-level="3" data-branch="${i}"${owned ? (profile.selectedVariants[def.id] ? ` data-variant="${profile.selectedVariants[def.id]}"` : '') : ' data-silhouette'}></canvas>
            <figcaption>${i === 0 ? 'A' : 'B'} · ${form.name}</figcaption>
          </figure>`,
        )
        .join('')}</div>
      ${def.classe && owned ? formsPopHtml(profile, def) : ''}
    </div>
    <div class="cc-body">
      ${def.classe ? newSheetBody(profile, def) : `<div class="cc-head"><b>${def.name}</b><span><canvas class="inline-badge" data-race="${def.race}"></canvas>${def.race} · ${def.role}</span></div>
      <p class="cc-desc">${def.description}</p>
      <p class="cc-lore">“${def.lore}”</p>
      <dl class="cc-stats">${stats}</dl>
      <p class="cc-ability">${abilityText(def.ability, def.effects)}</p>
      ${racePassiveHtml(def.race)}
      ${ascendedFormsHtml(def)}
      ${variantRow(profile, def.id)}`}
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
  const tabs: Tab[] = racesInOrder(profile).map((race) => {
    const ids = visibleCreatureIds(profile).filter((id) => CREATURES[id].race === race);
    return { id: race, label: race, badge: `${ids.filter((id) => profile.ownedCreatures.includes(id)).length}/${ids.length}`, color: CREATURES[ids[0]!].color };
  });
  if (justUnlocked) setTab('collection', CREATURES[justUnlocked].race);
  const race = currentTab('collection', tabs);
  const cards = visibleCreatureIds(profile).filter((id) => CREATURES[id].race === race)
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
