// Bot de calibragem: joga runs reais com a simulação (sem DOM) e mede vitórias, onda e Sem Fim por raça.
// Uso: npm run calib -- [filtro de raça]. Variáveis: STAGE=graveyard|swamp|tundra|desert, TAL=none|2500|max, N=30,
// SYN=1 (sinergias), ENDLESS=1 (segue no Sem Fim), HERO=<id>, TEAM=a,b,c (time próprio), AWAKE=1 (equipe
// desperta) ou AWAKEN=a,b (despertas escolhidas; o bot compra estrelas até ★5).
import type { CreatureId } from '../src/data/creatures';
import type { HeroId } from '../src/data/heroes';
import { NEXUS_UPGRADES } from '../src/data/nexusUpgrades';
import { TALENT_IDS, TALENTS, talentMaxLevel, type TalentId } from '../src/data/talents';
import { TIER_ORDER } from '../src/data/upgrades';
import { chooseChest, chooseOption } from '../src/game/choices';
import { firePulse } from '../src/game/pulses';
import { canEvolve, canPlaceCreature, evolveCreature, needsBranchChoice, placeCreature } from '../src/game/economy';
import { chooseHeroUpgrade } from '../src/game/hero';
import { buyNexusUpgrade, canBuyNexusUpgrade, nexusUpgradeCost } from '../src/game/nexus';
import { buyExtraSlot, canBuyExtraSlot, extraSlotCost } from '../src/game/shop';
import type { Choice, RunState } from '../src/game/state';
import type { StageId } from '../src/data/stages';
import { noTalentBonuses, talentBonuses, type TalentLevels } from '../src/game/talents';
import { enterEndless, startRun, updateRun } from '../src/game/update';
import { entrances } from '../src/game/paths';

const N = Number(process.env.N ?? 30);
/** Portais do Céu: inimigos impedidos ao selar e abates (diagnóstico com DIAG=1). */
let sealedTotal = 0;
let killedTotal = 0;
const ENDLESS = process.env.ENDLESS === '1';
const TAL = process.env.TAL ?? 'none';

/** Perfis de talento: nenhum, "meio da árvore" (~1.500 de Essência) e árvore completa. */
function talents() {
  if (TAL === 'none') return noTalentBonuses();
  if (TAL.startsWith('only:')) {
    const id = TAL.slice(5) as TalentId;
    return talentBonuses({ [id]: talentMaxLevel(id) });
  }
  const levels: TalentLevels = {};
  if (/^[0-9]+$/.test(TAL)) {
    // orçamento de Essência: compra sempre o próximo nível mais barato disponível (respeitando a cadeia)
    let budget = Number(TAL);
    for (;;) {
      const options = TALENT_IDS.filter((id) => {
        const lv = levels[id] ?? 0;
        const req = TALENTS[id].requires;
        return lv < talentMaxLevel(id) && (!req || (levels[req.id] ?? 0) >= req.level) && TALENTS[id].branch !== 'essence';
      }).sort((a, b) => TALENTS[a].costs[levels[a] ?? 0]! - TALENTS[b].costs[levels[b] ?? 0]!);
      const next = options[0];
      if (!next || TALENTS[next].costs[levels[next] ?? 0]! > budget) break;
      budget -= TALENTS[next].costs[levels[next] ?? 0]!;
      levels[next] = (levels[next] ?? 0) + 1;
    }
    return talentBonuses(levels);
  }
  for (const id of TALENT_IDS) {
    const max = talentMaxLevel(id as TalentId);
    levels[id as TalentId] = TAL === 'max' ? max : Math.ceil(max / 2);
  }
  return talentBonuses(levels);
}

const PREF: Record<string, number> = { damage: 5, attackSpeed: 5, raceDamage: 4, critChance: 4, ascendAll: 6, execute: 6, creatureSlot: 5, range: 3, nexusHeart: 3, nexusMaxHp: 2, heroDamage: 2, pulseCooldown: 2, nexusRegen: 2, evolveDiscount: 3, killGold: 2, gold: 2, ward: 3 };

function best(hand: Choice[]): number {
  let idx = 0;
  let score = -1;
  hand.forEach((c, i) => {
    const s = TIER_ORDER.indexOf(c.upgrade.tier) * 10 + (PREF[c.upgrade.family.kind] ?? 1);
    if (s > score) {
      score = s;
      idx = i;
    }
  });
  return idx;
}

/** Pontos a defender: Nexus e Obeliscos gêmeos vivos (Deserto). */
const anchorsOf = (run: RunState) => [run.nexus, ...run.guards.filter((g) => g.twin && g.hp > 0)];

/** Distância de um ponto à trilha mais próxima (Infinity sem trilhas). */
function pathDistance(run: RunState, p: { x: number; y: number }): number {
  let best = Infinity;
  for (const entrance of entrances(run)) {
    const path = entrance.path;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!;
      const b = path[i]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t)));
    }
  }
  return best;
}

/** Lugares candidatos em volta de um ponto (anéis), dos mais perto às trilhas aos mais longe. */
function spotsAround(run: RunState, anchor: { x: number; y: number }): { x: number; y: number }[] {
  const spots: { x: number; y: number; score: number }[] = [];
  for (const r of [55, 85, 115, 145]) {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const p = { x: anchor.x + Math.cos(a) * r * 1.2, y: anchor.y + Math.sin(a) * r };
      const d = pathDistance(run, p);
      // perto (não em cima) das trilhas e sem se afastar demais do ponto defendido
      const score = d === Infinity ? r : Math.abs(d - 32) + r * 0.25;
      spots.push({ ...p, score });
    }
  }
  return spots.sort((a, b) => a.score - b.score);
}

/**
 * Destino do herói (como o clique para mover de um jogador): o inimigo mais perto de qualquer ponto
 * defendido; sem ameaça, loot por perto; senão, o ponto mais ferido.
 */
function heroGoal(run: RunState): { x: number; y: number } {
  const anchors = anchorsOf(run);
  const hero = run.hero;
  let target: { x: number; y: number } | undefined;
  let bestD = 240;
  for (const e of run.enemies) {
    if (e.dead || e.allyTimer > 0 || e.submerged || e.hidden) continue;
    const d = Math.min(...anchors.map((a) => Math.hypot(a.x - e.x, a.y - e.y)));
    if (d < bestD) {
      bestD = d;
      target = e;
    }
  }
  // Portais do Céu: sem ameaça colada no Nexus, vai selar o portal aberto mais perto
  const nearNexus = target && Math.min(...anchors.map((a) => Math.hypot(a.x - target!.x, a.y - target!.y))) < 130;
  const portal = run.portals.filter((p) => p.warn <= 0 && !p.sealed && !p.done).sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y))[0];
  if (portal && !nearNexus) return { x: portal.x, y: portal.y };
  if (target) return { x: target.x, y: target.y };
  const item = run.loot.filter((l) => Math.hypot(l.x - hero.x, l.y - hero.y) < 140).sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y))[0];
  if (item) return { x: item.x, y: item.y };
  const weakest = anchors.reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a));
  return { x: weakest.x, y: weakest.y + 30 };
}

function act(run: RunState, team: CreatureId[]): void {
  if (run.phase !== 'playing') return;
  for (let tries = 0; tries < 3 && team.length; tries++) {
    const id = team[run.creatures.length % team.length]!;
    // com dois pontos (Deserto), alterna entre eles
    const anchors = anchorsOf(run);
    const anchor = anchors[run.creatures.length % anchors.length]!;
    const spot = spotsAround(run, anchor).find((s) => !run.creatures.some((c) => Math.hypot(c.x - s.x, c.y - s.y) < 22) && canPlaceCreature(run, id, s));
    if (spot) placeCreature(run, id, spot);
    else break;
  }
  const evolvable = run.creatures.filter((c) => canEvolve(run, c)).sort((a, b) => a.level - b.level)[0];
  if (evolvable && run.creatures.length >= run.creatureLimit) {
    evolveCreature(run, evolvable, needsBranchChoice(evolvable) ? (Math.random() < 0.5 ? 0 : 1) : undefined);
  } else if (run.creatures.length >= run.creatureLimit && !run.creatures.some((c) => c.level < 3)) {
    const options = NEXUS_UPGRADES.filter((u) => canBuyNexusUpgrade(run, u.id)).sort((a, b) => nexusUpgradeCost(run, a.id)! - nexusUpgradeCost(run, b.id)!);
    if (options[0]) buyNexusUpgrade(run, options[0].id);
  }
  if (!run.hero.dead) run.hero.target = heroGoal(run);
}

function trial(label: string, team: CreatureId[], hero: HeroId): void {
  let wins = 0;
  let wavesSum = 0;
  let endlessSum = 0;
  let levels = 0;
  const losses: number[] = [];
  for (let k = 0; k < N; k++) {
    const run = startRun({ stage: (process.env.STAGE ?? 'graveyard') as StageId, talents: talents(), team, hero, heroPalette: {}, synergies: process.env.SYN === '1', awakened: process.env.AWAKE === '1' ? [...team] : process.env.AWAKEN ? (process.env.AWAKEN.split(',') as CreatureId[]) : [] });
    let t = 0;
    let won = false;
    while (t < 20000) {
      while (run.heroChoices.length) chooseHeroUpgrade(run, 0);
      while (run.chestChoices.length) chooseChest(run, best(run.chestChoices));
      act(run, team);
      if (run.pulse.remaining === 0 && run.enemies.length > 3) firePulse(run);
      updateRun(run, 1 / 30, { direction: { x: 0, y: 0 } });
      t += 1 / 30;
      for (const e of run.events.splice(0)) {
        if (e.type === 'portalSealed') sealedTotal += e.prevented;
        if (e.type === 'enemyKilled') killedTotal++;
        if (e.type === 'choicesOffered') {
          if (canBuyExtraSlot(run) && run.gold > (extraSlotCost(run) ?? 0) + 40) buyExtraSlot(run);
          chooseOption(run, best(run.choices));
        }
      }
      if (run.phase === 'ended') {
        if (run.result?.victory && ENDLESS && !won) {
          won = true;
          enterEndless(run);
          continue;
        }
        break;
      }
      if (run.endless && run.wave >= 60) break;
    }
    if (process.env.DIAG === '1' && !won && !run.result?.victory) {
      // diagnóstico da derrota: qual ponto caiu e quem estava vivo perto dele
      const near = (p: { x: number; y: number }) => {
        const count: Record<string, number> = {};
        for (const e of run.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 60) count[e.def.id] = (count[e.def.id] ?? 0) + 1;
        return JSON.stringify(count);
      };
      const points = [{ name: 'Nexus', hp: run.nexus.hp, at: run.nexus }, ...run.guards.map((g) => ({ name: g.name, hp: g.hp, at: g }))];
      console.log(`  onda ${run.wave} · ${points.map((p) => `${p.name} ${Math.round(p.hp)} ${near(p.at)}`).join(' | ')} · criaturas ${run.creatures.length}`);
    }
    const victory = won || !!run.result?.victory;
    if (victory) wins++;
    else losses.push(run.wave);
    wavesSum += Math.min(run.wave, 20);
    if (ENDLESS && won) endlessSum += run.wave;
    levels += run.hero.level;
  }
  if (process.env.DIAG === '1' && sealedTotal) console.log(`  selados: ${(sealedTotal / N).toFixed(1)} inimigos impedidos por run (abates ${(killedTotal / N).toFixed(0)})`);
  sealedTotal = 0;
  killedTotal = 0;
  const endless = ENDLESS ? ` | Sem Fim até ${wins ? (endlessSum / wins).toFixed(1) : '-'}` : '';
  console.log(
    `${label.padEnd(14)} vitórias ${String(wins).padStart(2)}/${N} | onda ${(wavesSum / N).toFixed(1)} | nível ${(levels / N).toFixed(1)}${endless} | derrotas ${losses.sort((a, b) => a - b).join(',')}`,
  );
}

// Cada raça com suas 3 classes (dano primeiro) e o próprio herói; mais um time misto forte.
const RACES: [string, CreatureId[], HeroId][] = [
  ['Humano', ['archer', 'guard', 'cleric'], 'knight'],
  ['Vampiro', ['duelist', 'batSwarm', 'sanguine'], 'vampireLord'],
  ['Dragão', ['fireDragon', 'storm', 'iceDragon'], 'draconian'],
  ['Lobisomem', ['hunter', 'alpha', 'howler'], 'lycan'],
  ['Fantasma', ['haunt', 'banshee', 'possessor'], 'specter'],
  ['Bruxa', ['sorceress', 'cauldron', 'herbalist'], 'witch'],
  ['Fada', ['lumina', 'trickster', 'enchantress'], 'faeQueen'],
  ['Golem', ['crystalGolem', 'magmaGolem', 'stoneWall'], 'colossus'],
  ['Necromante', ['skeletonWarrior', 'reaper', 'drainer'], 'deathLord'],
  ['Górgona', ['serpentArcher', 'basilisk', 'medusa'], 'gorgonQueen'],
  ['Demônio', ['imp', 'infernal', 'succubus'], 'archdemon'],
  ['Anjo', ['cherub', 'valkyrie', 'guardianAngel'], 'archangel'],
  ['Unicórnio', ['starFoal', 'guardianUnicorn', 'warPegasus'], 'alicorn'],
  ['Misto 8', ['archer', 'fireDragon', 'storm', 'sorceress', 'infernal', 'cherub', 'lumina', 'enchantress'], 'knight'],
];
const only = process.argv[2];
if (process.env.TEAM) { trial(process.env.LABEL ?? 'custom', process.env.TEAM.split(',') as CreatureId[], (process.env.HERO as HeroId) || 'knight'); process.exit(0); }
console.log(`talentos: ${TAL} · ${N} runs por time${ENDLESS ? ' · segue no Sem Fim (até a onda 60)' : ''}`);
// todo jogador tem o Arqueiro: ele abre a defesa, e a raça completa o time
for (const [label, team, hero] of RACES) if (!only || label.startsWith(only)) trial(label, label === 'Misto 8' || label === 'Humano' ? team : ['archer', ...team], (process.env.HERO as HeroId) || hero);
