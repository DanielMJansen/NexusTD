import { GAME_TITLE } from '../data/config';
import { showOverlay } from './overlay';

/**
 * Tela de entrada. O clique (ou Enter/Espaço) é o gesto que o navegador exige
 * para liberar o áudio, então a música do menu já começa depois dele.
 */
export function showEntry(onStart: () => void): void {
  showOverlay(
    `<button class="entry" data-action="start">
      <span class="entry-title">${GAME_TITLE}</span>
      <span class="entry-hint">Clique para começar</span>
    </button>`,
    { start: () => onStart() },
  );
}
