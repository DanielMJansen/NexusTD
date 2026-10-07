import { MUTATIONS } from '../data/mutations';
import { stageWaveCount } from '../data/stages';
import { HERO_MAX_LEVEL, xpToNextLevel } from '../data/heroUpgrades';
import { heroMaxHp } from '../game/hero';
import { CREATURE_IDS } from '../data/creatures';
import { HERO_IDS } from '../data/heroes';
import type { Profile } from '../game/profile';
import { heroSheetHtml } from './describe';
import type { RunState } from '../game/state';

const wave = document.querySelector<HTMLElement>('#hud-wave')!;
const mutationChip = document.querySelector<HTMLElement>('#hud-mutations')!;
const mutationList = document.querySelector<HTMLElement>('#hud-mutation-list')!;
const gold = document.querySelector<HTMLElement>('#hud-gold')!;
const nexusText = document.querySelector<HTMLElement>('#hud-nexus')!;
const nexusBar = document.querySelector<HTMLElement>('#hud-nexus-bar')!;
const creatures = document.querySelector<HTMLElement>('#hud-creatures')!;
const enemies = document.querySelector<HTMLElement>('#hud-enemies')!;
const heroLevel = document.querySelector<HTMLElement>('#hud-hero-level')!;
const heroHp = document.querySelector<HTMLElement>('#hud-hero-hp')!;
const heroXp = document.querySelector<HTMLElement>('#hud-hero-xp')!;
const heroHpText = document.querySelector<HTMLElement>('#hud-hero-hp-text')!;
const heroXpText = document.querySelector<HTMLElement>('#hud-hero-xp-text')!;
const heroChip = document.querySelector<HTMLElement>('.hero-chip')!;
const heroSheet = document.querySelector<HTMLElement>('#hero-sheet')!;

export function updateHud(run: RunState): void {
  setText(wave, run.endless ? `${run.wave} · Sem Fim` : `${Math.max(1, run.wave)} de ${stageWaveCount(run.stage)}`);
  setText(gold, `${run.gold}`);
  // mutações do Sem Fim ativas (ícones; nome e efeito no título)
  const mutations = run.mutations ?? [];
  if (mutationChip.hidden === mutations.length > 0) mutationChip.hidden = mutations.length === 0;
  setText(mutationList, mutations.map((id) => MUTATIONS[id].icon).join(' '));
  const title = mutations.map((id) => `${MUTATIONS[id].name}: ${MUTATIONS[id].description}`).join('\n');
  if (mutationChip.title !== title) mutationChip.title = title;
  const hp = Math.max(0, Math.trunc(run.nexus.hp));
  const ratio = hp / run.nexus.maxHp;
  setText(nexusText, `${hp}/${run.nexus.maxHp}`);
  nexusBar.style.width = `${ratio * 100}%`;
  nexusBar.classList.toggle('low', ratio < 0.3);
  setText(creatures, `${run.creatures.length} de ${run.creatureLimit}`);
  // restantes = vivos (sem aliados) + ainda por entrar; total = restantes + abatidos (inclui divisões e invocados)
  const remaining = run.enemies.filter((e) => !e.dead && e.allyTimer <= 0).length + run.spawnQueue.length;
  setText(enemies, run.phase === 'playing' ? `${remaining} de ${remaining + run.waveKills}` : 'entre ondas');
  const hero = run.hero;
  setText(heroLevel, hero.dead ? `nível ${hero.level} · volta em ${Math.ceil(hero.respawnTimer)} s` : `nível ${hero.level}`);
  const maxHp = heroMaxHp(run);
  const nextXp = xpToNextLevel(hero.level);
  heroHp.style.width = `${(hero.hp / maxHp) * 100}%`;
  const maxed = hero.level >= HERO_MAX_LEVEL;
  heroXp.style.width = maxed ? '100%' : `${(hero.xp / nextXp) * 100}%`;
  setText(heroHpText, `♥ ${Math.ceil(Math.max(0, hero.hp))}/${Math.round(maxHp)}`);
  setText(heroXpText, maxed ? 'Nível máximo' : `XP ${Math.floor(hero.xp)}/${nextXp} → nível ${hero.level + 1}`);
  // ficha do herói só é montada enquanto o mouse está no chip
  if (heroChip.matches(':hover')) {
    const html = `<h4>${hero.def.name}</h4>${heroSheetHtml(run)}`;
    if (heroSheet.innerHTML !== html) heroSheet.innerHTML = html;
  }
}

const menuEssence = document.querySelector<HTMLElement>('#menu-essence')!;
const menuCollection = document.querySelector<HTMLElement>('#menu-collection')!;
const menuHeroes = document.querySelector<HTMLElement>('#menu-heroes')!;
const menuWins = document.querySelector<HTMLElement>('#menu-wins')!;


/** Fora da run, o topo mostra o progresso permanente em vez dos dados da run. */
export function updateMenuHud(profile: Profile): void {
  setText(menuEssence, `${profile.essence}`);
  setText(menuCollection, `${CREATURE_IDS.filter((id) => profile.ownedCreatures.includes(id)).length} de ${CREATURE_IDS.length}`);
  setText(menuHeroes, `${HERO_IDS.filter((id) => profile.ownedHeroes.includes(id)).length} de ${HERO_IDS.length}`);
  setText(menuWins, `${profile.stats.wins} de ${profile.stats.runs} runs`);
}

function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}
