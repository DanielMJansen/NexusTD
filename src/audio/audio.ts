import type { GameEvent } from '../game/events';
import type { Settings } from '../save/settings';
import { SOUNDS, type SoundId } from './sounds';

/** Volume "cheio" de cada barramento; o volume escolhido pelo jogador (0..1) multiplica estes. */
const SFX_LEVEL = 0.065;
const MUSIC_LEVEL = 0.32;
/** Tiros podem disparar dezenas de vezes por segundo: intervalo mínimo entre sons iguais. */
const MIN_GAP: Partial<Record<SoundId, number>> = { kill: 0.03 };
const DEFAULT_GAP = 0.06;
/** Abates em sequência rápida sobem de tom (até uma oitava). */
const COMBO_WINDOW = 0.35;
const COMBO_MAX = 12;

/**
 * Áudio sintetizado com WebAudio: efeitos e música em barramentos separados, com um
 * limitador no mestre. O navegador só libera o som após um gesto do jogador.
 */
export class SoundPlayer {
  private context: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private settings: Pick<Settings, 'musicVolume' | 'sfxVolume' | 'muted'> = { musicVolume: 1, sfxVolume: 1, muted: false };
  private lastPlayed = new Map<SoundId, number>();
  private lastKill = 0;
  private combo = 0;
  /** Avisado quando o contexto é criado (a música se conecta aqui). */
  onReady: ((ctx: AudioContext, musicOut: AudioNode) => void) | null = null;

  constructor() {
    // Com a aba escondida, o navegador estrangula os timers e a música picota: suspende de propósito.
    document.addEventListener('visibilitychange', () => {
      if (!this.context) return;
      if (document.hidden) void this.context.suspend();
      else void this.context.resume();
    });
  }

  /** Chamar em resposta a um gesto do jogador (clique ou tecla). */
  unlock(): void {
    if (!this.context) {
      try {
        this.createGraph(new AudioContext());
      } catch {
        return;
      }
    }
    if (this.context?.state === 'suspended' && !document.hidden) void this.context.resume();
  }

  get ready(): boolean {
    return this.context !== null;
  }

  applySettings(settings: Pick<Settings, 'musicVolume' | 'sfxVolume' | 'muted'>): void {
    this.settings = { ...settings };
    if (!this.context || !this.sfxBus || !this.musicBus) return;
    const t = this.context.currentTime;
    const mute = settings.muted ? 0 : 1;
    this.sfxBus.gain.setTargetAtTime(SFX_LEVEL * settings.sfxVolume * mute, t, 0.05);
    this.musicBus.gain.setTargetAtTime(MUSIC_LEVEL * settings.musicVolume * mute, t, 0.05);
  }

  /** Toca um efeito; `pitch` multiplica as frequências. */
  play(id: SoundId, pitch = 1): void {
    const ctx = this.context;
    if (!ctx || !this.sfxBus || this.settings.muted || this.settings.sfxVolume <= 0) return;
    const t = ctx.currentTime;
    const gap = MIN_GAP[id] ?? DEFAULT_GAP;
    if (t - (this.lastPlayed.get(id) ?? -1) < gap) return;
    this.lastPlayed.set(id, t);

    const sound = SOUNDS[id];
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = sound.wave;
    oscillator.frequency.setValueAtTime(sound.from * pitch, t);
    oscillator.frequency.exponentialRampToValueAtTime(sound.to * pitch, t + sound.duration);
    gain.gain.setValueAtTime(sound.volume ?? 1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + sound.duration + 0.05);
    oscillator.connect(gain);
    gain.connect(this.sfxBus);
    oscillator.start(t);
    oscillator.stop(t + sound.duration + 0.08);
  }

  /** Som correspondente a cada evento da simulação (tiros do herói são silenciosos). */
  handle(event: GameEvent): void {
    switch (event.type) {
      case 'shot':
        this.play(event.source);
        break;
      case 'enemyKilled':
        this.playKill();
        break;
      case 'pulse':
        this.play('pulse');
        break;
      case 'nexusHit':
        this.play('hurt');
        break;
      case 'bossSpawned':
        this.play('boss');
        break;
      case 'creaturePlaced':
        this.play('place');
        break;
      case 'wardBlocked':
      case 'nexusHealed':
        this.play('heal');
        break;
      case 'creatureEvolved':
        this.play('evolve');
        break;
      case 'creatureSold':
      case 'choiceMade':
      case 'shopPurchase':
        this.play('coin');
        break;
      default:
        break;
    }
  }

  private playKill(): void {
    const now = this.context?.currentTime ?? 0;
    this.combo = now - this.lastKill < COMBO_WINDOW ? Math.min(COMBO_MAX, this.combo + 1) : 0;
    this.lastKill = now;
    this.play('kill', Math.pow(2, this.combo / COMBO_MAX));
  }

  private createGraph(ctx: AudioContext): void {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    limiter.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.sfxBus.connect(limiter);
    this.musicBus.connect(limiter);
    this.context = ctx;
    this.applySettings(this.settings);
    this.onReady?.(ctx, this.musicBus);
  }
}
