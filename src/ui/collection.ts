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

/**
 * Seletor de visual: Normal + as três variantes do Altar, cada uma com o retrato.
 * As que o jogador tem são clicáveis (a escolhida fica destacada); as outras aparecem em silhueta, com onde conseguir.
 */
function visualPickerHtml(profile: Profile, def: CreatureDef): string {
  const owned = profile.variants[def.id] ?? [];
  const selected = profile.selectedVariants[def.id] ?? '';
  const option = (tier: VariantTier | '', name: string, label: string, color: string) => {
    const has = tier === '' || owned.includes(tier);
    const isOn = selected === tier;
    const portrait = `<canvas data-sprite="${def.id}" data-variant="${tier || 'none'}"${has ? '' : ' data-silhouette'}></canvas>`;
    const body = `${portrait}<b>${has ? name : '???'}</b><small>${has ? label : `${label} · Altar`}</small>`;
    return has
      ? `<button class="vp-option${isOn ? ' selected' : ''}" style="--chip-color:${color}" data-action="variant" data-value="${def.id}:${tier}" title="${isOn ? 'Visual em uso' : 'Usar este visual'}">${body}${isOn ? '<span class="vp-check">✓ em uso</span>' : ''}</button>`
      : `<div class="vp-option locked" style="--chip-color:${color}" title="Consiga no Altar">${body}</div>`;
  };
  const options = [
    option('', 'Normal', 'Original', '#9a8ab8'),
    ...VARIANT_TIERS.map((tier) => option(tier, variantTheme(def.id, tier).name, VARIANTS[tier].name, VARIANTS[tier].color)),
  ].join('');
  return `<p class="sheet-section">Visual <small>${owned.length}/3 variantes · clique para usar</small></p><div class="vp-row">${options}</div>`;
}

/** Janela das formas despertas: A, B e as Supremas, no visual em uso. Abre ao passar o mouse no botão ou nos retratos do nível 3. */
function formsPopHtml(profile: Profile, def: CreatureDef): string {
  const tier = profile.selectedVariants[def.id];
  const look = tier ? `${variantTheme(def.id, tier).name} (${VARIANTS[tier].name.toLowerCase()})` : 'visual normal';
  const cols = def.ascended.flatMap((form, i) => [
    { tag: `Nível 3 · ${i === 0 ? 'A' : 'B'}`, name: form.name, branch: i, supreme: false, color: form.color },
    ...(form.supreme ? [{ tag: `✦ Suprema ${i === 0 ? 'A' : 'B'}`, name: form.supreme.name, branch: i, supreme: true, color: form.color }] : []),
  ]);
  const cells = cols
    .map(
      (c) => `<figure style="--branch-color:${c.color}">
        <small>${c.tag}</small>
        <canvas data-sprite="${def.id}" data-level="3" data-branch="${c.branch}"${c.supreme ? ' data-supreme' : ''} data-variant="${tier ?? 'none'}"></canvas>
        <b>${c.name}</b>
      </figure>`,
    )
    .join('');
  return `<div class="forms-pop">
    <p class="fp-title">Formas despertas de ${def.name} <small>· ${look}</small></p>
    <div class="fp-row-cells">${cells}</div>
    <p class="fp-hint">A Suprema (★5) exige despertar a criatura no Santuário.</p>
  </div>`;
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
      <p class="sheet-section">Formas despertas <small>nível 3</small></p>
      ${formsChangeHtml(def)}
      ${visualPickerHtml(profile, def)}`;
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
      ${def.classe && owned ? `<button class="forms-btn" type="button">👁 Ver formas despertas</button>${formsPopHtml(profile, def)}` : ''}
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
