# Proposta de personagens — F9 e F10 (para aprovação)

> Status: **aprovada em 07/10/2026**. Vira dado em `src/data/` e entra no GDD conforme cada parte é implementada.
> Regra desta rodada: **nenhuma classe nova cura o Nexus** (o jogo já está fácil). Os efeitos são de dano, controle ou suporte às criaturas.

## Mecânicas novas que aparecem aqui

Elas são reaproveitadas por várias classes. Quanto mais classes usarem a mesma mecânica, mais simples fica o código.

| Mecânica | O que faz |
|---|---|
| **Aliado temporário** | Um inimigo (ou esqueleto erguido) luta do nosso lado por alguns segundos: dá meia-volta e ataca outros inimigos. Chefes resistem. Usada por Possessor, Legião de Ossos e Senhor dos Mortos. |
| **Marca** | O inimigo marcado recebe +X% de dano de todas as fontes. |
| **Raízes / petrificar** | O inimigo fica parado (como o atordoar, mas por mais tempo). |
| **Corrosão** | Reduz a armadura do inimigo por um tempo. |
| **Puxar** | Arrasta inimigos na direção da criatura (para longe do caminho). |
| **Bênção** | Aura que dá +dano às criaturas próximas. A aura do Alfa dá velocidade de ataque. |
| **Proteção** | Aura que deixa as criaturas imunes a teia e atordoamento (contra Aranhas e o Rei Ogro). |

---

## F9 — terceira classe das raças atuais

| Raça | Classe (base) | Vertente A | Vertente B |
|---|---|---|---|
| Humano | **Clériga**: Bênção (+dano às criaturas num raio) | **Sacerdotisa**: Bênção maior e Proteção | **Inquisidora**: troca a aura por raios de luz que atordoam |
| Vampiro | **Enxame de Morcegos**: morcegos voam até o alvo e mordem em área | **Nuvem Sangrenta**: área maior com sangramento (dano contínuo) | **Revoada Faminta**: cada abate acelera os ataques até o fim da onda |
| Dragão | **Tempestade**: raio que salta entre inimigos | **Dragão do Trovão**: mais saltos | **Olho da Tormenta**: o raio atordoa |
| Lobisomem | **Uivador**: uivo periódico que dá medo em área | **Uivo Lunar**: medo maior e mais longo | **Grito de Guerra**: troca o medo por +velocidade de ataque aos aliados por alguns segundos |
| Fantasma | **Possessor**: possui um inimigo, que vira aliado temporário | **Marionetista**: possui 2 de uma vez | **Devorador**: o possuído explode ao fim, ferindo quem estiver perto |
| Bruxa | **Herbalista**: Raízes prendem o alvo | **Jardim Venenoso**: as raízes envenenam | **Guardiã do Bosque**: raízes em área prendem vários |

A equipe passa a ter **8 vagas** (atalhos 1–8).

---

## F10 — 6 raças novas (3 classes + herói cada)

### Fada — suporte e confusão
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Encantadora** | Bênção: +dano e +alcance às criaturas próximas | **Rainha das Flores**: aura maior e mais forte | **Fada Guerreira**: troca a aura por pó de estrelas em 3 alvos |
| **Travessa** | Chance de confundir: o inimigo anda para trás | **Pregadora de Peças**: confusão em área | **Ladra de Ouro**: confundidos que morrem rendem ouro extra |
| **Lumina** | Marca o alvo (+dano recebido) | **Farol**: marca vários de uma vez | **Estrela Cadente**: marcados explodem em luz ao morrer |
| **Herói: Rainha Fada** | Ataque de pó mágico; Pulso **Bênção Feérica**: todas as criaturas atacam mais rápido por alguns segundos; bônus: Fadas +alcance | | |

### Golem — tanque e controle
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Muralha** | Bloqueia 3 inimigos e atordoa quem segura | **Fortaleza**: bloqueia 6 | **Avalanche**: troca o bloqueio por pancada em área que atordoa |
| **Cristal** | Raio que atravessa inimigos em linha | **Prisma**: divide o raio em 3 | **Amplificador**: aura que aumenta o dano crítico dos vizinhos |
| **Magma** | Queima tudo ao redor de si (dano contínuo em área) | **Vulcão**: área maior | **Lava Viva**: deixa poças de lava pelo caminho |
| **Herói: Colosso** | Lento, muita vida, golpe em área curta; Pulso **Terremoto**: atordoa todos no raio; bônus: Golems +dano | | |

### Necromante — mortos a seu serviço
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Guerreiro Esqueleto** | Barato, corpo a corpo | **Cavaleiro da Morte**: mais dano e ignora armadura | **Legião de Ossos**: abates erguem um esqueleto aliado temporário |
| **Ceifador** | Executa inimigos comuns abaixo de 15% de vida | **Ceifador Sombrio**: limiar de 25% | **Colhedor de Almas**: execuções rendem ouro |
| **Drenador** | Enfraquece: o alvo anda mais devagar e causa menos dano ao Nexus | **Sanguessuga**: enfraquecimento mais forte | **Corruptor**: também corrói a armadura |
| **Herói: Senhor dos Mortos** | Ataque de foice; Pulso **Erguer Mortos**: 3 esqueletos aliados temporários; bônus: Necromantes +velocidade de ataque | | |

### Górgona — veneno e petrificação
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Arqueira Serpente** | Veneno que ignora armadura | **Víbora**: veneno mais forte | **Naja**: cuspe em leque |
| **Medusa** | Olhar com chance de petrificar | **Olhar Pétreo**: chance e duração maiores | **Górgona Ancestral**: petrificados recebem +50% de dano |
| **Basilisco** | Ácido que corrói a armadura | **Basilisco Rei**: corrosão em área | **Cuspidor**: deixa poças ácidas |
| **Herói: Rainha Górgona** | Ataque de serpentes; Pulso **Olhar Fatal**: petrifica em leque; bônus: Górgonas +duração dos efeitos | | |

### Demônios — dano bruto
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Diabrete** | Barato e rápido, bolas de fogo | **Diabrete Flamejante**: queimadura | **Diabrete Ladino**: chance de roubar ouro a cada golpe |
| **Súcubo** | Puxa inimigos para perto de si (tira do caminho) | **Sedutora**: puxa vários | **Tormento**: puxados levam o dobro de dano por alguns segundos |
| **Infernal** | Lento, meteoro com muito dano em área | **Senhor do Abismo**: área maior | **Berserker**: cada abate aumenta o dano até o fim da onda |
| **Herói: Arquidemônio** | Ataque de chamas; Pulso **Pacto**: gasta 30% da vida do herói por uma explosão enorme; bônus: Demônios +chance de crítico | | |

### Anjos — precisão contra os fortes
| Classe | Base | Vertente A | Vertente B |
|---|---|---|---|
| **Querubim** | Flechas de luz que ricocheteiam | **Serafim**: mais ricochetes | **Arauto**: as flechas marcam o alvo |
| **Valquíria** | Mira o inimigo mais forte (elites e chefes primeiro) | **Matadora de Reis**: +dano contra chefes e elites | **Lança Celeste**: a lança atravessa em linha |
| **Guardião Celestial** | Proteção: criaturas próximas imunes a teia e atordoamento | **Égide Celeste**: aura maior, que também dá +dano | **Juiz**: inimigos dentro da aura sofrem dano por segundo |
| **Herói: Arcanjo** | Ataque de espada de luz; Pulso **Juízo**: raio sagrado em linha; bônus: Anjos +dano contra chefes | | |

---

## Dificuldade

O jogo está fácil até a onda 20 para quem joga de verdade, e as raças novas trazem ainda mais poder. Proposta:
- Depois do F9, deixar o bot mais esperto (move o herói, busca loot, usa o Pulso bem) e recalibrar para ele vencer **~35–45%**. Assim um jogador atento fica perto de 60–70%.
- Quando cada raça nova entrar, conferir que ela não fica muito acima das outras.
