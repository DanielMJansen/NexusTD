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
  const now = level > 0 ? talentEffectText(kind, perLevel * level) : null;
  const next = level < max ? talentEffectText(kind, perLevel * (level + 1)) : null;
  const pips = '<i class="on"></i>'.repeat(level) + '<i></i>'.repeat(max - level);

  let footer: string;
  if (cost === null) footer = '<span class="node-max">Máximo</span>';
  else if (!available) footer = '<span class="node-lock">🔒 Bloqueado</span>';
  else {
    footer = `<button class="node-buy" data-action="buy" data-value="${id}"${canBuyTalent(profile, id) ? '' : ' disabled'}>
      ${level ? 'Melhorar' : 'Aprender'} ${essence(cost)}</button>`;
  }

  const classes = ['talent-node', level > 0 ? 'owned' : '', !available ? 'locked' : '', cost === null ? 'maxed' : '']
    .filter(Boolean)
    .join(' ');
  return `<div class="${classes}">
    <div class="node-head">
      <span class="node-icon">${def.icon}</span>
      <div><b>${def.name}</b><span class="node-pips">${pips}</span></div>
    </div>
    <div class="node-tip"><b>${def.name}</b><div class="node-desc">${def.description}</div>
    <div class="node-effect">${now ? `Atual: <b>${now}</b>` : ''}${now && next ? '<br>' : ''}${next ? `${now ? 'Próximo' : 'Nível 1'}: <b>${next}</b>` : ''}</div></div>
    ${footer}
  </div>`;
}

/** Ligação entre um nó e o de baixo: acesa quando o requisito já foi cumprido. */
function linkHtml(profile: Profile, child: TalentId): string {
  const req = TALENTS[child].requires;
  if (!req) return '';
  const met = isTalentAvailable(profile, child);
  return `<div class="node-link${met ? ' met' : ''}"><span>${met ? '✓' : `Nv ${req.level}`}</span></div>`;
}

/** Árvore de talentos: uma coluna por ramo, em cadeia vertical (cada nó exige o de cima). */
export function showTalents(profile: Profile, handlers: TalentHandlers): void {
  const columns = TALENT_BRANCHES.map((branch) => {
    const ids = TALENT_IDS.filter((id) => TALENTS[id].branch === branch.id);
    const spent = ids.reduce((sum, id) => sum + TALENTS[id].costs.slice(0, talentLevel(profile, id)).reduce((a, b) => a + b, 0), 0);
    const nodes = ids.map((id) => linkHtml(profile, id) + nodeHtml(profile, id)).join('');
    return `<div class="talent-branch" style="--branch-color:${branch.color}">
      <h3><span class="branch-icon">${branch.icon}</span>${branch.name}</h3>
      <small class="branch-spent">${spent ? `${spent} investidos` : '&nbsp;'}</small>
      ${nodes}
    </div>`;
  }).join('');

  showOverlay(
    `<div class="panel screen talents-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Talentos</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <p class="subtitle">Cada ramo é uma trilha: aprenda o talento de cima para liberar o de baixo.</p>
      <div class="talent-tree">${columns}</div>
    </div>`,
    { buy: (id) => handlers.onBuy(id as TalentId), back: () => handlers.onBack() },
  );
}
