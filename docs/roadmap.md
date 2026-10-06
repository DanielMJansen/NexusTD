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
- Nome: **Nexus TD** (adotado em 07/10/2026; pode mudar antes de lojas).

## 3. Próximas etapas

### F11. Organização `[x]`
Documentação unificada: GDD + este roadmap + checklist + valores. Planos e propostas antigos em `docs/arquivo/`.

### F12. Estrutura de fases `[x]`
Sem conteúdo novo; prepara o terreno.
- Dados de fase em `src/data/stages.ts`: cenário, composição de ondas, chefes, regra de mapa, força base, recompensa e o que destrava.
- A run atual vira a **Fase 1 — Cemitério**, sem mudar nada no jogo.
- Menu: **mapa de fases** (bloqueadas, liberadas, vencidas; recorde e Sem Fim por fase).
- Perfil: progresso por fase (campo novo com padrão no `sanitize`, sem trocar a chave `nx4`); a run salva guarda a fase.
- Render do cenário parametrizado por bioma; bot de calibragem recebe a fase.

### F13. Fase 2 — Pântano `[x]`
Dividida em três entregas, cada uma jogável ao fim:

**F13a — A fase** `[x]` (valores finais após calibragem: inimigos ×1,15 de vida e ×1,1 de dano; Rei Sapo 440 de vida, Crocodilo Ancião 680, Hidra 300 por cabeça com renascimento em 10 s — ver GDD seção 9)
- Liberada ao vencer a Fase 1. Força base: inimigos com +35% de vida e +20% de dano em relação à Fase 1 (calibrar com o bot).
- Cenário: água escura, juncos, vitórias-régias, troncos podres, névoa verde e vagalumes.
- **Regra de mapa — lama:**
  - 4 poças fixas de lama.
  - Criatura invocada dentro de uma poça ataca 25% mais devagar.
  - O herói anda 40% mais devagar na lama.
  - Inimigos do pântano não são afetados.
  - Efeito: escolher onde invocar passa a importar.
- **Inimigos novos:**

| Inimigo | Papel | Habilidade nova |
|---|---|---|
| Sapo-Boi | comum | **Salto**: a cada poucos segundos pula para a frente, passando por cima de bloqueios |
| Sanguessuga | rápido e fraco, em bando | **Suga**: cada golpe no herói ou no Nexus cura ela mesma |
| Bruxa do Brejo | à distância | **Praga**: amaldiçoa a criatura mais próxima (−40% de velocidade de ataque por 4 s) |
| Crocodilo | tanque com armadura | **Submerso**: entra na lama e fica intocável enquanto atravessa a poça |
| Fogo-fátuo | voador | **Isca**: atrai os tiros das criaturas próximas (fica como alvo preferido) |

- **Chefes:**
  - **Onda 7 — Rei Sapo:** engole uma criatura, que fica fora de combate por 6 s ou até o Rei Sapo levar 15% da vida em dano; também pula.
  - **Onda 14 — Crocodilo Ancião:** some na lama e reaparece perto do Nexus com uma investida; armadura alta.
  - **Onda 20 — Hidra:** nasce com 3 cabeças, e cada cabeça é uma barra de vida. Uma cabeça cortada renasce em 2 cabeças após 8 s, a não ser que todas morram nesse intervalo, até no máximo 5 cabeças. Cada cabeça cospe ácido (área).
- Recompensa: Essência um pouco maior por onda (+25%).

**F13b — Fragmentos de raça e Santuário** `[x]`
- **Origem:** só caem em fases a partir da 2. No fim da run, cada raça que você usou rende Fragmentos daquela raça, proporcionais às ondas vencidas e às criaturas dela invocadas. Chefes rendem um bônus.
- **Santuário** (menu): nível permanente por criatura, de 1 a 5. Cada nível dá +4% de dano e +2% de velocidade de ataque. Custo em Fragmentos da raça: 10 / 20 / 35 / 55 / 80.
- **Balanceamento:** fica de fora a "economia de poder" que a Essência já cobre; o teto total é +20% de dano e +10% de velocidade por criatura.

**F13c — Altar de Variantes** `[x]` (versão aprovada em 07/10)
- Liberado ao vencer a Fase 2 (menu). Sorteio: **600 ✦**, com confirmação; chances à vista na tela.
- Prêmios: devolve 200 ✦ (32%) · 12 Fragmentos de uma raça da coleção (32%) · variante Rara (26%) · Épica (8,5%) · Lendária (1,5%).
- Garantia: Épica (ou melhor) a cada 20 sorteios sem Épica; Lendária a cada 60 sem Lendária (contadores na tela).
- Variante = visual de uma criatura da coleção (Rara: cores; Épica: cores + brilho; Lendária: dourada + brilho + faíscas). Repetida (todas já têm) vira Fragmentos (15/30/60). Escolhida na Coleção; só visual.

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

## 5. Decisões de 07/10/2026
- Cada fase: **20 ondas e 3 chefes novos** (identidade completa, como a Fase 1).
- Ordem das mecânicas **aprovada**: Pântano → Fragmentos/Santuário; Floresta → Sinergias; Forja → Relíquias; Cidadela → Ascensão e Desafio diário.
- Nome **Nexus TD** no jogo e na página.
- **Altar de Variantes** entra **depois da Fase 2**, junto com os Fragmentos (repetidas viram Fragmentos).
- Conteúdo de cada fase (inimigos, chefes, regra de mapa em detalhe) continua **PROPOSTA**: apresentar antes de implementar cada fase.
