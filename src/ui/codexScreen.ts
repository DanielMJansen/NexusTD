import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { ENEMIES, ENEMY_IDS, type EnemyDef, type EnemyId } from '../data/enemies';
import { STAGE_IDS, STAGES } from '../data/stages';
import type { Profile } from '../game/profile';
import { enemyTraitText, formatNumber } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

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
  const when = wave ? (def.isBoss ? t('Chefe da onda {n}', { n: wave }) : t('A partir da onda {n}', { n: wave })) : '';
  if (!seen) {
    return `<div class="codex-entry unknown">
      <canvas data-sprite="${def.id}" data-silhouette></canvas>
      <div class="codex-text"><b>???</b><span class="codex-when">${when}. ${t('Enfrente-o para descobrir.')}</span></div>
    </div>`;
  }
  const stats: [string, string][] = [
    [t('Vida'), formatNumber(def.hp)],
    [t('Velocidade'), formatNumber(def.speed)],
    [t('Armadura'), formatNumber(def.armor)],
    [t('Dano ao Nexus'), formatNumber(def.nexusDamage)],
    [t('Dano ao herói'), `${formatNumber(def.heroDps)}/s`],
    [t('Ouro'), formatNumber(def.gold)],
  ];
  const traits = def.traits.map((tr) => `<li>${enemyTraitText(tr)}</li>`).join('');
  return `<div class="codex-entry${def.isBoss ? ' boss' : ''}">
    <canvas data-sprite="${def.id}"></canvas>
    <div class="codex-text">
      <b>${def.name}${def.isBoss ? ` <span class="tag">${t('Chefe')}</span>` : ''}</b>
      <span>${def.description}</span>
      <span class="codex-stats">${stats.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</span>
      ${traits ? `<ul class="codex-traits">${traits}</ul>` : ''}
      <span class="codex-when">${when}${def.flying ? ` · ${t('voa')}` : ''}</span>
    </div>
  </div>`;
}

/** Códex: vida, dano, armadura, velocidade e habilidades dos inimigos já enfrentados. */
export function showCodex(profile: Profile, onBack: () => void): void {
  const seen = CODEX_ENEMIES.filter((id) => profile.seenEnemies.includes(id)).length;
  // uma aba por fase (inimigos pela primeira fase em que aparecem)
  const stageOf = (id: EnemyId) =>
    STAGE_IDS.find((s) => STAGES[s].composition.some((c) => c.enemy === id) || STAGES[s].bosses.some((b) => b.enemy === id) || (STAGES[s].script ?? []).some((w) => (w.groups ?? []).some((g) => g.enemy === id))) ?? STAGE_IDS[0]!;
  const tabs: Tab[] = STAGE_IDS.map((s) => {
    const ids = CODEX_ENEMIES.filter((id) => stageOf(id) === s);
    return { id: s, label: `${t('Fase {n}', { n: STAGES[s].number })} · ${STAGES[s].name}`, badge: `${ids.filter((id) => profile.seenEnemies.includes(id)).length}/${ids.length}`, color: STAGES[s].color };
  });
  const shown = currentTab('codex', tabs);
  const items = tabsHtml(tabs, shown) + '<div class="codex-grid">' + CODEX_ENEMIES.filter((id) => stageOf(id) === shown).map((id) => entry(ENEMIES[id], profile.seenEnemies.includes(id))).join('') + '</div>';
  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">${t('← Voltar')}</button>
        <h2>${t('Códex')}</h2>
        <span class="muted">${seen}/${CODEX_ENEMIES.length}</span>
      </div>
      <p class="subtitle">${t('Valores da onda 1. A cada onda os inimigos ganham vida, velocidade e dano; elites (contorno dourado) são ainda mais fortes.')}</p>
      ${items}
    </div>`,
    {
      back: () => onBack(),
      tab: (id) => {
        setTab('codex', id);
        showCodex(profile, onBack);
      },
    },
  );
}
