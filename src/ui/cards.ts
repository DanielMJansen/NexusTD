import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { creatureCost } from '../game/economy';
import type { RunState } from '../game/state';
import { drawSprite } from '../render/sprites';

interface Card {
  button: HTMLButtonElement;
  preview: CanvasRenderingContext2D;
  name: HTMLElement;
  price: HTMLElement;
}

/** Barra inferior: uma carta por criatura (bloqueadas ficam escondidas) e o botão do Pulso. */
export class CardBar {
  private cards = new Map<CreatureId, Card>();
  private pulseLabel: HTMLElement;

  constructor(container: HTMLElement, onSelect: (id: CreatureId) => void, onPulse: () => void) {
    for (const id of CREATURE_IDS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = '<canvas width="48" height="44"></canvas><b></b><i></i>';
      button.addEventListener('click', () => onSelect(id));
      container.appendChild(button);
      this.cards.set(id, {
        button,
        preview: button.querySelector('canvas')!.getContext('2d')!,
        name: button.querySelector('b')!,
        price: button.querySelector('i')!,
      });
    }
    const pulse = document.createElement('button');
    pulse.type = 'button';
    pulse.innerHTML = '<b>⚡</b><i></i>';
    pulse.addEventListener('click', onPulse);
    container.appendChild(pulse);
    this.pulseLabel = pulse.querySelector('i')!;
  }

  update(run: RunState, selected: CreatureId | null, time: number): void {
    for (const [id, card] of this.cards) {
      const def = CREATURES[id];
      const unlocked = run.unlocked.has(id);
      card.button.disabled = !unlocked;
      card.button.hidden = !unlocked;
      card.button.classList.toggle('selected', selected === id);
      setText(card.name, def.name);
      setText(card.price, unlocked ? `${creatureCost(run, id)}💰` : `🔒 ${def.race}`);
      if (unlocked) {
        card.preview.clearRect(0, 0, 48, 44);
        drawSprite(card.preview, id, 24, 26, 1.1, time);
      }
    }
    const remaining = run.pulse.remaining;
    setText(this.pulseLabel, remaining > 0 ? `${Math.trunc(remaining)}s` : 'Pulso');
  }
}

function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}
