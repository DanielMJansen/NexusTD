// Moedas sempre com o mesmo símbolo e cor em qualquer tela.

/** Essência (permanente): ✦ lilás. */
export const essence = (amount: number | string): string => `<span class="essence-amount">${amount} ✦</span>`;

/** Confirmação de compra com Essência: preço e quanto sobra (botões cancel/buy com o id). */
export function confirmPurchaseHtml(id: string, cost: number, balance: number): string {
  return `<div class="cc-confirm">
    <span>Desbloquear por ${essence(cost)}? Sobram ${essence(balance - cost)}</span>
    <button data-action="cancel" data-value="${id}">Cancelar</button>
    <button class="play-button" data-action="buy" data-value="${id}">Confirmar</button>
  </div>`;
}

/** Ouro (da run): ◉ dourado. */
export const gold = (amount: number | string): string => `<span class="gold-amount">◉ ${amount}</span>`;
