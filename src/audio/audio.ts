import type { GameEvent } from '../game/events';
import { SOUNDS, type SoundId } from './sounds';

const VOLUME = 0.05;

/** Áudio sintetizado com WebAudio. O navegador só libera o som após um gesto do jogador. */
export class SoundPlayer {
  private context: AudioContext | null = null;
  muted = false;

  /** Chamar em resposta a tecla/toque. */
  unlock(): void {
    if (!this.context) {
      try {
        this.context = new AudioContext();
      } catch {
        return;
      }
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  play(id: SoundId): void {
    const ctx = this.context;
    if (this.muted || !ctx) return;
    const sound = SOUNDS[id];
    const t = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = sound.wave;
    oscillator.frequency.setValueAtTime(sound.from, t);
    oscillator.frequency.exponentialRampToValueAtTime(sound.to, t + sound.duration);
    gain.gain.setValueAtTime(VOLUME, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + sound.duration + 0.05);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + sound.duration + 0.08);
  }

  /** Som correspondente a cada evento da simulação (tiros do herói são silenciosos). */
  handle(event: GameEvent): void {
    switch (event.type) {
      case 'shot':
        if (event.source !== 'hero') this.play(event.source);
        break;
      case 'enemyKilled':
        this.play('kill');
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
}
