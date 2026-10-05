import type { CreatureId } from '../data/creatures';
import { canPlaceCreature } from '../game/economy';
import type { Creature, Point, RunState } from '../game/state';
import type { InteractionView } from '../render/draw';

/** Estado da interação na arena: carta escolhida, arrasto, criatura inspecionada. */
export interface Interaction {
  selectedCard: CreatureId | null;
  /** Carta sendo arrastada do painel (solta na arena = posiciona). */
  draggingCard: boolean;
  /** Botão pressionado no chão, guiando o herói. */
  holding: boolean;
  /** Última posição do mouse, em coordenadas da arena. */
  pointer: Point;
  pointerInArena: boolean;
  inspected: Creature | null;
}

export function createInteraction(): Interaction {
  return {
    selectedCard: null,
    draggingCard: false,
    holding: false,
    pointer: { x: 0, y: 0 },
    pointerInArena: false,
    inspected: null,
  };
}

/** Limpa seleção e arrasto, mantendo a posição do mouse. */
export function resetInteraction(interaction: Interaction): void {
  Object.assign(interaction, { selectedCard: null, draggingCard: false, holding: false, inspected: null });
}

export function interactionView(interaction: Interaction, run: RunState): InteractionView {
  const { selectedCard, pointer, pointerInArena, inspected } = interaction;
  return {
    inspected,
    placement:
      selectedCard && pointerInArena
        ? { creature: selectedCard, at: pointer, valid: canPlaceCreature(run, selectedCard, pointer) }
        : null,
  };
}
