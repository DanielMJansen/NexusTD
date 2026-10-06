import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { LOADOUTS } from '../data/config';
import { HEROES } from '../data/heroes';
import { heroSkin, loadoutSlotCost, ownsCreature, TEAM_SIZE, type Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
import { showOverlay } from './overlay';

export interface TeamHandlers {
  onToggle(id: CreatureId): void;
  onSelectLoadout(index: number): void;
  onBuyLoadout(): void;
  onRename(index: number, name: string): void;
  onHero(): void;
  onBack(): void;
}

/** Abas das equipes salvas (herói + nome), mais a compra de vaga. */
function loadoutTabs(profile: Profile): string {
  const tabs = profile.loadouts
    .map((l, i) => {
      const hero = HEROES[l.hero];
      return `<button class="loadout-tab${i === profile.activeLoadout ? ' active' : ''}" style="--card-color:${hero.color}" data-action="loadout" data-value="${i}" title="${hero.name} + ${l.team.length} criatura(s)">
        <canvas data-sprite="${l.hero}" data-skin="${heroSkin(profile, l.hero).id}"></canvas><span>${l.name}</span><small>${hero.name} · ${l.team.length}</small></button>`;
    })
    .join('');
  const cost = loadoutSlotCost(profile);
  const buy = cost === null ? '' : `<div class="loadout-buy"><button data-action="askSlot"${profile.essence >= cost ? '' : ' disabled'}>+ Nova equipe ${essence(cost)}</button></div>`;
  return `<div class="loadout-tabs">${tabs}${buy}</div>`;
}

/** Equipe: as criaturas (até 6) que ficam disponíveis na run, na ordem dos atalhos. */
export function showTeam(profile: Profile, handlers: TeamHandlers): void {
  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => {
    const id = profile.team[i];
    if (!id) return `<div class="team-slot empty"><kbd>${i + 1}</kbd><span>Vaga livre</span></div>`;
    const def = CREATURES[id];
    return `<button class="team-slot" style="--card-color:${def.color}" data-action="toggle" data-value="${id}" title="Tirar da equipe">
      <kbd>${i + 1}</kbd><canvas data-sprite="${id}"></canvas><span>${def.name}</span><small>${def.role}</small></button>`;
  }).join('');

  const full = profile.team.length >= TEAM_SIZE;
  const options = CREATURE_IDS.filter((id) => ownsCreature(profile, id))
    .map((id) => {
      const def = CREATURES[id];
      const inTeam = profile.team.includes(id);
      const tag = inTeam ? '✓ Na equipe' : full ? 'Equipe cheia' : 'Adicionar';
      return `<button class="team-option${inTeam ? ' in-team' : ''}" style="--card-color:${def.color}" data-action="toggle" data-value="${id}"${!inTeam && full ? ' disabled' : ''}>
        <canvas data-sprite="${id}"></canvas>
        <span><b>${def.name}</b><small>${def.race} · ${def.role}</small></span>
        <em>${tag}</em></button>`;
    })
    .join('');
  const missing = CREATURE_IDS.length - profile.ownedCreatures.length;

  const active = profile.loadouts[profile.activeLoadout];
  const hero = HEROES[profile.selectedHero];
  const element = showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Equipes</h2>
        <span class="muted">${profile.team.length} de ${TEAM_SIZE} criaturas</span>
      </div>
      <p class="subtitle">Monte equipes salvas (herói + criaturas) e troque com um clique — por exemplo, uma para cada fase.</p>
      ${loadoutTabs(profile)}
      <div class="loadout-head">
        <label>Nome <input class="loadout-name" maxlength="${LOADOUTS.nameLength}" value="${active?.name ?? ''}" /></label>
        <span class="loadout-hero" style="--card-color:${hero.color}">Herói: <b>${hero.name}</b> <button data-action="hero">Trocar herói</button></span>
      </div>
      <div class="team-slots">${slots}</div>
      <h3>Sua coleção</h3>
      <div class="team-options">${options}</div>
      ${missing > 0 ? `<p class="hint">Mais ${missing} criatura(s) para desbloquear na Coleção.</p>` : ''}
    </div>`,
    {
      toggle: (id) => handlers.onToggle(id as CreatureId),
      loadout: (i) => handlers.onSelectLoadout(Number(i)),
      askSlot: () => {
        const box = element.querySelector<HTMLElement>('.loadout-buy');
        if (box) box.innerHTML = confirmPurchaseHtml('slot', LOADOUTS.slotCost, profile.essence).replace('Desbloquear por', 'Nova equipe por');
      },
      cancel: () => {
        const box = element.querySelector<HTMLElement>('.loadout-buy');
        if (box) box.innerHTML = `<button data-action="askSlot">+ Nova equipe ${essence(LOADOUTS.slotCost)}</button>`;
      },
      buy: () => handlers.onBuyLoadout(),
      hero: () => handlers.onHero(),
      back: () => handlers.onBack(),
    },
    { keepScroll: true },
  );
  // renomear ao sair do campo ou com Enter
  const input = element.querySelector<HTMLInputElement>('.loadout-name');
  const rename = () => input && input.value !== active?.name && handlers.onRename(profile.activeLoadout, input.value);
  input?.addEventListener('change', rename);
  input?.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') input.blur();
  });
}
