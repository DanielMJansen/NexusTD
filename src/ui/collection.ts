import { CREATURES, CREATURE_IDS, type CreatureDef, type CreatureId } from '../data/creatures';
import { ownsCreature, type Profile } from '../game/profile';
import { essence } from './currency';
import { abilityText, ascendedFormsHtml, creatureStats } from './describe';
import { showOverlay } from './overlay';

export interface CollectionHandlers {
  onBuy(id: CreatureId): void;
  onBack(): void;
}

/** Raças na ordem em que aparecem nos dados. */
export function racesInOrder(): string[] {
  return [...new Set(CREATURE_IDS.map((id) => CREATURES[id].race))];
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
      <canvas data-sprite="${def.id}"${owned ? '' : ' data-silhouette'}></canvas>
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
      <div class="cc-footer">${footer}</div>
    </div>
  </div>`;
}

/** Confirmação no próprio card: preço e quanto de Essência sobra. */
function confirmHtml(profile: Profile, def: CreatureDef): string {
  const cost = def.unlock.kind === 'essence' ? def.unlock.cost : 0;
  return `<div class="cc-confirm">
    <span>Desbloquear por ${essence(cost)}? Sobram ${essence(profile.essence - cost)}</span>
    <button data-action="cancel" data-value="${def.id}">Cancelar</button>
    <button class="play-button" data-action="buy" data-value="${def.id}">Confirmar</button>
  </div>`;
}

/**
 * Coleção: ficha de cada criatura, agrupada por raça; desbloqueio com Essência (pede confirmação).
 * justUnlocked: criatura recém-liberada; a tela é redesenhada na mesma posição, com ela em destaque.
 */
export function showCollection(profile: Profile, handlers: CollectionHandlers, justUnlocked?: CreatureId): void {
  const groups = racesInOrder()
    .map((race) => {
      const cards = CREATURE_IDS.filter((id) => CREATURES[id].race === race)
        .map((id) => cardHtml(profile, CREATURES[id], id === justUnlocked))
        .join('');
      return `<h3>${race}</h3><div class="creature-grid">${cards}</div>`;
    })
    .join('');

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
        if (target) target.innerHTML = confirmHtml(profile, CREATURES[id as CreatureId]);
      },
      cancel: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = footerHtml(profile, CREATURES[id as CreatureId]);
      },
      buy: (id) => handlers.onBuy(id as CreatureId),
      back: () => handlers.onBack(),
    },
    { keepScroll: justUnlocked !== undefined },
  );
}
