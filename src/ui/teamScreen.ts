import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { ownsCreature, TEAM_SIZE, type Profile } from '../game/profile';
import { showOverlay } from './overlay';

export interface TeamHandlers {
  onToggle(id: CreatureId): void;
  onBack(): void;
}

/** Equipe: as criaturas (até 6) que ficam disponíveis na run, na ordem dos atalhos. */
export function showTeam(profile: Profile, handlers: TeamHandlers): void {
  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => {
    const id = profile.team[i];
    if (!id) return `<div class="team-slot empty"><kbd>${i + 1}</kbd><span>Vaga livre</span></div>`;
    const def = CREATURES[id];
    return `<button class="team-slot" style="--card-color:${def.color}" data-action="toggle" data-value="${id}" title="Tirar da equipe">
      <kbd>${i + 1}</kbd><canvas data-sprite="${id}"></canvas><span>${def.name}</span><small>${def.role}</small></button>`;
  }).join('');

  const full = profile.team.length >= TEAM_SIZE;
  const options = CREATURE_IDS.filter((id) => ownsCreature(profile, id))
    .map((id) => {
      const def = CREATURES[id];
      const inTeam = profile.team.includes(id);
      const tag = inTeam ? '✓ Na equipe' : full ? 'Equipe cheia' : 'Adicionar';
      return `<button class="team-option${inTeam ? ' in-team' : ''}" style="--card-color:${def.color}" data-action="toggle" data-value="${id}"${!inTeam && full ? ' disabled' : ''}>
        <canvas data-sprite="${id}"></canvas>
        <span><b>${def.name}</b><small>${def.race} · ${def.role}</small></span>
        <em>${tag}</em></button>`;
    })
    .join('');
  const missing = CREATURE_IDS.length - profile.ownedCreatures.length;

  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Equipe</h2>
        <span class="muted">${profile.team.length}/${TEAM_SIZE}</span>
      </div>
      <p class="subtitle">Só a equipe aparece na run — todas disponíveis desde a onda 1, pagando o ouro para invocar.</p>
      <div class="team-slots">${slots}</div>
      <h3>Sua coleção</h3>
      <div class="team-options">${options}</div>
      ${missing > 0 ? `<p class="hint">Mais ${missing} criatura(s) para desbloquear na Coleção.</p>` : ''}
    </div>`,
    { toggle: (id) => handlers.onToggle(id as CreatureId), back: () => handlers.onBack() },
  );
}
