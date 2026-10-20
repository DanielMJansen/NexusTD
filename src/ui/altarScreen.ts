import { variantTheme } from '../data/variantThemes';
import { ALTAR_NEXUS_CHANCE, findNexusColor } from '../data/nexusSkins';
import { ALTAR, VARIANTS } from '../data/altar';
import { CREATURES } from '../data/creatures';
import type { AltarResult } from '../game/altar';
import type { Profile } from '../game/profile';
import { essence, fragments } from './currency';
import { formatNumber } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

export interface AltarHandlers {
  onRoll(): void;
  onBack(): void;
}

const pct = (w: number, total: number) => `${formatNumber(Math.round((w / total) * 1000) / 10)}%`;

function resultHtml(result: AltarResult): string {
  switch (result.kind) {
    case 'refund':
      return `<div class="altar-result">${t('O Altar devolveu {e}.', { e: essence(result.amount) })}</div>`;
    case 'fragments':
      return `<div class="altar-result">${t('Você recebeu {f}.', { f: fragments(result.amount, result.race) })}</div>`;
    case 'nexusColor': {
      const look = VARIANTS[result.tier];
      const color = findNexusColor(result.color)!;
      return `<div class="altar-result variant" style="--tier-color:${look.color}">
        <canvas data-nexus="${result.color}"></canvas>
        <div><b>${t('Cor do Nexus {tier}!', { tier: look.name })}</b> ${color.name}<br><small>${t('Escolha-a na tela do Nexus, no menu.')}</small></div>
      </div>`;
    }
    case 'variant': {
      const look = VARIANTS[result.tier];
      const name = CREATURES[result.creature].name;
      const extra = result.duplicate
        ? `<small>${t('Todas as suas criaturas já têm essa variante: virou {f}.', { f: fragments(result.amount, result.race) })}</small>`
        : `<small>${t('Escolha-a na Coleção, no card da criatura.')}</small>`;
      return `<div class="altar-result variant" style="--tier-color:${look.color}">
        <canvas data-sprite="${result.creature}" data-variant="${result.tier}"></canvas>
        <div><b>${t('Variante {tier} · {theme}!', { tier: look.name, theme: variantTheme(result.creature, result.tier).name })}</b> ${name}<br>${extra}</div>
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
        o.kind === 'refund'
          ? t('Devolve {e}', { e: essence(o.amount) })
          : o.kind === 'fragments'
            ? t('{f} de uma raça da coleção', { f: fragments(o.amount) })
            : `<b style="color:${VARIANTS[o.tier].color}">${t('Variante {tier}', { tier: VARIANTS[o.tier].name })}</b>${
                o.tier !== 'rare'
                  ? ` <small>(${t('{p}%: cor do Nexus {color}', { p: Math.round(ALTAR_NEXUS_CHANCE * 100), color: findNexusColor(o.tier === 'epic' ? 'void' : 'aurora')?.name ?? '' })})</small>`
                  : ''
              }`;
      return `<li><span>${label}</span><b>${pct(o.weight, total)}</b></li>`;
    })
    .join('');
  const epicIn = ALTAR.pity.epic - profile.altarPity.epic;
  const legendaryIn = ALTAR.pity.legendary - profile.altarPity.legendary;
  const can = profile.essence >= ALTAR.cost;
  const element = showOverlay(
    `<div class="panel screen altar">
      <div class="screen-head">
        <button data-action="back">${t('← Voltar')}</button>
        <h2>${t('Altar de Variantes')}</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <p class="subtitle">${t('Variantes mudam só a aparência das criaturas da sua coleção (cores, aura e faíscas). Não dão poder.')}</p>
      ${last ? resultHtml(last) : ''}
      <div class="altar-columns">
        <ul class="altar-odds">${odds}</ul>
        <div class="altar-pity">
          <p>${epicIn === 1 ? t('Épica (ou melhor) garantida no próximo sorteio.') : t('Épica (ou melhor) garantida em <b>{n}</b> sorteios.', { n: epicIn })}</p>
          <p>${legendaryIn === 1 ? t('Lendária garantida no próximo sorteio.') : t('Lendária garantida em <b>{n}</b> sorteios.', { n: legendaryIn })}</p>
          <div class="altar-roll">
            <button class="play-button" data-action="ask"${can ? '' : ' disabled'}>${t('Sortear')} ${essence(ALTAR.cost)}</button>
          </div>
        </div>
      </div>
    </div>`,
    {
      ask: () => {
        const box = element.querySelector<HTMLElement>('.altar-roll');
        if (box) {
          box.innerHTML = `<div class="cc-confirm"><span>${t('Sortear por {e}? Sobram {left}', { e: essence(ALTAR.cost), left: essence(profile.essence - ALTAR.cost) })}</span>
            <button data-action="cancel">${t('Cancelar')}</button><button class="play-button" data-action="roll">${t('Confirmar')}</button></div>`;
        }
      },
      cancel: () => showAltar(profile, handlers, last),
      roll: () => handlers.onRoll(),
      back: () => handlers.onBack(),
    },
    { keepScroll: true },
  );
}
