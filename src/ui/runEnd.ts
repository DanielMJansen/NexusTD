import type { RunResult } from '../game/state';
import { essence } from './currency';
import { showOverlay } from './overlay';

export function showRunEnd(result: RunResult, onContinue: () => void): void {
  const title = result.victory ? 'Vitória!' : 'O Nexus caiu';
  const subtitle = result.victory ? 'O Nexus resistiu às hordas.' : `Derrota na onda ${result.wave}.`;
  showOverlay(
    `<div class="panel">
      <h2>${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="result-stats">
        <div>${result.wave}<small>onda</small></div>
        <div>${result.kills}<small>abates</small></div>
        <div>${essence(`+${result.essence}`)}<small>Essência</small></div>
      </div>
      <button class="play-button" data-action="continue">Continuar</button>
    </div>`,
    { continue: () => onContinue() },
  );
}
