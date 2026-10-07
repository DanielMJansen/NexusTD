# Nexus — instruções para o Claude Code

## Projeto
Jogo de **navegador para computador** (paisagem 16:9, mouse e teclado): Tower Defense + Survivor + Roguelite + Coleção de Criaturas místicas. TypeScript + Vite + Canvas 2D, publicado no GitHub Pages (https://danielmjansen.github.io/NexusTD/, repositório `DanielMJansen/NexusTD`). O nome "Nexus" é provisório.
**Fonte de verdade do design:** `docs/GDD.md` (regras e calibragem na seção 9; números exatos em `docs/valores.md`, gerado).
**Plano único:** `docs/roadmap.md` (feito, próximas etapas com status e propostas). Planos/propostas antigos em `docs/arquivo/` (só histórico; não criar novos arquivos de plano, atualizar o roadmap).

## Comandos
- `npm install` · `npm run dev` (http://localhost:5173) · `npm run typecheck` · `npm run build` (typecheck + build) · `npm run preview`
- Deploy: push na branch `main` (workflow em `.github/workflows/deploy.yml`, Node 24).
- Em `npm run dev`, o app fica em `window.nexus` no console (ex.: `nexus.run.gold = 999`) para testes.
- Regressão manual: `docs/checklist-regressao.md`.
- `npm run docs:values` gera `docs/valores.md` (números atuais lidos de `src/data`); rode após mudar balanceamento.
- `npm run calib -- [raça]` roda o bot de calibragem (`scripts/calib.ts`; variáveis STAGE, TAL, N, SYN, ENDLESS, AWAKE/AWAKEN no topo do arquivo).

## Arquitetura (`src/`)
- `data/` — tudo que é conteúdo e balanceamento, como dados: `config` (arena, Nexus, economia, loja, recompensas), `creatures` (criaturas, habilidades e efeitos de golpe como uniões discriminadas, duas vertentes no nível 3, descrição/lore), `evolution`, `heroes` (um por raça: ataque, Pulso, bônus de raça), `enemies` (habilidades como uniões discriminadas), `waves` (20 ondas, escalonamento, elites, Sem Fim), `heroUpgrades`, `nexusUpgrades` (melhorias do Nexus e loot), `upgrades` (melhorias da run), `talents` (árvore), `achievements`, `skins`, `relics` (Relíquias).
- `game/` — simulação pura, sem DOM: `state` (tipos e `createRun`), `update` (loop), `combat` (golpes, habilidades, Pulso, veneno/poças, auras e bênçãos, bloqueio), `hitEffects` (efeitos de golpe e aliados temporários), `creatureStats`, `spawning` (ondas, escalonamento, elites, chefes, Sem Fim), `enemies` (habilidades e movimento dos inimigos), `hero` (vida, XP, níveis), `pulses` (Pulsos dos heróis, inclusive os que duram no tempo), `nexus` (melhorias do Nexus, dano ao Nexus), `loot` (moedas e baús), `economy` (invocar, evoluir, vender), `shop`, `choices`, `talents` (soma dos bônus), `profile` (progresso permanente: talentos, coleção, equipe, heróis, skins), `achievements`. A simulação só registra **eventos** em `state.events` (`events.ts`); render, áudio e UI reagem a eles.
- `render/` — `draw` (quadro, ordem por profundidade), `sprites` (despacho) + `spriteKit` (ferramentas de desenho) + `spritesMystic` (Lobisomem, Fantasma, Bruxa) + `spritesEnemies` (inimigos do F5 e chefes) + `spritesClasses` (terceiras classes), `arena` (cenário e Nexus), `nexusLoot` (Nexus upado e loot no chão), `effects` (partículas, projéteis, faixas, tremor), `portrait`, `viewport` (HiDPI).
- `input/` — `pointer` (mouse), `keyboard`, `interaction` (estado da seleção).
- `ui/` — DOM: telas no overlay (`entry`, `menu`, `heroesScreen`, `teamScreen`, `collection`, `talentsScreen`, `achievementsScreen`, `codexScreen`, `settingsScreen` (inclui Controles), `relicsScreen`, `starterPick`, `waveChoices`, `heroLevelUp`, `chestChoices`, `nexusPanel`, `pause`, `runEnd`), `hud`, `sidePanel`, `describe` (textos gerados dos dados), `currency` (Essência ✦ lilás e ouro ◉ dourado iguais em todas as telas).
- `audio/` — `audio` (efeitos, barramentos de música/efeitos com limitador), `sounds` (tabela), `music` (sequenciador procedural), `songs` (trilhas menu/run/chefe).
- `save/` — `save` (perfil em `localStorage` chave `nx4`, versão 4; migra `nx3`/`nx2` sem apagá-las), `settings` (chave `nexus-settings-v1`), `backup` (exportar/importar JSON `nexus-save`).
- `app.ts` liga tudo; `main.ts` só inicia.

## Regras de trabalho
1. **Não invente requisitos.** Itens `TBD` ou `PROPOSTA` no GDD exigem perguntar antes de implementar.
2. **Incrementos pequenos.** Uma mudança por vez, e o jogo deve continuar rodando ao fim de cada passo (`npm run build` sem erro).
3. **Dirigido por dados.** Criaturas, heróis, inimigos, melhorias, ondas, talentos, conquistas e skins ficam em `src/data/`. Mudar balanceamento não deve exigir mexer em sistemas.
4. **Separar responsabilidades:** dados · estado · simulação · renderização · entrada · áudio · interface · persistência. A simulação não toca DOM, som nem efeitos visuais.
5. **Computador primeiro:** paisagem 16:9, mouse (arrastar, clicar, botão direito, hover/tooltip) e teclado (WASD, 1–8, E, N, Espaço, Esc, P, F). Celular fora do escopo.
6. **Sem dependências desnecessárias.** TypeScript + Vite puro. Arte vetorial desenhada em código e áudio sintetizado; única exceção externa: fontes do Google Fonts (Cinzel, Cinzel Decorative, Crimson Pro).
7. **Persistência:** `localStorage` com chave versionada (hoje `nx4`). Ao mudar o formato, migrar ou versionar; campos novos entram com padrão no `sanitize`.
8. **Atualizar o GDD** (seção 9 e Registro de Decisões) sempre que uma mudança alterar valores ou regras. Para balancear, simular várias runs com a simulação real (30+ por variante) antes de mexer em números.
9. **Idioma:** conversar em português do Brasil; código e nomes de variáveis em inglês; textos do jogo em português.
