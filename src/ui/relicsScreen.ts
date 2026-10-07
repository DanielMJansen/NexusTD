import { RELIC_DROPS, RELIC_IDS, RELIC_SLOTS, RELICS, type RelicId } from '../data/relics';
import { STAGE_IDS, STAGES } from '../data/stages';
import { activeRelics, relicSlots, toggleRelic, type Profile } from '../game/profile';
import { showOverlay } from './overlay';

/** Condição de cada vaga (a 1ª vem com a liberação das Relíquias). */
const SLOT_HINTS = ['Liberada ao vencer a Tundra', 'Vença o Deserto Dourado', `Chegue à onda ${RELIC_SLOTS.desertEndlessWave} do Sem Fim no Deserto`];

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Relíquias: vagas no topo e a coleção abaixo (clique para equipar ou tirar). */
export function showRelics(profile: Profile, onChange: () => void, onBack: () => void): void {
  const slots = relicSlots(profile);
  const active = activeRelics(profile);
  const bosses = STAGE_IDS.flatMap((s) => STAGES[s].bosses.map((b) => b.enemy));
  const lastStage = STAGES[STAGE_IDS.at(-1)!].number;
  const maxChance = RELIC_DROPS.finalChance * (1 + RELIC_DROPS.perStage * (lastStage - 1));

  const slotHtml = Array.from({ length: RELIC_SLOTS.max }, (_, i) => {
    const id = active[i];
    if (i >= slots) return `<div class="relic-slot locked"><span>🔒</span><small>${SLOT_HINTS[i]}</small></div>`;
    if (!id) return '<div class="relic-slot empty"><span>＋</span><small>Vaga livre</small></div>';
    return `<button class="relic-slot filled" data-action="toggle" data-value="${id}" title="Tirar"><span>${RELICS[id].icon}</span><small>${RELICS[id].name}</small></button>`;
  }).join('');

  const card = (id: RelicId) => {
    const def = RELICS[id];
    if (!profile.relics.includes(id)) {
      return '<div class="relic-card unknown"><span class="relic-icon">?</span><b>Relíquia desconhecida</b><p>Deixada por um chefe.</p></div>';
    }
    const on = active.includes(id);
    const full = !on && active.length >= slots;
    return `<div class="relic-card${on ? ' equipped' : ''}">
      <span class="relic-icon">${def.icon}</span>
      <b>${def.name}</b>
      <p>${def.description}</p>
      <em>${def.lore}</em>
      <button data-action="toggle" data-value="${id}"${full ? ' disabled' : ''}>${on ? 'Tirar' : full ? 'Sem vaga' : 'Equipar'}</button>
    </div>`;
  };

  showOverlay(
    `<div class="panel screen relics-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Relíquias</h2>
        <span class="muted">${profile.relics.length}/${RELIC_IDS.length}</span>
      </div>
      <p class="subtitle">Tesouros dos chefes. Equipe antes da run: valem a run inteira.</p>
      <div class="relic-slots">${slotHtml}</div>
      <p class="hint">Chefes de todas as fases deixam Relíquias. O 1º abate de cada chefe garante uma nova (${profile.relicBosses.filter((b) => bosses.includes(b)).length} de ${bosses.length} chefes já deram a sua); depois, cada abate tem chance de ${pct(RELIC_DROPS.midChance)} (chefe do meio da 1ª fase) a ${pct(maxChance)} (chefe final do Deserto). Vale no Sem Fim.</p>
      <div class="relic-grid">${RELIC_IDS.map(card).join('')}</div>
    </div>`,
    {
      back: () => onBack(),
      toggle: (id) => {
        if (toggleRelic(profile, id as RelicId)) onChange();
        showRelics(profile, onChange, onBack);
      },
    },
  );
}
