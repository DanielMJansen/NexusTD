import { SoundPlayer } from './audio/audio';
import { Music } from './audio/music';
import { GAME_TITLE, SIMULATION } from './data/config';
import { CREATURE_IDS, type CreatureId } from './data/creatures';
import { WAVES } from './data/waves';
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
import { downloadBackup, importBackup, pickBackupFile } from './save/backup';
import { loadProfile, saveProfile } from './save/save';
import { loadSettings, saveSettings, type Settings } from './save/settings';
import { showEntry } from './ui/entry';
import { updateHud } from './ui/hud';
import { showMenu } from './ui/menu';
import { animateOverlay, hideOverlay } from './ui/overlay';
import { showPause } from './ui/pause';
import { showRunEnd } from './ui/runEnd';
import { showSettings } from './ui/settingsScreen';
import { SidePanel } from './ui/sidePanel';
import { showWaveChoices } from './ui/waveChoices';

type Mode = 'entry' | 'menu' | 'run';

/** Liga as peças: simulação, desenho, entrada, áudio, telas e save. */
export class App {
  private profile: Profile = loadProfile();
  private settings: Settings = loadSettings();
  private run: RunState;
  private mode: Mode = 'entry';
  /** Para onde voltar ao fechar as configurações (null = fechadas). */
  private settingsReturn: (() => void) | null = null;
  private paused = false;
  private lastFrame = 0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effects = new Effects();
  private readonly interaction = createInteraction();
  private readonly sound = new SoundPlayer();
  private readonly music = new Music();
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
    this.sound.onReady = (ctx, output) => this.music.connect(ctx, output);
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
      this.updateSettings({ muted: !this.settings.muted });
    });
    document.querySelector('#settings-button')!.addEventListener('click', (event) => {
      (event.currentTarget as HTMLElement).blur();
      this.openSettings();
    });
    this.updateSettings({});
  }

  start(): void {
    showEntry(() => this.leaveEntry());
    requestAnimationFrame((t) => this.frame(t));
  }

  private leaveEntry(): void {
    if (this.mode !== 'entry') return;
    this.openMenu();
    this.sound.unlock();
  }

  private updateSettings(change: Partial<Settings>): void {
    this.settings = { ...this.settings, ...change };
    saveSettings(this.settings);
    this.sound.applySettings(this.settings);
    this.muteButton.textContent = this.settings.muted ? '🔇' : '🔊';
  }

  /** Abre as configurações por cima da tela atual; durante uma onda, pausa antes. */
  private openSettings(): void {
    if (this.mode === 'entry' || this.settingsReturn) return;
    if (this.isPlaying()) this.togglePause();
    this.settingsReturn =
      this.mode === 'menu'
        ? () => this.openMenu()
        : this.paused
          ? () => this.showPauseScreen()
          : this.run.result
            ? () => showRunEnd(this.run.result!, () => this.openMenu())
            : () => this.showChoices();
    showSettings(this.settings, {
      onChange: (change) => this.updateSettings(change),
      onBack: () => this.closeSettings(),
      onExport: () => downloadBackup(),
      onImport: () => void this.importSave(),
    });
  }

  private closeSettings(): void {
    const back = this.settingsReturn;
    this.settingsReturn = null;
    back?.();
  }

  private async importSave(): Promise<void> {
    const text = await pickBackupFile();
    if (text === null) return;
    if (!confirm('Importar este save vai substituir TODO o seu progresso atual. Continuar?')) return;
    try {
      importBackup(text);
      location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível importar o save.');
    }
  }

  private isPlaying(): boolean {
    return this.mode === 'run' && this.run.phase === 'playing' && !this.paused;
  }

  private onKey(key: string, event: KeyboardEvent): void {
    this.sound.unlock();
    if (this.mode === 'entry') {
      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        this.leaveEntry();
      }
      return;
    }
    if (this.settingsReturn) {
      if (key === 'escape') this.closeSettings();
      return;
    }
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
      case 'waveStarted':
        this.music.setIntensity((event.wave - 1) / (WAVES.total - 1));
        break;
      case 'bossSpawned':
        this.music.play('boss');
        break;
      case 'runEnded':
        resetInteraction(this.interaction);
        this.music.play('menu');
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
    this.music.play('menu');
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
    this.music.play('run');
    this.music.setIntensity(0);
    this.run = startRun(runSetup(this.profile));
  }

  private togglePause(): void {
    if (this.paused) {
      this.paused = false;
      hideOverlay();
    } else if (this.isPlaying()) {
      this.paused = true;
      resetInteraction(this.interaction);
      this.showPauseScreen();
    }
  }

  private showPauseScreen(): void {
    showPause({
      onResume: () => this.togglePause(),
      onQuit: () => this.openMenu(),
      onSettings: () => this.openSettings(),
    });
  }
}
