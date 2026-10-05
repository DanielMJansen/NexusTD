import { ARENA } from '../data/config';
import type { CreatureId } from '../data/creatures';
import { evolveCreature, placeCreature, sellCreature } from '../game/economy';
import { distance, type Point, type RunState } from '../game/state';
import { inspectButtons } from '../render/draw';
import type { Interaction } from './interaction';

/** Raio do clique para selecionar uma criatura em campo. */
const CREATURE_CLICK_RADIUS = 18;

export interface PointerContext {
  canvas: HTMLCanvasElement;
  interaction: Interaction;
  getRun(): RunState;
  /** Só aceita comandos durante uma onda, sem pausa. */
  isActive(): boolean;
}

export interface PointerControls {
  /** Mouse pressionado numa carta: escolhe a criatura e começa a arrastá-la. */
  pressCard(id: CreatureId): void;
  /** Escolhe/desescolhe a criatura (atalho de teclado). */
  toggleCard(id: CreatureId): void;
  /** Cancela carta escolhida ou criatura inspecionada. Devolve false se não havia nada. */
  cancel(): boolean;
  /** Evolui a criatura inspecionada (atalho de teclado). */
  evolveInspected(): void;
}

/**
 * Mouse na arena:
 * - com carta escolhida: a prévia segue o mouse; clicar (ou soltar o arrasto) posiciona;
 * - sem carta: clicar numa criatura mostra o botão de venda; clicar/segurar no chão guia o herói;
 * - botão direito cancela.
 */
export function attachPointer({ canvas, interaction, getRun, isActive }: PointerContext): PointerControls {
  const toArena = (event: PointerEvent): { point: Point; inside: boolean } => {
    const rect = canvas.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    return {
      point: {
        x: ((event.clientX - rect.left) * ARENA.width) / rect.width,
        y: ((event.clientY - rect.top) * ARENA.height) / rect.height,
      },
      inside,
    };
  };

  const tryPlace = (): boolean => {
    const card = interaction.selectedCard;
    if (!card || !placeCreature(getRun(), card, interaction.pointer)) return false;
    interaction.selectedCard = null;
    return true;
  };

  const cancel = (): boolean => {
    const hadSomething = interaction.selectedCard !== null || interaction.inspected !== null;
    interaction.selectedCard = null;
    interaction.draggingCard = false;
    interaction.inspected = null;
    return hadSomething;
  };

  addEventListener('pointermove', (event) => {
    const { point, inside } = toArena(event);
    interaction.pointer = point;
    interaction.pointerInArena = inside;
    if (interaction.holding) getRun().hero.target = point;
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  canvas.addEventListener('pointerdown', (event) => {
    if (!isActive()) return;
    if (event.button === 2) {
      cancel();
      return;
    }
    if (event.button !== 0) return;
    const run = getRun();
    const { point } = toArena(event);
    interaction.pointer = point;
    interaction.pointerInArena = true;

    if (interaction.selectedCard) {
      tryPlace();
      return;
    }

    const inspected = interaction.inspected;
    if (inspected) {
      const button = inspectButtons(run, inspected).find(
        (b) => point.x >= b.x && point.x <= b.x + b.width && point.y >= b.y && point.y <= b.y + b.height,
      );
      if (button?.action === 'evolve') {
        evolveCreature(run, inspected);
        return;
      }
      interaction.inspected = null;
      if (button?.action === 'sell') {
        sellCreature(run, inspected);
        return;
      }
    }

    const clicked = run.creatures.find((c) => distance(c, point) < CREATURE_CLICK_RADIUS);
    if (clicked) {
      interaction.inspected = clicked;
      return;
    }

    run.hero.target = point;
    interaction.holding = true;
  });

  addEventListener('pointerup', () => {
    interaction.holding = false;
    if (!interaction.draggingCard) return;
    interaction.draggingCard = false;
    // Soltou o arrasto dentro da arena: posiciona. Fora dela, a carta continua escolhida (modo clique).
    if (interaction.pointerInArena && isActive()) tryPlace();
  });

  addEventListener('pointercancel', () => {
    interaction.holding = false;
    interaction.draggingCard = false;
  });

  const select = (id: CreatureId, drag: boolean) => {
    if (!isActive() || !getRun().unlocked.has(id)) return;
    if (interaction.selectedCard === id) {
      interaction.selectedCard = null;
      return;
    }
    interaction.selectedCard = id;
    interaction.draggingCard = drag;
    interaction.inspected = null;
  };

  return {
    pressCard: (id) => select(id, true),
    toggleCard: (id) => select(id, false),
    cancel,
    evolveInspected: () => {
      if (isActive() && interaction.inspected) evolveCreature(getRun(), interaction.inspected);
    },
  };
}

