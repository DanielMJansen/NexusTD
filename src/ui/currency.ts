// Moedas sempre com o mesmo símbolo e cor em qualquer tela.

/** Essência (permanente): ✦ lilás. */
export const essence = (amount: number | string): string => `<span class="essence-amount">${amount} ✦</span>`;

/** Ouro (da run): ◉ dourado. */
export const gold = (amount: number | string): string => `<span class="gold-amount">◉ ${amount}</span>`;
