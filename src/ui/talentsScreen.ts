import { TALENT_BRANCHES, TALENT_IDS, TALENTS, talentMaxLevel, type TalentId } from '../data/talents';
import { canBuyTalent, isTalentAvailable, talentCost, talentLevel, type Profile } from '../game/profile';
import { essence } from './currency';
import { talentEffectText } from './describe';
import { showOverlay } from './overlay';

export interface TalentHandlers {
  onBuy(id: TalentId): void;
  onBack(): void;
}

function nodeHtml(profile: Profile, id: TalentId): string {
  const def = TALENTS[id];
  const level = talentLevel(profile, id);
  const max = talentMaxLevel(id);
  const cost = talentCost(profile, id);
  const available = isTalentAvailable(profile, id);
  const { kind, perLevel } = def.effect;
  const now = level > 0 ? talentEffectText(kind, perLevel * level) : '—';
  const next = level < max ? talentEffectText(kind, perLevel * (level + 1)) : null;
  const pips = '●'.repeat(level) + '○'.repeat(max - level);

  let footer: string;
  if (cost === null) footer = '<span class="node-max">Máximo</span>';
  else if (!available && def.requires) {
    footer = `<span class="node-lock">🔒 Requer ${TALENTS[def.requires.id].name} nível ${def.requires.level}</span>`;
  } else {
    footer = `<button class="node-buy" data-action="buy" data-value="${id}"${canBuyTalent(profile, id) ? '' : ' disabled'}>
      Melhorar ${essence(cost)}</button>`;
  }

  const classes = ['talent-node', level > 0 ? 'owned' : '', !available ? 'locked' : '', cost === null ? 'maxed' : '']
    .filter(Boolean)
    .join(' ');
  return `<div class="${classes}">
    <div class="node-head"><b>${def.name}</b><span class="pips">${pips}</span></div>
    <div class="node-desc">${def.description}</div>
    <div class="node-effect">Atual: <b>${now}</b>${next ? `<br>Próximo: <b>${next}</b>` : ''}</div>
    ${footer}
  </div>`;
}

/** Árvore de talentos: uma coluna por ramo; nós filhos exigem nível no pai. */
export function showTalents(profile: Profile, handlers: TalentHandlers): void {
  const columns = TALENT_BRANCHES.map((branch) => {
    const nodes = TALENT_IDS.filter((id) => TALENTS[id].branch === branch.id)
      .map((id) => nodeHtml(profile, id))
      .join('<div class="node-link"></div>');
    return `<div class="talent-branch"><h3>${branch.icon} ${branch.name}</h3>${nodes}</div>`;
  }).join('');

  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Talentos</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <div class="talent-tree">${columns}</div>
    </div>`,
    { buy: (id) => handlers.onBuy(id as TalentId), back: () => handlers.onBack() },
  );
}
