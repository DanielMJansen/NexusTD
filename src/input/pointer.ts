import { ARENA } from '../data/config';
import type { CreatureId } from '../data/creatures';
import { creatureCost, evolveCreature, placeCreature } from '../game/economy';
import { distance, type Point, type RunState } from '../game/state';
import type { Interaction } from './interaction';

/** Raio do clique para selecionar uma criatura em campo. */
const CREATURE_CLICK_RADIUS = 18;
const NEXUS_CLICK_RADIUS = 20;

export interface PointerContext {
  canvas: HTMLCanvasElement;
  /** Câmera (o mouse vira coordenada do mundo; guiar o herói volta a segui-lo). */
  camera: { x: number; y: number };
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
export function attachPointer({ canvas, camera, interaction, getRun, isActive }: PointerContext): PointerControls {
  const toArena = (event: PointerEvent): { point: Point; inside: boolean } => {
    const rect = canvas.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    const view = {
      x: ((event.clientX - rect.left) * ARENA.width) / rect.width,
      y: ((event.clientY - rect.top) * ARENA.height) / rect.height,
    };
    // rolagem pela borda só com o mouse sobre a arena (não sobre o HUD)
    interaction.viewPointer = inside && event.target === canvas ? view : null;
    return { point: { x: view.x + camera.x, y: view.y + camera.y }, inside };
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
    interaction.sellArmed = false;
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

    // clicar fora fecha o quadro da criatura (evoluir e vender ficam no quadro, em HTML)
    if (interaction.inspected) {
      interaction.inspected = null;
      interaction.sellArmed = false;
    }

    const clicked = run.creatures.find((c) => distance(c, point) < CREATURE_CLICK_RADIUS);
    if (clicked) {
      interaction.inspected = clicked;
      interaction.sellArmed = false;
      interaction.nexusOpen = false;
      return;
    }
    // clique no Nexus: abre/fecha o quadro de melhorias dele
    if (distance(run.nexus, point) < NEXUS_CLICK_RADIUS) {
      interaction.nexusOpen = !interaction.nexusOpen;
      return;
    }

    run.hero.target = point;
    interaction.holding = true;
  });

  addEventListener('pointerup', (event) => {
    interaction.holding = false;
    if (!interaction.draggingCard) return;
    interaction.draggingCard = false;
    // Soltou o arrasto sobre a arena (não sobre o HUD, como a própria carta): posiciona.
    // Clicou e soltou na carta: ela fica escolhida e um novo clique na arena posiciona.
    if (interaction.pointerInArena && event.target === canvas && isActive()) tryPlace();
  });

  addEventListener('pointercancel', () => {
    interaction.holding = false;
    interaction.draggingCard = false;
  });

  const select = (id: CreatureId, drag: boolean) => {
    const run = getRun();
    if (!isActive() || !run.unlocked.has(id)) return;
    if (interaction.selectedCard === id) {
      interaction.selectedCard = null;
      return;
    }
    // Sem vaga ou sem ouro: nem deixa escolher (a carta pisca em vermelho).
    if (run.creatures.length >= run.creatureLimit || run.gold < creatureCost(run, id)) {
      interaction.denied = { id, at: performance.now() };
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

