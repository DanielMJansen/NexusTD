import { WAVES } from '../data/waves';
import { xpToNextLevel } from '../data/heroUpgrades';
import { heroMaxHp } from '../game/hero';
import type { RunState } from '../game/state';

const wave = document.querySelector<HTMLElement>('#hud-wave')!;
const gold = document.querySelector<HTMLElement>('#hud-gold')!;
const nexusText = document.querySelector<HTMLElement>('#hud-nexus')!;
const nexusBar = document.querySelector<HTMLElement>('#hud-nexus-bar')!;
const creatures = document.querySelector<HTMLElement>('#hud-creatures')!;
const heroLevel = document.querySelector<HTMLElement>('#hud-hero-level')!;
const heroHp = document.querySelector<HTMLElement>('#hud-hero-hp')!;
const heroXp = document.querySelector<HTMLElement>('#hud-hero-xp')!;

export function updateHud(run: RunState): void {
  setText(wave, `Onda ${Math.max(1, run.wave)}/${WAVES.total}`);
  setText(gold, `${run.gold}`);
  const hp = Math.max(0, Math.trunc(run.nexus.hp));
  const ratio = hp / run.nexus.maxHp;
  setText(nexusText, `${hp}/${run.nexus.maxHp}`);
  nexusBar.style.width = `${ratio * 100}%`;
  nexusBar.classList.toggle('low', ratio < 0.3);
  setText(creatures, `${run.creatures.length}/${run.creatureLimit}`);
  const hero = run.hero;
  setText(heroLevel, hero.dead ? `Nv ${hero.level} · ${Math.ceil(hero.respawnTimer)}s` : `Nv ${hero.level}`);
  heroHp.style.width = `${(hero.hp / heroMaxHp(run)) * 100}%`;
  heroXp.style.width = `${(hero.xp / xpToNextLevel(hero.level)) * 100}%`;
}

function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}
