// Abas das telas de menu: cada tela lembra a aba aberta (enquanto o jogo estiver aberto).

const active = new Map<string, string>();

export interface Tab {
  id: string;
  label: string;
  /** Texto pequeno ao lado (ex.: "2/3"). */
  badge?: string;
  /** Cor de destaque (raça, herói). */
  color?: string;
  /** Retrato animado na aba (id de sprite e skin opcional). */
  sprite?: string;
  skin?: string;
  /** Retrato em silhueta (bloqueado). */
  silhouette?: boolean;
}

/** Aba atual da tela (ou a primeira, se a guardada não existe mais). */
export function currentTab(screen: string, tabs: Tab[]): string {
  const saved = active.get(screen);
  return tabs.some((t) => t.id === saved) ? saved! : (tabs[0]?.id ?? '');
}

export function setTab(screen: string, id: string): void {
  active.set(screen, id);
}

/** Barra de abas: botões com data-action="tab". */
export function tabsHtml(tabs: Tab[], current: string): string {
  return `<nav class="screen-tabs">${tabs
    .map(
      (t) =>
        `<button class="screen-tab${t.id === current ? ' active' : ''}${t.sprite ? ' with-portrait' : ''}" data-action="tab" data-value="${t.id}"${t.color ? ` style="--tab-color:${t.color}"` : ''}>${t.sprite ? `<canvas class="tab-portrait" data-sprite="${t.sprite}"${t.skin ? ` data-skin="${t.skin}"` : ''}${t.silhouette ? ' data-silhouette' : ''}></canvas>` : ''}${t.label}${t.badge ? ` <small>${t.badge}</small>` : ''}</button>`,
    )
    .join('')}</nav>`;
}
