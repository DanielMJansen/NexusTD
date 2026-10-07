import { STAGES, type StageId } from '../data/stages';
import { showOverlay } from './overlay';

/** Quadro "como funciona esta fase": mecânicas do mapa, antes da primeira run nela (ou pela pausa). */
export function showStageIntro(stage: StageId, onClose: () => void, closeLabel = '▶ Começar'): void {
  const def = STAGES[stage];
  const tips = def.intro
    .map((tip) => `<li><span class="intro-icon">${tip.icon}</span><div><b>${tip.title}</b><p>${tip.text}</p></div></li>`)
    .join('');
  showOverlay(
    `<div class="panel stage-intro" style="--card-color:${def.color}">
      <small class="intro-kicker">Fase ${def.number}</small>
      <h2>${def.name}</h2>
      <p class="subtitle">${def.description}</p>
      <ul class="intro-tips">${tips}</ul>
      <button class="play-button" data-action="close">${closeLabel}</button>
    </div>`,
    { close: () => onClose() },
  );
}
