import { STAGES, type StageId, type StageTip } from '../data/stages';
import { showOverlay } from './overlay';

export interface IntroContent {
  kicker: string;
  title: string;
  subtitle: string;
  color: string;
  tips: StageTip[];
}

/** Quadro de tutorial (dicas com ícone): fases, Santuário e o que mais precisar de explicação. */
export function showIntro(content: IntroContent, onClose: () => void, closeLabel = '▶ Começar'): void {
  const tips = content.tips
    .map((tip) => `<li><span class="intro-icon">${tip.icon}</span><div><b>${tip.title}</b><p>${tip.text}</p></div></li>`)
    .join('');
  showOverlay(
    `<div class="panel stage-intro" style="--card-color:${content.color}">
      <small class="intro-kicker">${content.kicker}</small>
      <h2>${content.title}</h2>
      <p class="subtitle">${content.subtitle}</p>
      <ul class="intro-tips">${tips}</ul>
      <button class="play-button" data-action="close">${closeLabel}</button>
    </div>`,
    { close: () => onClose() },
  );
}

/** Quadro "como funciona esta fase": mecânicas do mapa, antes da primeira run nela (ou pela pausa). */
export function showStageIntro(stage: StageId, onClose: () => void, closeLabel = '▶ Começar'): void {
  const def = STAGES[stage];
  showIntro({ kicker: `Fase ${def.number}`, title: def.name, subtitle: def.description, color: def.color, tips: def.intro }, onClose, closeLabel);
}
