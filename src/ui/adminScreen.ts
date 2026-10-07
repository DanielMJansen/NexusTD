import { ACHIEVEMENT_IDS, ACHIEVEMENTS, type AchievementId } from '../data/achievements';
import { VARIANT_TIERS, VARIANTS, type VariantTier } from '../data/altar';
import { ALL_CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { GIFT_IDS, GIFTS, type GiftId } from '../data/gifts';
import { ALL_HERO_IDS, HEROES, STARTER_HERO, type HeroId } from '../data/heroes';
import { NEXUS_COLORS } from '../data/nexusSkins';
import { SANCTUARY } from '../data/sanctuary';
import { SKINS } from '../data/skins';
import { STAGE_IDS, STAGES, type StageId } from '../data/stages';
import {
  adminRaces,
  setAchievement,
  setAwakened,
  setCreatureOwned,
  setCrystals,
  setEssence,
  setFragments,
  setGift,
  setHeroOwned,
  setSanctuaryLevel,
  setStageWon,
  setAllRelics,
  setTalentsMax,
  toggleNexusColor,
  toggleVariant,
  unlockEverything,
} from '../game/admin';
import type { Profile } from '../game/profile';
import { crystals, essence, fragments } from './currency';
import { showOverlay } from './overlay';
import { currentTab, setTab, tabsHtml, type Tab } from './tabs';

export interface AdminHandlers {
  /** Aplica uma mudança no perfil (o app salva, valida e reabre a tela). */
  onApply(change: (profile: Profile) => void): void;
  onBack(): void;
}

const TABS: Tab[] = [
  { id: 'currency', label: 'Moedas' },
  { id: 'creatures', label: 'Criaturas' },
  { id: 'heroes', label: 'Heróis' },
  { id: 'achievements', label: 'Conquistas e skins' },
  { id: 'stages', label: 'Fases e Nexus' },
  { id: 'extras', label: 'Talentos e presentes' },
];

const toggle = (on: boolean, action: string, label = on ? 'Sim' : 'Não'): string =>
  `<button class="admin-toggle${on ? ' on' : ''}" data-action="do" data-value="${action}">${label}</button>`;

function currencyTab(profile: Profile): string {
  const row = (label: string, key: string, value: number, shown: string) =>
    `<div class="admin-row"><span>${label} <small>(${shown})</small></span>
      <input type="number" min="0" step="1" data-key="${key}" value="${value}" />
      <button data-action="set" data-value="${key}">Definir</button>
      <button data-action="do" data-value="add:${key}:1000">+1000</button></div>`;
  return [
    row('Essência', 'essence', profile.essence, essence(profile.essence)),
    row('Cristais Ancestrais', 'crystals', profile.crystals, crystals(profile.crystals)),
    ...adminRaces().map((race) => row(`Fragmentos · ${race}`, `fragments:${race}`, profile.fragments[race] ?? 0, fragments(profile.fragments[race] ?? 0))),
  ].join('');
}

function creaturesTab(profile: Profile): string {
  return ALL_CREATURE_IDS.map((id) => {
    const def = CREATURES[id];
    const owned = profile.ownedCreatures.includes(id);
    const level = profile.sanctuary[id] ?? 0;
    const awake = profile.awakened.includes(id);
    const variants = VARIANT_TIERS.map((t) => toggle((profile.variants[id] ?? []).includes(t), `variant:${id}:${t}`, VARIANTS[t].name)).join('');
    return `<div class="admin-row creature">
      <span><b>${def.name}</b> <small>${def.race}</small></span>
      ${toggle(owned, `creature:${id}`, owned ? 'Na coleção' : 'Fora')}
      <span class="admin-step">Santuário <button data-action="do" data-value="sanctuary:${id}:${level - 1}">−</button> ${level}/${SANCTUARY.maxLevel} <button data-action="do" data-value="sanctuary:${id}:${level + 1}">+</button></span>
      ${toggle(awake, `awaken:${id}`, awake ? '✦ Desperta' : 'Despertar')}
      <span class="admin-chips">${variants}</span>
    </div>`;
  }).join('');
}

function heroesTab(profile: Profile): string {
  return ALL_HERO_IDS.map((id) => {
    const owned = profile.ownedHeroes.includes(id);
    return `<div class="admin-row"><span><b>${HEROES[id].name}</b> <small>${HEROES[id].race}${HEROES[id].gift ? ' · exclusivo' : ''}</small></span>${
      id === STARTER_HERO ? '<small>herói inicial</small>' : toggle(owned, `hero:${id}`, owned ? 'Liberado' : 'Bloqueado')
    }</div>`;
  }).join('');
}

function achievementsTab(profile: Profile): string {
  const skinsOf = (id: AchievementId) => SKINS.filter((s) => s.unlockedBy === id).map((s) => s.name);
  return (
    `<div class="row-buttons"><button data-action="do" data-value="achievements:all">Marcar todas (libera todas as skins)</button><button data-action="do" data-value="achievements:none">Desmarcar todas</button></div>` +
    ACHIEVEMENT_IDS.map((id) => {
      const skins = skinsOf(id);
      return `<div class="admin-row"><span><b>${ACHIEVEMENTS[id].name}</b>${skins.length ? ` <small>skin: ${skins.join(', ')}</small>` : ''}</span>${toggle(profile.achievements.includes(id), `achievement:${id}`)}</div>`;
    }).join('')
  );
}

function stagesTab(profile: Profile): string {
  const stages = STAGE_IDS.map(
    (id) => `<div class="admin-row"><span><b>Fase ${STAGES[id].number} · ${STAGES[id].name}</b> <small>vencida libera a próxima e o Nexus da fase</small></span>${toggle((profile.stageRecords[id]?.wins ?? 0) > 0, `stage:${id}`, (profile.stageRecords[id]?.wins ?? 0) > 0 ? 'Vencida' : 'Não vencida')}</div>`,
  );
  const colors = NEXUS_COLORS.filter((c) => c.unlock.kind !== 'achievement').map(
    (c) => `<div class="admin-row"><span><b>Cor do Nexus · ${c.name}</b></span>${toggle(profile.nexusColors.includes(c.id), `color:${c.id}`)}</div>`,
  );
  return [...stages, '<p class="hint">Cores ganhas por conquista ficam na aba de conquistas.</p>', ...colors].join('');
}

function extrasTab(profile: Profile): string {
  const gifts = GIFT_IDS.map((id) => `<div class="admin-row"><span><b>Presente · ${GIFTS[id].name}</b></span>${toggle(profile.gifts.includes(id), `gift:${id}`)}</div>`);
  return [
    '<div class="row-buttons"><button data-action="do" data-value="talents:max">Talentos no máximo</button><button data-action="do" data-value="talents:none">Zerar talentos</button></div>',
    '<div class="row-buttons"><button data-action="do" data-value="relics:all">Todas as Relíquias</button><button data-action="do" data-value="relics:none">Tirar as Relíquias</button></div>',
    ...gifts,
    '<div class="row-buttons"><button class="play-button" data-action="do" data-value="everything">Liberar tudo</button><button data-action="do" data-value="intros">Rever tutoriais das fases</button></div>',
  ].join('');
}

/** Transforma a ação de um botão numa mudança do perfil. */
function changeFor(action: string): ((p: Profile) => void) | null {
  const [kind, a, b] = action.split(':');
  switch (kind) {
    case 'add':
      // add:<campo>[:raça]:<quantia>
      if (a === 'essence') return (p) => setEssence(p, p.essence + Number(b));
      if (a === 'crystals') return (p) => setCrystals(p, p.crystals + Number(b));
      if (a === 'fragments') {
        const [, , race, amount] = action.split(':');
        return (p) => setFragments(p, race!, (p.fragments[race!] ?? 0) + Number(amount));
      }
      return null;
    case 'creature':
      return (p) => setCreatureOwned(p, a as CreatureId, !p.ownedCreatures.includes(a as CreatureId));
    case 'sanctuary':
      return (p) => setSanctuaryLevel(p, a as CreatureId, Number(b));
    case 'awaken':
      return (p) => setAwakened(p, a as CreatureId, !p.awakened.includes(a as CreatureId));
    case 'variant':
      return (p) => toggleVariant(p, a as CreatureId, b as VariantTier);
    case 'hero':
      return (p) => setHeroOwned(p, a as HeroId, !p.ownedHeroes.includes(a as HeroId));
    case 'achievement':
      return (p) => setAchievement(p, a as AchievementId, !p.achievements.includes(a as AchievementId));
    case 'achievements':
      return (p) => ACHIEVEMENT_IDS.forEach((id) => setAchievement(p, id, a === 'all'));
    case 'stage':
      return (p) => setStageWon(p, a as StageId, !((p.stageRecords[a as StageId]?.wins ?? 0) > 0));
    case 'color':
      return (p) => toggleNexusColor(p, a!);
    case 'relics':
      return (p) => setAllRelics(p, a === 'all');
    case 'talents':
      return (p) => setTalentsMax(p, a === 'max');
    case 'gift':
      return (p) => setGift(p, a as GiftId, !p.gifts.includes(a as GiftId));
    case 'everything':
      return (p) => unlockEverything(p);
    case 'intros':
      return (p) => {
        p.seenStageIntros = [];
        p.seenTutorials = [];
      };
    default:
      return null;
  }
}

/** Painel de administrador: adicionar e remover qualquer coisa do perfil local. */
export function showAdmin(profile: Profile, handlers: AdminHandlers): void {
  const tab = currentTab('admin', TABS);
  const body =
    tab === 'currency'
      ? currencyTab(profile)
      : tab === 'creatures'
        ? creaturesTab(profile)
        : tab === 'heroes'
          ? heroesTab(profile)
          : tab === 'achievements'
            ? achievementsTab(profile)
            : tab === 'stages'
              ? stagesTab(profile)
              : extrasTab(profile);
  const root = showOverlay(
    `<div class="panel screen admin-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>🛠 Administrador</h2>
        <div></div>
      </div>
      <p class="subtitle">Mudanças valem na hora e ficam salvas neste navegador.</p>
      ${tabsHtml(TABS, tab)}
      <div class="admin-list">${body}</div>
    </div>`,
    {
      back: () => handlers.onBack(),
      tab: (id) => {
        setTab('admin', id);
        showAdmin(profile, handlers);
      },
      do: (action) => {
        const change = changeFor(action);
        if (change) handlers.onApply(change);
      },
      set: (key) => {
        const input = root.querySelector<HTMLInputElement>(`input[data-key="${CSS.escape(key)}"]`);
        const value = Number(input?.value ?? 0);
        if (key === 'essence') handlers.onApply((p) => setEssence(p, value));
        else if (key === 'crystals') handlers.onApply((p) => setCrystals(p, value));
        else if (key.startsWith('fragments:')) handlers.onApply((p) => setFragments(p, key.slice('fragments:'.length), value));
      },
    },
    { keepScroll: true },
  );
}
