import type { AchievementId } from './achievements';
import type { HeroId } from './heroes';

// Skins: só cosméticas. Cada uma troca a paleta do sprite do herói e é liberada por uma conquista.

/** Cores que o sprite de cada herói lê (chaves ausentes usam a cor padrão do desenho). */
export type SkinPalette = Record<string, string>;

export interface SkinDef {
  id: string;
  hero: HeroId;
  name: string;
  palette: SkinPalette;
  /** null = skin padrão, sempre disponível. */
  unlockedBy: AchievementId | null;
}

export const SKINS: SkinDef[] = [
  { id: 'knight-sentinel', hero: 'knight', name: 'Sentinela', palette: {}, unlockedBy: null },
  {
    id: 'knight-templar',
    hero: 'knight',
    name: 'Templário',
    palette: { cape: '#f4f0e8', capeDark: '#b8a888', tunic: '#fff8ec', tunicDark: '#c8b898', scarf: '#d4302a', scarfDark: '#a01818' },
    unlockedBy: 'knightVictory',
  },
  {
    id: 'knight-black',
    hero: 'knight',
    name: 'Cavaleiro Negro',
    palette: { cape: '#4a2a7a', capeDark: '#1a0c30', tunic: '#3a3448', tunicDark: '#16121e', scarf: '#9a5cff', scarfDark: '#6a3ad0', hair: '#e8e0f0', hairDark: '#a898b8' },
    unlockedBy: 'untouchable',
  },
  { id: 'vampire-nocturne', hero: 'vampireLord', name: 'Noturno', palette: {}, unlockedBy: null },
  {
    id: 'vampire-crimson',
    hero: 'vampireLord',
    name: 'Conde Carmesim',
    palette: { coat: '#c8203a', coatDark: '#6e0a1a', cape: '#2a1018', capeDark: '#0e0408', lining: '#f4eef8', liningDark: '#a898b8', hat: '#f4eef8', hatBand: '#c8203a' },
    unlockedBy: 'vampireVictory',
  },
  {
    id: 'vampire-moon',
    hero: 'vampireLord',
    name: 'Lua de Sangue',
    palette: { coat: '#141018', coatDark: '#050308', lining: '#ffd25a', liningDark: '#a8701a', hat: '#141018', hatBand: '#ffd25a' },
    unlockedBy: 'slayer',
  },
  { id: 'draconian-ember', hero: 'draconian', name: 'Brasa', palette: {}, unlockedBy: null },
  {
    id: 'draconian-obsidian',
    hero: 'draconian',
    name: 'Obsidiana',
    palette: { body: '#3a2a4a', bodyDark: '#140a20', belly: '#b98cff', wing: '#7a3cf0', armor: '#c8c8d8', armorDark: '#6a6a80' },
    unlockedBy: 'draconianVictory',
  },
  {
    id: 'draconian-gold',
    hero: 'draconian',
    name: 'Escama Dourada',
    palette: { body: '#f0c35a', bodyDark: '#a8701a', belly: '#fff4d0', wing: '#ffe07a', armor: '#e8e8f4', armorDark: '#8a8aa0' },
    unlockedBy: 'ascension',
  },
];

export const skinsOf = (hero: HeroId): SkinDef[] => SKINS.filter((s) => s.hero === hero);
export const defaultSkin = (hero: HeroId): SkinDef => skinsOf(hero).find((s) => s.unlockedBy === null)!;
export const findSkin = (id: string): SkinDef | undefined => SKINS.find((s) => s.id === id);
