import { CREATURES, type CreatureId } from '../data/creatures';
import { creatureCost } from '../game/economy';
import type { Creature, RunState } from '../game/state';
import type { Interaction } from '../input/interaction';
import { MAX_CREATURE_LEVEL } from '../data/evolution';
import {
  creatureAbility,
  creatureAttacksPerSecond,
  creatureDamage,
  creatureName,
  creatureRange,
} from '../game/creatureStats';
import { evolveCost, sellValue } from '../game/economy';
import { drawPortrait } from '../render/portrait';
import { gold } from './currency';
import { abilityText, creatureStats, formatNumber } from './describe';
import { pulseText, raceBonusText } from './heroesScreen';
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
  private pulseTooltip = this.pulseButton.querySelector<HTMLElement>('.pulse-tooltip')!;
  private selectionInfo = document.querySelector<HTMLElement>('#selection-info')!;

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
    this.pulseTooltip.style.setProperty('--card-color', hero.color);
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
    this.updateSelection(run, interaction.inspected);

    const { remaining, cooldown } = run.pulse;
    const ready = remaining <= 0 && run.phase === 'playing';
    this.pulseFill.style.transform = `scaleX(${1 - remaining / cooldown})`;
    this.pulseButton.classList.toggle('ready', ready);
    const status = remaining > 0 ? `recarregando ${Math.ceil(remaining)} s` : 'pronto';
    const name = run.hero.def.pulse.name;
    if (this.pulseName.textContent !== name) this.pulseName.textContent = name;
    if (this.pulseStatus.textContent !== status) this.pulseStatus.textContent = status;
  }

  /** Quadro com os atributos efetivos da criatura clicada na arena. */
  private updateSelection(run: RunState, creature: Creature | null): void {
    if (!creature || !run.creatures.includes(creature)) {
      this.selectionInfo.hidden = true;
      return;
    }
    const m = run.modifiers;
    const next = evolveCost(creature, run.talents.evolveDiscount);
    const stars =
      '<span class="star-on">' + '★'.repeat(creature.level) + '</span><span class="star-off">' + '★'.repeat(MAX_CREATURE_LEVEL - creature.level) + '</span>';
    const html = `<h4>${creatureName(creature)} <span class="stars">${stars}</span></h4>
      <dl>
        <dt>Dano</dt><dd>${formatNumber(Math.round(creatureDamage(creature, m) * 10) / 10)}</dd>
        <dt>Ataques/s</dt><dd>${formatNumber(Math.round(creatureAttacksPerSecond(creature, m) * 100) / 100)}${creature.auraBonus > 0 ? ' <small>(aura)</small>' : ''}</dd>
        <dt>Alcance</dt><dd>${Math.round(creatureRange(creature, m))}</dd>
        <dt>Investido</dt><dd>${gold(creature.paid)}</dd>
        <dt>Venda</dt><dd>${gold(sellValue(creature))}</dd>
        <dt>Evoluir</dt><dd>${next === null ? 'máximo' : gold(next)}</dd>
      </dl>
      <p class="special">${abilityText(creatureAbility(creature))}</p>`;
    this.selectionInfo.style.setProperty('--card-color', creature.def.color);
    setHtml(this.selectionInfo, html);
    this.selectionInfo.hidden = false;
  }
}

function setHtml(element: HTMLElement, html: string): void {
  if (element.innerHTML !== html) element.innerHTML = html;
}
