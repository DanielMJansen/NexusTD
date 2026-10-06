import { ARENA } from '../data/config';
import { MAX_CREATURE_LEVEL } from '../data/evolution';
import {
  ascendedForm,
  creatureAbility,
  creatureAttacksPerSecond,
  creatureEffects,
  creatureDamage,
  creatureName,
  creatureRange,
} from '../game/creatureStats';
import { canEvolve, evolveCost, needsBranchChoice, sellValue } from '../game/economy';
import type { Creature, RunState } from '../game/state';
import type { Interaction } from '../input/interaction';
import { gold } from './currency';
import { abilityText, formatNumber } from './describe';

export interface CreaturePopupHandlers {
  /** Evoluir a criatura inspecionada; `branch` na escolha da vertente. */
  onEvolve(branch?: number): void;
  /** Vender (o 1º clique arma, o 2º confirma). */
  onSell(): void;
}

interface Stats {
  damage: number;
  speed: number;
  range: number;
}

const round1 = (v: number) => formatNumber(Math.round(v * 10) / 10);
const round2 = (v: number) => formatNumber(Math.round(v * 100) / 100);

function statsOf(run: RunState, creature: Creature): Stats {
  const m = run.modifiers;
  return {
    damage: creatureDamage(creature, m),
    speed: creatureAttacksPerSecond(creature, m),
    range: creatureRange(creature, m),
  };
}

/** Linha "atual → depois", destacando o que sobe (verde) e o que desce (vermelho). */
function deltaRows(now: Stats, next: Stats): string {
  const row = (label: string, a: number, b: number, fmt: (v: number) => string) => {
    const cls = b > a + 1e-6 ? 'up' : b < a - 1e-6 ? 'down' : '';
    return `<dt>${label}</dt><dd>${fmt(a)} <span class="arrow">→</span> <b class="${cls}">${fmt(b)}</b></dd>`;
  };
  return `<dl class="cp-delta">
    ${row('Dano', now.damage, next.damage, round1)}
    ${row('Ataques/s', now.speed, next.speed, round2)}
    ${row('Alcance', now.range, next.range, (v) => String(Math.round(v)))}
  </dl>`;
}

/** Quadro sobre a criatura clicada: atributos, habilidade, evolução (com as vertentes lado a lado) e venda. */
export class CreaturePopup {
  /** Câmera da arena (posição do popup na tela). */
  camera: { x: number; y: number } = { x: 0, y: 0 };
  private root = document.querySelector<HTMLElement>('#creature-popup')!;

  constructor(
    private readonly interaction: Interaction,
    handlers: CreaturePopupHandlers,
  ) {
    this.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (!button || button.disabled) return;
      if (button.dataset.action === 'evolve') {
        handlers.onEvolve(button.dataset.branch === undefined ? undefined : Number(button.dataset.branch));
      } else if (button.dataset.action === 'sell') handlers.onSell();
    });
    // passar o mouse numa vertente mostra o alcance dela na arena
    this.root.addEventListener('pointerover', (event) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>('[data-branch-card]');
      this.interaction.hoverBranch = card ? Number(card.dataset.branchCard) : null;
    });
    this.root.addEventListener('pointerleave', () => {
      this.interaction.hoverBranch = null;
    });
  }

  update(run: RunState, visible: boolean): void {
    const creature = this.interaction.inspected;
    if (!visible || !creature || !run.creatures.includes(creature)) {
      this.root.hidden = true;
      this.interaction.hoverBranch = null;
      return;
    }
    const html = this.content(run, creature);
    if (this.root.innerHTML !== html) this.root.innerHTML = html;
    this.root.classList.toggle('wide', needsBranchChoice(creature));
    this.root.style.setProperty('--card-color', ascendedForm(creature)?.color ?? creature.def.color);
    this.root.hidden = false;
    this.place(creature);
  }

  private content(run: RunState, creature: Creature): string {
    const now = statsOf(run, creature);
    const stars =
      '<span class="star-on">' +
      '★'.repeat(creature.level) +
      '</span><span class="star-off">' +
      '★'.repeat(MAX_CREATURE_LEVEL - creature.level) +
      '</span>';
    const form = ascendedForm(creature);
    const cost = evolveCost(creature, run.talents.evolveDiscount);
    const affordable = canEvolve(run, creature);
    const evolveLabel = (c: number) => `${affordable ? '' : '<small>falta ouro</small> '}${gold(c)}`;

    let evolve = '';
    if (cost === null) {
      evolve = `<p class="cp-final">Forma final${form ? ` · <span class="branch-tag" style="--branch-color:${form.color}">${form.icon} ${creature.branch === 1 ? 'B' : 'A'}</span>` : ''}</p>`;
    } else if (needsBranchChoice(creature)) {
      const cards = creature.def.ascended
        .map((f, i) => {
          const next = statsOf(run, { ...creature, level: creature.level + 1, branch: i });
          return `<div class="cp-branch" data-branch-card="${i}" style="--branch-color:${f.color}">
            <div class="cp-branch-head"><span class="branch-tag">${f.icon} ${i === 0 ? 'A' : 'B'}</span><b>${f.name}</b></div>
            <p class="cp-branch-desc">${f.description}</p>
            <p class="cp-ability">${abilityText(f.ability, f.effects ?? creature.def.effects)}</p>
            ${deltaRows(now, next)}
            <button type="button" data-action="evolve" data-branch="${i}"${affordable ? '' : ' disabled'}>Escolher ${evolveLabel(cost)}</button>
          </div>`;
        })
        .join('');
      evolve = `<p class="cp-section">Nível 3: escolha a vertente</p><div class="cp-branches">${cards}</div>`;
    } else {
      const next = statsOf(run, { ...creature, level: creature.level + 1 });
      evolve = `<p class="cp-section">Evoluir para o nível ${creature.level + 1}</p>
        ${deltaRows(now, next)}
        <button type="button" class="cp-evolve" data-action="evolve"${affordable ? '' : ' disabled'}>Evoluir ${evolveLabel(cost)} <kbd>E</kbd></button>`;
    }

    const armed = this.interaction.sellArmed;
    return `<div class="cp-head"><b>${creatureName(creature)}</b><span class="stars">${stars}</span></div>
      <div class="cp-sub">${creature.def.race} · investido ${gold(creature.paid)}</div>
      <dl class="cp-stats">
        <dt>Dano</dt><dd>${round1(now.damage)}</dd>
        <dt>Ataques/s</dt><dd>${round2(now.speed)}${creature.auraBonus > 0 ? ' <small>(aura)</small>' : ''}</dd>
        <dt>Alcance</dt><dd>${Math.round(now.range)}</dd>
      </dl>
      <p class="cp-ability">${abilityText(creatureAbility(creature), creatureEffects(creature))}</p>
      ${evolve}
      <button type="button" class="cp-sell${armed ? ' armed' : ''}" data-action="sell">${armed ? 'Confirmar venda' : 'Vender'} +${gold(sellValue(creature))}</button>`;
  }

  /** Acima da criatura (ou abaixo, se não couber), sempre dentro da arena. */
  private place(creature: Creature): void {
    const stage = this.root.parentElement!;
    const scale = stage.clientWidth / ARENA.width;
    const width = this.root.offsetWidth;
    const height = this.root.offsetHeight;
    const margin = 8;
    const x = (creature.x - this.camera.x) * scale;
    const above = (creature.y - this.camera.y - 30) * scale - height;
    const below = (creature.y - this.camera.y + 24) * scale;
    const top = above >= margin ? above : Math.min(below, stage.clientHeight - height - margin);
    const left = Math.max(margin, Math.min(stage.clientWidth - width - margin, x - width / 2));
    this.root.style.left = `${Math.round(left)}px`;
    this.root.style.top = `${Math.round(Math.max(margin, top))}px`;
  }
}
