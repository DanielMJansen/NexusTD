import { CREATURES, type CreatureId } from '../data/creatures';
import { creatureCost } from '../game/economy';
import type { RunState } from '../game/state';
import { drawPortrait } from '../render/portrait';
import { gold } from './currency';
import { abilityText, creatureStats } from './describe';
import { raceBonusText } from './heroesScreen';
import type { HeroDef, HeroId } from '../data/heroes';

interface Card {
  root: HTMLElement;
  portrait: HTMLCanvasElement;
  cost: HTMLElement;
}

export interface SidePanelHandlers {
  /** Botão do mouse pressionado sobre uma carta. */
  onCardPress(id: CreatureId): void;
  onPulse(): void;
}

/** Painel lateral: uma carta por criatura da equipe (atalhos 1–6) e o botão do Pulso. */
export class SidePanel {
  private cards = new Map<CreatureId, Card>();
  private team: readonly CreatureId[] = [];
  private heroId: HeroId | null = null;
  private list = document.querySelector<HTMLElement>('#card-list')!;
  private pulseButton = document.querySelector<HTMLButtonElement>('#pulse-button')!;
  private pulseFill = this.pulseButton.querySelector<HTMLElement>('.pulse-fill')!;
  private pulseStatus = document.querySelector<HTMLElement>('#pulse-status')!;
  private pulseName = this.pulseButton.querySelector<HTMLElement>('.pulse-label b')!;

  constructor(private readonly handlers: SidePanelHandlers) {
    this.pulseButton.addEventListener('click', () => {
      this.pulseButton.blur();
      handlers.onPulse();
    });
  }

  /** Remonta as cartas quando a equipe ou o herói mudam (nova run ou menu). */
  private setTeam(team: readonly CreatureId[], hero: HeroDef): void {
    this.team = [...team];
    this.heroId = hero.id;
    this.cards.clear();
    this.list.innerHTML = '';
    team.forEach((id, index) => {
      const def = CREATURES[id];
      const root = document.createElement('div');
      root.className = 'card';
      root.style.setProperty('--card-color', def.color);
      const stats = creatureStats(def)
        .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
        .join('');
      root.innerHTML = `
        <canvas></canvas>
        <div class="card-info">
          <span class="card-name">${def.name}</span>
          <span class="card-race">${def.race}</span>
          <span class="card-cost"></span>
        </div>
        <kbd>${index + 1}</kbd>
        <div class="tooltip">
          <h4>${def.race} ${def.name}</h4>
          <p class="role">${def.role}</p>
          <p class="special">${def.description}</p>
          <dl>${stats}</dl>
          <p class="special">${abilityText(def.ability)}</p>
          <p class="special evolves">Nível 3: <b>${def.ascended.name}</b>. ${abilityText(def.ascended.ability)}</p>
          ${def.race === hero.race ? `<p class="special hero-bonus">Bônus do ${hero.name}: ${raceBonusText(hero.race, hero.raceBonus)}</p>` : ''}
        </div>`;
      root.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        this.handlers.onCardPress(id);
      });
      this.list.appendChild(root);
      this.cards.set(id, { root, portrait: root.querySelector('canvas')!, cost: root.querySelector('.card-cost')! });
    });
  }

  update(run: RunState, selected: CreatureId | null, time: number): void {
    const changed = run.team.length !== this.team.length || run.team.some((id, i) => id !== this.team[i]);
    if (changed || this.heroId !== run.hero.def.id) this.setTeam(run.team, run.hero.def);
    for (const [id, card] of this.cards) {
      const cost = creatureCost(run, id);
      card.root.classList.toggle('selected', selected === id);
      setHtml(card.cost, gold(cost));
      card.cost.classList.toggle('too-expensive', cost > run.gold);
      drawPortrait(card.portrait, id, time + id.length);
    }

    const { remaining, cooldown } = run.pulse;
    const ready = remaining <= 0 && run.phase === 'playing';
    this.pulseFill.style.transform = `scaleX(${1 - remaining / cooldown})`;
    this.pulseButton.classList.toggle('ready', ready);
    const status = remaining > 0 ? `recarregando ${Math.ceil(remaining)} s` : 'pronto';
    const name = run.hero.def.pulse.name;
    if (this.pulseName.textContent !== name) this.pulseName.textContent = name;
    if (this.pulseStatus.textContent !== status) this.pulseStatus.textContent = status;
  }
}

function setHtml(element: HTMLElement, html: string): void {
  if (element.innerHTML !== html) element.innerHTML = html;
}
