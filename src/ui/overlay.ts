import { findNexusColor, NEXUS_MODELS, type NexusModelId } from '../data/nexusSkins';
import { drawNexusPreview } from '../render/portrait';
import { VARIANTS, type VariantTier } from '../data/altar';
import { findSkin } from '../data/skins';
import { drawPortrait } from '../render/portrait';
import type { SpriteId } from '../render/sprites';
import { paintRaceBadge } from '../render/raceIcons';
import { drawFeatureDemo } from '../render/featureDemos';

/** Ações dos botões do overlay, indexadas por `data-action`; recebem o `data-value` do botão. */
export type OverlayActions = Record<string, (value: string) => void>;

const overlay = document.querySelector<HTMLElement>('#overlay')!;
let actions: OverlayActions = {};
/** Canvases com `data-sprite`, animados a cada quadro enquanto o overlay está aberto. */
let portraits: HTMLCanvasElement[] = [];
/** Prévias do Nexus (`data-nexus` = cor ou "original"; `data-model` = modelo). */
let nexusPreviews: HTMLCanvasElement[] = [];
/** Ilustrações animadas dos tutoriais (`data-demo`). */
let demos: HTMLCanvasElement[] = [];
/** Variante escolhida de cada criatura (Coleção): vale para todo retrato sem `data-variant` próprio. */
let chosenVariants: Partial<Record<string, VariantTier>> = {};

/** O app informa as variantes escolhidas do perfil (retratos de qualquer tela mostram a variante). */
export function setChosenVariants(variants: Partial<Record<string, VariantTier>>): void {
  chosenVariants = variants;
}

overlay.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
  if (!button || button.disabled) return;
  actions[button.dataset.action!]?.(button.dataset.value ?? '');
});

/**
 * Mostra o overlay e devolve o elemento (para telas que precisam de mais eventos, como sliders).
 * keepScroll: redesenha a mesma tela sem voltar ao topo (ex.: depois de uma compra).
 */
export function showOverlay(html: string, newActions: OverlayActions, options: { keepScroll?: boolean } = {}): HTMLElement {
  actions = newActions;
  const scroll = overlay.scrollTop;
  overlay.innerHTML = html;
  overlay.scrollTop = options.keepScroll ? scroll : 0;
  overlay.classList.add('visible');
  portraits = [...overlay.querySelectorAll<HTMLCanvasElement>('canvas[data-sprite]')];
  nexusPreviews = [...overlay.querySelectorAll<HTMLCanvasElement>('canvas[data-nexus]')];
  demos = [...overlay.querySelectorAll<HTMLCanvasElement>('canvas[data-demo]')];
  // selos de raça: pintados uma vez
  for (const badge of overlay.querySelectorAll<HTMLCanvasElement>('canvas[data-race]')) paintRaceBadge(badge, badge.dataset.race!);
  return overlay;
}

export function hideOverlay(): void {
  actions = {};
  portraits = [];
  nexusPreviews = [];
  demos = [];
  overlay.classList.remove('visible');
  overlay.innerHTML = '';
}

export function isOverlayVisible(): boolean {
  return overlay.classList.contains('visible');
}

/** Filtro da variante de um retrato: explícita, "none" (original) ou a escolhida no perfil. */
function variantFilter(canvas: HTMLCanvasElement): string | undefined {
  const own = canvas.dataset.variant;
  if (own === 'none') return undefined;
  const tier = (own as VariantTier | undefined) ?? chosenVariants[canvas.dataset.sprite ?? ''];
  return tier ? VARIANTS[tier]?.filter : undefined;
}

/** Redesenha os retratos (`data-sprite`, e opcionais `data-level`, `data-branch`, `data-skin`, `data-silhouette`). */
export function animateOverlay(time: number): void {
  for (const canvas of demos) drawFeatureDemo(canvas, canvas.dataset.demo!, time);
  for (const canvas of nexusPreviews) {
    const model = (canvas.dataset.model ?? 'crystal') as NexusModelId;
    const color = findNexusColor(canvas.dataset.nexus ?? '');
    drawNexusPreview(canvas, time, { model, palette: color?.palette ?? NEXUS_MODELS[model].palette, animated: color?.animated }, canvas.dataset.locked !== undefined);
  }
  portraits.forEach((canvas, i) =>
    drawPortrait(canvas, canvas.dataset.sprite as SpriteId, time + i * 0.7, {
      silhouette: canvas.dataset.silhouette !== undefined,
      level: Number(canvas.dataset.level ?? 1),
      branch: Number(canvas.dataset.branch ?? 0),
      palette: findSkin(canvas.dataset.skin ?? '')?.palette,
      // variante: a do próprio retrato (`data-variant`; "none" = original) ou a escolhida para a criatura
      filter: variantFilter(canvas),
    }),
  );
}
