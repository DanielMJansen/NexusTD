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
import { noTalentBonuses, talentBonuses, type TalentLevels } from '../src/game/talents';
import { enterEndless, startRun, updateRun } from '../src/game/update';

const N = Number(process.env.N ?? 30);
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

const SPOTS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const r = i % 2 ? 95 : 62;
  return { x: Math.cos(a) * r * 1.3, y: Math.sin(a) * r };
});
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

/**
 * Com dois Obeliscos (Deserto), o herói corre até o inimigo mais perto de qualquer um deles;
 * nas outras fases fica parado no Nexus (como nas calibragens antigas).
 */
function heroDirection(run: RunState): { x: number; y: number } {
  const twins = run.guards.filter((g) => g.twin && g.hp > 0);
  if (!twins.length || run.hero.dead) return { x: 0, y: 0 };
  const anchors = [run.nexus, ...twins];
  let target: { x: number; y: number } | undefined;
  let bestD = 260;
  for (const e of run.enemies) {
    if (e.dead || e.allyTimer > 0) continue;
    const d = Math.min(...anchors.map((a) => Math.hypot(a.x - e.x, a.y - e.y)));
    if (d < bestD) {
      bestD = d;
      target = e;
    }
  }
  if (!target) {
    // sem ameaça: volta para o ponto mais ferido
    target = anchors.reduce((a, b) => ((b.hp ?? 0) / (b.maxHp ?? 1) < (a.hp ?? 0) / (a.maxHp ?? 1) ? b : a));
  }
  const dx = target.x - run.hero.x;
  const dy = target.y - run.hero.y;
  const len = Math.hypot(dx, dy);
  return len < 24 ? { x: 0, y: 0 } : { x: dx / len, y: dy / len };
}

function act(run: RunState, team: CreatureId[]): void {
  if (run.phase !== 'playing') return;
  for (let tries = 0; tries < 3 && team.length; tries++) {
    const id = team[run.creatures.length % team.length]!;
    // Deserto: alterna entre o Nexus e os Obeliscos gêmeos
    const anchors = [run.nexus, ...run.guards.filter((g) => g.twin && g.hp > 0)];
    const anchor = anchors[run.creatures.length % anchors.length]!;
    const spot = SPOTS.map((s) => ({ x: anchor.x + s.x, y: anchor.y + s.y })).find((s) => !run.creatures.some((c) => Math.hypot(c.x - s.x, c.y - s.y) < 20));
    if (spot && canPlaceCreature(run, id, spot)) placeCreature(run, id, spot);
    else break;
  }
  const evolvable = run.creatures.filter((c) => canEvolve(run, c)).sort((a, b) => a.level - b.level)[0];
  if (evolvable && run.creatures.length >= run.creatureLimit) {
    evolveCreature(run, evolvable, needsBranchChoice(evolvable) ? (Math.random() < 0.5 ? 0 : 1) : undefined);
  } else if (run.creatures.length >= run.creatureLimit && !run.creatures.some((c) => c.level < 3)) {
    const options = NEXUS_UPGRADES.filter((u) => canBuyNexusUpgrade(run, u.id)).sort((a, b) => nexusUpgradeCost(run, a.id)! - nexusUpgradeCost(run, b.id)!);
    if (options[0]) buyNexusUpgrade(run, options[0].id);
  }
  // herói busca loot por perto e volta para perto do Nexus
  const hero = run.hero;
  const item = run.loot.filter((l) => Math.hypot(l.x - hero.x, l.y - hero.y) < 140).sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y))[0];
  hero.target = item ? { x: item.x, y: item.y } : { x: 320, y: 214 };
}

function trial(label: string, team: CreatureId[], hero: HeroId): void {
  let wins = 0;
  let wavesSum = 0;
  let endlessSum = 0;
  let levels = 0;
  const losses: number[] = [];
  for (let k = 0; k < N; k++) {
    const run = startRun({ stage: (process.env.STAGE ?? 'graveyard') as 'graveyard' | 'swamp' | 'tundra', talents: talents(), team, hero, heroPalette: {}, synergies: process.env.SYN === '1', awakened: process.env.AWAKE === '1' ? [...team] : process.env.AWAKEN ? (process.env.AWAKEN.split(',') as CreatureId[]) : [] });
    let t = 0;
    let won = false;
    while (t < 20000) {
      while (run.heroChoices.length) chooseHeroUpgrade(run, 0);
      while (run.chestChoices.length) chooseChest(run, best(run.chestChoices));
      act(run, team);
      if (run.pulse.remaining === 0 && run.enemies.length > 3) firePulse(run);
      updateRun(run, 1 / 30, { direction: heroDirection(run) });
      t += 1 / 30;
      for (const e of run.events.splice(0)) {
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
    const victory = won || !!run.result?.victory;
    if (victory) wins++;
    else losses.push(run.wave);
    wavesSum += Math.min(run.wave, 20);
    if (ENDLESS && won) endlessSum += run.wave;
    levels += run.hero.level;
  }
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
