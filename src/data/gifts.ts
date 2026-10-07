// Presentes: conteúdo exclusivo liberado por código (Configurações › Código de presente).
// O código em si não fica no jogo, só o SHA-256 dele (código em maiúsculas, sem espaços nas pontas).

export type GiftId = 'unicorn';

export interface GiftDef {
  id: GiftId;
  name: string;
  /** SHA-256 (hex) do código. */
  hash: string;
}

export const GIFTS: Record<GiftId, GiftDef> = {
  unicorn: {
    id: 'unicorn',
    name: 'Raça Unicórnio',
    hash: 'bf416232eb98bfc2d706db1197c15e3449f1dde61ee061928eecd29279d5f11e',
  },
};

export const GIFT_IDS = Object.keys(GIFTS) as GiftId[];
