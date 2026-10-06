import { ENEMIES, ENEMY_IDS, type EnemyDef, type EnemyId } from '../data/enemies';
import { STAGE_IDS, STAGES } from '../data/stages';
import type { Profile } from '../game/profile';
import { enemyTraitText, formatNumber } from './describe';
import { showOverlay } from './overlay';

/** Inimigos do códex (sem os que só surgem por invocação ou divisão). */
export const CODEX_ENEMIES = ENEMY_IDS.filter((id) => !ENEMIES[id].minion);

/** Primeira onda em que o inimigo aparece (na primeira fase em que ele existe). */
function firstWave(id: EnemyId): number | null {
  for (const stage of STAGE_IDS.map((s) => STAGES[s])) {
    const boss = stage.bosses.find((b) => b.enemy === id);
    if (boss) return boss.wave;
    const entry = stage.composition.find((c) => c.enemy === id);
    if (entry) return entry.fromWave;
  }
  return null;
}

function entry(def: EnemyDef, seen: boolean): string {
  const wave = firstWave(def.id);
  const when = wave ? `${def.isBoss ? 'Chefe da onda' : 'A partir da onda'} ${wave}` : '';
  if (!seen) {
    return `<div class="codex-entry unknown">
      <canvas data-sprite="${def.id}" data-silhouette></canvas>
      <div class="codex-text"><b>???</b><span class="codex-when">${when}. Enfrente-o para descobrir.</span></div>
    </div>`;
  }
  const stats: [string, string][] = [
    ['Vida', formatNumber(def.hp)],
    ['Velocidade', formatNumber(def.speed)],
    ['Armadura', formatNumber(def.armor)],
    ['Dano ao Nexus', formatNumber(def.nexusDamage)],
    ['Dano ao herói', `${formatNumber(def.heroDps)}/s`],
    ['Ouro', formatNumber(def.gold)],
  ];
  const traits = def.traits.map((t) => `<li>${enemyTraitText(t)}</li>`).join('');
  return `<div class="codex-entry${def.isBoss ? ' boss' : ''}">
    <canvas data-sprite="${def.id}"></canvas>
    <div class="codex-text">
      <b>${def.name}${def.isBoss ? ' <span class="tag">Chefe</span>' : ''}</b>
      <span>${def.description}</span>
      <span class="codex-stats">${stats.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</span>
      ${traits ? `<ul class="codex-traits">${traits}</ul>` : ''}
      <span class="codex-when">${when}${def.flying ? ' · voa' : ''}</span>
    </div>
  </div>`;
}

/** Códex: vida, dano, armadura, velocidade e habilidades dos inimigos já enfrentados. */
export function showCodex(profile: Profile, onBack: () => void): void {
  const seen = CODEX_ENEMIES.filter((id) => profile.seenEnemies.includes(id)).length;
  const items = CODEX_ENEMIES.map((id) => entry(ENEMIES[id], profile.seenEnemies.includes(id))).join('');
  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Códex</h2>
        <span class="muted">${seen}/${CODEX_ENEMIES.length}</span>
      </div>
      <p class="subtitle">Valores da onda 1. A cada onda os inimigos ganham vida, velocidade e dano; elites (contorno dourado) são ainda mais fortes.</p>
      <div class="codex-grid">${items}</div>
    </div>`,
    { back: () => onBack() },
  );
}
