import { STAGE_IDS, STAGES, type StageId } from '../data/stages';
import { ENEMIES } from '../data/enemies';
import { WAVES } from '../data/waves';
import { isStageUnlocked, type Profile } from '../game/profile';
import { showOverlay } from './overlay';

export interface StageHandlers {
  onSelect(id: StageId): void;
  onBack(): void;
}

/** Mapa de fases: liberadas, vencidas, recordes e a fase da próxima run. */
export function showStages(profile: Profile, handlers: StageHandlers): void {
  const cards = STAGE_IDS.map((id) => {
    const def = STAGES[id];
    const unlocked = isStageUnlocked(profile, id);
    const selected = profile.selectedStage === id;
    const record = profile.stageRecords[id];
    const bosses = def.bosses.map((b) => `onda ${b.wave}: ${ENEMIES[b.enemy].name}`).join(' · ');
    const status = record?.wins ? `✓ Vencida ${record.wins}×` : record?.bestWave ? `Melhor onda ${record.bestWave}` : 'Ainda não jogada';
    let footer: string;
    if (!unlocked) footer = `<span class="cc-tag locked-tag">🔒 Vença a Fase ${STAGES[def.requires!].number}</span>`;
    else if (selected) footer = '<span class="cc-tag">✓ Fase escolhida</span>';
    else footer = `<button data-action="select" data-value="${id}">Escolher</button>`;
    return `<div class="creature-card stage-card${unlocked ? '' : ' locked'}${selected ? ' selected' : ''}" style="--card-color:${def.color}">
      <div class="cc-body">
        <div class="cc-head"><b>Fase ${def.number} · ${def.name}</b><span>${status}</span></div>
        <p class="cc-desc">${def.description}</p>
        <p class="cc-ability">${WAVES.total} ondas · chefes — ${bosses}</p>
        ${record?.bestWave ? `<p class="cc-ability">Recorde: onda ${record.bestWave}${record.bestWave > WAVES.total ? ' (Sem Fim)' : ''}</p>` : ''}
        <div class="cc-footer">${footer}</div>
      </div>
    </div>`;
  }).join('');
  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Fases</h2>
        <div></div>
      </div>
      <p class="subtitle">Vencer uma fase libera a próxima. Novas fases trazem inimigos, chefes e mecânicas novas.</p>
      <div class="creature-grid">${cards}</div>
    </div>`,
    { select: (id) => handlers.onSelect(id as StageId), back: () => handlers.onBack() },
    { keepScroll: true },
  );
}
