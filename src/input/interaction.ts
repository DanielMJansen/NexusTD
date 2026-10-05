import type { CreatureId } from '../data/creatures';
import type { Creature, Point } from '../game/state';
import type { InteractionView } from '../render/draw';

/** Estado da interação na arena: carta escolhida, arrasto, criatura tocada. */
export interface Interaction {
  selectedCard: CreatureId | null;
  /** Arrastando a carta escolhida pela arena. */
  dragging: boolean;
  /** Dedo/mouse pressionado guiando o herói. */
  holding: boolean;
  pointer: Point;
  inspected: Creature | null;
}

export function createInteraction(): Interaction {
  return { selectedCard: null, dragging: false, holding: false, pointer: { x: 0, y: 0 }, inspected: null };
}

export function resetInteraction(interaction: Interaction): void {
  Object.assign(interaction, createInteraction());
}

export function interactionView(interaction: Interaction): InteractionView {
  const { selectedCard, dragging, pointer, inspected } = interaction;
  return {
    inspected,
    placement: dragging && selectedCard ? { creature: selectedCard, at: pointer } : null,
  };
}
