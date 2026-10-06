import { ACHIEVEMENTS } from '../data/achievements';
import { NEXUS_COLORS, NEXUS_MODEL_IDS, NEXUS_MODELS, type NexusModelId } from '../data/nexusSkins';
import { STAGES } from '../data/stages';
import { isNexusColorUnlocked, isNexusModelUnlocked } from '../game/nexusSkins';
import type { Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
import { showOverlay } from './overlay';

export interface NexusScreenHandlers {
  onModel(model: NexusModelId | 'map'): void;
  onColor(color: string): void;
  onBuyColor(color: string): void;
  onBack(): void;
}

/** Modelo usado na prévia de cores: o escolhido, ou o da fase atual quando "do mapa". */
function previewModel(profile: Profile): NexusModelId {
  return profile.nexusLook.model === 'map' ? STAGES[profile.selectedStage].nexusModel : profile.nexusLook.model;
}

/** Skins do Nexus: modelo (forma) e cor (paleta), combináveis. Só visual. */
export function showNexusSkins(profile: Profile, handlers: NexusScreenHandlers): void {
  const look = profile.nexusLook;
  const model = previewModel(profile);
  const mapCard = `<button class="nexus-skin${look.model === 'map' ? ' selected' : ''}" data-action="model" data-value="map">
      <canvas data-nexus="${look.color}" data-model="${STAGES[profile.selectedStage].nexusModel}"></canvas>
      <b>Do mapa</b><small>Cada fase mostra seu Nexus</small></button>`;
  const models = NEXUS_MODEL_IDS.map((id) => {
    const def = NEXUS_MODELS[id];
    const unlocked = isNexusModelUnlocked(profile, id);
    const how = def.stage ? `🔒 Vença a Fase ${STAGES[def.stage].number} · ${STAGES[def.stage].name}` : '';
    return `<button class="nexus-skin${look.model === id ? ' selected' : ''}" data-action="model" data-value="${id}"${unlocked ? '' : ' disabled'}>
      <canvas data-nexus="${look.color}" data-model="${id}"${unlocked ? '' : ' data-locked'}></canvas>
      <b>${def.name}</b><small>${unlocked ? def.description.split('.')[0] : how}</small></button>`;
  }).join('');
  const original = `<button class="nexus-skin${look.color === 'original' ? ' selected' : ''}" data-action="color" data-value="original">
      <canvas data-nexus="original" data-model="${model}"></canvas><b>Original</b><small>Cores do próprio modelo</small></button>`;
  const colors = NEXUS_COLORS.map((c) => {
    const unlocked = isNexusColorUnlocked(profile, c);
    let how = '';
    if (!unlocked) {
      if (c.unlock.kind === 'essence') how = `<span class="nexus-buy" data-color="${c.id}"><button data-action="ask" data-value="${c.id}"${profile.essence >= c.unlock.cost ? '' : ' disabled'}>Comprar ${essence(c.unlock.cost)}</button></span>`;
      else if (c.unlock.kind === 'achievement') how = `<small>🏆 Conquista: ${ACHIEVEMENTS[c.unlock.id].name}</small>`;
      else how = `<small>✨ Altar (${c.unlock.tier === 'epic' ? 'Épica' : 'Lendária'})</small>`;
    }
    const inner = `<canvas data-nexus="${c.id}" data-model="${model}"></canvas><b>${c.name}</b>`;
    return unlocked
      ? `<button class="nexus-skin${look.color === c.id ? ' selected' : ''}" data-action="color" data-value="${c.id}">${inner}<small>${c.animated ? 'Cores que mudam' : 'Liberada'}</small></button>`
      : `<div class="nexus-skin locked">${inner}${how}</div>`;
  }).join('');
  const element = showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Nexus</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <p class="subtitle">Escolha o modelo e a cor do Nexus. Só visual. Vencer fases libera modelos; cores vêm da Essência, de conquistas e do Altar.</p>
      <h3>Modelo</h3>
      <div class="nexus-grid">${mapCard}${models}</div>
      <h3>Cor</h3>
      <div class="nexus-grid">${original}${colors}</div>
    </div>`,
    {
      model: (id) => handlers.onModel(id as NexusModelId | 'map'),
      color: (id) => handlers.onColor(id),
      ask: (id) => {
        const box = element.querySelector<HTMLElement>(`.nexus-buy[data-color="${id}"]`);
        const c = NEXUS_COLORS.find((x) => x.id === id);
        if (box && c?.unlock.kind === 'essence') box.innerHTML = confirmPurchaseHtml(id, c.unlock.cost, profile.essence).replace('Desbloquear por', 'Comprar por');
      },
      cancel: () => showNexusSkins(profile, handlers),
      buy: (id) => handlers.onBuyColor(id),
      back: () => handlers.onBack(),
    },
    { keepScroll: true },
  );
}
