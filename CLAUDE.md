# Nexus — instruções para o Claude Code

## Projeto
Jogo mobile-first de Tower Defense + Survivor + Roguelite + Coleção de Criaturas. Protótipo web em HTML/JS/Canvas com Vite, publicado no GitHub Pages.
**Fonte de verdade do design:** `docs/Nexus_GDD_v0_7_PT-BR.md` (valores numéricos na seção 9).

## Comandos
- `npm install` · `npm run dev` (http://localhost:5173) · `npm run build` · `npm run preview`
- Deploy: push na branch `main` (workflow em `.github/workflows/deploy.yml`).

## Estado atual
Todo o jogo está em um único `index.html` (~25 KB) com HTML, CSS e JS. Funciona e é jogável. O próximo passo planejado é **modularizar**.

## Regras de trabalho
1. **Não invente requisitos.** Itens `TBD` ou `PROPOSTA` no GDD exigem perguntar antes de implementar.
2. **Incrementos pequenos.** Uma mudança por vez, e o jogo deve continuar rodando ao fim de cada passo (`npm run dev` sem erro).
3. **Dirigido por dados.** Criaturas, inimigos, melhorias e ondas ficam em arquivos de dados (JSON/objetos), não espalhados na lógica. Mudar balanceamento não deve exigir mexer em sistemas.
4. **Separar responsabilidades:** dados · estado · simulação (update) · renderização · entrada · áudio · interface/menus · persistência.
5. **Mobile primeiro:** retrato, toque, `pointer events`, `touch-action: none` na arena. Teste também com teclado/mouse.
6. **Sem dependências desnecessárias.** Preferir TypeScript + Vite puro. Sem assets externos por enquanto (sprites vetoriais e áudio sintetizado).
7. **Persistência:** `localStorage` com chave versionada (hoje `nx2`). Ao mudar o formato, migrar ou versionar.
8. **Atualizar o GDD** (seção 9 e Registro de Decisões) sempre que uma mudança alterar valores ou regras.
9. **Idioma:** conversar em português do Brasil; código e nomes de variáveis em inglês; textos do jogo em português.

## Primeira tarefa sugerida
Converter o `index.html` em módulos TypeScript sem mudar o comportamento:
`src/data/` (creatures, enemies, upgrades, waves) · `src/game/` (state, update, combat) · `src/render/` (sprites, draw) · `src/ui/` (menu, cards, pause) · `src/audio/` · `src/save/`.
Faça em passos pequenos, confirme que o jogo roda a cada passo e comece propondo o plano antes de mexer no código.
