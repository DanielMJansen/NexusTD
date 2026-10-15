// Desenho das melhorias do Nexus (campo, escudo, raio) e do loot no chão.

import { anyNexusUpgradeAffordable, nexusLevel } from '../game/nexus';
import type { LootItem, RunState } from '../game/state';

const TAU = Math.PI * 2;

/** Por baixo de tudo: o Campo de Lentidão no chão e o anel de seleção do Nexus. */
export function drawNexusGround(ctx: CanvasRenderingContext2D, state: RunState, selected: boolean, time: number): void {
  const { x, y } = state.nexus;
  const field = nexusLevel(state, 'slowField');
  if (field) {
    const g = ctx.createRadialGradient(x, y, field.radius * 0.4, x, y, field.radius);
    g.addColorStop(0, '#7fd8ff00');
    g.addColorStop(1, '#7fd8ff22');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, field.radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#9fe4ff55';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -time * 8;
    ctx.beginPath();
    ctx.arc(x, y, field.radius, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (selected) {
    ctx.strokeStyle = `rgba(226, 200, 255, ${0.6 + Math.sin(time * 5) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 30, 12, 0, 0, TAU);
    ctx.stroke();
    const bolt = nexusLevel(state, 'bolt');
    if (bolt) {
      ctx.strokeStyle = '#ffe9a855';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(x, y, bolt.range, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

/** Por cima do Nexus: bolha do escudo ativo e o selo dourado de escudo pronto. */
export function drawNexusOverlay(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const { x, y } = state.nexus;
  const shield = state.nexusShield;
  if (shield.active > 0) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(time * 10) * 0.15;
    const g = ctx.createRadialGradient(x, y - 8, 10, x, y - 8, 34);
    g.addColorStop(0, '#ffe9a800');
    g.addColorStop(1, '#ffd25a66');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - 8, 34, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (nexusLevel(state, 'shield') && shield.cooldown <= 0) {
    // escudo pronto: pequeno losango dourado girando acima do cristal
    ctx.save();
    ctx.translate(x, y - 46);
    ctx.rotate(time * 1.5);
    ctx.fillStyle = '#ffd25a';
    ctx.shadowColor = '#ffd25a';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(3, 0);
    ctx.lineTo(0, 3);
    ctx.lineTo(-3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // há ouro para melhorar: etiqueta sobre o Nexus (mais chamativa até a 1ª compra da run, depois discreta)
  if (anyNexusUpgradeAffordable(state)) {
    const bought = Object.values(state.nexusLevels).some((level) => level > 0);
    drawUpgradeTag(ctx, x, y - 76 + Math.sin(time * 4) * (bought ? 1 : 2.5), time, !bought);
  }
}

/** Etiqueta dourada sobre o Nexus: "⬆ Melhorar · N" (clique no Nexus ou tecla N). */
function drawUpgradeTag(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, strong: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  const s = strong ? 1 : 0.85;
  ctx.scale(s, s);
  const pulse = 0.5 + Math.sin(time * 5) * 0.5;
  ctx.font = '700 9px Cinzel, Georgia, serif';
  ctx.textBaseline = 'middle';
  const label = 'MELHORAR';
  const textW = ctx.measureText(label).width;
  const w = textW + 32;
  const h = 15;
  // pílula escura com borda dourada e brilho pulsando
  ctx.shadowColor = '#ffd25a';
  ctx.shadowBlur = strong ? 6 + pulse * 10 : 4;
  ctx.fillStyle = '#1e1428ee';
  ctx.strokeStyle = '#ffd25a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  // seta
  ctx.fillStyle = '#ffd25a';
  const ax = -w / 2 + 8;
  ctx.beginPath();
  ctx.moveTo(ax, -4.5);
  ctx.lineTo(ax + 4, 0);
  ctx.lineTo(ax + 1.5, 0);
  ctx.lineTo(ax + 1.5, 4);
  ctx.lineTo(ax - 1.5, 4);
  ctx.lineTo(ax - 1.5, 0);
  ctx.lineTo(ax - 4, 0);
  ctx.closePath();
  ctx.fill();
  // texto
  ctx.fillStyle = '#ffe08a';
  ctx.textAlign = 'left';
  ctx.fillText(label, ax + 7, 0.5);
  // tecla N
  const kx = w / 2 - 9;
  ctx.fillStyle = '#ffd25a';
  ctx.beginPath();
  ctx.roundRect(kx - 5, -5, 10, 10, 2.5);
  ctx.fill();
  ctx.fillStyle = '#2a1a08';
  ctx.textAlign = 'center';
  ctx.fillText('N', kx, 0.8);
  ctx.restore();
}

/** Moedas giram e baús balançam; piscam nos últimos 3 s antes de sumir. */
export function drawLoot(ctx: CanvasRenderingContext2D, item: LootItem, time: number): void {
  if (item.remaining < 3 && Math.sin(time * 18) < 0) return;
  const bob = Math.sin(time * 4 + item.x) * 1.5;
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.fillStyle = '#05020a77';
  ctx.beginPath();
  ctx.ellipse(0, 6, item.kind === 'chest' ? 8 : 4, 2, 0, 0, TAU);
  ctx.fill();
  if (item.kind === 'coin') {
    // giro suave (nunca fica de lado) com aro interno
    const squash = 0.55 + Math.abs(Math.cos(time * 3 + item.x)) * 0.45;
    ctx.translate(0, bob - 3);
    ctx.shadowColor = '#ffd25a';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd25a';
    ctx.strokeStyle = '#6a4a1a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5 * squash, 5.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c8901a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.2 * squash, 3.2, 0, 0, TAU);
    ctx.stroke();
  } else {
    ctx.translate(0, bob - 2);
    ctx.rotate(Math.sin(time * 6) * 0.06);
    // brilho
    const glow = ctx.createRadialGradient(0, -2, 1, 0, -2, 16);
    glow.addColorStop(0, '#ffe9a866');
    glow.addColorStop(1, '#ffe9a800');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -2, 16, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#170c24';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = '#8a4a20';
    ctx.beginPath();
    ctx.roundRect(-7, -4, 14, 9, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b06a2a';
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.quadraticCurveTo(0, -11, 7, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd25a';
    ctx.fillRect(-7, -4.8, 14, 1.6);
    ctx.fillRect(-1.2, -6, 2.4, 11);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(0, -2, 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
