import { CREATURES, type CreatureId } from '../data/creatures';
import { creatureCost } from '../game/economy';
import { pulsePower } from '../game/pulses';
import type { RunState } from '../game/state';
import type { Interaction } from '../input/interaction';
import { drawPortrait } from '../render/portrait';
import { gold } from './currency';
import { abilityText, ascendedFormsHtml, creatureStats, pulseText, raceBonusText } from './describe';
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

/** Painel lateral: uma carta por criatura da equipe (atalhos 1–8) e o botão do Pulso. */
export class SidePanel {
  private cards = new Map<CreatureId, Card>();
  private team: readonly CreatureId[] = [];
  private heroId: HeroId | null = null;
  private list = document.querySelector<HTMLElement>('#card-list')!;
  private pulseButton = document.querySelector<HTMLButtonElement>('#pulse-button')!;
  private pulseFill = this.pulseButton.querySelector<HTMLElement>('.pulse-fill')!;
  private pulseStatus = document.querySelector<HTMLElement>('#pulse-status')!;
  private pulseName = this.pulseButton.querySelector<HTMLElement>('.pulse-label b')!;
  private pulseTooltip = this.pulseButton.querySelector<HTMLElement>('.pulse-tooltip')!;
  private pulseKey = '';

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
    this.pulseTooltip.innerHTML = `<h4>Pulso do ${hero.name} <kbd>Espaço</kbd></h4><p class="special">${pulseText(hero)}</p>`;
    this.pulseKey = '';
    this.pulseTooltip.style.setProperty('--card-color', hero.color);
    this.cards.clear();
    this.list.innerHTML = '';
    // equipe grande: cartas compactas em duas colunas
    this.list.classList.toggle('compact', team.length > 5);
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
          <p class="special">${abilityText(def.ability, def.effects)}</p>
          ${ascendedFormsHtml(def, 'special evolves')}
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

  update(run: RunState, interaction: Interaction, time: number): void {
    const changed = run.team.length !== this.team.length || run.team.some((id, i) => id !== this.team[i]);
    if (changed || this.heroId !== run.hero.def.id) this.setTeam(run.team, run.hero.def);
    const full = run.creatures.length >= run.creatureLimit;
    const now = performance.now();
    for (const [id, card] of this.cards) {
      const cost = creatureCost(run, id);
      const affordable = cost <= run.gold;
      // verde: dá para invocar; vermelho: falta ouro ou vaga
      card.root.classList.toggle('selected', interaction.selectedCard === id);
      card.root.classList.toggle('ready', affordable && !full);
      card.root.classList.toggle('blocked', !affordable || full);
      card.root.classList.toggle('denied', interaction.denied?.id === id && now - interaction.denied.at < 400);
      setHtml(card.cost, full ? '<span class="card-full">Sem vaga</span>' : gold(cost));
      card.cost.classList.toggle('too-expensive', !affordable);
      drawPortrait(card.portrait, id, time + id.length);
    }

    const { remaining, cooldown } = run.pulse;
    const ready = remaining <= 0 && run.phase === 'playing';
    this.pulseFill.style.transform = `scaleX(${1 - remaining / cooldown})`;
    this.pulseButton.classList.toggle('ready', ready);
    const status = remaining > 0 ? `recarregando ${Math.ceil(remaining)} s` : 'pronto';
    // tooltip do Pulso com os valores atuais (nível do herói, melhorias e talentos)
    // (só refaz o texto quando algum valor muda)
    const live = { power: pulsePower(run), size: 1 + run.heroStats.pulseSize, radius: run.pulse.radius, cooldown: run.pulse.cooldown };
    const key = `${run.hero.def.id} ${live.power} ${live.size} ${live.radius} ${live.cooldown}`;
    if (key !== this.pulseKey) {
      this.pulseKey = key;
      setHtml(this.pulseTooltip, `<h4>Pulso do ${run.hero.def.name} <kbd>Espaço</kbd></h4><p class="special">${pulseText(run.hero.def, live)}</p>`);
    }
    const name = run.hero.def.pulse.name;
    if (this.pulseName.textContent !== name) this.pulseName.textContent = name;
    if (this.pulseStatus.textContent !== status) this.pulseStatus.textContent = status;
  }
}

function setHtml(element: HTMLElement, html: string): void {
  if (element.innerHTML !== html) element.innerHTML = html;
}
