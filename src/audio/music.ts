import { SONGS, type Song, type SongId } from './songs';

const STEPS_PER_BAR = 8;
/** Quanto à frente (s) as notas são agendadas no relógio do WebAudio. */
const LOOKAHEAD = 0.15;
const TICK_MS = 25;
const FADE = 0.8;

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Sequenciador de música procedural: agenda notas com antecedência no relógio do
 * WebAudio (o setTimeout do navegador oscila demais para ritmo). A trilha da run
 * acelera e ganha camadas conforme a intensidade sobe (0 = onda 1, 1 = última onda).
 */
export class Music {
  private ctx: AudioContext | null = null;
  private fade: GainNode | null = null;
  private echo: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private song: Song | null = null;
  private songId: SongId | null = null;
  private wanted: SongId | null = null;
  private step = 0;
  private nextTime = 0;
  private intensity = 0;
  private timer: number | null = null;

  /** Liga a música ao barramento de música do SoundPlayer (chamado quando o áudio é liberado). */
  connect(ctx: AudioContext, output: AudioNode): void {
    this.ctx = ctx;
    this.fade = ctx.createGain();
    this.fade.gain.value = 0;
    this.fade.connect(output);
    // eco simples para sinos e melodia
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.33;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    this.echo = ctx.createGain();
    this.echo.gain.value = 0.35;
    this.echo.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.fade);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    if (this.wanted) this.play(this.wanted);
  }

  /** Troca de trilha com fade. Pode ser chamado antes do áudio liberar (toca quando liberar). */
  play(id: SongId): void {
    this.wanted = id;
    const ctx = this.ctx;
    if (!ctx || !this.fade || this.songId === id) return;
    const t = ctx.currentTime;
    const switching = this.songId !== null;
    this.fade.gain.cancelScheduledValues(t);
    this.fade.gain.setValueAtTime(this.fade.gain.value, t);
    this.fade.gain.linearRampToValueAtTime(0, t + (switching ? FADE / 2 : 0.01));
    this.fade.gain.linearRampToValueAtTime(1, t + (switching ? FADE / 2 : 0.01) + FADE);
    this.songId = id;
    this.song = SONGS[id];
    this.step = 0;
    this.nextTime = t + (switching ? FADE / 2 : 0.05);
    if (this.timer === null) this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  private tick(): void {
    const ctx = this.ctx;
    const song = this.song;
    if (!ctx || !song || ctx.state !== 'running') return;
    // Volta de uma aba escondida: não tenta "recuperar" as notas perdidas.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const secondsPerStep = 60 / this.bpm(song) / 2;
      this.playStep(song, this.step, this.nextTime, secondsPerStep);
      this.nextTime += secondsPerStep;
      this.step++;
    }
  }

  private bpm(song: Song): number {
    return song.bpmMin + (song.bpmMax - song.bpmMin) * this.intensity;
  }

  private playStep(song: Song, step: number, t: number, sps: number): void {
    const bar = Math.floor(step / STEPS_PER_BAR) % song.chords.length;
    const s = step % STEPS_PER_BAR;
    const level = this.songId === 'run' ? this.intensity : 1;

    if (s === 0) {
      this.pad(song.chords[bar]!, t, sps * STEPS_PER_BAR, song.padCutoff + level * 500);
      if (level < 0.45) this.bass(song.bass[bar]!, t, sps * STEPS_PER_BAR * 0.95);
    }
    if (level >= 0.45 && s % 2 === 0) this.bass(song.bass[bar]!, t, sps * 1.6);

    // melodia: no menu sempre; na run entra a partir da metade e fica em todo compasso no fim
    const melodyOn = this.songId !== 'run' || (level >= 0.25 && (bar % 2 === 0 || level >= 0.6));
    if (melodyOn) {
      for (const [start, note, length] of song.melody[bar]!) {
        if (start !== s) continue;
        if (song.lead === 'bell') this.bell(note, t);
        else this.organ(note, t, length * sps);
      }
    }

    switch (song.drums) {
      case 'march':
        if (s === 0 || s === 4) this.doum(t, 1);
        if (level >= 0.3 && (s === 3 || s === 7)) this.tek(t, 0.6);
        if (level >= 0.65 && (s === 2 || s === 6)) this.tek(t, 0.45);
        if (level >= 0.85 && s === 5) this.doum(t, 0.6);
        break;
      case 'war':
        if (s % 2 === 0) this.doum(t, s === 0 ? 1.2 : 0.8);
        if (s % 2 === 1) this.tek(t, 0.5);
        break;
      case 'none':
        break;
    }
  }

  // ---------- instrumentos ----------

  private envelope(t: number, peak: number, attack: number, hold: number, release: number): GainNode {
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.setValueAtTime(peak, t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return gain;
  }

  /** Pad escuro: duas serras desafinadas por nota, num passa-baixa. */
  private pad(chord: number[], t: number, duration: number, cutoff: number): void {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = this.envelope(t, 0.05, 0.35, Math.max(0, duration - 0.6), 0.6);
    filter.connect(gain);
    gain.connect(this.fade!);
    for (const note of chord) {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = midiToFreq(note);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + duration + 0.7);
      }
    }
  }

  private bass(note: number, t: number, duration: number): void {
    const ctx = this.ctx!;
    const gain = this.envelope(t, 0.16, 0.02, duration * 0.6, duration * 0.4 + 0.1);
    gain.connect(this.fade!);
    for (const [type, mult] of [['triangle', 1], ['sine', 0.5]] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = midiToFreq(note) * mult;
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + duration + 0.2);
    }
  }

  /** Sino: parcial inarmônico (×2,76) que decai devagar, com eco. */
  private bell(note: number, t: number): void {
    const ctx = this.ctx!;
    const gain = this.envelope(t, 0.07, 0.005, 0, 2.2);
    gain.connect(this.fade!);
    gain.connect(this.echo!);
    for (const [mult, level] of [[1, 1], [2.76, 0.35], [5.4, 0.12]] as const) {
      const osc = ctx.createOscillator();
      const partial = ctx.createGain();
      partial.gain.value = level;
      osc.type = 'sine';
      osc.frequency.value = midiToFreq(note) * mult;
      osc.connect(partial);
      partial.connect(gain);
      osc.start(t);
      osc.stop(t + 2.4);
    }
  }

  /** Voz de órgão para a melodia da run: fundamental + oitava, com vibrato leve. */
  private organ(note: number, t: number, duration: number): void {
    const ctx = this.ctx!;
    const gain = this.envelope(t, 0.06, 0.02, Math.max(0, duration - 0.08), 0.18);
    gain.connect(this.fade!);
    gain.connect(this.echo!);
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 5.5;
    depth.gain.value = 4;
    vibrato.connect(depth);
    for (const [type, mult, level] of [['triangle', 1, 1], ['sine', 2, 0.4]] as const) {
      const osc = ctx.createOscillator();
      const partial = ctx.createGain();
      partial.gain.value = level;
      osc.type = type;
      osc.frequency.value = midiToFreq(note) * mult;
      depth.connect(osc.detune);
      osc.connect(partial);
      partial.connect(gain);
      osc.start(t);
      osc.stop(t + duration + 0.3);
    }
    vibrato.start(t);
    vibrato.stop(t + duration + 0.3);
  }

  /** Tambor grave: seno que despenca de tom + baque de ruído. */
  private doum(t: number, strength: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    const gain = this.envelope(t, 0.5 * strength, 0.003, 0, 0.32);
    osc.connect(gain);
    gain.connect(this.fade!);
    osc.start(t);
    osc.stop(t + 0.4);
    this.noiseHit(t, 0.12 * strength, 0.08, 'lowpass', 900);
  }

  /** Estalo agudo. */
  private tek(t: number, strength: number): void {
    this.noiseHit(t, 0.1 * strength, 0.05, 'highpass', 3500);
  }

  private noiseHit(t: number, peak: number, length: number, type: BiquadFilterType, freq: number): void {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const gain = this.envelope(t, peak, 0.002, 0, length);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.fade!);
    source.start(t);
    source.stop(t + length + 0.05);
  }
}
