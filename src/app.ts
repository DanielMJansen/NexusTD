import { SoundPlayer } from './audio/audio';
import { GAME_TITLE, SIMULATION } from './data/config';
import { CREATURE_IDS, type CreatureId } from './data/creatures';
import type { MetaUpgradeId } from './data/upgrades';
import { chooseOption } from './game/choices';
import { firePulse } from './game/combat';
import type { GameEvent } from './game/events';
import { buyMetaUpgrade, runSetup, unlockCreature, type Profile } from './game/profile';
import { buyExtraSlot, reroll } from './game/shop';
import { createRun, type RunState } from './game/state';
import { startRun, updateRun } from './game/update';
import { createInteraction, interactionView, resetInteraction } from './input/interaction';
import { Keyboard } from './input/keyboard';
import { attachPointer, type PointerControls } from './input/pointer';
import { drawFrame } from './render/draw';
import { Effects } from './render/effects';
import { fitArenaCanvas } from './render/viewport';
import { loadProfile, saveProfile } from './save/save';
import { updateHud } from './ui/hud';
import { showMenu } from './ui/menu';
import { animateOverlay, hideOverlay } from './ui/overlay';
import { showPause } from './ui/pause';
import { showRunEnd } from './ui/runEnd';
import { SidePanel } from './ui/sidePanel';
import { showWaveChoices } from './ui/waveChoices';

type Mode = 'menu' | 'run';

/** Liga as peças: simulação, desenho, entrada, áudio, telas e save. */
export class App {
  private profile: Profile = loadProfile();
  private run: RunState;
  private mode: Mode = 'menu';
  private paused = false;
  private lastFrame = 0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effects = new Effects();
  private readonly interaction = createInteraction();
  private readonly sound = new SoundPlayer();
  private readonly keyboard: Keyboard;
  private readonly pointer: PointerControls;
  private readonly panel: SidePanel;
  private readonly muteButton: HTMLButtonElement;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>('#arena')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.run = createRun(runSetup(this.profile));
    document.querySelector('#brand')!.textContent = GAME_TITLE;

    this.pointer = attachPointer({
      canvas: this.canvas,
      interaction: this.interaction,
      getRun: () => this.run,
      isActive: () => this.isPlaying(),
    });
    this.keyboard = new Keyboard((key, event) => this.onKey(key, event));
    addEventListener('pointerdown', () => this.sound.unlock());

    this.panel = new SidePanel({
      onCardPress: (id) => this.pointer.pressCard(id),
      onPulse: () => this.pulse(),
    });

    document.querySelector('#pause-button')!.addEventListener('click', (event) => {
      (event.currentTarget as HTMLElement).blur();
      this.togglePause();
    });
    this.muteButton = document.querySelector<HTMLButtonElement>('#mute-button')!;
    this.muteButton.addEventListener('click', () => {
      this.muteButton.blur();
      this.muteButton.textContent = this.sound.toggleMute() ? '🔇' : '🔊';
    });
  }

  start(): void {
    this.openMenu();
    requestAnimationFrame((t) => this.frame(t));
  }

  private isPlaying(): boolean {
    return this.mode === 'run' && this.run.phase === 'playing' && !this.paused;
  }

  private onKey(key: string, event: KeyboardEvent): void {
    this.sound.unlock();
    if (key === ' ') {
      event.preventDefault();
      this.pulse();
    } else if (key === 'escape') {
      if (!this.pointer.cancel()) this.togglePause();
    } else if (key === 'e') {
      this.pointer.evolveInspected();
    } else if (key === 'p') {
      this.togglePause();
    } else if (/^[1-9]$/.test(key)) {
      const id = CREATURE_IDS[Number(key) - 1];
      if (id) this.pointer.toggleCard(id);
    }
  }

  private pulse(): void {
    if (this.isPlaying()) firePulse(this.run);
  }

  private frame(now: number): void {
    const dt = Math.min(SIMULATION.maxFrameTime, (now - this.lastFrame) / 1000 || 0);
    this.lastFrame = now;
    const time = now / 1000;

    if (this.mode === 'run' && !this.paused) {
      updateRun(this.run, dt, { direction: this.keyboard.direction() });
      this.effects.update(dt);
    }
    for (const event of this.run.events.splice(0)) this.handleEvent(event);

    fitArenaCanvas(this.canvas, this.ctx);
    drawFrame(this.ctx, this.run, this.effects, interactionView(this.interaction, this.run), time);
    updateHud(this.run);
    this.panel.update(this.run, this.interaction.selectedCard, time);
    animateOverlay(time);
    requestAnimationFrame((t) => this.frame(t));
  }

  private handleEvent(event: GameEvent): void {
    this.effects.handle(event);
    this.sound.handle(event);
    switch (event.type) {
      case 'choicesOffered':
        resetInteraction(this.interaction);
        this.showChoices();
        break;
      case 'shopPurchase':
        this.showChoices();
        break;
      case 'runEnded':
        resetInteraction(this.interaction);
        this.profile.essence += event.result.essence;
        saveProfile(this.profile);
        showRunEnd(event.result, () => this.openMenu());
        break;
      default:
        break;
    }
  }

  private showChoices(): void {
    showWaveChoices(this.run, this.run.choiceReason, {
      onChoose: (index) => {
        chooseOption(this.run, index);
        hideOverlay();
      },
      onReroll: () => reroll(this.run),
      onBuyExtraSlot: () => buyExtraSlot(this.run),
    });
  }

  private openMenu(): void {
    this.mode = 'menu';
    this.paused = false;
    // Arena vazia ao fundo, já com as criaturas iniciais do perfil no painel.
    this.run = createRun(runSetup(this.profile));
    this.effects.clear();
    resetInteraction(this.interaction);
    showMenu(this.profile, {
      onBuyUpgrade: (id: MetaUpgradeId) => this.spendEssence(buyMetaUpgrade(this.profile, id)),
      onUnlockCreature: (id: CreatureId) => this.spendEssence(unlockCreature(this.profile, id)),
      onPlay: () => this.startRun(),
    });
  }

  private spendEssence(bought: boolean): void {
    if (!bought) return;
    saveProfile(this.profile);
    this.sound.play('coin');
    this.openMenu();
  }

  private startRun(): void {
    this.effects.clear();
    resetInteraction(this.interaction);
    hideOverlay();
    this.mode = 'run';
    this.run = startRun(runSetup(this.profile));
  }

  private togglePause(): void {
    if (this.paused) {
      this.paused = false;
      hideOverlay();
    } else if (this.isPlaying()) {
      this.paused = true;
      resetInteraction(this.interaction);
      showPause({
        onResume: () => this.togglePause(),
        onQuit: () => this.openMenu(),
      });
    }
  }
}
