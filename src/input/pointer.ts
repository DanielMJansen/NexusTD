import { ARENA } from '../data/config';
import { placeCreature, sellCreature } from '../game/economy';
import { distance, type Point, type RunState } from '../game/state';
import { SELL_BUTTON } from '../render/draw';
import type { Interaction } from './interaction';

/** Raio do toque para selecionar uma criatura em campo. */
const CREATURE_TOUCH_RADIUS = 18;

export interface PointerContext {
  canvas: HTMLCanvasElement;
  interaction: Interaction;
  getRun(): RunState;
  /** Só aceita toques na arena durante uma onda, sem pausa. */
  isActive(): boolean;
}

/**
 * Toque/mouse na arena:
 * - com carta escolhida: arrastar mostra a prévia e soltar posiciona;
 * - sem carta: tocar numa criatura mostra o botão de venda; tocar/segurar no chão guia o herói.
 */
export function attachPointer({ canvas, interaction, getRun, isActive }: PointerContext): void {
  const toArena = (event: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * ARENA.width) / rect.width,
      y: ((event.clientY - rect.top) * ARENA.height) / rect.height,
    };
  };

  canvas.addEventListener('pointerdown', (event) => {
    if (!isActive()) return;
    const run = getRun();
    const point = toArena(event);
    interaction.pointer = point;

    const inspected = interaction.inspected;
    if (inspected) {
      interaction.inspected = null;
      if (isOnSellButton(point, inspected)) {
        sellCreature(run, inspected);
        return;
      }
    }

    if (interaction.selectedCard) {
      interaction.dragging = true;
      return;
    }

    const touched = run.creatures.find((c) => distance(c, point) < CREATURE_TOUCH_RADIUS);
    if (touched) {
      interaction.inspected = touched;
      return;
    }

    run.hero.target = point;
    interaction.holding = true;
  });

  canvas.addEventListener('pointermove', (event) => {
    if (interaction.dragging) interaction.pointer = toArena(event);
    else if (interaction.holding) getRun().hero.target = toArena(event);
  });

  addEventListener('pointerup', () => {
    interaction.holding = false;
    if (!interaction.dragging) return;
    interaction.dragging = false;
    const card = interaction.selectedCard;
    interaction.selectedCard = null;
    if (card) placeCreature(getRun(), card, interaction.pointer);
  });

  // Gesto interrompido pelo sistema: cancela sem posicionar.
  addEventListener('pointercancel', () => {
    interaction.holding = false;
    interaction.dragging = false;
  });
}

function isOnSellButton(point: Point, creature: Point): boolean {
  return (
    Math.abs(point.x - creature.x) < SELL_BUTTON.width / 2 + 2 &&
    Math.abs(point.y - (creature.y + SELL_BUTTON.offsetY)) < SELL_BUTTON.height / 2 + 1
  );
}
