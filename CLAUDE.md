# Nexus — instruções para o Claude Code

## Projeto
Jogo de **navegador para computador** (paisagem 16:9, mouse e teclado): Tower Defense + Survivor + Roguelite + Coleção de Criaturas místicas. TypeScript + Vite + Canvas 2D, publicado no GitHub Pages. O nome "Nexus" é provisório.
**Fonte de verdade do design:** `docs/Nexus_GDD_v0_8_PT-BR.md` (valores numéricos na seção 9).

## Comandos
- `npm install` · `npm run dev` (http://localhost:5173) · `npm run typecheck` · `npm run build` (typecheck + build) · `npm run preview`
- Deploy: push na branch `main` (workflow em `.github/workflows/deploy.yml`).
- Em `npm run dev`, o app fica em `window.nexus` no console (ex.: `nexus.run.gold = 999`) para testes.
- Regressão manual: `docs/checklist-regressao.md`.

## Arquitetura (`src/`)
- `data/` — tudo que é balanceamento: `config` (arena, herói, Pulso, economia, recompensas), `creatures`, `enemies`, `waves`, `upgrades`. Habilidades e efeitos são dados com parâmetros (uniões discriminadas), não `if` espalhado.
- `game/` — simulação pura, sem DOM: `state` (tipos e `createRun`), `update` (loop), `combat`, `spawning`, `economy`, `choices`, `profile` (progresso permanente). A simulação só registra **eventos** em `state.events` (`events.ts`); render, áudio e UI reagem a eles.
- `render/` — `draw` (quadro, ordem por profundidade), `sprites` (personagens vetoriais), `arena` (cenário e Nexus), `effects` (partículas, projéteis, faixas, tremor), `portrait`, `viewport` (HiDPI).
- `input/` — `pointer` (mouse: arrastar carta, clicar, vender), `keyboard`, `interaction` (estado da seleção).
- `ui/` — DOM: `hud`, `sidePanel` (cartas + Pulso), `overlay` + telas (`menu`, `waveChoices`, `pause`, `runEnd`), `describe` (textos gerados dos dados).
- `audio/` — WebAudio sintetizado; tabela de sons em `sounds.ts`.
- `save/` — `localStorage` chave `nx3` (versão 3), migra do `nx2` do protótipo.
- `app.ts` liga tudo; `main.ts` só inicia.

## Regras de trabalho
1. **Não invente requisitos.** Itens `TBD` ou `PROPOSTA` no GDD exigem perguntar antes de implementar.
2. **Incrementos pequenos.** Uma mudança por vez, e o jogo deve continuar rodando ao fim de cada passo (`npm run build` sem erro).
3. **Dirigido por dados.** Criaturas, inimigos, melhorias e ondas ficam em `src/data/`. Mudar balanceamento não deve exigir mexer em sistemas.
4. **Separar responsabilidades:** dados · estado · simulação · renderização · entrada · áudio · interface · persistência. A simulação não toca DOM, som nem efeitos visuais.
5. **Computador primeiro:** paisagem 16:9, mouse (arrastar, clicar, botão direito, hover/tooltip) e teclado (WASD, 1–4, Espaço, Esc, P). Celular fora do escopo.
6. **Sem dependências desnecessárias.** TypeScript + Vite puro. Arte vetorial desenhada em código e áudio sintetizado; única exceção externa: fontes do Google Fonts (Cinzel, Cinzel Decorative, Crimson Pro).
7. **Persistência:** `localStorage` com chave versionada (hoje `nx3`). Ao mudar o formato, migrar ou versionar.
8. **Atualizar o GDD** (seção 9 e Registro de Decisões) sempre que uma mudança alterar valores ou regras.
9. **Idioma:** conversar em português do Brasil; código e nomes de variáveis em inglês; textos do jogo em português.
