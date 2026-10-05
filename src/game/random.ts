// Ponto único de aleatoriedade da simulação (permite trocar por um gerador com semente).
export const random = (): number => Math.random();

/** Embaralhamento Fisher–Yates; devolve uma cópia. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
