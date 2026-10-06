# Roadmap — Nexus

Plano único do projeto: o que foi feito, o que vem a seguir e as propostas em discussão.
Regras e valores do jogo ficam no [GDD](GDD.md); números exatos em [valores.md](valores.md) (gerado); testes manuais em [checklist-regressao.md](checklist-regressao.md). Planos e propostas antigos estão em [`arquivo/`](arquivo/) só como histórico.

> Status: `[ ]` a fazer · `[~]` em andamento · `[x]` feito · **PROPOSTA** = precisa de aprovação antes de implementar.

## 1. Feito até aqui (resumo)

| Etapa | O que entrou |
|---|---|
| v0.9 (E0–E11) | Configurações e volumes, música procedural, perfil v4 com migração, exportar/importar save, coleção, equipe, árvore de talentos, heróis por raça, conquistas e skins, 3 raças místicas, raridade nas melhorias, salvar run, tutorial |
| v1.0 F1–F4 | Correções de playtest, tutorial guiado, melhorias da run 2.0, herói com XP, vida e renascimento |
| v1.0 F5 | 20 ondas, 3 chefes, 7 inimigos com habilidades, elites, escalonamento, códex, Sem Fim |
| v1.0 F6–F7 | Evolução progressiva, Nexus upável, loot (moedas e baús), talentos 2.0 |
| v1.0 F8 | Vertentes de evolução no nível 3, com sprites próprios |
| v1.0 F9–F10 | Terceiras classes; 6 raças novas (Fada, Golem, Necromante, Górgona, Demônio, Anjo) — 12 raças, 36 criaturas, 12 heróis |
| Pós-F10 | Recalibragem completa, Pulsos com personalidade, skins dos heróis novos, melhorias de Pulso, ficha do herói, HUD por contexto, desempenho (brilho por camada) |

## 2. Direção (decidida em 07/10/2026)

- **Fases antes da Ascensão.** Cada fase nova traz um bioma, inimigos e chefes próprios **e destrava uma mecânica nova para o jogo todo** — a sensação de progressão vem de "o jogo cresce", não só de "mais uma fase para vencer".
- **Moedas novas** entram junto com as fases (Fragmentos a partir de uma fase intermediária).
- **Steam fica para depois**, quando houver conteúdo suficiente. Até lá: web (GitHub Pages; itch.io quando fizer sentido).
- Nome: "Nexus TD" é o candidato (ver pergunta em 5).

## 3. Próximas etapas

### F11. Organização `[x]`
Documentação unificada: GDD + este roadmap + checklist + valores. Planos e propostas antigos em `docs/arquivo/`.

### F12. Estrutura de fases `[ ]`
Sem conteúdo novo; prepara o terreno.
- Dados de fase em `src/data/stages.ts`: cenário, composição de ondas, chefes, regra de mapa, força base, recompensa e o que destrava.
- A run atual vira a **Fase 1 — Cemitério**, sem mudar nada no jogo.
- Menu: **mapa de fases** (bloqueadas, liberadas, vencidas; recorde e Sem Fim por fase).
- Perfil: progresso por fase (campo novo com padrão no `sanitize`, sem trocar a chave `nx4`); a run salva guarda a fase.
- Render do cenário parametrizado por bioma; bot de calibragem recebe a fase.

### F13. Fase 2 — Pântano + Fragmentos de raça `[ ]` — PROPOSTA
- Regra de mapa: **poças de lama** que deixam criaturas e herói mais lentos; inimigos do pântano as ignoram.
- 4 inimigos novos e 3 chefes (Hidra como chefe final; cabeças que renascem).
- Destrava **Fragmentos de raça**: caem só a partir da Fase 2, um tipo por raça, ao jogar com criaturas daquela raça. Usados no **Santuário** (nível permanente das criaturas, pequeno: ex. +3% por nível, até 5).

### F14. Fase 3 — Floresta Sombria + Sinergias `[ ]` — PROPOSTA
- Regra de mapa: **árvores** ocupam espaço (não dá para invocar ali) e bloqueiam parte dos tiros.
- Destrava **Sinergias de raça**: 2 ou 3 criaturas da mesma raça em campo dão um bônus de raça (estilo TFT), o que muda a montagem de equipe.

### F15. Fase 4 — Forja Infernal + Relíquias `[ ]` — PROPOSTA
- Regra de mapa: **fendas de lava** que se abrem no chão de tempos em tempos (ferem todos, inclusive inimigos).
- Destrava **Relíquias**: chefes deixam relíquias (itens permanentes com efeito, ex.: "o Pulso deixa chamas"); o herói equipa 1 a 3 antes da run.

### F16. Fase 5 — Cidadela Celeste + Ascensão e Desafio diário `[ ]` — PROPOSTA
- Regra de mapa: **ventos** que desviam projéteis e empurram inimigos voadores.
- Destrava **Ascensão** (níveis de dificuldade por fase) e o **Desafio diário** (semente do dia; recorde pessoal).

### Em paralelo (encaixar entre fases)
- **Raças novas** `[ ]` — PROPOSTA por lote: Zumbis, Unicórnio, Sereia, Centauro, Goblin, Elementais. Ideia: cada fase libera 1–2 raças ligadas ao bioma (ex.: Sereia no Pântano, Goblin na Forja).
- **Altar de Variantes** `[ ]` — PROPOSTA (ver 4).
- **Playtest** com outras pessoas pelo GitHub Pages a cada fase nova.

### Depois
- Corrida de Chefes e Mutadores.
- Steam (Electron/Tauri), DLC de conteúdo.
- Arte e música finais.

## 4. Gacha: faz sentido?

**Com dinheiro real: não.**
- O save fica no navegador e pode ser editado.
- Caixas de recompensa pagas têm restrição legal (no Brasil, o ECA Digital proíbe loot boxes em jogos acessíveis a crianças e adolescentes; vários países e lojas também restringem).
- O público do gênero rejeita esse modelo.

**Com moeda do próprio jogo: sim, numa forma leve.** A proposta é um **Altar de Variantes**:
- Gasta-se uma moeda ganha jogando (Selos de Fase ou Essência) para invocar **variantes cosméticas** de criaturas: cores raras ("brilhantes"), auras, rastros.
- Não dá poder; a escolha de criaturas e o poder continuam comprados de forma direta.
- Variante repetida vira Fragmentos daquela raça.
- Há um contador de garantia (pity): na N-ésima tentativa sem raridade alta, a próxima é garantida.
- Dá o "frio na barriga" da roleta e um objetivo de coleção, sem prender a estratégia à sorte. Liga-se ao item "variantes", que estava em aberto no GDD.

## 5. Perguntas em aberto

1. Cada fase com 20 ondas e 3 chefes próprios, ou 2 chefes reaproveitados + 1 chefe novo por fase (menos conteúdo, sai mais rápido)?
2. A ordem de mecânicas (Fragmentos → Sinergias → Relíquias → Ascensão) está boa?
3. Nome: adotar "Nexus TD" no jogo e na página agora?
4. Altar de Variantes: entra, e depois de qual fase?
