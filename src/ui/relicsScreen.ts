import { RELIC_DROPS, RELIC_IDS, RELIC_MAX_LEVEL, RELIC_SLOTS, RELICS, relicLevel, type RelicId } from '../data/relics';
import { STAGE_IDS, STAGES } from '../data/stages';
import { activeRelics, convertRelicCopy, relicLevelOf, relicSlots, toggleRelic, upgradeRelic, type Profile } from '../game/profile';
import { essence } from './currency';
import { showOverlay } from './overlay';

/** Condição de cada vaga (a 1ª vem com a liberação das Relíquias). */
const SLOT_HINTS = ['Liberada ao vencer a Tundra', 'Vença o Deserto Dourado', `Chegue à onda ${RELIC_SLOTS.desertEndlessWave} do Sem Fim no Deserto`];

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Bolinhas do nível (● cheio, ○ vazio). */
const levelDots = (level: number) => `<span class="relic-level" title="Nível ${level} de ${RELIC_MAX_LEVEL}">${'●'.repeat(level)}${'○'.repeat(RELIC_MAX_LEVEL - level)}</span>`;

/** Relíquias: vagas no topo e a coleção abaixo (equipar, subir de nível com cópias ou trocar cópias por Essência). */
export function showRelics(profile: Profile, onChange: () => void, onBack: () => void, onHelp: () => void): void {
  const slots = relicSlots(profile);
  const active = activeRelics(profile);
  const lastStage = STAGES[STAGE_IDS.at(-1)!].number;
  const minChance = RELIC_DROPS.mid.base;
  const maxChance = RELIC_DROPS.final.base + RELIC_DROPS.final.perStage * (lastStage - 1);

  const slotHtml = Array.from({ length: RELIC_SLOTS.max }, (_, i) => {
    const id = active[i];
    if (i >= slots) return `<div class="relic-slot locked"><span>🔒</span><small>${SLOT_HINTS[i]}</small></div>`;
    if (!id) return '<div class="relic-slot empty"><span>＋</span><small>Vaga livre</small></div>';
    return `<button class="relic-slot filled" data-action="toggle" data-value="${id}" title="Tirar"><span>${RELICS[id].icon}</span><small>${RELICS[id].name} · Nv ${relicLevelOf(profile, id)}</small></button>`;
  }).join('');

  const card = (id: RelicId) => {
    const def = RELICS[id];
    if (!profile.relics.includes(id)) {
      return '<div class="relic-card unknown"><div class="relic-head"><span class="relic-icon">?</span><b>Desconhecida</b></div><p>Sai de um baú de chefe.</p></div>';
    }
    const level = relicLevelOf(profile, id);
    const copies = profile.relicCopies[id] ?? 0;
    const on = active.includes(id);
    const full = !on && active.length >= slots;
    const next = level < RELIC_MAX_LEVEL ? `<p class="relic-next">Nível ${level + 1}: ${relicLevel(id, level + 1).description}</p>` : '<p class="relic-next">Nível máximo.</p>';
    const copyRow = copies
      ? `<div class="relic-copies"><small>${copies} ${copies === 1 ? 'cópia' : 'cópias'}:</small>
          ${level < RELIC_MAX_LEVEL ? `<button data-action="upgrade" data-value="${id}" title="Gasta 1 cópia">⬆ Nível</button>` : ''}
          <button data-action="convert" data-value="${id}" title="Troca 1 cópia por Essência">${essence(RELIC_DROPS.copyEssence)}</button></div>`
      : '';
    return `<div class="relic-card${on ? ' equipped' : ''}" title="${def.lore}">
      <div class="relic-head"><span class="relic-icon">${def.icon}</span><b>${def.name}</b></div>
      ${levelDots(level)}
      <p>${relicLevel(id, level).description}</p>
      ${next}
      ${copyRow}
      <button data-action="toggle" data-value="${id}"${full ? ' disabled' : ''}>${on ? 'Tirar' : full ? 'Sem vaga' : 'Equipar'}</button>
    </div>`;
  };

  const rerender = () => showRelics(profile, onChange, onBack, onHelp);
  showOverlay(
    `<div class="panel screen relics-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Relíquias</h2>
        <span class="muted">${profile.relics.length}/${RELIC_IDS.length} <button data-action="help" title="Rever o tutorial">Como funciona?</button></span>
      </div>
      <div class="relic-slots">${slotHtml}</div>
      <p class="hint">Equipe antes da run: valem a run inteira. Cada chefe abatido tem chance de deixar um baú de Relíquia: de ${pct(minChance)} (chefes do meio do Cemitério) a ${pct(maxChance)} (chefe final da Cidadela); o Sem Fim também conta. Garantia: ${profile.relicPity} de ${RELIC_DROPS.pity} chefes sem baú. Repetidas viram cópias: sobem o nível da Relíquia (até ${RELIC_MAX_LEVEL}) ou valem ${essence(RELIC_DROPS.copyEssence)}.</p>
      <div class="relic-grid">${RELIC_IDS.map(card).join('')}</div>
    </div>`,
    {
      back: () => onBack(),
      help: () => onHelp(),
      toggle: (id) => {
        if (toggleRelic(profile, id as RelicId)) onChange();
        rerender();
      },
      upgrade: (id) => {
        if (upgradeRelic(profile, id as RelicId)) onChange();
        rerender();
      },
      convert: (id) => {
        if (convertRelicCopy(profile, id as RelicId)) onChange();
        rerender();
      },
    },
    { keepScroll: true },
  );
}
