// Trilhas compostas (notas MIDI), tocadas pelo sequenciador de music.ts.
// Ré menor: clima gótico. Um compasso = 8 colcheias.

export type SongId = 'menu' | 'run' | 'boss';

/** [colcheia de início, nota MIDI, duração em colcheias] */
export type Note = [step: number, note: number, length: number];

export interface Song {
  /** Andamento com intensidade 0 e 1 (a da run sobe ao longo das ondas). */
  bpmMin: number;
  bpmMax: number;
  /** Acorde (MIDI) de cada compasso. */
  chords: number[][];
  /** Nota grave de cada compasso. */
  bass: number[];
  /** Melodia por compasso. */
  melody: Note[][];
  /** Timbre da melodia: sino (menu) ou voz de órgão/lira (run). */
  lead: 'bell' | 'organ';
  drums: 'none' | 'march' | 'war';
  /** Corte do filtro do pad (Hz): mais baixo = mais escuro. */
  padCutoff: number;
}

const Dm = [50, 57, 62, 65];
const Bb = [46, 53, 58, 62];
const Gm = [43, 55, 58, 62];
const A = [45, 57, 61, 64];
const F = [41, 53, 57, 60];
const C = [48, 55, 60, 64];
const Eb = [51, 58, 63, 67];

export const SONGS: Record<SongId, Song> = {
  // Menu: lento, sem percussão, sinos esparsos sobre um pad de órgão.
  menu: {
    bpmMin: 58,
    bpmMax: 58,
    chords: [Dm, Bb, Gm, A, Dm, F, C, A],
    bass: [38, 34, 31, 33, 38, 29, 36, 33],
    melody: [
      [[0, 74, 4], [4, 77, 4]],
      [[0, 74, 6], [6, 70, 2]],
      [[0, 70, 4], [4, 74, 4]],
      [[0, 73, 8]],
      [[0, 81, 4], [4, 77, 2], [6, 76, 2]],
      [[0, 77, 6], [6, 72, 2]],
      [[0, 76, 4], [4, 72, 4]],
      [[0, 73, 4], [4, 69, 4]],
    ],
    lead: 'bell',
    drums: 'none',
    padCutoff: 700,
  },
  // Run: marcha que acelera (96 → 156 BPM) e ganha camadas a cada onda.
  run: {
    bpmMin: 96,
    bpmMax: 156,
    chords: [Dm, Bb, C, A, Dm, Gm, Bb, A],
    bass: [38, 34, 36, 33, 38, 31, 34, 33],
    melody: [
      [[0, 74, 2], [2, 76, 1], [3, 77, 1], [4, 76, 2], [6, 74, 2]],
      [[0, 77, 3], [3, 74, 1], [4, 70, 4]],
      [[0, 72, 2], [2, 76, 2], [4, 79, 2], [6, 77, 2]],
      [[0, 76, 2], [2, 73, 2], [4, 69, 4]],
      [[0, 74, 1], [1, 77, 1], [2, 81, 2], [4, 79, 1], [5, 77, 1], [6, 76, 2]],
      [[0, 74, 2], [2, 70, 2], [4, 74, 2], [6, 79, 2]],
      [[0, 77, 2], [2, 76, 1], [3, 74, 1], [4, 72, 2], [6, 74, 2]],
      [[0, 73, 3], [3, 76, 1], [4, 69, 4]],
    ],
    lead: 'organ',
    drums: 'march',
    padCutoff: 900,
  },
  // Chefe: grave, cromático (Ré–Mi♭) e tambores de guerra.
  boss: {
    bpmMin: 150,
    bpmMax: 150,
    chords: [Dm, Eb, Dm, A, Dm, Eb, Bb, A],
    bass: [38, 39, 38, 33, 38, 39, 34, 33],
    melody: [
      [[0, 62, 2], [2, 62, 1], [3, 63, 1], [4, 62, 2], [6, 61, 2]],
      [[0, 63, 2], [2, 67, 2], [4, 70, 2], [6, 67, 2]],
      [[0, 74, 1], [1, 72, 1], [2, 74, 2], [4, 69, 4]],
      [[0, 69, 2], [2, 73, 2], [4, 76, 4]],
      [[0, 62, 2], [2, 62, 1], [3, 63, 1], [4, 62, 2], [6, 61, 2]],
      [[0, 63, 2], [2, 67, 2], [4, 75, 2], [6, 74, 2]],
      [[0, 70, 2], [2, 74, 2], [4, 77, 2], [6, 74, 2]],
      [[0, 73, 4], [4, 69, 4]],
    ],
    lead: 'organ',
    drums: 'war',
    padCutoff: 650,
  },
};
