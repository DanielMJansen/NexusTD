import type { Quality } from '../save/settings';

/**
 * Resolução interna da arena: limita quantos pixels são pintados a cada quadro.
 * Alta = nativa; Média e Baixa = teto de largura; Automática = ajusta pelo tempo de quadro.
 */
export class RenderQuality {
  /** Fator aplicado à resolução nativa (CSS × devicePixelRatio). */
  scale = 1;
  fps = 60;
  private frames = 0;
  private elapsed = 0;
  private slowFor = 0;
  private fastFor = 0;

  /** Atualiza a medição e devolve o fator de resolução para este quadro. */
  update(quality: Quality, dt: number, nativeWidth: number): number {
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed >= 1) {
      this.fps = Math.round(this.frames / this.elapsed);
      this.frames = 0;
      this.elapsed = 0;
      if (quality === 'auto') {
        // pesado por 2 s seguidos: reduz; folgado por 6 s: aumenta (devagar, sem ficar oscilando)
        if (this.fps < 45) {
          this.slowFor++;
          this.fastFor = 0;
        } else if (this.fps >= 57) {
          this.fastFor++;
          this.slowFor = 0;
        } else this.slowFor = this.fastFor = 0;
        if (this.slowFor >= 2) {
          this.scale = Math.max(0.45, this.scale * 0.85);
          this.slowFor = 0;
        } else if (this.fastFor >= 6 && this.scale < 1) {
          this.scale = Math.min(1, this.scale * 1.1);
          this.fastFor = 0;
        }
      }
    }
    const cap = (maxWidth: number) => Math.min(1, maxWidth / Math.max(1, nativeWidth));
    if (quality === 'high') return 1;
    if (quality === 'medium') return cap(1600);
    if (quality === 'low') return cap(1100);
    return Math.min(this.scale, cap(2560));
  }
}
