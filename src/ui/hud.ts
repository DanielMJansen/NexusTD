import { ECONOMY } from '../data/config';
import { WAVES } from '../data/waves';
import type { RunState } from '../game/state';

const hud = document.querySelector<HTMLElement>('#hud')!;

export function updateHud(run: RunState): void {
  const text =
    `Onda ${Math.max(1, run.wave)}/${WAVES.total} · 💰 ${run.gold} · ` +
    `Nexus ${Math.max(0, Math.trunc(run.nexus.hp))}/${run.nexus.maxHp} · ` +
    `${run.creatures.length}/${ECONOMY.creatureLimit}`;
  if (hud.textContent !== text) hud.textContent = text;
}
