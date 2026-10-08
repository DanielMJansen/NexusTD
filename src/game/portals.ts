import { ENEMIES } from '../data/enemies';
import { STAGES } from '../data/stages';
import { random, shuffle } from './random';
import { distance, type Creature, type Enemy, type Point, type RunState, type SpawnItem } from './state';

// Portais do Céu (Fase 5): cada onda abre portais em pontos sorteados (com aviso); os inimigos da onda
// são divididos entre eles. O herói sela um portal ficando parado sobre ele; o que ainda ia sair não sai.
// Ventos: direção sorteada a cada onda; acelera voadores a favor e muda o alcance das criaturas.

const portalOf = (item: SpawnItem): number | undefined => (typeof item === 'string' ? undefined : item.entrance);
const enemyOf = (item: SpawnItem) => (typeof item === 'string' ? item : item.enemy);

/** Início da onda: sorteia os portais, divide a fila entre eles e troca o vento. */
export function setupWavePortals(state: RunState): void {
  const stage = STAGES[state.stage];
  if (stage.wind) {
    // oito direções
    state.wind = Math.floor(random() * 8) * (Math.PI / 4);
    state.events.push({ type: 'windChanged', angle: state.wind });
  }
  const rule = stage.portals;
  if (!rule) return;
  if (!state.spawnQueue.length) {
    state.portals = [];
    return;
  }
  const count = [...rule.counts].reverse().find((c) => state.wave >= c.fromWave)?.count ?? 2;
  state.portals = shuffle(rule.spots)
    .slice(0, count)
    .map((p) => ({ x: p.x, y: p.y, warn: rule.warning, seal: 0, sealed: false, done: false }));
  // grupos com entrada escolhida vão ao portal de mesmo índice; o resto, em rodízio
  state.spawnQueue = state.spawnQueue.map((item, i) => {
    const entrance = portalOf(item);
    const base = typeof item === 'string' ? { enemy: item } : { ...item };
    return { ...base, entrance: (entrance ?? i) % count };
  });
  state.events.push({ type: 'portalsWarning', count, seconds: Math.ceil(rule.warning) });
}

/** Avisos, abertura, selagem pelo herói e fechamento dos portais vazios. */
export function updatePortals(state: RunState, dt: number): void {
  const rule = STAGES[state.stage].portals;
  if (!rule) return;
  const hero = state.hero;
  state.portals.forEach((p, index) => {
    if (p.sealed || p.done) return;
    if (p.warn > 0) {
      p.warn -= dt;
      if (p.warn <= 0) state.events.push({ type: 'portalOpened', x: p.x, y: p.y });
      return;
    }
    // vazio: fecha sozinho
    if (!state.spawnQueue.some((item) => portalOf(item) === index)) {
      p.done = true;
      state.events.push({ type: 'portalClosed', x: p.x, y: p.y });
      return;
    }
    // selar: herói vivo e perto; afastar-se perde o progresso aos poucos
    const near = !hero.dead && distance(hero, p) <= rule.sealRadius;
    p.seal = near ? p.seal + dt : Math.max(0, p.seal - dt * 0.5);
    if (p.seal >= rule.sealTime) {
      p.sealed = true;
      // chefes não podem ser impedidos: continuam na fila
      const before = state.spawnQueue.length;
      state.spawnQueue = state.spawnQueue.filter((item) => portalOf(item) !== index || ENEMIES[enemyOf(item)].isBoss);
      state.events.push({ type: 'portalSealed', x: p.x, y: p.y, prevented: before - state.spawnQueue.length });
    }
  });
}

/**
 * Índice na fila do próximo inimigo que já pode sair (portal aberto). Sem portais na fase, 0.
 * -1 = todos esperando portais em aviso.
 */
export function nextSpawnIndex(state: RunState): number {
  if (!state.portals.length) return state.spawnQueue.length ? 0 : -1;
  return state.spawnQueue.findIndex((item) => {
    const p = state.portals[portalOf(item) ?? 0];
    return !p || p.warn <= 0;
  });
}

/** Ponto de saída de um portal (com espalhamento). */
export function portalSpawnPoint(state: RunState, index: number): Point | null {
  const p = state.portals[index];
  if (!p) return null;
  const a = random() * Math.PI * 2;
  const r = random() * 14;
  return { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
}

/** Fator de velocidade de um voador pelo vento (direção do movimento x, y normalizada). */
export function windSpeedFactor(state: RunState, enemy: Enemy, dx: number, dy: number): number {
  const rule = STAGES[state.stage].wind;
  if (!rule || state.wind === null || !enemy.def.flying) return 1;
  return 1 + rule.flyerSpeed * (dx * Math.cos(state.wind) + dy * Math.sin(state.wind));
}

/** Fator de alcance de uma criatura à distância mirando um inimigo (a favor do vento: mais longe). */
export function windRangeFactor(state: RunState, creature: Creature, target: Point): number {
  const rule = STAGES[state.stage].wind;
  if (!rule || state.wind === null) return 1;
  const dx = target.x - creature.x;
  const dy = target.y - creature.y;
  const len = Math.hypot(dx, dy) || 1;
  return 1 + rule.range * ((dx * Math.cos(state.wind) + dy * Math.sin(state.wind)) / len);
}
