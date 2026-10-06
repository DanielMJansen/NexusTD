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
- **Referências**: usar jogos do gênero como base e melhorar a partir deles (ex.: Soulstone Survivors para o HUD; Kingdom Rush/Bloons para vertentes; Slay the Spire/Hades para Ascensão).
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

### F13.5. Equipes salvas e skins do Nexus `[x]` (pedido de 07/10/2026; antes do F14)

**F13.5a — Equipes salvas** `[x]`
- Cada equipe salva guarda **herói + 8 criaturas** e tem um nome (ex.: "Vampiros", "Fantasmas do Pântano"); a skin do herói continua global.
- **3 slots grátis**; slots 4 e 5 compráveis com Essência (300 ✦ cada, com confirmação).
- Troca com um clique na tela de Equipe e no menu (mostra a equipe ativa). Editar herói/criaturas altera a equipe ativa.

**F13.5b — Skins do Nexus** `[x]` — catálogo aprovado em 07/10 (modelos das próximas fases entram junto com cada fase)
- Duas partes combináveis: **modelo** (forma do Nexus) e **cor** (paleta aplicada a qualquer modelo). Só visual.
- Padrão **"do mapa"**: cada fase mostra seu Nexus temático; o jogador pode fixar outro modelo/cor **por fase** (tela do Nexus no menu, com abas por fase).
- Obtenção por **todas as fontes**:
  - **Vencer a fase** libera o modelo dela: Cristal Rúnico (Cemitério, já liberado), Lótus Ancestral (Pântano); depois Pináculo Glacial (Tundra), Obelisco Solar (Deserto), Olho Celeste (Cidadela).
  - **Essência** (preço fixo, 400 ✦ cada): cores Rubi, Esmeralda e Safira.
  - **Conquistas**: Prata Lunar (Intocável), Sangue (Exterminador), Ouro Real (Campeão), Obsidiana (Colecionador).
  - **Altar**: cores exclusivas Vazio (Épica) e Aurora (Lendária, animada). Quando sai Épica/Lendária, 20% de chance de vir a cor do Nexus dessa raridade (se ainda não tiver).

### F13.95. Interface 2.0 `[x]` (pedido de 07/10/2026; referência: Soulstone Survivors)
- **I1 — HUD da run** `[x]`: arena em tela cheia (16:9, sem painel lateral); topo central com onda, ouro e inimigos; canto superior esquerdo com a vida do Nexus e as melhorias dele; canto superior direito com botões e minimapa; barra inferior com o herói (vida e XP grandes), as criaturas da equipe como "habilidades" (retrato, tecla, custo; tooltip abre para cima) e o Pulso. Controles foram para a tela de pausa.
- **I2 — Menus como páginas** `[x]`: fora da run, a arena some e as telas ocupam a página (sem caixa com rolagem). Menu em duas colunas (identidade, equipe e Jogar | atalhos). Abas: Coleção, Santuário e coleção das Equipes por raça; Heróis como lista + ficha; Códex por fase; Conquistas Gerais/Heróis. Talentos compactos (detalhes no tooltip). Tudo cabe em 1440×900.

> **Biomas revistos em 07/10/2026:** o jogo estava escuro/gótico demais; as próximas fases vão do escuro para a luz — **Neve → Deserto → Céu**. As mecânicas destravadas continuam as mesmas.

### F13.9. Motor de mapas `[x]` — feito em 07/10/2026 (M1–M6); Cemitério e Pântano são revistos com ele depois
Hoje o mapa é uma imagem fixa de 640×360, desenhada uma vez; inimigos nascem nas bordas e andam em linha reta até o Nexus; toda fase usa a mesma fórmula de quantidade e 20 ondas com 3 chefes. Para fases realmente diferentes, o motor precisa de:
1. **Mundo maior que a tela + câmera**: mapas de tamanhos e formatos variados (ex.: 2–3 telas de largura), câmera que segue o herói (com arrastar/rolar e minimapa). Mapas pequenos continuam possíveis.
2. **Trilhas e entradas**: cada mapa define de onde os inimigos vêm (bordas em 360°, 2–3 passagens, rios, portais) e por onde andam (trilhas com curvas, gargalos, pontes). Criaturas perto de gargalos passam a valer mais.
3. **Roteiro de ondas por dados**: cada onda tem tipo e conteúdo próprios — normal, **horda** (muitos fracos), **elite** (poucos fortes), **evento** (avalanche, tempestade), **chefe**, **trégua** (loja/descanso). Número de ondas e de chefes livre por fase.
4. **Objetos interativos do mapa**: coisas que o herói ativa ao ficar perto (fogueiras, alavancas, pontes), terreno que muda durante a fase (gelo que racha, areia que cobre trilhas).
5. **Objetivos variados**: além de "defenda o Nexus", ex.: escoltar uma caravana, defender dois pontos, sobreviver a um tempo, destruir ninhos.

Entregue em 6 passos, cada um sem mudar Cemitério e Pântano: **M1** geometria por run (tamanho do mundo, posição do Nexus) · **M2** câmera que segue o herói, rolagem pela borda, tecla C e minimapa · **M3** entradas com trilhas (terrestres seguem, voadores vão direto; invocados entram na trilha mais próxima) · **M4** roteiro de ondas (`script`: tipos normal/horda/elite/evento/chefe/trégua, grupos com entrada e elite, ritmo próprio; trégua sem inimigos e loja Rara+; total de ondas por fase) · **M5** objetos interativos (fogueira que o herói acende parado perto) e clima periódico com aviso (nevasca: alcance −30% longe das fogueiras; onda pode forçar o clima) · **M6** pontos extras a defender (vitais encerram a run) e escolta (Nexus, criaturas e herói avançam de parada). "Sobreviver a um tempo" e "destruir ninhos" ficam para quando uma fase precisar.

### F14. Fase 3 — Tundra Gelada + Sinergias `[ ]` — aprovada (07/10), com **18 ondas**; Sinergias por raça ainda em PROPOSTA
**Mapa: o Lago Congelado** — 2 telas de largura, com câmera.
- O Nexus (Pináculo Glacial) fica numa ilha de pedra no centro de um **lago congelado**; inimigos chegam por **3 passagens nas montanhas** (norte, leste e oeste) e seguem trilhas até o lago — não mais de todas as bordas.
- **Gelo**: no lago, inimigos **deslizam** (mais rápidos, não podem ser segurados por bloqueio). Onde muitos inimigos passam, o gelo **racha** e, depois de rachado, vira **buraco de água**: inimigos comuns que caem morrem; o buraco congela de novo depois de um tempo. Dá para "guiar" a destruição com o posicionamento.
- **Nevasca**: a cada ~60 s, 12 s de nevasca — névoa branca, **alcance de todas as criaturas −30%**. Há **3 fogueiras** no mapa: criaturas perto de uma fogueira acesa ignoram a nevasca. Fogueiras **apagam** na nevasca; o **herói reacende** ficando 2 s perto. O herói ganha um papel novo: correr entre fogueiras.
- **Fogo vs. gelo**: criaturas de fogo (Dragão de Fogo, Infernal, Magma, Diabrete…) causam +25% de dano a inimigos de gelo — times diferentes brilham aqui.

**Roteiro: a Expedição** — 18 ondas (não 20), com tipos variados:
| Ondas | Conteúdo |
|---|---|
| 1–4 | normais, poucos inimigos |
| 5 | **Matilha**: 30+ Lobos Gélidos rápidos e fracos, todos pela mesma passagem |
| 6 | **Chefe: Yeti Ancião** — arremessa bolas de neve que congelam criaturas (param 2 s) |
| 7–9 | normais + elites |
| 10 | **Avalanche** (evento, sem chefe): uma onda gigante desce por uma passagem e esmaga tudo no caminho, inclusive inimigos; avisada 5 s antes |
| 11 | **Trégua**: loja com melhorias raras, sem inimigos |
| 12 | **Gigantes**: poucos inimigos enormes e lentos |
| 13 | **Nevasca Eterna** (evento): a nevasca não para durante a onda; as fogueiras viram o centro da defesa |
| 14–15 | **Gigantes** + elites |
| 16 | **Grande Matilha**: lobos pelas 3 passagens ao mesmo tempo |
| 17 | normal, pesada |
| 18 | **Chefe final: Wyrm de Gelo** — nada sob o gelo do lago, emerge rachando o gelo perto das criaturas, depois volta a mergulhar |

**Inimigos novos**: Lobo Gélido (matilha), Golem de Neve (ao morrer vira bolas de neve que rolam), Espírito do Gelo (voador; encosta numa criatura e a congela), Troll da Geleira (regenera, a menos que leve dano de fogo), Kobold Escavador (atravessa o gelo por baixo e surge longe das trilhas).

**Destrava Sinergias de raça** (aprovadas em 07/10, números reduzidos): conta **classes diferentes** da raça em campo — 2 das 3 classes ativam o nível 1, as 3 ativam o nível 2. O painel mostra as ativas e quantas faltam. Números iniciais (calibrar com o bot):
| Raça | 2 classes | 3 classes |
|---|---|---|
| Humano | +4% de dano de todas as criaturas | +8% |
| Vampiro | herói +3% de roubo de vida | +7% |
| Dragão | +6% de área (explosões e ondas) | +15% |
| Lobisomem | lobisomens +5% de vel. de ataque | +12% |
| Fantasma | ignoram 1 de armadura | 3 |
| Bruxa | venenos e efeitos duram +15% | +35% |
| Fada | +5% de alcance de todas as criaturas | +12% |
| Golem | Nexus recebe −5% de dano | −12% |
| Necromante | 8% dos abatidos viram esqueleto aliado por 6 s | 18% |
| Górgona | +10% de chance dos efeitos de golpe | +20% |
| Demônio | +3% de chance de crítico e +6% de dano crítico | +6% e +15% |
| Anjo | +8% de dano contra chefes | +18% |

### F15. Fase 4 — Deserto Dourado + Relíquias `[ ]` — PROPOSTA
- Cenário de areia e sol. Regra de mapa: **tempestade de areia** (inimigos ficam ocultos até chegar perto) e **oásis** que curam o herói.
- Ideia de modo diferente: **escoltar uma caravana** que atravessa o deserto (o Nexus anda), com paradas para montar defesas.
- Destrava **Relíquias**: chefes deixam relíquias (itens permanentes com efeito); o herói equipa 1 a 3 antes da run.
- Nexus temático: **Obelisco Solar**.

### F16. Fase 5 — Cidadela Celeste + Ascensão e Desafio diário `[ ]` — PROPOSTA
- Nuvens, luz e ruínas brancas. Regra de mapa: **ventos** que desviam projéteis e empurram inimigos voadores.
- Ideia de modo diferente: **ilhas flutuantes** ligadas por pontes; defender **dois Nexus** ao mesmo tempo.
- Destrava **Ascensão** (níveis de dificuldade por fase) e o **Desafio diário** (semente do dia; recorde pessoal).
- Nexus temático: **Olho Celeste**.

### Revisão das Fases 1 e 2 `[x]` (feita em 07/10, antes da Tundra)
- Dar ao Cemitério e ao Pântano roteiros próprios (hordas, eventos, tréguas) e, se fizer sentido, trilhas e câmera — também fora do molde.

### Em paralelo (encaixar entre fases)
- **Raças novas** `[ ]` — PROPOSTA por lote: Zumbis, Unicórnio, Sereia, Centauro, Goblin, Elementais. Ideia: cada fase libera 1–2 raças ligadas ao bioma (ex.: Sereia no Pântano, Elementais na Tundra, Goblin no Deserto, Unicórnio na Cidadela).
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
- Ordem das mecânicas **aprovada**: Pântano → Fragmentos/Santuário; Fase 3 → Sinergias; Fase 4 → Relíquias; Cidadela → Ascensão e Desafio diário.
- Nome **Nexus TD** no jogo e na página.
- **Altar de Variantes** entra **depois da Fase 2**, junto com os Fragmentos (repetidas viram Fragmentos).
- Conteúdo de cada fase (inimigos, chefes, regra de mapa em detalhe) continua **PROPOSTA**: apresentar antes de implementar cada fase.
- **Biomas revistos**: Fases 3–5 passam a ser Tundra Gelada → Deserto Dourado → Cidadela Celeste (do escuro para a luz), com as mesmas mecânicas destravadas.
