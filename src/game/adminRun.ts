// Ações de administrador dentro da run (tela de pausa, só com o modo admin ativo). Simulação pura.
import { xpToNextLevel } from '../data/heroUpgrades';
import { damageEnemy } from './combat';
import { grantXp, heroMaxHp } from './hero';
import type { RunState } from './state';

export type AdminRunAction = 'gold500' | 'gold5000' | 'heroLevel' | 'heal' | 'clearEnemies';

export const ADMIN_RUN_ACTIONS: { id: AdminRunAction; label: string }[] = [
  { id: 'gold500', label: '+500 ◉' },
  { id: 'gold5000', label: '+5000 ◉' },
  { id: 'heroLevel', label: 'Herói +1 nível' },
  { id: 'heal', label: 'Nexus e herói com vida cheia' },
  { id: 'clearEnemies', label: 'Eliminar os inimigos em campo' },
];

export function applyAdminRunAction(state: RunState, action: AdminRunAction): void {
  switch (action) {
    case 'gold500':
      state.gold += 500;
      break;
    case 'gold5000':
      state.gold += 5000;
      break;
    case 'heroLevel':
      // XP que falta para o próximo nível (sem os bônus de talento, que só aumentariam o ganho)
      grantXp(state, Math.max(1, xpToNextLevel(state.hero.level) - state.hero.xp));
      break;
    case 'heal':
      state.nexus.hp = state.nexus.maxHp;
      for (const g of state.guards) g.hp = g.maxHp;
      if (!state.hero.dead) state.hero.hp = heroMaxHp(state);
      break;
    case 'clearEnemies':
      // como dano contínuo, para não parar no escudo do Sem Fim
      for (const enemy of state.enemies) if (!enemy.dead && enemy.allyTimer <= 0) damageEnemy(state, enemy, 1e9, undefined, { overTime: true });
      break;
  }
}
