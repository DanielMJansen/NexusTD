import { showAdmin } from './ui/adminScreen';
import { ADMIN_HASH } from './game/admin';
import { GIFTS } from './data/gifts';
import { showIntro, showStageIntro } from './ui/stageIntro';
import { RenderQuality } from './render/quality';
import { Camera, drawMinimap } from './render/camera';
import { buyNexusColor, selectNexusLook } from './game/nexusSkins';
import { showNexusSkins } from './ui/nexusScreen';
import { rollAltar, selectVariant, type AltarResult } from './game/altar';
import { showAltar } from './ui/altarScreen';
import { STAGE_IDS, stageWaveCount, STAGES, type StageId } from './data/stages';
import type { CreatureId } from './data/creatures';
import { SoundPlayer } from './audio/audio';
import { Music } from './audio/music';
import { GAME_TITLE, SIMULATION } from './data/config';
import { checkAchievements, recordRun } from './game/achievements';
import { chooseChest, chooseOption } from './game/choices';
import { buyNexusUpgrade } from './game/nexus';
import { showChestChoices } from './ui/chestChoices';
import { NexusPanel } from './ui/nexusPanel';
import { CreaturePopup } from './ui/creaturePopup';
import { firePulse } from './game/pulses';
import { actionForKey, setActiveBindings } from './input/bindings';
import type { GameEvent } from './game/events';
import {
  buyHero,
  buyTalent,
  grantStarterCreature,
  runSetup,
  selectHero,
  selectSkin,
  selectStage,
  selectLoadout,
  buyLoadoutSlot,
  renameLoadout,
  upgradeSanctuary,
  toggleTeamMember,
  moveTeamMember,
  unlockCreature,
  type Profile,
  redeemGiftCode,
  sha256,
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
import { deleteProfile, loadProfile, profileFromData, saveProfile } from './save/save';
import { loadSettings, saveSettings, type Settings } from './save/settings';
import { showAchievements } from './ui/achievementsScreen';
import { showCodex } from './ui/codexScreen';
import { showCollection } from './ui/collection';
import { showEntry } from './ui/entry';
import { showHeroLevelUp } from './ui/heroLevelUp';
import { chooseHeroUpgrade } from './game/hero';
import { showHeroes, type HeroScreenOptions } from './ui/heroesScreen';
import { showStages } from './ui/stagesScreen';
import { showSanctuary, showSanctuaryIntro } from './ui/sanctuaryScreen';
import { updateHud, updateMenuHud } from './ui/hud';
import { showMenu } from './ui/menu';
import { animateOverlay, hideOverlay, setChosenVariants } from './ui/overlay';
import { showPause } from './ui/pause';
import { showRunEnd } from './ui/runEnd';
import { showSettings } from './ui/settingsScreen';
import { showRelics } from './ui/relicsScreen';
import { FEATURES, type FeatureId } from './data/features';
import { isFeatureUnlocked, markFeatureSeen } from './game/features';
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
  private quality = new RenderQuality();
  private fpsMeter = document.querySelector<HTMLElement>('#fps-meter')!;
  private camera = new Camera();
  private minimap = document.querySelector<HTMLCanvasElement>('#minimap')!;
  /** Para onde a tela de heróis volta (menu ou equipes). */
  private heroesReturn: (() => void) | null = null;
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
      camera: this.camera,
      interaction: this.interaction,
      getRun: () => this.run,
      isActive: () => this.isPlaying(),
    });
    this.sound.onReady = (ctx, output) => this.music.connect(ctx, output);
    // roda do mouse: zoom (afastar até ver o mapa inteiro)
    this.canvas.addEventListener(
      'wheel',
      (event) => {
        if (this.mode !== 'run') return;
        event.preventDefault();
        this.camera.zoomBy(this.run, event.deltaY < 0 ? 1 : -1);
      },
      { passive: false },
    );
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
      onSell: () => this.sellInspected(),
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
    this.keyboard.bindings = this.settings.keys;
    setActiveBindings(this.settings.keys);
  }

  /** Abre as configurações por cima da tela atual; durante uma onda, pausa antes. */
  /** Vende a criatura selecionada: o 1º clique (ou V) arma, o 2º confirma. */
  private sellInspected(): void {
    const creature = this.interaction.inspected;
    if (!this.isPlaying() || !creature) return;
    if (!this.interaction.sellArmed) {
      this.interaction.sellArmed = true;
      return;
    }
    this.interaction.inspected = null;
    this.interaction.sellArmed = false;
    sellCreature(this.run, creature);
  }

  private openSettings(): void {
    if (this.settingsReturn) return;
    if (this.isPlaying()) this.togglePause();
    this.settingsReturn =
      this.mode === 'entry'
        ? () => showEntry(() => this.leaveEntry())
        : this.mode === 'menu'
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
      onRedeem: async (code) => {
        if ((await sha256(code.trim().toUpperCase())) === ADMIN_HASH) {
          this.updateSettings({ admin: true });
          return '🛠 Modo administrador ativado: botão Admin no menu.';
        }
        const gift = await redeemGiftCode(this.profile, code);
        if (!gift) return 'Código inválido.';
        saveProfile(this.profile);
        updateMenuHud(this.profile);
        return `🎁 ${GIFTS[gift].name} liberada! Veja na Coleção e em Heróis.`;
      },
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
    const action = actionForKey(this.settings.keys, key);
    if (action === 'pulse') {
      event.preventDefault();
      this.pulse();
    } else if (key === 'escape') {
      if (!this.pointer.cancel()) this.togglePause();
    } else if (action === 'evolve') {
      this.pointer.evolveInspected();
    } else if (action === 'sell') {
      // vender a criatura selecionada (2 toques, como no popup)
      this.sellInspected();
    } else if (action === 'speed') {
      this.cycleSpeed();
    } else if (action === 'freeze') {
      this.setFrozen(!this.frozen);
    } else if (action === 'pause') {
      this.togglePause();
    } else if (action === 'camera') {
      this.camera.snap(this.run);
    } else if (action === 'nexus') {
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
        // Pulso segurado: solta assim que recarregar
        if (this.run.pulse.remaining === 0 && this.keyboard.isDown(this.settings.keys.pulse)) this.pulse();
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

    // qualidade gráfica: resolução interna da arena (automática reduz se o quadro ficar pesado)
    const nativeWidth = this.canvas.clientWidth * (window.devicePixelRatio || 1);
    const renderScale = this.quality.update(this.settings.quality, elapsed, nativeWidth);
    fitArenaCanvas(this.canvas, this.ctx, renderScale);
    if (this.settings.showFps) {
      const text = `${this.quality.fps} fps · ${this.canvas.width}×${this.canvas.height}`;
      if (this.fpsMeter.textContent !== text) this.fpsMeter.textContent = text;
    }
    if (this.fpsMeter.hidden === this.settings.showFps) this.fpsMeter.hidden = !this.settings.showFps;
    const view = interactionView(this.interaction, this.run);
    const hero = this.run.hero;
    view.heroRange =
      this.keyboard.isDown('shift') ||
      (this.interaction.pointerInArena && Math.hypot(this.interaction.pointer.x - hero.x, this.interaction.pointer.y - hero.y) < 18);
    // câmera: sempre no herói
    this.camera.update(this.run, elapsed);
    this.creaturePopup.camera = this.camera;
    drawFrame(this.ctx, this.run, this.effects, view, time, this.camera);
    const showMinimap = this.mode === 'run' && this.camera.scrolls(this.run);
    if (this.minimap.hidden === showMinimap) this.minimap.hidden = !showMinimap;
    if (showMinimap) drawMinimap(this.minimap, this.run, this.camera);
    // HUD e painel da run só aparecem na run; fora dela, o topo mostra o perfil
    if (document.body.dataset.mode !== this.mode) document.body.dataset.mode = this.mode;
    if (this.mode === 'run') updateHud(this.run);
    else updateMenuHud(this.profile);
    this.panel.update(this.run, this.interaction, time);
    this.nexusPanel.update(this.run, this.mode === 'run' && this.interaction.nexusOpen);
    this.creaturePopup.update(this.run, this.isPlaying() && !this.tutorial.freezes);
    setChosenVariants(this.profile.selectedVariants);
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
      case 'caravanMoved':
        this.camera.snap(this.run);
        break;
      case 'waveStarted':
        // depois de uma onda de chefe, volta a trilha normal
        this.music.play('run');
        this.music.setIntensity(Math.min(1, (event.wave - 1) / (event.total - 1)));
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
        // primeira vitória numa fase libera a seguinte
        const next = STAGE_IDS.map((id) => STAGES[id]).find((s) => s.requires === event.result.stage);
        const firstWin = event.result.victory && !event.result.endless && this.profile.stageRecords[event.result.stage]?.wins === 1;
        showRunEnd(
          event.result,
          unlocked,
          () => this.openMenu(),
          event.result.victory ? () => this.enterEndless() : undefined,
          firstWin ? next : undefined,
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

  /** Painel de administrador: cada mudança passa pela limpeza do save (equipe e herói válidos) e é salva. */
  private openAdmin(): void {
    showAdmin(this.profile, {
      onApply: (change) => {
        change(this.profile);
        this.profile = profileFromData(JSON.parse(JSON.stringify(this.profile)), 4);
        saveProfile(this.profile);
        updateMenuHud(this.profile);
        this.openAdmin();
      },
      onBack: () => this.openMenu(),
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
      onAdmin: this.settings.admin ? () => this.openAdmin() : undefined,
      onPlay: () => this.startRun(),
      onContinue: () => this.continueRun(),
      onTeam: () => this.openTeam(),
      onHeroes: () => {
        this.heroesReturn = null;
        this.openHeroes();
      },
      onCollection: () => this.openCollection(),
      onTalents: () => this.openFeature('talents', () => this.openTalents()),
      onAchievements: () => this.openFeature('achievements', () => showAchievements(this.profile, () => this.openMenu())),
      onCodex: () => this.openFeature('codex', () => showCodex(this.profile, () => this.openMenu())),
      onStages: () => this.openStages(),
      onNexus: () => this.openFeature('nexus', () => this.openNexusSkins()),
      onSelectLoadout: (index) => {
        if (index === this.profile.activeLoadout || !selectLoadout(this.profile, index)) return;
        saveProfile(this.profile);
        this.sound.play('place');
        this.openMenu();
      },
      onSanctuary: () => this.openFeature('sanctuary', () => this.openSanctuary()),
      onAltar: () => this.openFeature('altar', () => this.openAltar()),
      onRelics: () =>
        this.openFeature('relics', () =>
          showRelics(
            this.profile,
            () => saveProfile(this.profile),
            () => this.openMenu(),
          ),
        ),
      onSettings: () => this.openSettings(),
    });
  }

  // ---------- telas de meta-progressão ----------

  /** Abre uma tela que libera com o progresso; na 1ª visita, antes mostra o que ela faz (com ilustração). */
  private openFeature(id: FeatureId, open: () => void): void {
    if (!isFeatureUnlocked(this.profile, id)) return;
    // o Santuário tem o próprio quadro de tutorial (openSanctuary)
    if (id === 'sanctuary' || !markFeatureSeen(this.profile, id)) {
      open();
      return;
    }
    saveProfile(this.profile);
    const def = FEATURES[id];
    showIntro({ kicker: 'Liberado!', title: def.name, subtitle: def.intro.subtitle, color: def.intro.color, tips: def.intro.tips, demo: id }, open, `▶ Abrir ${def.name}`);
  }

  private openTalents(): void {
    showTalents(this.profile, {
      onBuy: (id) => this.afterPurchase(buyTalent(this.profile, id), () => this.openTalents()),
      onBack: () => this.openMenu(),
    });
  }

  /** highlight: criatura recém-fortalecida (a tela fica no mesmo lugar). */
  private openSanctuary(highlight?: CreatureId): void {
    // primeira visita: tutorial antes da tela
    if (!this.profile.seenTutorials.includes('sanctuary')) {
      this.profile.seenTutorials.push('sanctuary');
      saveProfile(this.profile);
      showSanctuaryIntro(() => this.openSanctuary(highlight), '▶ Entrar no Santuário');
      return;
    }
    showSanctuary(
      this.profile,
      {
        onUpgrade: (id) => {
          if (!upgradeSanctuary(this.profile, id)) return;
          this.afterPurchase(true, () => this.openSanctuary(id));
        },
        onHelp: () => showSanctuaryIntro(() => this.openSanctuary(), '← Voltar'),
        onBack: () => this.openMenu(),
      },
      highlight,
    );
  }

  private openAltar(last?: AltarResult): void {
    showAltar(
      this.profile,
      {
        onRoll: () => {
          const result = rollAltar(this.profile);
          if (!result) return;
          saveProfile(this.profile);
          this.sound.play(result.kind === 'variant' ? 'evolve' : 'coin');
          this.openAltar(result);
        },
        onBack: () => this.openMenu(),
      },
      last,
    );
  }

  /** stage: fase cujo Nexus está sendo editado (padrão: a fase escolhida). */
  private openNexusSkins(stage: StageId = this.profile.selectedStage): void {
    const changed = (ok: boolean, sound: 'place' | 'coin' = 'place') => {
      if (!ok) return;
      saveProfile(this.profile);
      this.sound.play(sound);
      this.run = createRun(runSetup(this.profile));
      this.openNexusSkins(stage);
    };
    showNexusSkins(this.profile, stage, {
      onStage: (id) => this.openNexusSkins(id),
      onModel: (model) => changed(selectNexusLook(this.profile, stage, { model })),
      onColor: (color) => changed(selectNexusLook(this.profile, stage, { color })),
      onBuyColor: (color) => changed(buyNexusColor(this.profile, color, stage), 'coin'),
      onBack: () => this.openMenu(),
    });
  }

  private openStages(): void {
    showStages(this.profile, {
      onSelect: (id) => {
        if (!selectStage(this.profile, id)) return;
        saveProfile(this.profile);
        this.sound.play('place');
        this.run = createRun(runSetup(this.profile));
        this.openStages();
      },
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
      onBack: () => {
        const back = this.heroesReturn;
        this.heroesReturn = null;
        if (back) back();
        else this.openMenu();
      },
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
        onVariant: (id, tier) => {
          if (!selectVariant(this.profile, id, tier)) return;
          saveProfile(this.profile);
          this.sound.play('place');
          this.run = createRun(runSetup(this.profile));
          this.openCollection(id);
        },
        onBack: () => this.openMenu(),
      },
      justUnlocked,
    );
  }

  private openTeam(): void {
    const changed = (sound: 'place' | 'coin' = 'place') => {
      saveProfile(this.profile);
      this.sound.play(sound);
      this.run = createRun(runSetup(this.profile));
      this.openTeam();
    };
    showTeam(this.profile, {
      onToggle: (id) => {
        if (toggleTeamMember(this.profile, id)) changed();
      },
      onMove: (from, to) => {
        if (moveTeamMember(this.profile, from, to)) changed();
      },
      onSelectLoadout: (index) => {
        if (index !== this.profile.activeLoadout && selectLoadout(this.profile, index)) changed();
      },
      onBuyLoadout: () => {
        if (buyLoadoutSlot(this.profile)) changed('coin');
      },
      onRename: (index, name) => {
        if (renameLoadout(this.profile, index, name)) changed();
      },
      onHero: () => {
        this.heroesReturn = () => this.openTeam();
        this.openHeroes();
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
    this.camera.snap(run);
    this.mode = 'run';
    this.music.play(waveBoss(run.stage, run.wave) && run.phase === 'playing' ? 'boss' : 'run');
    this.music.setIntensity(Math.min(1, (run.wave - 1) / (stageWaveCount(run.stage) - 1)));
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
    this.camera.snap(this.run, true);
    const stage = this.run.stage;
    if (!this.profile.seenStageIntros.includes(stage)) {
      // primeira run na fase: mostra as mecânicas do mapa antes de começar
      this.paused = true;
      showStageIntro(stage, () => {
        this.profile.seenStageIntros.push(stage);
        saveProfile(this.profile);
        hideOverlay();
        this.paused = false;
        if (!this.settings.tutorialDone) this.tutorial.start();
      });
    } else if (!this.settings.tutorialDone) this.tutorial.start();
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
      onStageIntro: () => showStageIntro(this.run.stage, () => this.showPauseScreen(), '← Voltar'),
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
