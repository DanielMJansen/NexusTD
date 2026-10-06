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
  { id: 'archangel-default', hero: 'archangel', name: 'Aurora', palette: {}, unlockedBy: null },
  { id: 'archdemon-default', hero: 'archdemon', name: 'Abismo', palette: {}, unlockedBy: null },
  { id: 'gorgonQueen-default', hero: 'gorgonQueen', name: 'Esmeralda', palette: {}, unlockedBy: null },
  { id: 'deathLord-default', hero: 'deathLord', name: 'Túmulo', palette: {}, unlockedBy: null },
  { id: 'colossus-default', hero: 'colossus', name: 'Pedra Antiga', palette: {}, unlockedBy: null },
  { id: 'faeQueen-default', hero: 'faeQueen', name: 'Primavera', palette: {}, unlockedBy: null },
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
  { id: 'lycan-grey', hero: 'lycan', name: 'Lobo Cinzento', palette: {}, unlockedBy: null },
  {
    id: 'lycan-arctic',
    hero: 'lycan',
    name: 'Lobo Ártico',
    palette: { fur: '#e8eef8', furDark: '#9aa8c0', cape: '#3a7ad0', capeDark: '#1a3a7a', leather: '#c8d0e0' },
    unlockedBy: 'lycanVictory',
  },
  {
    id: 'lycan-shadow',
    hero: 'lycan',
    name: 'Lobo Sombrio',
    palette: { fur: '#2a2632', furDark: '#0e0c12', cape: '#7a3cf0', capeDark: '#2e1460', leather: '#3a2a4a' },
    unlockedBy: 'collector',
  },
  { id: 'specter-pale', hero: 'specter', name: 'Lanterna Pálida', palette: {}, unlockedBy: null },
  {
    id: 'specter-wisp',
    hero: 'specter',
    name: 'Fogo-Fátuo',
    palette: { robe: '#4a2a6a', robeDark: '#1a0c2a', glow: '#ffb040' },
    unlockedBy: 'specterVictory',
  },
  {
    id: 'specter-reaper',
    hero: 'specter',
    name: 'Ceifador',
    palette: { robe: '#2a2a30', robeDark: '#08080a', glow: '#ff3a40' },
    unlockedBy: 'marathon',
  },
  { id: 'witch-pumpkin', hero: 'witch', name: 'Abóbora', palette: {}, unlockedBy: null },
  {
    id: 'witch-forest',
    hero: 'witch',
    name: 'Bruxa da Floresta',
    palette: { dress: '#2a5a2a', dressDark: '#0e2a10', hair: '#6a3a1a', accent: '#ffd25a', hat: '#1e3a1a', hatBand: '#ffd25a' },
    unlockedBy: 'witchVictory',
  },
  {
    id: 'witch-moon',
    hero: 'witch',
    name: 'Bruxa da Lua',
    palette: { dress: '#1a2450', dressDark: '#080c20', hair: '#f0f0f8', accent: '#8ce8ff', hat: '#141a3a', hatBand: '#c8d0e0' },
    unlockedBy: 'champion',
  },
];

export const skinsOf = (hero: HeroId): SkinDef[] => SKINS.filter((s) => s.hero === hero);
export const defaultSkin = (hero: HeroId): SkinDef => skinsOf(hero).find((s) => s.unlockedBy === null)!;
export const findSkin = (id: string): SkinDef | undefined => SKINS.find((s) => s.id === id);
