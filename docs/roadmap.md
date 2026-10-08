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
- Nome: **Nexus TD** (definitivo para a 1ª versão, decidido em 07/10/2026).

## 2.5. Caminho para a 1.0 (o "fim" deste projeto) — itens 1–4 aprovados em 08/10/2026 (o 5 se decide depois do playtest)
A 1.0 é o jogo completo para jogar sozinho: 5 fases, coleção, meta-progressão e Sem Fim, calibrado e sem bugs conhecidos. Contas, rankings, anúncios e Steam ficam **fora** da 1.0 (só se o jogo tiver público).
1. **F16 · Fase 5 — Cidadela Celeste** (Portais do Céu, ventos, 5 inimigos e 2 chefes; proposta detalhada no F16). Ascensão por fase entra simples (3 níveis); Desafio diário fica para depois da 1.0 (precisa de ranking para fazer sentido). ~3–4 sessões.
2. **CAL · Calibragem** das 5 fases com o bot novo contra as metas (seção CAL). ~2 sessões.
3. **Polimento:** variantes Épica/Lendária recolorindo também as **habilidades** (auras, poças, ondas, raios, correntes), passada completa do checklist de regressão, desempenho (FPS) em computador comum, textos e tutoriais revisados, tela "Sobre" com versão e créditos. ~2 sessões.
4. **Playtest fechado** com 3–5 pessoas pelo link atual (1–2 semanas); corrigir o que aparecer.
5. **Portão de decisão:** com o retorno do playtest, escolher entre (a) **publicar leve** — PUB-A (segurança e hospedagem) + página grátis no itch.io e/ou CrazyGames, save local, sem servidor; (b) investir no caminho completo (contas, rankings, Steam: PUB-B a PUB-G); ou (c) encerrar aqui e partir para um projeto novo.
- **Fora da 1.0 (conteúdo pós-lançamento):** raças novas, Desafio diário, Corrida de Chefes e mutadores, arte e música finais.

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

### F14. Fase 3 — Tundra Gelada + Sinergias `[x]` — feita em 07/10 (F14a mecânicas/inimigos, F14b mapa/roteiro, F14c Sinergias); calibragem: ~25–29% com 2.500 ✦, ~61–72% com a árvore completa
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

### F15. Fase 4 — Deserto Dourado + Relíquias `[x]` — feito em 07/10/2026 (mapa, dois Obeliscos, oásis, tempestade de areia, 5 inimigos e 2 chefes, roteiro de 20 ondas, 12 Relíquias). Pendente: o Faraó ainda é o maior obstáculo no bot; os números das Relíquias são um primeiro palpite (ajustar com uso)
- Cenário de areia e sol. Regra de mapa: **tempestade de areia** (inimigos ficam ocultos até chegar perto) e **oásis** que curam o herói.
- Modo diferente (decidido em 07/10/2026, no lugar da escolta): **dois Nexus** para defender ao mesmo tempo (ex.: dois oásis); a run acaba se qualquer um cair. A escolta foi descartada.
- Destrava **Relíquias** (decidido em 07/10/2026): itens permanentes que o herói equipa antes da run. Liberadas ao chegar no Deserto (vencer a Tundra); chefes de **todas as fases** passam a deixá-las: o 1º abate de cada chefe garante uma, depois a **chance cresce com a dificuldade** (chefe do meio da run < chefe final; fases mais avançadas > iniciais; Sem Fim conta). Vagas: 1 ao liberar, 2 ao vencer o Deserto, 3 ao chegar na onda 30 do Sem Fim do Deserto.
- Tempestade de areia (decidido): inimigos longe do herói e das criaturas ficam **ocultos e não podem ser alvo** até chegar perto.
- Nexus temático: **Obelisco Solar**.

### F16. Fase 5 — Cidadela Celeste + Ascensão `[~]` — partes 1–3 feitas em 08/10/2026 (mapa, Olho Celeste, Portais do Céu, ventos, 5 inimigos e 2 chefes, roteiro de 20 ondas e calibragem inicial); a seguir: Ascensão
- Nuvens, luz e ruínas brancas. Regra de mapa: **ventos** que desviam projéteis e empurram inimigos voadores.
- Modo diferente (decidido em 07/10/2026): **Portais do Céu** — sem trilhas fixas; portais se abrem em pontos do mapa (avisados ~5 s antes) e despejam inimigos ali; o herói **sela** um portal ficando parado nele alguns segundos. Ventos continuam como regra de mapa. Números e detalhes: PROPOSTA a fechar antes de implementar.
- Destrava **Ascensão** (níveis de dificuldade por fase) e o **Desafio diário** (semente do dia; recorde pessoal).
- Nexus temático: **Olho Celeste**.
- **Detalhes (propostos em 07/10/2026, aprovados com o caminho da 1.0 em 08/10/2026):**
  - *Mapa:* ruínas flutuantes 1280×720 com o Nexus no centro; sem entradas fixas. ~10 pontos possíveis de portal em plataformas a 250–450 do Nexus.
  - *Portais:* cada onda abre 2 portais (3 a partir da onda 8, 4 a partir da 15), sorteados entre os pontos. Aviso de 5 s (círculo no chão, faixa e marca no minimapa); o portal solta a parte dele da onda aos poucos e fecha sozinho quando esvazia.
  - *Selar:* o herói parado a até 40 de um portal por 3 s (anel de progresso) o fecha; os inimigos que ainda iam sair dele **não saem** (sem ouro por eles). Chefes não saem de portais selados e não podem ser impedidos.
  - *Ventos:* a direção gira a cada onda (rosa dos ventos no HUD). Voadores andam 20% mais rápido a favor do vento; projéteis das criaturas a favor ganham +15% de alcance, contra perdem 15%.
  - *Inimigos (5):* Harpia (voa, rápida, em bando), Sentinela de Mármore (lenta, armadura alta, raio de luz no herói), Anjo Caído (voa, dá escudo aos próximos), Elemental do Vento (empurra criaturas para trás de leve, imune a lentidão), Corvo da Tempestade (enxame que surge direto perto do Nexus).
  - *Chefes:* Grifo Real (onda 10; mergulhos em investida, atordoa no impacto) e Serafim Corrompido (onda 20; abre os próprios portais e dispara feixes; segunda fase abaixo de 50%).
  - *Libera:* **Ascensão** (níveis de dificuldade por fase, ex.: A1 inimigos +15% de vida, A2 +elites…) e **Desafio diário** (semente do dia, recorde pessoal; ranking só com contas).
  - *Força da fase:* começar em ~1,0× e calibrar para a meta da Fase 5 (10–25% / 45%+).

### Revisão das Fases 1 e 2 `[x]` (feita em 07/10, antes da Tundra)
- Dar ao Cemitério e ao Pântano roteiros próprios (hordas, eventos, tréguas) e, se fizer sentido, trilhas e câmera — também fora do molde.

### PUB. Publicação e segurança `[ ]` — PROPOSTA (07/10/2026)
Objetivo: deixar o código seguro e pronto para ser **distribuído** em sites com anúncios e, depois, na **Steam**. Viável neste projeto: o jogo não tem servidor, a versão publicada tem ~590 KB e a simulação já é separada da interface. Esforço: PUB-A fácil (1 sessão), PUB-B médio-baixo (1–2 sessões), PUB-C médio (várias sessões, mais trâmites da Steam).

**Princípio:** jogo só no navegador não tem segredo; qualquer um edita o save e lê o código. Para single-player isso é aceitável (quem trapaceia estraga só o próprio jogo). Tudo que valer dinheiro ou envolver competição precisa vir de fora do cliente: plataforma (Steam/portal) ou servidor.

**PUB-A. Consolidar (fácil)**
1. **Repositório privado** `[ ]` (hoje é público: qualquer um clona e hospeda o jogo). Publicar a versão web por **Cloudflare Pages** ou **Netlify**, que aceitam repositório privado de graça. O link do GitHub Pages deixa de funcionar. *Ação do Daniel: conta na Cloudflare/Netlify e trocar a visibilidade no GitHub.*
2. **Admin só em desenvolvimento** `[ ]` — **fazer só no lançamento** (decidido em 07/10/2026; até lá o admin fica ativo): painel, botão e hash do código de admin passam a entrar só no `npm run dev` (`import.meta.env.DEV`).
3. **Fontes no próprio jogo** `[ ]`: Cinzel, Cinzel Decorative e Crimson Pro em `public/fonts` (licença OFL permite), sem chamar o Google. Funciona offline (necessário na Steam), carrega mais rápido e não envia o IP do jogador a terceiros (LGPD/GDPR).
4. **Política de conteúdo (CSP)** `[ ]` no `index.html`: só arquivos do próprio site (os portais pedem exceções para o SDK deles; ver PUB-B).
5. **Higiene do GitHub** `[ ]`: 2FA na conta, proteção da `main`, Dependabot (`.github/dependabot.yml`), varredura de segredos e workflow com `permissions` mínimas.
6. **Licença "todos os direitos reservados"** `[ ]`: arquivo `LICENSE` proprietário e aviso de copyright no jogo (Configurações → Sobre).
7. **Códigos de presente** `[ ]`: mantidos como mimo para amigos (não são proteção: dá para descobrir por força bruta ou editar o save). Conteúdo **pago** nunca vai por código no cliente.
8. **Nome definitivo** `[x]` — **Nexus TD** (decidido em 07/10/2026). Pesquisar no INPI e na Steam antes de divulgar.

**PUB-B. Sites com anúncios (médio-baixo)**
- **Portal:** CrazyGames (aceita jogos só de computador, SDK simples, divide a receita de anúncios) é o primeiro candidato; GameDistribution como alternativa. Poki é seletivo e prioriza celular. Receita esperada: modesta. Vale como vitrine e para medir público.
- **Camada de plataforma** `src/platform/` (fora da simulação): `init`, `gameplayStart/Stop`, `midgameAd` (entre runs), `rewardedAd` e `storage`. Versões `web` (sem anúncio) e `crazygames`, escolhidas no build (`vite --mode crazygames`).
- **Onde entram anúncios** (PROPOSTA): só **entre runs** (fim da run → menu), nunca no meio da onda. Recompensado e opcional (ex.: dobrar a Essência da run) — decidir antes de implementar, porque mexe no balanceamento.
- Pausar jogo e som durante o anúncio; save pelo módulo de dados do portal (nuvem) com o `localStorage` como reserva; nada de links para fora do portal.

**PUB-C. Steam (médio)**
- **App de desktop:** Electron + `steamworks.js` (mais simples para a Steamworks) ou Tauri (app menor). Janela/tela cheia, sair do jogo pelo menu, save em arquivo + **Steam Cloud**.
- **Steamworks:** conta de desenvolvedor (US$ 100 por jogo, dados fiscais/W-8BEN), conquistas da Steam espelhando as do jogo, página "Em breve" (cápsulas, capturas, trailer) pelo menos 2 semanas antes, revisão da build.
- **Demo grátis** (Fases 1–2) por opção de build; a versão web/portal pode ser essa demo, levando à página da Steam.
- Preço sugerido US$ 5–10 com preço regional.

**PUB-D. Legal**
- Registrar a marca (INPI, classes 9 e 41) com o nome definitivo.
- Conversa com advogado de propriedade intelectual: arte e código feitos com IA têm proteção autoral incerta (não impede vender).
- Página de privacidade simples quando houver anúncios (o portal cuida do consentimento, mas a página é pedida).

**PUB-E. Contas, save na nuvem e rankings** (PROPOSTA; para a versão de testes 1.0)
- **Por quê:** save só local se perde ao limpar o navegador ou trocar de computador, e ranking exige saber quem é quem.
- **Serviço (sem manter servidor próprio):** **Supabase** (banco Postgres + login + regras de acesso por linha; plano grátis serve para testes, ~US$ 25/mês depois) como primeira opção. Alternativas: Firebase, ou PlayFab (feito para jogos, já tem ranking).
- **Login:** e-mail com link mágico e Google. O **modo convidado continua** (save local, como hoje); ao criar conta, o save local sobe para a nuvem ("vincular"). Apelido público para o ranking, com filtro de palavrões.
- **Save na nuvem:** tabela `saves` (usuário, dados JSON, versão, data). Salva ao fim de cada run e ao gastar na meta-progressão. Conflito entre aparelhos: vale o mais novo, guardando o anterior como cópia. O `sanitize` atual continua validando tudo que chega.
- **Por plataforma** (camada `src/platform/`): web → contas próprias; CrazyGames → conta e save do próprio portal (login de terceiros dentro do portal costuma ser vetado); Steam → conta Steam, Steam Cloud e os **rankings da própria Steam**. O backend próprio serve à versão web e a um ranking unificado, se desejado.
- **Rankings** (exemplos): onda mais alta no Sem Fim por fase, vitória mais rápida por fase, **Desafio diário** (F16: mesma semente para todos).
- **Trapaça:** ver **PUB-G** (servidor dono do progresso e runs verificadas).
- **Administrador por papel na conta** (decidido em 07/10/2026; substitui o código de admin no lançamento): a conta tem um papel (`jogador` ou `admin`) gravado no banco, que só pode ser mudado direto no painel do Supabase (as regras de acesso impedem o próprio usuário de alterá-lo). As ações do painel de admin (dar Essência, liberar conteúdo, apagar/banir conta) viram funções no servidor que conferem o papel antes de agir; o painel no jogo só aparece para quem é admin, mas quem garante é o servidor. Toda ação de admin fica registrada (quem, quando, o quê). Até o lançamento, o código de admin atual continua.
- **Segurança do backend:** regras por linha (cada um só lê e grava o próprio save); só a chave pública no cliente (a chave de serviço nunca sai do servidor); envio de placar por função no servidor, não direto na tabela; limite de requisições.
- **LGPD:** política de privacidade e termos de uso, coletar o mínimo (e-mail e apelido), botão para **apagar a conta e os dados** e para exportar o save (já existe).

**PUB-F. Versão de testes 1.0 (beta aberta)** — o que precisa estar pronto
- Número de versão visível (menu) e **notas da versão** (o que mudou).
- Canal para relatos: link para formulário ou Discord; botão "Relatar problema" que copia versão + dados técnicos.
- **Relatório de erros automático** (ex.: Sentry, grátis no início), com aviso na política de privacidade.
- **Estatísticas de uso sem cookies** (Cloudflare Web Analytics ou Plausible): quantos jogam, até que fase chegam, onde desistem.
- Migração de save testada (versões antigas → nova), aviso "beta: o progresso pode ser reiniciado" se for o caso.
- Item 2 do PUB-A (tirar o admin) **só no lançamento**: até lá o admin continua ativo.

**Hospedagem (Cloudflare Pages / Netlify), como funciona:** conecta-se ao repositório do GitHub (pode ser privado). O fluxo continua o mesmo: commit e push na `main` → o serviço roda `npm run build` e publica a pasta `dist` em ~1 minuto. Ganhos: link de **prévia para cada branch** (testar antes de publicar), **voltar para qualquer versão anterior com um clique**, domínio próprio com HTTPS grátis. O versionamento continua no Git; o workflow `deploy.yml` deixa de ser necessário. Configuração única: comando `npm run build`, pasta `dist`, Node 24. A base do Vite já é relativa (`./`), então nada muda no código. Plano grátis: Cloudflare sem limite de tráfego (500 builds/mês); Netlify 100 GB/mês.

**PUB-G. Proteção contra trapaça** (PROPOSTA de 07/10/2026; substitui "aceitar edição do save")
Ideia central: **com conta, o servidor é o dono do progresso**. O navegador só mostra e joga; quem decide quanto o jogador tem é o servidor. Editar o `localStorage` deixa de valer, porque ele vira só uma cópia.

1. **Progresso autoritativo no servidor (base da 1.0 com contas).**
   - O cliente nunca envia "tenho 5.000 de Essência". Envia **ações**: "terminei esta run com este resultado", "quero comprar o talento X", "quero despertar a criatura Y".
   - O servidor recalcula tudo com o **mesmo código do jogo** (`src/data` e as funções puras de `game/profile`, `talents`, `economy` rodam no servidor sem mudança), confere saldo e regras e grava. Recompensas (Essência, Fragmentos, Cristais, Relíquias, sorteio do Altar) são **calculadas e sorteadas no servidor**.
   - O save local passa a ser cache: ao abrir o jogo, vale o do servidor.
2. **Run verificada (o que dá recompensa e ranking).**
   - O servidor entrega uma **semente** ao começar a run; o jogo registra as ações do jogador (posições de invocação, evoluções, escolhas de carta, movimento e Pulso por quadro).
   - Ao terminar, envia semente + ações. O servidor **reexecuta a simulação** e só credita o que a reexecução confirmar. Alterar o jogo no navegador não muda o resultado da reexecução.
   - Pré-requisitos no jogo: gerador com semente em `random.ts`, simulação em passo fixo (ex.: 1/60 s) e gravação das entradas. A simulação já é separada da interface, o que torna isso viável.
   - Custo: uma run de 20 ondas roda em ~1–3 s sem desenho (o bot já faz isso). Verificar em fila, sem pressa (recompensa chega em segundos; ranking aceito depois de verificado).
   - Etapa intermediária mais barata (se preferir começar menor): **checagem de plausibilidade** — limites por onda/tempo (Essência máxima por run, onda possível no tempo jogado, ritmo de abates); o que passar do limite é recusado e marcado.
3. **Ranking só com runs verificadas**, por conta, com limite de envios e possibilidade de banir. Os 10 primeiros de cada ranking podem ser revisados (o replay mostra a run).
4. **Modo convidado (sem conta):** continua com save local e funciona offline, mas é **"não verificado"**: não entra em ranking. Ao criar conta, o progresso local **sobe inteiro, uma vez** (decidido em 07/10/2026). Não abre brecha nos rankings: eles só contam runs verificadas feitas depois de ter conta.
5. **Camada leve contra edição casual no local** (também no convidado): save com assinatura de integridade; se for editado à mão, o jogo **não apaga**, só marca o perfil como "modificado" (sem ranking). Não impede quem souber o que faz, mas tira a facilidade de "abrir o console e mudar o número".
6. **Por plataforma:** CrazyGames → mesmo esquema com a conta do portal; Steam → os rankings da Steam aceitam qualquer valor do cliente, então enviar para eles só depois da verificação do nosso servidor (ou usar só o nosso ranking).
7. **Conteúdo pago** (se houver): a posse vem da plataforma (DLC da Steam) ou do servidor (compra registrada), nunca de código no cliente.

Esforço: nível 1 (servidor autoritativo + plausibilidade) — médio, entra junto com as contas (PUB-E). Nível 2 (replay verificado) — médio-alto; recomendado antes de abrir rankings ou o Desafio diário.

**Ordem sugerida (quando a 1.0 estiver pronta):** PUB-A → PUB-E + PUB-G nível 1 (contas, save na nuvem, servidor dono do progresso) → PUB-F (beta aberta) → PUB-G nível 2 (runs verificadas) antes dos rankings → PUB-B (portal com anúncios) → PUB-C (Steam). Nome decidido: **Nexus TD**. Decisões pendentes: portal, anúncio recompensado (sim/não e qual recompensa), Electron ou Tauri, serviço de contas (Supabase?), quais rankings.

### CAL. Calibragem para a 1.0 `[ ]` (decidido em 07/10/2026; antes do lançamento)
- **Metas de vitória** (bot, % com 2.500 ✦ / com a árvore completa): Fase 1 55–75% / 90%+ · Fase 2 40–60% / 85%+ · Fase 3 25–45% / 70%+ · Fase 4 15–35% / 55%+ · Fase 5 10–25% / 45%+. Nenhuma raça abaixo da metade da média da fase nem acima do dobro.
- **Bot mais fiel a um jogador:** herói se movendo em todas as fases (hoje só no Deserto), criaturas posicionadas perto das trilhas (não num círculo fixo), uso de evolução, Santuário/Relíquias como num perfil real.
- **Rodada completa:** 13 raças × fases × 2 perfis de talento × 30 runs; relatório por fase e raça; ajustes até cair nas metas.
- Depois: playtest com pessoas para conferir se o bot bate com a experiência real.

### Em paralelo (encaixar entre fases)
- **Balanceamento das raças** `[~]` (07/10/2026): rodada feita nas 3 fases (ver Registro do GDD); Humanos com a passiva **Disciplina**. Pendente: Lobisomem na Tundra (0/30) e Bruxa no Pântano (24/30).
- **Limites da run** `[x]` (decidido em 07/10/2026): crítico até 100% (a Precisão some das ofertas ao chegar) e herói até o **nível 30** — feitos. O Sem Fim continua até perder (sem onda final). Tetos de todas as melhorias feitos (07/10/2026).
- **Sem Fim com mutações** `[x]` (feito em 07/10/2026) (decidido em 07/10/2026): a cada 5 ondas do Sem Fim entra uma mutação sorteada que fica até o fim (ex.: escudo, rapidez, dividir ao morrer, regeneração, explosão) e ondas misturando inimigos de outras fases. Lista de mutações: PROPOSTA.
- **Estrelas e Despertar** `[x]` (07/10/2026): estrelas ★4–★5, Despertar (Cristais Ancestrais + Fragmentos) e estrutura da Forma Suprema feitos; ★5 = Forma Suprema, só despertadas, até 2 por run. Todas as raças feitas e calibradas (07/10/2026).
- **Lobisomem na Tundra** `[x]`: passiva **Caçada** (Garras + Salto) e dica da fase sobre corpo a corpo; Tundra segue difícil para ele (~4/30), por decisão.
- **Unicórnio exclusivo** `[x]` — feito em 07/10/2026 (Pureza, Potro Estelar, Unicórnio Guardião, Pégaso de Guerra, Alicórnio com o Arco-Íris; código de presente em Configurações, guardado só como hash).
- **Raças novas** `[ ]` — PROPOSTA por lote: Zumbis, Sereia, Centauro, Goblin, Elementais. Ideia: cada fase libera 1–2 raças ligadas ao bioma (ex.: Sereia no Pântano, Elementais na Tundra, Goblin no Deserto, Unicórnio na Cidadela).
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

## Formas Supremas — plano aprovado (07/10/2026)

Formato: vertente → **Suprema**: efeito · visual. Todas implementadas e calibradas em 07/10/2026 (números finais em `docs/valores.md` e no Registro do GDD).

- **Lobisomem** — Caçador Lunar → **Lua Sangrenta**: garras saltam para 6, +30% de dano · pelagem prateada, lua cheia atrás. Caçador Feral → **Fera Primal**: frenesi a cada 3 golpes, dura o dobro · maior, cicatrizes, olhos em brasa. Líder da Matilha → **Rei Lobo**: aura raio 140, +40% de vel. de ataque · juba e coroa de ossos. Fera Devastadora → **Destruidor**: golpe em área (raio 50) que atordoa 0,5 s · garras gigantes, chão rachado. Uivo Lunar → **Uivo do Eclipse**: medo em área enorme, chefes 30% mais lentos · lua escura, ondas de som. Grito de Guerra → **Trompa da Matilha**: aliados próximos +35% de velocidade e +15% de dano · trompa de chifre, pintura de guerra.
- **Fantasma** — Espírito Vingativo → **Ira Eterna**: +100% contra blindados e chefes · chamas azuis, correntes quebradas. Aparição Gélida → **Inverno Fantasma**: lentidão 60% (ao redor do alvo, se possível) · névoa congelante. Banshee Ancestral → **Lamento Final**: grito largo, empurrão forte, +50% de dano · cabelo erguido, boca enorme. Arauto do Pavor → **Pesadelo**: medo dura o dobro, assustados recebem +30% · máscara de caveira. Marionetista → **Mestre das Almas**: possui 3 por mais tempo · fios de alma. Devorador → **Abismo**: possuído explode em área maior e puxa vizinhos · portal no peito.
- **Bruxa** — Arquibruxa → **Bruxa Suprema**: veneno acumula até 3× · chapéu com olhos, caldeirão flutuando. Feiticeira do Caos → **Caos Absoluto**: raios saltam para 6 · cabelo em chamas verdes. Caldeirão Infernal → **Caldeirão do Fim**: poça raio 55 que puxa para o centro · caldeirão de ossos roxo. Caldeirão Alquímico → **Pedra Filosofal**: abates na poça +6 de ouro · caldeirão de ouro, pedra vermelha. Jardim Venenoso → **Floresta Viva**: raízes em área com veneno forte · coroa de flores carnívoras. Guardiã do Bosque → **Coração da Mata**: raízes em área grande, mais longas · ent de galhos atrás.
- **Fada** — Rainha das Flores → **Primavera Eterna**: bênção enorme, +40% de dano e +20% de vel. · asas de pétalas. Fada Guerreira → **Valquíria Feérica**: pó de estrelas em 5 alvos, +50% · armadura de cristal. Pregadora de Peças → **Grande Ilusionista**: confusão em área grande e longa · cartola e cartas girando. Ladra de Ouro → **Rainha dos Ladrões**: confusos que morrem +5 de ouro · capa de moedas. Farol → **Sol Interior**: marca 5 com +35% · corpo de luz. Estrela Cadente → **Supernova**: marcados explodem em área maior · núcleo pulsando.
- **Golem** — Fortaleza → **Montanha Viva**: segura 10 · pinheiros e musgo nas costas. Avalanche → **Terremoto**: pancadas em área maior, atordoa mais · pedras orbitando. Prisma → **Caleidoscópio**: 5 raios em leque · cristais coloridos girando. Amplificador → **Ressonância**: aura maior, +dano crítico e +10% de chance · diapasão de cristal. Vulcão → **Erupção**: área e queimadura maiores · cratera fumegante. Lava Viva → **Rio de Lava**: poças maiores e mais longas · corpo derretendo.
- **Necromante** — Cavaleiro da Morte → **Lorde da Morte**: +80% de dano, golpes em área pequena · armadura negra com chamas verdes. Legião de Ossos → **Exército dos Mortos**: ergue esqueletos com mais frequência (teto atual) · estandarte de ossos. Ceifador Sombrio → **A Morte**: executa abaixo de 35% · capuz vazio, foice gigante. Colhedor de Almas → **Colecionador de Almas**: execução +4 de ouro · lanterna de almas. Sanguessuga → **Praga**: enfraquecimento em área · nuvem de moscas. Corruptor → **Ruína**: corrói armadura em área · chão apodrecendo.
- **Górgona** — Víbora → **Rainha das Víboras**: veneno fortíssimo que passa aos vizinhos ao morrer · serpente enorme. Naja → **Hidra Menor**: cusparada em leque largo, 3 jatos · três serpentes na mão. Olhar Pétreo → **Olhar Eterno**: petrifica em área pequena · cabelo de serpentes erguido. Górgona Ancestral → **Mãe das Górgonas**: vulnerável +80% · coroa de cobras douradas. Basilisco Rei → **Imperador Basilisco**: corrosão em área grande · cristas de pedra. Cuspidor → **Pântano Ácido**: poças maiores que corroem · glândulas ácidas brilhando.
- **Demônio** — Diabrete Flamejante → **Pequeno Inferno**: queimadura forte, 2 alvos · chifres em chamas. Diabrete Ladino → **Rei dos Ladrões**: rouba mais ouro, mais vezes · bolsas de ouro. Senhor do Abismo → **Lorde do Inferno**: explosão raio 80 · coroa de fogo. Berserker → **Fúria Infernal**: acúmulo por abate dobrado (com teto) · corpo incandescente. Sedutora → **Rainha Súcubo**: puxa 5 · chicote de chamas. Tormento → **Agonia**: puxados +80% de dano recebido · correntes sombrias.
- **Anjo** — Serafim → **Seis Asas**: ricocheteia 7 vezes · seis asas com olhos. Arauto → **Trombeta do Juízo**: marca +35% em área · trombeta dourada. Matadora de Reis → **Executora Divina**: +120% contra elites e chefes · elmo alado, espada de luz. Lança Celeste → **Lança do Paraíso**: atravessa e atordoa · lança gigante dourada. Égide Celeste → **Muralha Celeste**: proteção maior e +25% de dano · escudo de luz. Juiz → **Juízo Final**: aura com dano alto e marca · balança dourada.
- **Unicórnio** — Chifre Prismático → **Arco-Íris Vivo**: 5 raios em leque · crina de 7 cores. Estrela Guia → **Constelação**: raio que marca forte e deixa lento · estrelas na pelagem. Santuário de Luz → **Templo Vivo**: aura enorme com dano e velocidade · pilares de luz. Lança Celeste → **Juízo de Luz**: a aura fere forte · chifre gigante. Corcel da Tempestade → **Tempestade Alada**: o rasante atordoa mais · asas de nuvem e raios. Pégaso Real → **Pégaso Imperial**: rasante enorme · armadura dourada.
