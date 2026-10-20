import { ASCENSION } from '../data/ascension';
import { ascensionOpen, ascensionUnlocked, selectedAscension } from '../game/profile';
import { STAGE_IDS, stageWaveCount, STAGES, type StageId } from '../data/stages';
import { isStageUnlocked, type Profile } from '../game/profile';
import { paintStageThumbnail } from '../render/arena';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

export interface StageHandlers {
  onSelect(id: StageId): void;
  /** Escolhe o nível de Ascensão da fase. */
  onAscension(id: StageId, level: number): void;
  onBack(): void;
}

/** Fase mostrada no carrossel (lembrada enquanto o jogo estiver aberto). */
let shown: StageId | null = null;

/** Seletor de Ascensão (A0–A3) da fase: só depois de vencer a Cidadela e a própria fase. */
function ascensionRow(profile: Profile, id: StageId): string {
  if (!ascensionOpen(profile)) return '';
  const unlocked = ascensionUnlocked(profile, id);
  if (!unlocked) return `<p class="hint">${t('Vença esta fase para liberar a Ascensão nela.')}</p>`;
  const current = selectedAscension(profile, id);
  const buttons = ASCENSION.levels
    .map((_, level) =>
      level > unlocked
        ? `<button class="asc-chip" disabled title="${t('Vença em A{n} para liberar', { n: level - 1 })}">🔒 A${level}</button>`
        : `<button class="asc-chip${level === current ? ' selected' : ''}" data-action="ascension" data-value="${level}">${level ? `A${level}` : t('Normal')}</button>`,
    )
    .join('');
  const bonus = current ? ` · ${t('Essência')} +${Math.round(ASCENSION.essencePerLevel * current * 100)}%` : '';
  return `<div class="asc-row"><span>${t('Ascensão')}</span>${buttons}</div><p class="hint asc-text">${current ? `A${current}: ${ASCENSION.levels.slice(1, current + 1).map((l) => t(l.text)).join(' ')}` : t('Escolha um nível de Ascensão para mais desafio e mais Essência.')}${bonus}</p>`;
}

/** Fases em carrossel: uma por vez, com a miniatura do mapa, recordes e a escolha. */
export function showStages(profile: Profile, handlers: StageHandlers): void {
  if (!shown || !STAGE_IDS.includes(shown)) shown = profile.selectedStage;
  const index = STAGE_IDS.indexOf(shown);
  const id = shown;
  const def = STAGES[id];
  const unlocked = isStageUnlocked(profile, id);
  const selected = profile.selectedStage === id;
  const record = profile.stageRecords[id];
  const total = stageWaveCount(id);
  const best = record?.bestWave ?? 0;
  let footer: string;
  if (!unlocked) footer = `<span class="cc-tag locked-tag">🔒 ${t('Vença a Fase {n} · {name}', { n: STAGES[def.requires!].number, name: STAGES[def.requires!].name })}</span>`;
  else if (selected) footer = `<span class="cc-tag">${t('✓ Fase escolhida')}</span>`;
  else footer = `<button class="play-button" data-action="select" data-value="${id}">${t('Escolher esta fase')}</button>`;
  const dots = STAGE_IDS.map((s) => `<span class="stage-dot${s === id ? ' active' : ''}${isStageUnlocked(profile, s) ? '' : ' locked'}" style="--card-color:${STAGES[s].color}"></span>`).join('');
  const element = showOverlay(
    `<div class="panel screen stage-carousel">
      <div class="screen-head">
        <button data-action="back">${t('← Voltar')}</button>
        <h2>${t('Fases')}</h2>
        <div></div>
      </div>
      <div class="carousel">
        <button class="carousel-arrow" data-action="prev"${index > 0 ? '' : ' disabled'} title="${t('Fase anterior')}">◀</button>
        <div class="stage-hero${unlocked ? '' : ' locked'}${selected ? ' selected' : ''}" style="--card-color:${def.color}">
          <canvas class="stage-map" width="760" height="380"></canvas>
          <div class="stage-info">
            <div class="cc-head"><b>${t('Fase {n}', { n: def.number })} · ${def.name}</b><span>${t('{n} ondas', { n: total })}</span></div>
            <p class="cc-desc">${def.description}</p>
            <div class="stage-stats">
              <div><small>${t('Vitórias')}</small><b>${record?.wins ?? 0}</b></div>
              <div><small>${t('Melhor onda')}</small><b>${best ? `${best}${best > total ? ` · ${t('Sem Fim')}` : ''}` : '—'}</b></div>
            </div>
            ${ascensionRow(profile, id)}
            <div class="cc-footer">${footer}</div>
          </div>
        </div>
        <button class="carousel-arrow" data-action="next"${index < STAGE_IDS.length - 1 ? '' : ' disabled'} title="${t('Próxima fase')}">▶</button>
      </div>
      <div class="stage-dots">${dots}</div>
    </div>`,
    {
      prev: () => {
        shown = STAGE_IDS[Math.max(0, index - 1)]!;
        showStages(profile, handlers);
      },
      next: () => {
        shown = STAGE_IDS[Math.min(STAGE_IDS.length - 1, index + 1)]!;
        showStages(profile, handlers);
      },
      select: (value) => handlers.onSelect(value as StageId),
      ascension: (value) => handlers.onAscension(id, Number(value)),
      back: () => handlers.onBack(),
    },
  );
  const map = element.querySelector<HTMLCanvasElement>('.stage-map');
  if (map) paintStageThumbnail(map, def);
}
