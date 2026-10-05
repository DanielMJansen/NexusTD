import { SoundPlayer } from './audio/audio';
import { SIMULATION } from './data/config';
import type { CreatureId } from './data/creatures';
import type { MetaUpgradeId } from './data/upgrades';
import { chooseOption } from './game/choices';
import { firePulse } from './game/combat';
import type { GameEvent } from './game/events';
import { buyMetaUpgrade, runSetup, unlockCreature, type Profile } from './game/profile';
import { createRun, type RunState } from './game/state';
import { startRun, updateRun } from './game/update';
import { createInteraction, interactionView, resetInteraction } from './input/interaction';
import { Keyboard } from './input/keyboard';
import { attachPointer } from './input/pointer';
import { drawFrame } from './render/draw';
import { Effects } from './render/effects';
import { loadProfile, saveProfile } from './save/save';
import { CardBar } from './ui/cards';
import { updateHud } from './ui/hud';
import { showMenu } from './ui/menu';
import { hideOverlay } from './ui/overlay';
import { showPause } from './ui/pause';
import { showRunEnd } from './ui/runEnd';
import { showWaveChoices } from './ui/waveChoices';

type Mode = 'menu' | 'run';

/** Liga as peças: simulação, desenho, entrada, áudio, telas e save. */
export class App {
  private profile: Profile = loadProfile();
  private run: RunState;
  private mode: Mode = 'menu';
  private paused = false;
  private lastFrame = 0;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly effects = new Effects();
  private readonly interaction = createInteraction();
  private readonly sound = new SoundPlayer();
  private readonly keyboard: Keyboard;
  private readonly cards: CardBar;
  private readonly muteButton: HTMLButtonElement;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>('#arena')!;
    this.ctx = canvas.getContext('2d')!;
    this.run = createRun(runSetup(this.profile));

    this.keyboard = new Keyboard((key) => {
      this.sound.unlock();
      if (key === 'p' || key === 'escape') this.togglePause();
    });
    addEventListener('pointerdown', () => this.sound.unlock());

    attachPointer({
      canvas,
      interaction: this.interaction,
      getRun: () => this.run,
      isActive: () => this.isPlaying(),
    });

    this.cards = new CardBar(
      document.querySelector<HTMLElement>('#card-bar')!,
      (id) => this.selectCard(id),
      () => {
        if (this.isPlaying()) firePulse(this.run);
      },
    );

    document.querySelector('#pause-button')!.addEventListener('click', () => this.togglePause());
    this.muteButton = document.querySelector<HTMLButtonElement>('#mute-button')!;
    this.muteButton.addEventListener('click', () => {
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

  private frame(now: number): void {
    const dt = Math.min(SIMULATION.maxFrameTime, (now - this.lastFrame) / 1000 || 0);
    this.lastFrame = now;
    const time = now / 1000;

    if (this.mode === 'run' && !this.paused) {
      updateRun(this.run, dt, { direction: this.keyboard.direction() });
      this.effects.update(dt);
    }
    for (const event of this.run.events.splice(0)) this.handleEvent(event);

    drawFrame(this.ctx, this.run, this.effects, interactionView(this.interaction), time);
    updateHud(this.run);
    this.cards.update(this.run, this.interaction.selectedCard, time);
    requestAnimationFrame((t) => this.frame(t));
  }

  private handleEvent(event: GameEvent): void {
    this.effects.handle(event);
    this.sound.handle(event);
    switch (event.type) {
      case 'choicesOffered':
        resetInteraction(this.interaction);
        showWaveChoices(this.run, event.reason, (index) => {
          chooseOption(this.run, index);
          hideOverlay();
        });
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

  private openMenu(): void {
    this.mode = 'menu';
    this.paused = false;
    // Arena vazia ao fundo, já com as criaturas iniciais do perfil nas cartas.
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
    this.run = startRun(runSetup(this.profile));
    this.mode = 'run';
    this.effects.clear();
    resetInteraction(this.interaction);
    hideOverlay();
  }

  private selectCard(id: CreatureId): void {
    this.interaction.selectedCard = this.interaction.selectedCard === id ? null : id;
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
