import { NEXUS_UPGRADES, type NexusLevel, type NexusUpgradeId } from '../data/nexusUpgrades';
import { canBuyNexusUpgrade, nexusUpgradeCost } from '../game/nexus';
import type { RunState } from '../game/state';
import { gold } from './currency';
import { formatNumber } from './describe';

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Efeito de um nível, em texto curto. */
export function nexusLevelText(level: NexusLevel): string {
  switch (level.kind) {
    case 'vitality':
      return `+${level.maxHp} de vida máxima`;
    case 'armor':
      return `−${pct(level.reduction)} de dano recebido`;
    case 'bolt':
      return `${formatNumber(level.damage)} de dano a cada ${formatNumber(level.cooldown)} s, alcance ${level.range}`;
    case 'shield':
      return `imune por ${formatNumber(level.duration)} s, recarga ${level.cooldown} s`;
    case 'slowField':
      return `−${pct(level.slow)} de velocidade num raio de ${level.radius}`;
  }
}

/** Botão "Nexus" e o quadro de melhorias do Nexus compradas com ouro. */
export class NexusPanel {
  private button = document.querySelector<HTMLButtonElement>('#nexus-button')!;
  private panel = document.querySelector<HTMLElement>('#nexus-panel')!;
  private key = '';

  constructor(onToggle: () => void, onBuy: (id: NexusUpgradeId) => void) {
    this.button.addEventListener('click', () => {
      this.button.blur();
      onToggle();
    });
    this.panel.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-upgrade]');
      if (target && !target.disabled) onBuy(target.dataset.upgrade as NexusUpgradeId);
    });
  }

  update(run: RunState, open: boolean): void {
    const anyAffordable = NEXUS_UPGRADES.some((u) => canBuyNexusUpgrade(run, u.id));
    this.button.classList.toggle('open', open);
    this.button.classList.toggle('affordable', anyAffordable && !open);
    this.panel.hidden = !open;
    if (!open) {
      this.key = '';
      return;
    }
    const rows = NEXUS_UPGRADES.map((u) => {
      const level = run.nexusLevels[u.id];
      const cost = nexusUpgradeCost(run, u.id);
      const next = u.levels[level];
      const current = level > 0 ? u.levels[level - 1] : undefined;
      const pips = '<span class="pip on"></span>'.repeat(level) + '<span class="pip"></span>'.repeat(u.levels.length - level);
      const detail = next ? `${current ? 'Próximo: ' : ''}${nexusLevelText(next)}` : nexusLevelText(current!);
      return `<div class="nexus-row${level ? ' owned' : ''}" title="${u.description}">
        <span class="nexus-icon">${u.icon}</span>
        <div class="nexus-text">
          <b>${u.name} <span class="pips">${pips}</span></b>
          <small>${detail}</small>
        </div>
        ${
          cost === null
            ? '<span class="nexus-max">Máx.</span>'
            : `<button type="button" data-upgrade="${u.id}"${canBuyNexusUpgrade(run, u.id) ? '' : ' disabled'}>${gold(cost)}</button>`
        }
      </div>`;
    }).join('');
    // só refaz o HTML quando um nível muda; vida e ouro atualizam no lugar (refazer a cada
    // quadro trocava o botão sob o mouse e o clique de compra se perdia)
    const key = NEXUS_UPGRADES.map((u) => run.nexusLevels[u.id]).join(',');
    if (key !== this.key) {
      this.key = key;
      this.panel.innerHTML = `<h4>Nexus <small></small></h4>${rows}`;
    }
    const hp = `${Math.ceil(run.nexus.hp)}/${run.nexus.maxHp}`;
    const small = this.panel.querySelector('h4 small')!;
    if (small.textContent !== hp) small.textContent = hp;
    for (const button of this.panel.querySelectorAll<HTMLButtonElement>('[data-upgrade]')) {
      const disabled = !canBuyNexusUpgrade(run, button.dataset.upgrade as NexusUpgradeId);
      if (button.disabled !== disabled) button.disabled = disabled;
    }
  }
}
