import { ALTAR_NEXUS_CHANCE, findNexusColor } from '../data/nexusSkins';
import { ALTAR, VARIANTS } from '../data/altar';
import { CREATURES } from '../data/creatures';
import type { AltarResult } from '../game/altar';
import type { Profile } from '../game/profile';
import { essence, fragments } from './currency';
import { showOverlay } from './overlay';

export interface AltarHandlers {
  onRoll(): void;
  onBack(): void;
}

const pct = (w: number, total: number) => `${Math.round((w / total) * 1000) / 10}%`.replace('.', ',');

function resultHtml(result: AltarResult): string {
  switch (result.kind) {
    case 'refund':
      return `<div class="altar-result">O Altar devolveu ${essence(result.amount)}.</div>`;
    case 'fragments':
      return `<div class="altar-result">Você recebeu ${fragments(result.amount, result.race)}.</div>`;
    case 'nexusColor': {
      const look = VARIANTS[result.tier];
      const color = findNexusColor(result.color)!;
      return `<div class="altar-result variant" style="--tier-color:${look.color}">
        <canvas data-nexus="${result.color}"></canvas>
        <div><b>Cor do Nexus ${look.name}!</b> ${color.name}<br><small>Escolha-a na tela do Nexus, no menu.</small></div>
      </div>`;
    }
    case 'variant': {
      const look = VARIANTS[result.tier];
      const name = CREATURES[result.creature].name;
      const extra = result.duplicate ? `<small>Todas as suas criaturas já têm essa variante: virou ${fragments(result.amount, result.race)}.</small>` : '<small>Escolha-a na Coleção, no card da criatura.</small>';
      return `<div class="altar-result variant" style="--tier-color:${look.color}">
        <canvas data-sprite="${result.creature}" data-variant="${result.tier}"></canvas>
        <div><b>Variante ${look.name}!</b> ${name}<br>${extra}</div>
      </div>`;
    }
  }
}

/** Altar de Variantes: sorteio cosmético com Essência, chances à vista e garantia. */
export function showAltar(profile: Profile, handlers: AltarHandlers, last?: AltarResult): void {
  const total = ALTAR.outcomes.reduce((s, o) => s + o.weight, 0);
  const odds = ALTAR.outcomes
    .map((o) => {
      const label =
        o.kind === 'refund' ? `Devolve ${essence(o.amount)}` : o.kind === 'fragments' ? `${fragments(o.amount)} de uma raça da coleção` : `<b style="color:${VARIANTS[o.tier].color}">Variante ${VARIANTS[o.tier].name}</b>${o.tier !== 'rare' ? ` <small>(${Math.round(ALTAR_NEXUS_CHANCE * 100)}%: cor do Nexus ${o.tier === 'epic' ? 'Vazio' : 'Aurora'})</small>` : ''}`;
      return `<li><span>${label}</span><b>${pct(o.weight, total)}</b></li>`;
    })
    .join('');
  const epicIn = ALTAR.pity.epic - profile.altarPity.epic;
  const legendaryIn = ALTAR.pity.legendary - profile.altarPity.legendary;
  const can = profile.essence >= ALTAR.cost;
  const element = showOverlay(
    `<div class="panel screen altar">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Altar de Variantes</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <p class="subtitle">Variantes mudam só a aparência das criaturas da sua coleção (cores, aura e faíscas). Não dão poder.</p>
      ${last ? resultHtml(last) : ''}
      <div class="altar-columns">
        <ul class="altar-odds">${odds}</ul>
        <div class="altar-pity">
          <p>Épica (ou melhor) garantida em <b>${epicIn}</b> sorteio${epicIn === 1 ? '' : 's'}.</p>
          <p>Lendária garantida em <b>${legendaryIn}</b> sorteio${legendaryIn === 1 ? '' : 's'}.</p>
          <div class="altar-roll">
            <button class="play-button" data-action="ask"${can ? '' : ' disabled'}>Sortear ${essence(ALTAR.cost)}</button>
          </div>
        </div>
      </div>
    </div>`,
    {
      ask: () => {
        const box = element.querySelector<HTMLElement>('.altar-roll');
        if (box) {
          box.innerHTML = `<div class="cc-confirm"><span>Sortear por ${essence(ALTAR.cost)}? Sobram ${essence(profile.essence - ALTAR.cost)}</span>
            <button data-action="cancel">Cancelar</button><button class="play-button" data-action="roll">Confirmar</button></div>`;
        }
      },
      cancel: () => showAltar(profile, handlers, last),
      roll: () => handlers.onRoll(),
      back: () => handlers.onBack(),
    },
    { keepScroll: true },
  );
}
