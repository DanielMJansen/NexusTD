// Gera docs/valores.md com os números atuais do jogo, lidos direto de src/data.
// Uso: npm run docs:values (rode sempre que mudar balanceamento).
import { writeFileSync } from 'node:fs';
import { ECONOMY, NEXUS, REWARDS } from '../src/data/config';
import { CREATURE_IDS, CREATURES } from '../src/data/creatures';
import { ENEMIES, ENEMY_IDS } from '../src/data/enemies';
import { EVOLUTION_LEVELS } from '../src/data/evolution';
import { HERO_UPGRADES, xpToNextLevel } from '../src/data/heroUpgrades';
import { HERO_IDS, HEROES } from '../src/data/heroes';
import { LOOT, NEXUS_UPGRADES } from '../src/data/nexusUpgrades';
import { TALENT_BRANCHES, TALENT_IDS, TALENTS } from '../src/data/talents';
import { WAVES } from '../src/data/waves';
import { STAGES } from '../src/data/stages';
import { waveEnemyCount, waveScaling } from '../src/game/spawning';
import { abilityText, attackText, enemyTraitText, formatNumber, pulseText, raceBonusText, talentEffectText } from '../src/ui/describe';
import { nexusLevelText } from '../src/ui/nexusPanel';

const plain = (html: string) => html.replace(/<[^>]+>/g, '');
const n = formatNumber;
const pct = (v: number) => `${n(Math.round(v * 1000) / 10)}%`;
const lines: string[] = [];
const out = (s = '') => lines.push(s);

out('# Valores atuais do jogo (gerado)');
out();
out('> Gerado por `npm run docs:values` a partir de `src/data`. **Não edite à mão**: mude os dados e gere de novo.');
out('> Valores `PROPOSTA` até o playtest; a calibragem e os resultados da simulação estão no GDD (seção 9).');
out();

out('## Economia e Nexus');
out(`- Nexus: ${NEXUS.baseHp} de vida, +${NEXUS.healBetweenWaves} de cura entre ondas. Ouro inicial ${ECONOMY.startGold}; renda +${ECONOMY.passiveIncome.amount} a cada ${n(ECONOMY.passiveIncome.interval)} s; limite de criaturas ${ECONOMY.creatureLimit}; venda ${pct(ECONOMY.sellRefund)}.`);
out(`- Essência por run: ${REWARDS.essencePerWave} por onda + 1 a cada ${REWARDS.killsPerEssence} abates + ${REWARDS.victoryBonus} ao vencer.`);
out(`- Evolução: ${EVOLUTION_LEVELS.slice(1).map((l, i) => `nível ${i + 2} custa ${n(l.costMultiplier)}× o custo daquela cópia (dano ×${n(l.damage)}, alcance ×${n(l.range)})`).join('; ')}. No nível 3 o jogador escolhe a vertente.`);
out();
out('| Melhoria do Nexus | Custos | Níveis |');
out('|---|---|---|');
for (const u of NEXUS_UPGRADES) out(`| ${u.name} | ${u.costs.join(' / ')} | ${u.levels.map(nexusLevelText).join(' · ')} |`);
out();
out(`Loot: moeda ${pct(LOOT.coinChance)} (valor ${n(LOOT.coinValue)}× o ouro do inimigo); baú comum ${pct(LOOT.chestChance)}, elite ${pct(LOOT.eliteChestChance)}, chefe 100%; some após ${LOOT.lifetime} s.`);
out();

out('## Criaturas');
out('| Raça | Criatura | Custo | Dano | Alcance | Recarga | Habilidade | Desbloqueio |');
out('|---|---|---|---|---|---|---|---|');
for (const id of CREATURE_IDS) {
  const c = CREATURES[id];
  const unlock = c.unlock.kind === 'start' ? 'inicial' : `${c.unlock.cost} ✦`;
  out(`| ${c.race} | ${c.name} | ${c.baseCost} | ${n(c.damage)} | ${c.range} | ${n(c.cooldown)} s | ${abilityText(c.ability, c.effects)} | ${unlock} |`);
}
out();
out('### Vertentes (nível 3)');
out('| Criatura | Vertente A | Vertente B |');
out('|---|---|---|');
for (const id of CREATURE_IDS) {
  const c = CREATURES[id];
  const form = (i: 0 | 1) => {
    const f = c.ascended[i];
    const stats = f.stats ? ` (${Object.entries(f.stats).map(([k, v]) => `${k} ×${n(v as number)}`).join(', ')})` : '';
    return `**${f.name}**: ${abilityText(f.ability, f.effects ?? c.effects)}${stats}`;
  };
  out(`| ${c.name} | ${form(0)} | ${form(1)} |`);
}
out();

out('## Heróis');
out('| Herói | Raça | Vida | Vel. | Ataque | Pulso | Bônus de raça | Preço |');
out('|---|---|---|---|---|---|---|---|');
for (const id of HERO_IDS) {
  const h = HEROES[id];
  out(`| ${h.name} | ${h.race} | ${h.maxHp} | ${h.speed} | ${attackText(h)} | ${plain(pulseText(h))} | ${raceBonusText(h.race, h.raceBonus)} | ${h.cost === null ? 'inicial' : `${h.cost} ✦`} |`);
}
out();
out(`XP para o próximo nível: ${[1, 2, 3, 5, 10, 15, 20].map((l) => `nível ${l} → ${xpToNextLevel(l)}`).join(' · ')}.`);
out();
out('| Melhoria do herói | Efeito | Máx. |');
out('|---|---|---|');
for (const u of HERO_UPGRADES) out(`| ${u.name} | ${u.text} | ${u.maxPicks ?? '—'} |`);
out();

out('## Inimigos');
out('| Inimigo | Vida | Vel. | Armadura | Dano ao Nexus | Dano ao herói/s | Ouro | XP | Habilidades |');
out('|---|---|---|---|---|---|---|---|---|');
for (const id of ENEMY_IDS) {
  const e = ENEMIES[id];
  const traits = e.traits.map(enemyTraitText).join(' ') || '—';
  out(`| ${e.name}${e.isBoss ? ' (chefe)' : ''} | ${e.hp} | ${e.speed} | ${e.armor} | ${e.nexusDamage} | ${n(e.heroDps)} | ${e.gold} | ${e.xp} | ${traits} |`);
}
out();

out('## Ondas');
const s = WAVES.scaling;
out(`- ${WAVES.total} ondas; quantidade = ${WAVES.enemyCount.base} + ${n(WAVES.enemyCount.perWave)} × onda; chefes por fase abaixo.`);
for (const s of Object.values(STAGES)) {
  out(`- **Fase ${s.number} · ${s.name}**: vida dos inimigos ×${n(s.power.hp)}, dano ×${n(s.power.damage)}, Essência ×${n(s.essenceMultiplier)}; chefes: ${s.bosses.map((b) => `onda ${b.wave} ${ENEMIES[b.enemy].name}`).join(', ')}; inimigos: ${s.composition.map((c) => `${ENEMIES[c.enemy].name} (onda ${c.fromWave}+)`).join(', ')}${s.terrain?.kind === 'mud' ? `; lama: ${s.terrain.pools.length} poças, criaturas −${Math.round(s.terrain.creatureAttackSlow * 100)}% vel. de ataque, herói −${Math.round(s.terrain.heroSlow * 100)}% velocidade` : ''}${s.terrain?.kind === 'ice' ? `; gelo: inimigos ×${n(s.terrain.slide)} de velocidade, racha com ${s.terrain.crackAt} de desgaste, buraco por ${s.terrain.holeTime} s` : ''}${s.weather ? `; nevasca a cada ${s.weather.every} s por ${s.weather.duration} s (alcance ×${n(s.weather.rangeMultiplier)})` : ''}.`);
}
out(`- Força (o = onda − 1): vida × (1 + ${n(s.hp.linear)}·o + ${n(s.hp.quadratic)}·o²); velocidade +${pct(s.speedPerWave)} por onda (máx. +${pct(s.maxSpeedBonus)}); dano +${pct(s.damagePerWave)} por onda.`);
const e = WAVES.elites;
out(`- Elites a partir da onda ${e.fromWave}: chance ${pct(e.chance)} (+${pct(e.chancePerWave)}/onda, máx. ${pct(e.maxChance)}); vida ×${n(e.hp)}, dano ×${n(e.damage)}, recompensa ×${n(e.reward)}.`);
const en = WAVES.endless;
out(`- Sem Fim: chefe a cada ${en.bossEvery} ondas; por onda além da ${WAVES.total}, vida ×${n(1 + en.hpGrowth)} e dano ×${n(1 + en.damageGrowth)} a mais (exponencial); elites até ${pct(en.eliteChance)}.`);
out();
out('| Onda | Inimigos | Vida × | Velocidade × | Dano × |');
out('|---|---|---|---|---|');
for (const w of [1, 5, 7, 10, 14, 20, 25, 30, 40]) {
  const sc = waveScaling(w);
  out(`| ${w} | ${waveEnemyCount(w)} | ${n(Math.round(sc.hp * 100) / 100)} | ${n(Math.round(sc.speed * 100) / 100)} | ${n(Math.round(sc.damage * 100) / 100)} |`);
}
out();

out('## Talentos');
out('| Ramo | Talento (requisito) | Custos | Efeito por nível |');
out('|---|---|---|---|');
for (const branch of TALENT_BRANCHES) {
  for (const id of TALENT_IDS.filter((t) => TALENTS[t].branch === branch.id)) {
    const t = TALENTS[id];
    const req = t.requires ? ` (${TALENTS[t.requires.id].name} ${t.requires.level})` : '';
    out(`| ${branch.name} | ${t.name}${req} | ${t.costs.join(', ')} | ${talentEffectText(t.effect.kind, t.effect.perLevel)} |`);
  }
}
const total = TALENT_IDS.reduce((sum, id) => sum + TALENTS[id].costs.reduce((a, b) => a + b, 0), 0);
out();
out(`Custo total da árvore: ${total} ✦.`);

writeFileSync('docs/valores.md', lines.join('\n') + '\n');
console.log(`docs/valores.md gerado (${lines.length} linhas)`);
