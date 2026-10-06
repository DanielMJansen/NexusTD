import { WAVES } from '../data/waves';
import { xpToNextLevel } from '../data/heroUpgrades';
import { heroMaxHp } from '../game/hero';
import { CREATURE_IDS } from '../data/creatures';
import { HERO_IDS } from '../data/heroes';
import type { Profile } from '../game/profile';
import { essence } from './currency';
import { heroSheetHtml } from './describe';
import type { RunState } from '../game/state';

const wave = document.querySelector<HTMLElement>('#hud-wave')!;
const gold = document.querySelector<HTMLElement>('#hud-gold')!;
const nexusText = document.querySelector<HTMLElement>('#hud-nexus')!;
const nexusBar = document.querySelector<HTMLElement>('#hud-nexus-bar')!;
const creatures = document.querySelector<HTMLElement>('#hud-creatures')!;
const enemies = document.querySelector<HTMLElement>('#hud-enemies')!;
const heroLevel = document.querySelector<HTMLElement>('#hud-hero-level')!;
const heroHp = document.querySelector<HTMLElement>('#hud-hero-hp')!;
const heroXp = document.querySelector<HTMLElement>('#hud-hero-xp')!;
const heroChip = document.querySelector<HTMLElement>('.hero-chip')!;
const heroSheet = document.querySelector<HTMLElement>('#hero-sheet')!;

export function updateHud(run: RunState): void {
  setText(wave, run.endless ? `Onda ${run.wave} · Sem Fim` : `Onda ${Math.max(1, run.wave)}/${WAVES.total}`);
  setText(gold, `${run.gold}`);
  const hp = Math.max(0, Math.trunc(run.nexus.hp));
  const ratio = hp / run.nexus.maxHp;
  setText(nexusText, `${hp}/${run.nexus.maxHp}`);
  nexusBar.style.width = `${ratio * 100}%`;
  nexusBar.classList.toggle('low', ratio < 0.3);
  setText(creatures, `${run.creatures.length}/${run.creatureLimit}`);
  // restantes = vivos (sem aliados) + ainda por entrar; total = restantes + abatidos (inclui divisões e invocados)
  const remaining = run.enemies.filter((e) => !e.dead && e.allyTimer <= 0).length + run.spawnQueue.length;
  setText(enemies, run.phase === 'playing' ? `${remaining}/${remaining + run.waveKills}` : '—');
  const hero = run.hero;
  setText(heroLevel, hero.dead ? `Nv ${hero.level} · ${Math.ceil(hero.respawnTimer)}s` : `Nv ${hero.level}`);
  heroHp.style.width = `${(hero.hp / heroMaxHp(run)) * 100}%`;
  heroXp.style.width = `${(hero.xp / xpToNextLevel(hero.level)) * 100}%`;
  // ficha do herói só é montada enquanto o mouse está no chip
  if (heroChip.matches(':hover')) {
    const html = `<h4>${hero.def.name}</h4>${heroSheetHtml(run)}`;
    if (heroSheet.innerHTML !== html) heroSheet.innerHTML = html;
  }
}

const menuEssence = document.querySelector<HTMLElement>('#menu-essence')!;
const menuBest = document.querySelector<HTMLElement>('#menu-best')!;
const menuCollection = document.querySelector<HTMLElement>('#menu-collection')!;
const menuHeroes = document.querySelector<HTMLElement>('#menu-heroes')!;
const menuWins = document.querySelector<HTMLElement>('#menu-wins')!;

/** Fora da run, o topo mostra o progresso permanente em vez dos dados da run. */
export function updateMenuHud(profile: Profile): void {
  const html = essence(profile.essence);
  if (menuEssence.innerHTML !== html) menuEssence.innerHTML = html;
  setText(menuBest, profile.bestWave > 0 ? `Melhor onda ${profile.bestWave}` : 'Sem runs ainda');
  setText(menuCollection, `${profile.ownedCreatures.length}/${CREATURE_IDS.length}`);
  setText(menuHeroes, `${profile.ownedHeroes.length}/${HERO_IDS.length}`);
  setText(menuWins, `${profile.stats.wins}/${profile.stats.runs} vitórias`);
}

function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}
