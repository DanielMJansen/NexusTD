import type { RunResult } from '../game/state';
import { showOverlay } from './overlay';

export function showRunEnd(result: RunResult, onContinue: () => void): void {
  const title = result.victory ? 'Vitória! O Nexus resistiu.' : `Derrota na onda ${result.wave}`;
  showOverlay(
    `<h3>${title}</h3>
    <p>Abates: ${result.kills}<br>Essência ganha: <b>+${result.essence} ✦</b></p>
    <button data-action="continue">Continuar</button>`,
    { continue: () => onContinue() },
  );
}
