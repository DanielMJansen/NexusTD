import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { creatureCost } from '../game/economy';
import type { RunState } from '../game/state';
import { drawPortrait } from '../render/portrait';
import { abilityText, creatureStats } from './describe';

interface Card {
  root: HTMLElement;
  portrait: HTMLCanvasElement;
  cost: HTMLElement;
  lockNote: HTMLElement;
}

export interface SidePanelHandlers {
  /** Botão do mouse pressionado sobre uma carta liberada. */
  onCardPress(id: CreatureId): void;
  onPulse(): void;
}

/** Painel lateral: cartas das criaturas (bloqueadas aparecem como silhueta) e botão do Pulso. */
export class SidePanel {
  private cards = new Map<CreatureId, Card>();
  private pulseButton = document.querySelector<HTMLButtonElement>('#pulse-button')!;
  private pulseFill = this.pulseButton.querySelector<HTMLElement>('.pulse-fill')!;
  private pulseStatus = document.querySelector<HTMLElement>('#pulse-status')!;

  constructor(handlers: SidePanelHandlers) {
    const list = document.querySelector<HTMLElement>('#card-list')!;
    CREATURE_IDS.forEach((id, index) => {
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
          <dl>${stats}</dl>
          <p class="special">${abilityText(def)}</p>
          <p class="special lock-note"></p>
        </div>`;
      root.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        handlers.onCardPress(id);
      });
      list.appendChild(root);
      this.cards.set(id, {
        root,
        portrait: root.querySelector('canvas')!,
        cost: root.querySelector('.card-cost')!,
        lockNote: root.querySelector('.lock-note')!,
      });
    });

    this.pulseButton.addEventListener('click', () => {
      this.pulseButton.blur();
      handlers.onPulse();
    });
  }

  update(run: RunState, selected: CreatureId | null, time: number): void {
    for (const [id, card] of this.cards) {
      const unlocked = run.unlocked.has(id);
      card.root.classList.toggle('locked', !unlocked);
      card.root.classList.toggle('selected', selected === id);
      if (unlocked) {
        const cost = creatureCost(run, id);
        setText(card.cost, `◉ ${cost}`);
        card.cost.classList.toggle('too-expensive', cost > run.gold);
        setText(card.lockNote, '');
      } else {
        setText(card.cost, '🔒 Ovo');
        card.cost.classList.remove('too-expensive');
        setText(card.lockNote, 'Bloqueada nesta run: chega por ovo ou desbloqueie com Essência no menu.');
      }
      drawPortrait(card.portrait, id, time + id.length, !unlocked);
    }

    const { remaining, cooldown } = run.pulse;
    const ready = remaining <= 0 && run.phase === 'playing';
    this.pulseFill.style.transform = `scaleX(${1 - remaining / cooldown})`;
    this.pulseButton.classList.toggle('ready', ready);
    setText(this.pulseStatus, remaining > 0 ? `recarregando ${Math.ceil(remaining)} s` : 'pronto');
  }
}

function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}
