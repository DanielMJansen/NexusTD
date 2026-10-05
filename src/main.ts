import './style.css';
import { SIMULATION } from './data/config';
import { CREATURE_IDS } from './data/creatures';
import { chooseOption } from './game/choices';
import { placeCreature } from './game/economy';
import { startRun, updateRun, type FrameInput } from './game/update';
import type { RunState } from './game/state';
import { drawFrame, type InteractionView } from './render/draw';
import { Effects } from './render/effects';

const canvas = document.querySelector<HTMLCanvasElement>('#arena');
const ctx = canvas?.getContext('2d');
if (!canvas || !ctx) throw new Error('Canvas #arena não encontrado');

// DEMO TEMPORÁRIA (passos 3–4): a partida joga sozinha até existirem entrada e interface.
function startDemoRun(): RunState {
  const run = startRun({
    metaLevels: { damage: 0, nexusHp: 0, startGold: 0 },
    unlockedCreatures: CREATURE_IDS,
  });
  run.gold = 1000;
  const spots = [
    { x: 120, y: 180 },
    { x: 240, y: 180 },
    { x: 120, y: 300 },
    { x: 240, y: 300 },
  ];
  CREATURE_IDS.forEach((id, i) => placeCreature(run, id, spots[i]!));
  run.gold = 0;
  return run;
}

let run = startDemoRun();
const effects = new Effects();
const input: FrameInput = { direction: { x: 0, y: 0 } };
const interaction: InteractionView = { inspected: null, placement: null };
let last = 0;

function frame(now: number): void {
  const dt = Math.min(SIMULATION.maxFrameTime, (now - last) / 1000 || 0);
  last = now;
  updateRun(run, dt, input);
  effects.update(dt);
  for (const event of run.events.splice(0)) {
    effects.handle(event);
    if (event.type === 'waveCleared') chooseOption(run, 0);
    if (event.type === 'runEnded') {
      run = startDemoRun();
      effects.clear();
    }
  }
  drawFrame(ctx!, run, effects, interaction, now / 1000);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
