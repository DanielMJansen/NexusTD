import type { CreatureId } from './data/creatures';
import { SoundPlayer } from './audio/audio';
import { Music } from './audio/music';
import { GAME_TITLE, SIMULATION } from './data/config';
import { WAVES } from './data/waves';
import { checkAchievements, recordRun } from './game/achievements';
import { chooseChest, chooseOption } from './game/choices';
import { buyNexusUpgrade } from './game/nexus';
import { showChestChoices } from './ui/chestChoices';
import { NexusPanel } from './ui/nexusPanel';
import { CreaturePopup } from './ui/creaturePopup';
import { firePulse } from './game/pulses';
import type { GameEvent } from './game/events';
import {
  buyHero,
  buyTalent,
  grantStarterCreature,
  runSetup,
  selectHero,
  selectSkin,
  toggleTeamMember,
  unlockCreature,
  type Profile,
} from './game/profile';
import { buyExtraSlot, reroll } from './game/shop';
import { createRun, type RunState } from './game/state';
import { waveBoss } from './game/spawning';
import { enterEndless, startRun, updateRun } from './game/update';
import { createInteraction, interactionView, resetInteraction } from './input/interaction';
import { Keyboard } from './input/keyboard';
import { attachPointer, type PointerControls } from './input/pointer';
import { drawFrame } from './render/draw';
import { Effects } from './render/effects';
import { fitArenaCanvas } from './render/viewport';
import { downloadBackup, importBackup, pickBackupFile } from './save/backup';
import { clearRun, loadRun, savedRunSummary, saveRun } from './save/runSave';
import { deleteProfile, loadProfile, saveProfile } from './save/save';
import { loadSettings, saveSettings, type Settings } from './save/settings';
import { showAchievements } from './ui/achievementsScreen';
import { showCodex } from './ui/codexScreen';
import { showCollection } from './ui/collection';
import { showEntry } from './ui/entry';
import { showHeroLevelUp } from './ui/heroLevelUp';
import { chooseHeroUpgrade } from './game/hero';
import { showHeroes, type HeroScreenOptions } from './ui/heroesScreen';
import { updateHud, updateMenuHud } from './ui/hud';
import { showMenu } from './ui/menu';
import { animateOverlay, hideOverlay } from './ui/overlay';
import { showPause } from './ui/pause';
import { showRunEnd } from './ui/runEnd';
import { showSettings } from './ui/settingsScreen';
import { SidePanel } from './ui/sidePanel';
import { needsStarter, showStarterPick } from './ui/starterPick';
import { showTalents } from './ui/talentsScreen';
import { showTeam } from './ui/teamScreen';
import { Tutorial } from './ui/tutorial';
import { creatureCost, evolveCreature, sellCreature } from './game/economy';
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
  private readonly nexusPanel: NexusPanel;
  private readonly creaturePopup: CreaturePopup;
  private readonly muteButton: HTMLButtonElement;
  private readonly tutorial = new Tutorial(() => this.updateSettings({ tutorialDone: true }));
  private readonly speedButton = document.querySelector<HTMLButtonElement>('#speed-button')!;
  private readonly freezeBadge = document.querySelector<HTMLElement>('#freeze-badge')!;
  /** Velocidade 0x: o tempo para sem abrir a pausa (não é salvo; o jogo nunca abre congelado). */
  private frozen = false;

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
    this.creaturePopup = new CreaturePopup(this.interaction, {
      onEvolve: (branch) => {
        const creature = this.interaction.inspected;
        if (!this.isPlaying() || !creature) return;
        evolveCreature(this.run, creature, branch);
        this.interaction.sellArmed = false;
        this.interaction.hoverBranch = null;
      },
      onSell: () => {
        const creature = this.interaction.inspected;
        if (!this.isPlaying() || !creature) return;
        // 1º clique arma a venda; o 2º confirma
        if (!this.interaction.sellArmed) {
          this.interaction.sellArmed = true;
          return;
        }
        this.interaction.inspected = null;
        this.interaction.sellArmed = false;
        sellCreature(this.run, creature);
      },
    });
    this.nexusPanel = new NexusPanel(
      () => this.toggleNexusPanel(),
      (id) => {
        if (this.mode === 'run') buyNexusUpgrade(this.run, id);
      },
    );

    document.querySelector('#pause-button')!.addEventListener('click', (event) => {
      (event.currentTarget as HTMLElement).blur();
      this.togglePause();
    });
    this.muteButton = document.querySelector<HTMLButtonElement>('#mute-button')!;
    this.muteButton.addEventListener('click', () => {
      this.muteButton.blur();
      this.updateSettings({ muted: !this.settings.muted });
    });
    this.speedButton.addEventListener('click', () => {
      this.speedButton.blur();
      this.cycleSpeed();
    });
    document.querySelector('#settings-button')!.addEventListener('click', (event) => {
      (event.currentTarget as HTMLElement).blur();
      this.openSettings();
    });
    this.updateSettings({});
    // Fechar ou recarregar a aba no meio da run: salva onde está.
    addEventListener('pagehide', () => {
      if (this.mode === 'run' && this.run.phase !== 'ended') saveRun(this.run);
    });
    // Trocou de aba, minimizou ou clicou fora da janela no meio de uma onda: pausa sozinho.
    const pauseIfAway = () => {
      if (this.isPlaying()) this.togglePause();
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseIfAway();
    });
    addEventListener('blur', pauseIfAway);
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
    this.speedButton.textContent = this.frozen ? '0x' : `${this.settings.gameSpeed}x`;
    this.speedButton.classList.toggle('frozen', this.frozen);
    this.freezeBadge.hidden = !this.frozen || this.mode !== 'run';
    this.effects.showDamageNumbers = this.settings.damageNumbers;
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
            ? () => showRunEnd(this.run.result!, [], () => this.openMenu())
            : () => this.showChoices();
    showSettings(this.settings, {
      onChange: (change) => this.updateSettings(change),
      onBack: () => this.closeSettings(),
      onExport: () => downloadBackup(),
      onImport: () => void this.importSave(),
      onResetSave: () => this.resetSave(),
    });
  }

  private closeSettings(): void {
    const back = this.settingsReturn;
    this.settingsReturn = null;
    back?.();
  }

  /** 1x → 2x → 4x → 0x (tempo parado) → 1x. */
  private cycleSpeed(): void {
    if (this.frozen) {
      this.frozen = false;
      this.updateSettings({ gameSpeed: 1 });
      return;
    }
    if (this.settings.gameSpeed === 4) {
      this.setFrozen(true);
      return;
    }
    const next = this.settings.gameSpeed === 1 ? 2 : 4;
    this.updateSettings({ gameSpeed: next });
  }

  private resetSave(): void {
    if (!confirm('Apagar TODO o progresso (Essência, talentos, coleção, heróis, conquistas e run salva)?')) return;
    if (!confirm('Tem certeza? Isso não pode ser desfeito.')) return;
    deleteProfile();
    clearRun();
    this.updateSettings({ tutorialDone: false });
    location.reload();
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
    return (
      this.mode === 'run' &&
      this.run.phase === 'playing' &&
      !this.paused &&
      !this.run.heroChoices.length &&
      !this.run.chestChoices.length
    );
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
    } else if (key === 'f') {
      this.cycleSpeed();
    } else if (key === '0') {
      this.setFrozen(!this.frozen);
    } else if (key === 'p') {
      this.togglePause();
    } else if (key === 'n') {
      this.toggleNexusPanel();
    } else if (/^[1-9]$/.test(key)) {
      const id = this.run.team[Number(key) - 1];
      if (id) this.pointer.toggleCard(id);
    }
  }

  /** Mira dos Pulsos: direção do teclado, se pressionada; senão, o cursor sobre a arena. */
  private aimPoint(): { x: number; y: number } | undefined {
    const dir = this.keyboard.direction();
    const hero = this.run.hero;
    if (dir.x || dir.y) return { x: hero.x + dir.x * 100, y: hero.y + dir.y * 100 };
    return this.interaction.pointerInArena ? { ...this.interaction.pointer } : undefined;
  }

  /** Congela (0x) ou volta à velocidade escolhida. */
  private setFrozen(frozen: boolean): void {
    this.frozen = frozen && this.mode === 'run';
    this.updateSettings({});
  }

  private pulse(): void {
    if (!this.isPlaying()) return;
    // Mira: direção do teclado, se pressionada; senão, o cursor sobre a arena.
    const dir = this.keyboard.direction();
    const hero = this.run.hero;
    const aim =
      dir.x || dir.y
        ? { x: hero.x + dir.x * 100, y: hero.y + dir.y * 100 }
        : this.interaction.pointerInArena
          ? { ...this.interaction.pointer }
          : undefined;
    firePulse(this.run, aim);
  }

  private frame(now: number): void {
    // Tempo real desde o último quadro (limitado ao voltar de outra aba).
    const elapsed = Math.min(0.25, (now - this.lastFrame) / 1000 || 0);
    this.lastFrame = now;
    const time = now / 1000;

    if (this.mode === 'run' && !this.paused && !this.frozen && !this.tutorial.freezes) {
      // Velocidade 2x/4x e quadros lentos: divide o tempo em passos curtos (mesma física).
      let remaining = elapsed * this.settings.gameSpeed;
      while (remaining > 1e-6) {
        const dt = Math.min(SIMULATION.maxFrameTime, remaining);
        updateRun(this.run, dt, { direction: this.keyboard.direction(), aim: this.aimPoint() });
        this.effects.update(dt);
        remaining -= dt;
      }
    }
    for (const event of this.run.events.splice(0)) {
      this.handleEvent(event);
      this.tutorial.onEvent(event);
    }
    if (this.mode === 'run') {
      this.tutorial.watch({ hero: this.run.hero, inspecting: this.interaction.inspected !== null });
      // No passo de invocar, garante ouro para a criatura mais barata da equipe.
      if (this.tutorial.wantsSummon && this.run.team.length) {
        const cheapest = Math.min(...this.run.team.map((id) => creatureCost(this.run, id)));
        if (this.run.gold < cheapest) this.run.gold = cheapest;
      }
    }

    fitArenaCanvas(this.canvas, this.ctx);
    const view = interactionView(this.interaction, this.run);
    const hero = this.run.hero;
    view.heroRange =
      this.keyboard.isDown('shift') ||
      (this.interaction.pointerInArena && Math.hypot(this.interaction.pointer.x - hero.x, this.interaction.pointer.y - hero.y) < 18);
    drawFrame(this.ctx, this.run, this.effects, view, time);
    // HUD e painel da run só aparecem na run; fora dela, o topo mostra o perfil
    if (document.body.dataset.mode !== this.mode) document.body.dataset.mode = this.mode;
    if (this.mode === 'run') updateHud(this.run);
    else updateMenuHud(this.profile);
    this.panel.update(this.run, this.interaction, time);
    this.nexusPanel.update(this.run, this.mode === 'run' && this.interaction.nexusOpen);
    this.creaturePopup.update(this.run, this.isPlaying() && !this.tutorial.freezes);
    animateOverlay(time);
    requestAnimationFrame((t) => this.frame(t));
  }

  private handleEvent(event: GameEvent): void {
    this.effects.handle(event);
    this.sound.handle(event);
    switch (event.type) {
      case 'choicesOffered':
        saveRun(this.run);
        resetInteraction(this.interaction);
        this.showPendingChoices();
        break;
      case 'shopPurchase':
        this.showChoices();
        break;
      case 'heroLevelUp':
        resetInteraction(this.interaction);
        this.showPendingChoices();
        break;
      case 'lootCollected':
        if (event.kind === 'chest' && this.run.phase === 'playing') {
          resetInteraction(this.interaction);
          this.showPendingChoices();
        }
        break;
      case 'waveStarted':
        // depois de uma onda de chefe, volta a trilha normal
        this.music.play('run');
        this.music.setIntensity(Math.min(1, (event.wave - 1) / (WAVES.total - 1)));
        break;
      case 'bossSpawned':
        this.music.play('boss');
        break;
      case 'runEnded':
        resetInteraction(this.interaction);
        clearRun();
        this.music.play('menu');
        this.profile.essence += event.result.essence;
        recordRun(this.profile, event.result);
        const unlocked = checkAchievements(this.profile, event.result);
        saveProfile(this.profile);
        showRunEnd(
          event.result,
          unlocked,
          () => this.openMenu(),
          event.result.victory ? () => this.enterEndless() : undefined,
        );
        break;
      default:
        break;
    }
  }

  /** Depois da vitória: a mesma run segue no modo Sem Fim. */
  private enterEndless(): void {
    enterEndless(this.run);
    this.music.play('run');
  }

  /**
   * Abre a próxima escolha pendente, nesta ordem: nível do herói, baú, fim de onda.
   * Sem nenhuma pendente durante a onda, fecha o overlay e o jogo segue.
   */
  private showPendingChoices(): void {
    const run = this.run;
    if (run.heroChoices.length) {
      showHeroLevelUp(run, (index) => {
        chooseHeroUpgrade(run, index);
        this.showPendingChoices();
      });
    } else if (run.chestChoices.length) {
      showChestChoices(run, (index) => {
        chooseChest(run, index);
        this.showPendingChoices();
      });
    } else if (run.phase === 'choosing') {
      this.showChoices();
    } else {
      hideOverlay();
    }
  }

  private toggleNexusPanel(): void {
    if (this.mode !== 'run' || this.run.phase === 'ended') return;
    this.interaction.nexusOpen = !this.interaction.nexusOpen;
    if (this.interaction.nexusOpen) {
      this.interaction.inspected = null;
      this.interaction.sellArmed = false;
    }
  }

  private showChoices(): void {
    showWaveChoices(this.run, this.run.choiceReason, {
      onChoose: (index) => {
        chooseOption(this.run, index);
        this.showPendingChoices();
      },
      onReroll: () => reroll(this.run),
      onBuyExtraSlot: () => buyExtraSlot(this.run),
    });
  }

  private openMenu(): void {
    this.tutorial.stop();
    this.frozen = false;
    this.updateSettings({});
    this.mode = 'menu';
    this.music.play('menu');
    this.paused = false;
    // Arena vazia ao fundo, já com as criaturas iniciais do perfil no painel.
    this.run = createRun(runSetup(this.profile));
    this.effects.clear();
    resetInteraction(this.interaction);
    if (needsStarter(this.profile)) {
      showStarterPick(this.profile, (id) => {
        grantStarterCreature(this.profile, id);
        saveProfile(this.profile);
        this.sound.play('evolve');
        this.openMenu();
      });
      return;
    }
    showMenu(this.profile, savedRunSummary(), {
      onPlay: () => this.startRun(),
      onContinue: () => this.continueRun(),
      onTeam: () => this.openTeam(),
      onHeroes: () => this.openHeroes(),
      onCollection: () => this.openCollection(),
      onTalents: () => this.openTalents(),
      onAchievements: () => showAchievements(this.profile, () => this.openMenu()),
      onCodex: () => showCodex(this.profile, () => this.openMenu()),
      onSettings: () => this.openSettings(),
    });
  }

  // ---------- telas de meta-progressão ----------

  private openTalents(): void {
    showTalents(this.profile, {
      onBuy: (id) => this.afterPurchase(buyTalent(this.profile, id), () => this.openTalents()),
      onBack: () => this.openMenu(),
    });
  }

  /** Redesenhos (compra, escolha, skin) mantêm a posição da tela; a compra destaca o herói liberado. */
  private openHeroes(options: HeroScreenOptions = {}): void {
    const again = (extra: HeroScreenOptions = {}) => this.openHeroes({ keepScroll: true, ...extra });
    showHeroes(this.profile, {
      onBuy: (id) => this.afterPurchase(buyHero(this.profile, id), () => again({ justUnlocked: id })),
      onSelect: (id) => {
        if (!selectHero(this.profile, id)) return;
        saveProfile(this.profile);
        this.sound.play('place');
        this.run = createRun(runSetup(this.profile));
        again();
      },
      onSkin: (skinId) => {
        if (!selectSkin(this.profile, skinId)) return;
        saveProfile(this.profile);
        this.sound.play('place');
        this.run = createRun(runSetup(this.profile));
        again();
      },
      onBack: () => this.openMenu(),
    }, options);
  }

  /** justUnlocked: depois de comprar, redesenha no mesmo lugar com a criatura liberada em destaque. */
  private openCollection(justUnlocked?: CreatureId): void {
    showCollection(
      this.profile,
      {
        onBuy: (id) => {
          const bought = unlockCreature(this.profile, id);
          if (bought) checkAchievements(this.profile);
          this.afterPurchase(bought, () => this.openCollection(id));
        },
        onBack: () => this.openMenu(),
      },
      justUnlocked,
    );
  }

  private openTeam(): void {
    showTeam(this.profile, {
      onToggle: (id) => {
        if (!toggleTeamMember(this.profile, id)) return;
        saveProfile(this.profile);
        this.sound.play('place');
        this.run = createRun(runSetup(this.profile));
        this.openTeam();
      },
      onBack: () => this.openMenu(),
    });
  }

  /** Depois de gastar Essência: salva, toca o som e redesenha a tela atual. */
  private afterPurchase(bought: boolean, redraw: () => void): void {
    if (!bought) return;
    saveProfile(this.profile);
    this.sound.play('coin');
    this.run = createRun(runSetup(this.profile));
    redraw();
  }

  /** Retoma a run salva: na escolha entre ondas ou pausada, para o jogador se situar. */
  private continueRun(): void {
    const run = loadRun();
    if (!run) {
      clearRun();
      alert('Não foi possível carregar a run salva.');
      this.openMenu();
      return;
    }
    this.effects.clear();
    resetInteraction(this.interaction);
    this.run = run;
    this.mode = 'run';
    this.music.play(waveBoss(run.wave) && run.phase === 'playing' ? 'boss' : 'run');
    this.music.setIntensity(Math.min(1, (run.wave - 1) / (WAVES.total - 1)));
    if (run.heroChoices.length || run.chestChoices.length || run.phase === 'choosing') {
      this.paused = false;
      this.showPendingChoices();
    } else {
      this.paused = true;
      this.showPauseScreen();
    }
  }

  private startRun(): void {
    if (savedRunSummary() && !confirm('Começar uma nova run descarta a run salva. Continuar?')) return;
    clearRun();
    this.effects.clear();
    resetInteraction(this.interaction);
    hideOverlay();
    this.mode = 'run';
    this.music.play('run');
    this.music.setIntensity(0);
    this.run = startRun(runSetup(this.profile));
    if (!this.settings.tutorialDone) this.tutorial.start();
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
      onSettings: () => this.openSettings(),
      onSaveAndQuit: () => {
        saveRun(this.run);
        this.openMenu();
      },
      onAbandon: () => {
        if (!confirm('Abandonar a run? O progresso dela será perdido e não rende Essência.')) return;
        clearRun();
        this.openMenu();
      },
    }, this.run);
  }
}
