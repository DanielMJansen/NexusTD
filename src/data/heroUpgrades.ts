// Melhorias só do herói, escolhidas a cada nível ganho na run (XP por abate).
// Valores PROPOSTA.

export type HeroStat =
  | 'damage' // fração de dano do herói
  | 'attackSpeed' // fração de velocidade de ataque do herói
  | 'range' // fração de alcance do herói
  | 'maxHp' // vida máxima (também cura o mesmo)
  | 'regen' // vida por segundo
  | 'speed' // fração de velocidade de movimento
  | 'pulseCooldown' // fração a menos na recarga do Pulso
  | 'pulseDamage' // fração de dano do Pulso
  | 'lifesteal' // fração do dano dos golpes que volta como vida
  | 'thorns' // dano por segundo em inimigos encostados no herói
  | 'armor'; // fração a menos de dano recebido (máx. 60%)

export interface HeroUpgradeDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  stat: HeroStat;
  value: number;
  maxPicks?: number;
}

export const HERO_UPGRADES: HeroUpgradeDef[] = [
  { id: 'edge', name: 'Lâmina Afiada', icon: '⚔', text: '+15% de dano do herói', stat: 'damage', value: 0.15 },
  { id: 'agility', name: 'Agilidade', icon: '➶', text: '+12% de velocidade de ataque do herói', stat: 'attackSpeed', value: 0.12 },
  { id: 'reach', name: 'Alcance', icon: '◎', text: '+12% de alcance do herói', stat: 'range', value: 0.12 },
  { id: 'vigor', name: 'Vigor', icon: '♥', text: '+25 de vida máxima do herói', stat: 'maxHp', value: 25 },
  { id: 'recovery', name: 'Recuperação', icon: '❦', text: '+1,5 de vida/s do herói', stat: 'regen', value: 1.5 },
  { id: 'swift', name: 'Passos Rápidos', icon: '»', text: '+10% de velocidade do herói', stat: 'speed', value: 0.1, maxPicks: 4 },
  { id: 'focus', name: 'Foco', icon: '✺', text: 'Pulso recarrega 10% mais rápido', stat: 'pulseCooldown', value: 0.1, maxPicks: 4 },
  { id: 'surge', name: 'Pulso Potente', icon: '✹', text: '+25% de dano do Pulso', stat: 'pulseDamage', value: 0.25 },
  { id: 'leech', name: 'Sede', icon: '♦', text: 'Golpes do herói devolvem 10% do dano como vida', stat: 'lifesteal', value: 0.1, maxPicks: 3 },
  { id: 'thorns', name: 'Espinhos', icon: '✷', text: 'Inimigos encostados no herói sofrem 8 de dano/s', stat: 'thorns', value: 8 },
  { id: 'bulwark', name: 'Couraça', icon: '⛨', text: 'O herói recebe 15% menos dano', stat: 'armor', value: 0.15, maxPicks: 4 },
];

/** XP para passar do nível N para o N+1. */
export const xpToNextLevel = (level: number): number => 10 + 8 * (level - 1);

/** Tempo para renascer depois de morrer (s). */
export const HERO_RESPAWN_TIME = 8;
/** Distância (além do raio do inimigo) em que um inimigo encosta no herói. */
export const HERO_CONTACT_RANGE = 10;
