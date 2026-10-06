# Plano v1.0 — feedback de playtest, dificuldade, economia e conteúdo

> Documento de trabalho. Cada etapa termina com build sem erro, teste no navegador, commit próprio e GDD atualizado.
> Status: `[ ]` a fazer · `[~]` em andamento · `[x]` feita. Itens marcados com **D#** dependem de uma decisão (seção 2).

## 1. Diagnóstico (o que vi no código e nas simulações)

- **Fácil demais.** Os inimigos só ganham vida (+12% por onda); velocidade, dano e comportamento são fixos. Com 4 criaturas e o herói parado, a simulação vence ~80% das runs.
- **Ouro sobrando.** Depois de montar a equipe, o ouro só serve para evoluir (custo fixo por classe) e para a loja entre ondas.
- **Melhorias fortes e poucas.** São 17 melhorias, e as da run **multiplicam** entre si (composto): 3× "Fúria" (+35%) dá ×2,46 de dano, enquanto a mesma soma em talentos daria ×2,05.
- **Herói sem risco.** Não tem vida, nenhum inimigo o ataca e não há progressão dentro da run.
- **Pouca leitura do combate.** Não há números de dano, atributos da criatura ao clicar nem alcance do herói.

## 2. Decisões

**Respostas (06/10/2026):**
- **D1 + D2:** XP por abate → nível do herói com melhorias só dele; herói com vida, dano de contato e renascimento (~8 s).
- **D3:** run mais longa — **20 ondas, 3 chefes**, inimigos novos com habilidades e escalonamento; **modo Sem Fim** após a vitória.
- **D4 + D7:** **loot** dos inimigos, **Nexus upável** com ouro e **evolução progressiva**. Consumíveis ficam de fora.
- **D5 + D6:** como recomendado — tiers por valor (Comum → Lendária), chance de tier alto sobe com a onda, % somam por categoria.
- **D8:** cadeia vertical + visual por ramo (pedido direto do playtest).

Propostas originais:

| # | Pergunta | Recomendação |
|---|---|---|
| D1 | Como o herói progride na run? | **XP por abate → nível do herói**; a cada nível, escolher 1 entre 3 **melhorias só do herói** (estilo Vampire Survivors). As melhorias de fim de onda continuam sendo do exército. |
| D2 | Herói com vida: quem o machuca? | Inimigos causam dano de **contato** ao herói (e alguns inimigos novos atacam à distância). Morto, renasce no Nexus após **8 s** (−1 s por nível do talento novo). Sem herói, sem Pulso e sem ataques dele. |
| D3 | Tamanho da run e dificuldade | **15 ondas** com 2 chefes (onda 8 e onda 15) e inimigos ficando **mais rápidos, mais fortes e mais variados** a cada onda; depois da vitória, opção de seguir no **Modo Sem Fim**. |
| D4 | Para onde vai o ouro | (a) **evolução progressiva** por cópia (como você sugeriu); (b) **upar o Nexus** com ouro durante a run (vida, armadura e 3 habilidades do Nexus); (c) **consumíveis** na loja entre ondas (bomba, poção de cura do Nexus, totem de lentidão); (d) **loot** dos inimigos. |
| D5 | Melhorias: como os % somam? | **Somam dentro da mesma categoria** (três "+10% de dano" = +30%) e categorias diferentes multiplicam entre si. Mais previsível e escalável. |
| D6 | Melhorias com raridade por valor | Cada melhoria existe em vários **tiers**: Comum / Incomum / Rara / Épica / **Lendária** (ex.: dano +6% / +10% / +16% / +25% / +40%). A chance de tiers altos **cresce com a onda**. Mais melhorias novas (sinergias por raça, efeitos especiais). |
| D7 | Loot | Inimigos têm chance de soltar **moedas extras** e **baús** (elites e chefes sempre). Baú = escolha de 1 entre 3 melhorias de tier alto ou um consumível. O herói coleta passando por cima (recompensa o movimento). |
| D8 | Árvore de talentos | **Cadeia vertical**: cada nó depende do de cima (a linha passa a significar dependência de verdade), com **cor própria por ramo** e ícones. Ramo novo **Nexus+** para habilidades do Nexus (ligado ao D4b). |

## 3. Etapas

### F1. Correções rápidas `[x]` (não dependem de decisão)
- Cavaleiro: espada saindo do pescoço → espada embainhada na cintura, levantada só no golpe.
- Estrelas de nível: contorno fino; nível N mostra N estrelas.
- Lobisomens (Caçador, Alfa, Licantropo): ataque com a **boca abrindo e fechando** (mordida), em vez de "pescoçada".
- Tela do primeiro companheiro: cabe no quadro (cartas menores; rolagem se precisar).
- Primeiro companheiro: tooltip com dano/custo/alcance e **confirmação** antes de escolher.
- Cartas do painel: **verde** quando dá para invocar, **vermelho/desabilitado** sem ouro ou sem vaga; com o limite atingido, não deixa nem tentar (prévia some e mostra "Limite de criaturas").
- Botão Evoluir: **verde** quando há ouro, apagado quando não; **seta ⇧ discreta** sobre criaturas que podem evoluir, mesmo sem estar selecionadas.
- Vender pede **confirmação** (segundo clique: "Confirmar venda +X").
- Painel da criatura selecionada com **atributos**: dano, ataques/s, alcance, habilidade, nível, valor investido.
- **Alcance do herói** visível (anel suave sob o herói; mais forte segurando Shift ou com o mouse sobre o herói).
- **Tooltip do Pulso** no botão (nome, dano, raio, recarga, efeito).
- **Números de dano** flutuando nos inimigos, com opção liga/desliga nas Configurações.
- **Apagar save** nas Configurações (com confirmação dupla).
- **Velocidade 1x/2x/4x** (botão no topo e tecla `F`).
- Espectro: a **Travessia vai até o cursor** do mouse (ou na direção do WASD/setas se estiverem pressionadas).

### F2. Tutorial guiado `[x]` (pendente da E11)
Caixa fixa no canto do palco, com "Pular tutorial" sempre visível. Passos de leitura pausam o jogo; passos de ação avançam quando o jogador faz a ação. Os passos são: Nexus → mover o herói → ouro → invocar → Pulso → evoluir/vender → melhorias entre ondas. "Rever tutorial" nas Configurações.

### F3. Melhorias da run 2.0 `[x]` — D5, D6
- Bônus percentuais **somam por categoria** e as categorias multiplicam entre si.
- Melhorias com **tiers por valor** (Comum → Lendária), com chance de tier alto crescendo com a onda.
- Elenco ampliado (~30), incluindo:
  - sinergias de raça ("+X% para Dragões", "Vampiros curam o dobro");
  - efeitos especiais (crítico, perfuração, ricochete, explosão ao morrer, abate rende ouro extra).
- Painel "**Bônus ativos**" na lateral (como no Myth TD), mostrando os totais.

### F4. Herói vivo `[x]` — D1, D2
- Vida e regeneração do herói; dano de contato dos inimigos; morte e **renascimento** com contagem na tela.
- **Barra de XP** sob o HUD; XP por inimigo derrotado (chefes e elites dão mais).
- Ao subir de nível, escolher 1 entre 3 **melhorias só do herói**: dano, velocidade, alcance, recarga do Pulso, vida, roubo de vida, Pulso em dobro, aura ao redor do herói.
- **Feito:** 11 melhorias do herói (Lâmina Afiada, Agilidade, Alcance, Vigor, Recuperação, Passos Rápidos, Foco, Pulso Potente, Sede, Espinhos, Couraça). "Pulso em dobro" e "aura" ficaram para depois. Conquista "Sem Torres" criada. A curva de XP será recalibrada no F5, já com 20 ondas: hoje o herói chega ao nível ~14 em 10 ondas e quase nunca morre, porque o bot fica parado.

### F5. Dificuldade e inimigos `[ ]` — D3
- Escalonamento por onda: vida ×(1 + 0,15·o + 0,01·o²), velocidade +2%/onda, dano ao Nexus +5%/onda (calibrar por simulação).
- **Elites** a partir da metade (contorno dourado, 2× vida, soltam baú).
- **Inimigos novos com personalidade:**
  - **Esqueleto Arqueiro:** para longe e atira no herói;
  - **Lodo:** se divide ao morrer;
  - **Gárgula:** voa e vira pedra (armadura alta) quando parada;
  - **Aranha:** teia que deixa criaturas mais lentas;
  - **Necromante inimigo:** revive zumbis;
  - **Cavaleiro Sem Cabeça:** investida rápida;
  - **Banshee Sombria:** cura aliados.
- **Chefes com habilidades:**
  - **Rei Ogro:** pisão que atordoa criaturas próximas;
  - **Lich** (chefe final): invoca, protege-se com escudo e tem fases.
- **Codex de inimigos** no menu (vida, dano, armadura, velocidade, passivas, habilidades; desconhecidos em silhueta até serem enfrentados).
- **Conquista "Sem Torres"**: vencer só com o herói. Cria um modo de desafio natural junto com o F4.

### F6. Ouro com destino `[ ]` — D4, D7
- **Evolução progressiva:** a evolução custa em proporção ao que aquela cópia custou para invocar (2ª cópia mais cara → evoluções dela também).
- **Nexus upável com ouro na run:**
  - níveis de vida e armadura;
  - 3 habilidades: **Raio do Nexus** (ataque automático), **Escudo** (absorve dano por alguns segundos, com recarga) e **Campo de Lentidão** em volta.
- **Consumíveis** na loja entre ondas (preço sobe com a onda): bomba, poção de cura do Nexus, totem de lentidão e pergaminho de reroll grátis.
- **Loot:** moedas e baús caindo no chão, coletados pelo herói.

### F7. Meta-progressão 2.0 `[ ]` — D8
- Árvore de talentos em **cadeia vertical**, com cor por ramo, ícones e linhas de verdade entre pai e filho.
- Ramo **Nexus+** (habilidades do Nexus começando já desbloqueadas ou mais fortes).
- Talentos do herói: renascimento mais rápido, XP extra, vida do herói.

### F8. Conteúdo: raças e classes `[ ]`
Uma terceira classe para cada raça atual e 2 raças novas (cada uma com 2 classes e herói):

| Raça | Classe nova | Ideia |
|---|---|---|
| Humano | Clériga | Cura o Nexus e dá escudo temporário às criaturas próximas |
| Vampiro | Enxame de Morcegos | Vários morcegos pequenos que voam até o alvo (dano em área móvel) |
| Dragão | Tempestade | Raio que salta entre inimigos |
| Lobisomem | Uivador | Grito que aterroriza (medo) em área a cada X s |
| Fantasma | Possessor | Possui um inimigo, que luta do seu lado por alguns segundos |
| Bruxa | Herbalista | Plantas que prendem inimigos (enraizar) |

| Raça nova | Classe 1 | Classe 2 | Herói |
|---|---|---|---|
| **Fada** | Encantadora: aura de dano e alcance | Travessa: confunde inimigos, que andam para trás | Rainha Fada: Pulso que acelera tudo |
| **Golem** | Muralha: bloqueia muito e atordoa | Cristal: reflete dano e reforça o Nexus | Colosso: lento, muito resistente, pisão |
| *(depois)* Necromante, Medusa | | | |

Com mais criaturas, a equipe pode passar de 6 para **8 vagas** (atalhos 1–8), e o painel ganha duas colunas.

## 4. Ordem sugerida
F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8.
O F1 e o F2 não dependem de decisão e começam já. A partir do F3, cada etapa espera as decisões correspondentes. O F5 (dificuldade) só deve ser calibrado depois do F3 e do F4, porque melhorias e herói mudam muito o poder do jogador. A calibragem usa a simulação, com o bot passando a usar ouro e a mover o herói.
