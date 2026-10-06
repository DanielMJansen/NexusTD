# Valores atuais do jogo (gerado)

> Gerado por `npm run docs:values` a partir de `src/data`. **Não edite à mão**: mude os dados e gere de novo.
> Valores `PROPOSTA` até o playtest; a calibragem e os resultados da simulação estão no GDD (seção 9).

## Economia e Nexus
- Nexus: 100 de vida, +10 de cura entre ondas. Ouro inicial 30; renda +1 a cada 2 s; limite de criaturas 5; venda 60%.
- Essência por run: 3 por onda + 1 a cada 5 abates + 30 ao vencer.
- Evolução: nível 2 custa 1,5× o custo daquela cópia (dano ×1,5, alcance ×1,1); nível 3 custa 3× o custo daquela cópia (dano ×2,2, alcance ×1,2). No nível 3 o jogador escolhe a vertente.

| Melhoria do Nexus | Custos | Níveis |
|---|---|---|
| Vitalidade | 60 / 100 / 150 / 210 / 280 | +25 de vida máxima · +50 de vida máxima · +75 de vida máxima · +100 de vida máxima · +125 de vida máxima |
| Muralha | 70 / 120 / 180 / 250 / 330 | −6% de dano recebido · −12% de dano recebido · −18% de dano recebido · −24% de dano recebido · −30% de dano recebido |
| Raio do Nexus | 120 / 220 / 350 | 10 de dano a cada 1,3 s, alcance 105 · 16 de dano a cada 1,1 s, alcance 120 · 24 de dano a cada 0,9 s, alcance 135 |
| Escudo | 120 / 200 / 300 | imune por 2 s, recarga 40 s · imune por 3 s, recarga 32 s · imune por 4 s, recarga 25 s |
| Campo de Lentidão | 100 / 180 / 280 | −25% de velocidade num raio de 60 · −35% de velocidade num raio de 75 · −45% de velocidade num raio de 90 |

Loot: moeda 8% (valor 1,5× o ouro do inimigo); baú comum 0,2%, elite 6%, chefe 100%; some após 12 s.

## Criaturas
| Raça | Criatura | Custo | Dano | Alcance | Recarga | Habilidade | Desbloqueio |
|---|---|---|---|---|---|---|---|
| Humano | Arqueiro | 15 | 7 | 120 | 0,7 s | Alvo único, alcance alto. | inicial |
| Humano | Guarda | 20 | 8 | 55 | 0,8 s | Bloqueio: segura até 2 inimigos num raio de 30 (chefes não param). | 30 ✦ |
| Humano | Clériga | 25 | 7 | 90 | 1 s | Bênção: criaturas num raio de 100 ganham +25% de dano. | 70 ✦ |
| Vampiro | Duelista | 20 | 8 | 90 | 0,5 s | Frenesi: a cada 6 golpes, 3 s com ×1,5 de dano e ataques 2× mais rápidos. | 40 ✦ |
| Vampiro | Sanguinário | 25 | 6 | 100 | 0,8 s | Sustento: cada abate desta criatura cura 2 de vida do Nexus. | 50 ✦ |
| Vampiro | Enxame | 30 | 6 | 95 | 1 s | Área: atinge inimigos num raio de 32 ao redor do alvo com 100% do dano. | 80 ✦ |
| Dragão | Fogo | 30 | 12 | 110 | 1,4 s | Área: atinge inimigos num raio de 40 ao redor do alvo com 60% do dano. | 80 ✦ |
| Dragão | Gelo | 25 | 4 | 100 | 1 s | Lentidão: o alvo fica 50% mais lento por 1,5 s. | 80 ✦ |
| Dragão | Tempestade | 30 | 9 | 105 | 1,1 s | Garras em cadeia: o golpe salta para até 3 inimigos próximos (85% do dano a cada salto). | 80 ✦ |
| Lobisomem | Caçador | 25 | 10 | 75 | 0,6 s | Garras em cadeia: o golpe salta para até 2 inimigos próximos (80% do dano a cada salto). | 60 ✦ |
| Lobisomem | Alfa | 30 | 10 | 65 | 0,6 s | Aura: criaturas num raio de 80 atacam 20% mais rápido. | 70 ✦ |
| Lobisomem | Uivador | 30 | 4 | 70 | 3 s | Golpe em área: atinge todos num raio de 70 ao redor dela. 60% de chance de assustar: o inimigo foge do Nexus por 1,5 s (chefes resistem). | 70 ✦ |
| Fantasma | Assombração | 25 | 7 | 100 | 0,7 s | Ignora toda a armadura do alvo. | 60 ✦ |
| Fantasma | Banshee | 30 | 4 | 80 | 1,2 s | Grito em leque: atinge todos à frente e os empurra 16 para longe do Nexus (chefes resistem). | 70 ✦ |
| Fantasma | Possessor | 35 | 4 | 90 | 5 s | Possui o alvo por 3 s: ele luta contra os outros inimigos (chefes resistem). | 90 ✦ |
| Bruxa | Feiticeira | 25 | 5 | 110 | 0,8 s | Veneno: 8 de dano por segundo durante 3 s (ignora armadura). | 60 ✦ |
| Bruxa | Caldeirão | 35 | 5 | 100 | 1,8 s | Poça: 13 de dano por segundo num raio de 30 durante 3 s. | 80 ✦ |
| Bruxa | Herbalista | 25 | 5 | 100 | 1,1 s | 35% de chance de prender em raízes por 1,4 s (chefes resistem). | 70 ✦ |
| Fada | Encantadora | 30 | 5 | 95 | 1 s | Bênção: criaturas num raio de 85 ganham +10% de dano, +8% de alcance. | 90 ✦ |
| Fada | Travessa | 25 | 6 | 100 | 0,8 s | 25% de chance de confundir: o inimigo anda para trás por 1,5 s (chefes resistem). | 80 ✦ |
| Fada | Lumina | 30 | 6 | 110 | 0,9 s | Marca o alvo: +15% de dano recebido por 3 s. | 90 ✦ |
| Golem | Muralha | 30 | 6 | 45 | 1 s | Bloqueio: segura até 3 inimigos num raio de 32 (chefes não param). 25% de chance de atordoar por 1 s (chefes resistem). | 90 ✦ |
| Golem | Cristal | 30 | 9 | 120 | 1,2 s | Raio que atravessa todos os inimigos em linha. | 100 ✦ |
| Golem | Magma | 30 | 8 | 45 | 0,8 s | Golpe em área: atinge todos num raio de 45 ao redor dela. Dano contínuo: 4/s por 2 s (ignora armadura). | 90 ✦ |
| Necromante | Esqueleto | 15 | 10 | 55 | 0,7 s | Alvo único, alcance alto. | 70 ✦ |
| Necromante | Ceifador | 30 | 13 | 70 | 0,8 s | Executa inimigos comuns abaixo de 20% de vida. | 90 ✦ |
| Necromante | Drenador | 25 | 8 | 100 | 1 s | Enfraquece por 3 s: 30% mais lento e −40% de dano ao Nexus. | 80 ✦ |
| Górgona | Arqueira | 25 | 6 | 115 | 0,8 s | Dano contínuo: 6/s por 3 s (ignora armadura). | 80 ✦ |
| Górgona | Medusa | 35 | 7 | 100 | 1,1 s | 20% de chance de petrificar por 1,8 s (chefes resistem). | 100 ✦ |
| Górgona | Basilisco | 25 | 7 | 90 | 0,9 s | Corrói 3 de armadura por 3 s. | 80 ✦ |
| Demônio | Diabrete | 15 | 6 | 95 | 0,5 s | Alvo único, alcance alto. | 80 ✦ |
| Demônio | Súcubo | 30 | 6 | 110 | 1,2 s | Puxa o alvo 18 na direção da criatura (chefes resistem). | 90 ✦ |
| Demônio | Infernal | 40 | 22 | 110 | 2,4 s | Área: atinge inimigos num raio de 40 ao redor do alvo com 80% do dano. | 110 ✦ |
| Anjo | Querubim | 25 | 8 | 110 | 0,8 s | Garras em cadeia: o golpe salta para até 2 inimigos próximos (85% do dano a cada salto). | 80 ✦ |
| Anjo | Valquíria | 35 | 16 | 105 | 1,1 s | Alvo único, alcance alto. | 100 ✦ |
| Anjo | Guardião | 30 | 7 | 90 | 1 s | Bênção: criaturas num raio de 80 ganham imunidade a teia e atordoamento. | 90 ✦ |

### Vertentes (nível 3)
| Criatura | Vertente A | Vertente B |
|---|---|---|
| Arqueiro | **Patrulheiro**: Multi-tiro: ataca 2 inimigos de uma vez. | **Atirador de Elite**: Crítico: +35% de chance de golpe crítico, que causa ×3,5 de dano. (range ×1,3, cooldown ×1,15) |
| Guarda | **Paladino**: Bloqueio: segura até 4 inimigos num raio de 36 (chefes não param). | **Martelo Sagrado**: Atordoar: 35% de chance de parar o alvo por 1,2 s (chefes resistem). (damage ×1,4) |
| Clériga | **Sacerdotisa**: Bênção: criaturas num raio de 100 ganham +25% de dano, imunidade a teia e atordoamento. | **Inquisidora**: 35% de chance de atordoar por 1,2 s (chefes resistem). (damage ×2,6, range ×1,15) |
| Duelista | **Conde Vampiro**: Frenesi: a cada 4 golpes, 4 s com ×1,8 de dano e ataques 2× mais rápidos. | **Lâmina Carmesim**: Crítico: +40% de chance de golpe crítico, que causa ×2,5 de dano. (cooldown ×0,85) |
| Sanguinário | **Lorde de Sangue**: Sustento: cada abate desta criatura cura 4 de vida do Nexus. | **Mago de Sangue**: Garras em cadeia: o golpe salta para até 3 inimigos próximos (80% do dano a cada salto). (damage ×1,5) |
| Enxame | **Nuvem Sangrenta**: Área: atinge inimigos num raio de 45 ao redor do alvo com 100% do dano. Dano contínuo: 6/s por 3 s (ignora armadura). | **Revoada Faminta**: Área: atinge inimigos num raio de 32 ao redor do alvo com 100% do dano. Cada abate: +5% de velocidade de ataque até o fim da onda (máx. +75%). |
| Fogo | **Dragão Ancião**: Área: atinge inimigos num raio de 60 ao redor do alvo com 80% do dano. | **Wyrm Infernal**: Poça: 20 de dano por segundo num raio de 34 durante 3 s. |
| Gelo | **Dragão Glacial**: Lentidão: o alvo fica 65% mais lento por 2,5 s. | **Dragão Congelante**: Atordoar: 30% de chance de parar o alvo por 1,4 s (chefes resistem). (damage ×1,3) |
| Tempestade | **Dragão do Trovão**: Garras em cadeia: o golpe salta para até 6 inimigos próximos (88% do dano a cada salto). | **Olho da Tormenta**: Garras em cadeia: o golpe salta para até 3 inimigos próximos (85% do dano a cada salto). 30% de chance de atordoar por 1 s (chefes resistem). |
| Caçador | **Caçador Lunar**: Garras em cadeia: o golpe salta para até 4 inimigos próximos (80% do dano a cada salto). | **Caçador Feral**: Frenesi: a cada 5 golpes, 3 s com ×1,6 de dano e ataques 1,8× mais rápidos. |
| Alfa | **Líder da Matilha**: Aura: criaturas num raio de 100 atacam 40% mais rápido. | **Fera Devastadora**: Área: atinge inimigos num raio de 38 ao redor do alvo com 75% do dano. (damage ×1,3) |
| Uivador | **Uivo Lunar**: Golpe em área: atinge todos num raio de 90 ao redor dela. 85% de chance de assustar: o inimigo foge do Nexus por 2,2 s (chefes resistem). (range ×1,2) | **Grito de Guerra**: Bênção: criaturas num raio de 90 ganham +35% de velocidade de ataque. (cooldown ×0,4, damage ×2) |
| Assombração | **Espírito Vingativo**: Ignora armadura e causa +50% de dano em inimigos com armadura. | **Aparição Gélida**: Lentidão: o alvo fica 45% mais lento por 2 s. (damage ×1,6) |
| Banshee | **Banshee Ancestral**: Grito em leque: atinge todos à frente e os empurra 34 para longe do Nexus (chefes resistem). | **Arauto do Pavor**: Grito em leque: atinge todos à frente e os faz fugir do Nexus por 1,4 s (chefes resistem). (damage ×1,3) |
| Possessor | **Marionetista**: Multi-tiro: ataca 2 inimigos de uma vez. Possui o alvo por 4,5 s: ele luta contra os outros inimigos (chefes resistem). | **Devorador**: Possui o alvo por 4 s: ele luta contra os outros inimigos e explode no fim (raio 50) (chefes resistem). |
| Feiticeira | **Arquibruxa**: Veneno: 16 de dano por segundo durante 4 s (ignora armadura). | **Feiticeira do Caos**: Garras em cadeia: o golpe salta para até 3 inimigos próximos (85% do dano a cada salto). (damage ×2,4, cooldown ×0,85) |
| Caldeirão | **Caldeirão Infernal**: Poça: 24 de dano por segundo num raio de 40 durante 4 s. | **Caldeirão Alquímico**: Poça dourada: 16 de dano por segundo num raio de 32 durante 3 s; cada inimigo que morre nela rende +3 de ouro. |
| Herbalista | **Jardim Venenoso**: 40% de chance de prender em raízes por 1,5 s (chefes resistem). Dano contínuo: 10/s por 3 s (ignora armadura). | **Guardiã do Bosque**: Área: atinge inimigos num raio de 40 ao redor do alvo com 60% do dano. 35% de chance de prender em raízes por 1,4 s (chefes resistem). |
| Encantadora | **Rainha das Flores**: Bênção: criaturas num raio de 110 ganham +20% de dano, +15% de alcance. | **Fada Guerreira**: Multi-tiro: ataca 3 inimigos de uma vez. (damage ×2,4) |
| Travessa | **Pregadora de Peças**: Área: atinge inimigos num raio de 35 ao redor do alvo com 50% do dano. 35% de chance de confundir: o inimigo anda para trás por 1,8 s (chefes resistem). | **Ladra de Ouro**: 35% de chance de confundir: o inimigo anda para trás por 1,6 s (chefes resistem). Inimigos confusos ou assustados que morrem rendem +3 de ouro. (damage ×1,3) |
| Lumina | **Farol**: Multi-tiro: ataca 3 inimigos de uma vez. Marca o alvo: +25% de dano recebido por 3,5 s. | **Estrela Cadente**: Marca o alvo: +20% de dano recebido por 3 s; se morrer marcado, explode (raio 40, 40% da vida dele). (damage ×1,4) |
| Muralha | **Fortaleza**: Bloqueio: segura até 6 inimigos num raio de 40 (chefes não param). 25% de chance de atordoar por 1 s (chefes resistem). | **Avalanche**: Golpe em área: atinge todos num raio de 50 ao redor dela. 40% de chance de atordoar por 1,2 s (chefes resistem). (damage ×1,6) |
| Cristal | **Prisma**: Raio em leque: 3 raios que atravessam todos os inimigos no caminho. | **Amplificador**: Bênção: criaturas num raio de 90 ganham +1× de dano crítico. (damage ×1,4) |
| Magma | **Vulcão**: Golpe em área: atinge todos num raio de 65 ao redor dela. Dano contínuo: 7/s por 2,5 s (ignora armadura). (range ×1,4) | **Lava Viva**: Poça: 18 de dano por segundo num raio de 30 durante 3 s. (range ×1,8) |
| Esqueleto | **Cavaleiro da Morte**: Ignora toda a armadura do alvo. (damage ×1,5) | **Legião de Ossos**: 35% de chance de erguer um esqueleto aliado por 6 s ao abater. |
| Ceifador | **Ceifador Sombrio**: Executa inimigos comuns abaixo de 25% de vida. | **Colhedor de Almas**: Executa inimigos comuns abaixo de 15% de vida. Cada execução rende +3 de ouro. (damage ×1,3) |
| Drenador | **Sanguessuga**: Enfraquece por 3,5 s: 40% mais lento e −50% de dano ao Nexus. | **Corruptor**: Enfraquece por 3 s: 25% mais lento e −30% de dano ao Nexus. Corrói 3 de armadura por 3 s. (damage ×1,3) |
| Arqueira | **Víbora**: Dano contínuo: 11/s por 3,5 s (ignora armadura). | **Naja**: Grito em leque: atinge todos à frente e os empurra 0 para longe do Nexus (chefes resistem). Dano contínuo: 6/s por 3 s (ignora armadura). |
| Medusa | **Olhar Pétreo**: 35% de chance de petrificar por 2,4 s (chefes resistem). | **Górgona Ancestral**: 25% de chance de petrificar por 2 s (chefes resistem). O alvo recebe +50% de dano por 2 s. |
| Basilisco | **Basilisco Rei**: Área: atinge inimigos num raio de 35 ao redor do alvo com 60% do dano. Corrói 4 de armadura por 3,5 s. | **Cuspidor**: Poça: 12 de dano por segundo num raio de 28 durante 3 s. Corrói 3 de armadura por 3 s. |
| Diabrete | **Diabrete Flamejante**: Dano contínuo: 5/s por 2 s (ignora armadura). | **Diabrete Ladino**: 12% de chance de roubar 1 de ouro a cada golpe. |
| Súcubo | **Sedutora**: Multi-tiro: ataca 3 inimigos de uma vez. Puxa o alvo 18 na direção da criatura (chefes resistem). | **Tormento**: Puxa o alvo 15 na direção da criatura (chefes resistem). O alvo recebe +60% de dano por 2,5 s. |
| Infernal | **Senhor do Abismo**: Área: atinge inimigos num raio de 60 ao redor do alvo com 90% do dano. | **Berserker**: Área: atinge inimigos num raio de 40 ao redor do alvo com 80% do dano. Cada abate: +5% de dano até o fim da onda (máx. +100%). |
| Querubim | **Serafim**: Garras em cadeia: o golpe salta para até 4 inimigos próximos (90% do dano a cada salto). | **Arauto**: Garras em cadeia: o golpe salta para até 2 inimigos próximos (85% do dano a cada salto). Marca o alvo: +20% de dano recebido por 3 s. |
| Valquíria | **Matadora de Reis**: +60% de dano contra elites e chefes. | **Lança Celeste**: Raio que atravessa todos os inimigos em linha. |
| Guardião | **Égide Celeste**: Bênção: criaturas num raio de 100 ganham +12% de dano, imunidade a teia e atordoamento. | **Juiz**: Bênção: criaturas num raio de 80 ganham imunidade a teia e atordoamento. Inimigos dentro da aura sofrem 10 de dano por segundo. |

## Heróis
| Herói | Raça | Vida | Vel. | Ataque | Pulso | Bônus de raça | Preço |
|---|---|---|---|---|---|---|---|
| Cavaleiro | Humano | 120 | 115 | 10 de dano num alvo a cada 0,5 s, alcance 60. | Onda de Choque: 35 de dano, raio de 95, recarga 12 s. O dano cresce +10% por nível do herói. | Criaturas da raça Humano: +10% de alcance. | inicial |
| Nobre Vampiro | Vampiro | 100 | 125 | 8 de dano num alvo a cada 0,45 s, alcance 55. Cada golpe cura 0,5 do Nexus. | Revoada de Morcegos: 25 de dano, raio de 100, recarga 12 s. Cura 4 de vida do herói por inimigo atingido. O dano cresce +10% por nível do herói. | Criaturas da raça Vampiro: cada abate cura 1 de vida do Nexus. | 150 ✦ |
| Draconato | Dragão | 150 | 105 | 8 de dano em leque (todos à frente) a cada 0,65 s, alcance 55. | Rugido Flamejante: 30 de dano, raio de 130, recarga 13 s. O dano cresce +10% por nível do herói. | Criaturas da raça Dragão: +10% de dano. | 200 ✦ |
| Licantropo | Lobisomem | 110 | 135 | 6 de dano num alvo a cada 0,3 s, alcance 48. | Uivo: 15 de dano, raio de 110, recarga 12 s. Inimigos fogem do Nexus por 2 s. O dano cresce +10% por nível do herói. | Criaturas da raça Lobisomem: +15% de velocidade de ataque. | 200 ✦ |
| Espectro | Fantasma | 90 | 120 | 11 de dano num alvo a cada 0,5 s, alcance 75. Ignora armadura. | Travessia: 45 de dano, investida de 200 que atravessa o campo, recarga 10 s. O dano cresce +10% por nível do herói. | Criaturas da raça Fantasma: ignoram 2 de armadura. | 220 ✦ |
| Bruxa | Bruxa | 90 | 115 | 8 de dano num alvo a cada 0,7 s, alcance 110. | Maldição: 10 de dano, raio de 115, recarga 12 s. Envenena: 8/s por 4 s. O dano cresce +10% por nível do herói. | Criaturas da raça Bruxa: venenos, poças e efeitos de golpe duram +1 s. | 220 ✦ |
| Rainha Fada | Fada | 85 | 130 | 7 de dano num alvo a cada 0,45 s, alcance 95. | Bênção Feérica: 15 de dano, raio de 90, recarga 14 s. Todas as criaturas atacam 50% mais rápido por 5 s. O dano cresce +10% por nível do herói. | Criaturas da raça Fada: +12% de alcance. | 240 ✦ |
| Colosso | Golem | 220 | 85 | 12 de dano em leque (todos à frente) a cada 0,9 s, alcance 45. | Terremoto: 25 de dano, raio de 100, recarga 13 s. Atordoa por 1,8 s (chefes resistem). O dano cresce +10% por nível do herói. | Criaturas da raça Golem: +12% de dano. | 260 ✦ |
| Senhor dos Mortos | Necromante | 110 | 110 | 9 de dano em leque (todos à frente) a cada 0,6 s, alcance 55. | Erguer Mortos: 10 de dano, raio de 80, recarga 14 s. Ergue 3 esqueletos aliados por 8 s. O dano cresce +10% por nível do herói. | Criaturas da raça Necromante: +12% de velocidade de ataque. | 260 ✦ |
| Rainha Górgona | Górgona | 100 | 115 | 9 de dano num alvo a cada 0,55 s, alcance 85. | Olhar Fatal: 20 de dano, leque à frente (alcance 140), recarga 13 s. Petrifica por 2,2 s (chefes resistem). O dano cresce +10% por nível do herói. | Criaturas da raça Górgona: venenos, poças e efeitos de golpe duram +1 s. | 260 ✦ |
| Arquidemônio | Demônio | 130 | 120 | 9 de dano em leque (todos à frente) a cada 0,55 s, alcance 60. | Pacto: 90 de dano, raio de 110, recarga 12 s. Custa 30% da vida do herói. O dano cresce +10% por nível do herói. | Criaturas da raça Demônio: +10% de chance de crítico. | 280 ✦ |
| Arcanjo | Anjo | 120 | 125 | 11 de dano num alvo a cada 0,5 s, alcance 60. | Juízo: 70 de dano, raio em linha (alcance 220), recarga 12 s. O dano cresce +10% por nível do herói. | Criaturas da raça Anjo: +25% de dano contra elites e chefes. | 280 ✦ |

XP para o próximo nível: nível 1 → 15 · nível 2 → 30 · nível 3 → 51 · nível 5 → 111 · nível 10 → 366 · nível 15 → 771 · nível 20 → 1326.

| Melhoria do herói | Efeito | Máx. |
|---|---|---|
| Lâmina Afiada | +15% de dano do herói | — |
| Agilidade | +12% de velocidade de ataque do herói | — |
| Alcance | +12% de alcance do herói | — |
| Vigor | +25 de vida máxima do herói | — |
| Recuperação | +1,5 de vida/s do herói | — |
| Passos Rápidos | +10% de velocidade do herói | 4 |
| Foco | Pulso recarrega 10% mais rápido | 4 |
| Pulso Potente | +25% de dano do Pulso | — |
| Sede | Golpes do herói devolvem 10% do dano como vida | 3 |
| Espinhos | Inimigos encostados no herói sofrem 8 de dano/s | — |
| Ímã | Coleta moedas e baús 50% mais longe | 3 |
| Couraça | O herói recebe 15% menos dano | 4 |

## Inimigos
| Inimigo | Vida | Vel. | Armadura | Dano ao Nexus | Dano ao herói/s | Ouro | XP | Habilidades |
|---|---|---|---|---|---|---|---|---|
| Zumbi | 20 | 30 | 0 | 5 | 8 | 3 | 3 | — |
| Morcego | 12 | 62 | 0 | 3 | 6 | 2 | 2 | — |
| Esqueleto Arqueiro | 18 | 26 | 0 | 5 | 4 | 4 | 3 | Tiro: com o herói a até 90, avança devagar e atira (6 de dano a cada 1,6 s). |
| Ogro | 90 | 18 | 3 | 15 | 16 | 8 | 7 | — |
| Lodo | 34 | 22 | 0 | 6 | 8 | 3 | 3 | Divisão: ao morrer, vira 2 Lodinhos. |
| Lodinho | 10 | 34 | 0 | 2 | 4 | 1 | 1 | — |
| Aranha | 26 | 40 | 0 | 5 | 10 | 4 | 4 | Teia: a cada 4 s, prende a criatura mais próxima (alcance 80): atacam 50% mais devagar por 2,5 s. |
| Gárgula | 50 | 44 | 1 | 8 | 10 | 6 | 5 | Pedra: voa 2,5 s e pousa 1,5 s com +6 de armadura. |
| Cavaleiro Sem Cabeça | 80 | 24 | 2 | 10 | 18 | 8 | 7 | Investida: a cada 6 s, corre 2,6× mais rápido por 0,8 s. |
| Banshee Sombria | 40 | 28 | 0 | 6 | 6 | 7 | 6 | Lamento: a cada 4 s, cura 15% da vida dos inimigos num raio de 70 (chefes não). |
| Necromante | 55 | 20 | 1 | 10 | 8 | 9 | 8 | Invocação: a cada 6 s, ergue 2 Zumbis. |
| Esqueleto Aliado | 40 | 45 | 0 | 0 | 12 | 0 | 0 | — |
| Rei Ogro (chefe) | 450 | 13 | 4 | 30 | 35 | 30 | 40 | Pisão: a cada 7 s, atordoa as criaturas num raio de 75 por 1,2 s. |
| Rainha Aranha (chefe) | 600 | 15 | 3 | 35 | 30 | 45 | 60 | Teia: a cada 3,5 s, prende até 3 criaturas (alcance 120): atacam 60% mais devagar por 3 s. Invocação: a cada 7 s, ergue 2 Aranhas. |
| Lich (chefe) | 800 | 12 | 4 | 60 | 40 | 80 | 100 | Tiro: com o herói a até 120, avança devagar e atira (14 de dano a cada 1,4 s). Invocação: a cada 8 s, ergue 2 Esqueleto Arqueiros. Escudo: a cada 12 s, reduz o dano recebido em 80% por 3 s. Fúria: abaixo de 50% da vida, fica 40% mais rápido e usa habilidades mais vezes. |

## Ondas
- 20 ondas; quantidade = 4 + 3 × onda; chefes: onda 7 Rei Ogro, onda 14 Rainha Aranha, onda 20 Lich.
- Força (o = onda − 1): vida × (1 + 0,18·o + 0,03·o²); velocidade +2% por onda (máx. +40%); dano +6% por onda.
- Elites a partir da onda 8: chance 5% (+1%/onda, máx. 25%); vida ×2,5, dano ×1,5, recompensa ×2.
- Sem Fim: chefe a cada 5 ondas; por onda além da 20, vida ×1,08 e dano ×1,05 a mais (exponencial); elites até 35%.

| Onda | Inimigos | Vida × | Velocidade × | Dano × |
|---|---|---|---|---|
| 1 | 7 | 1 | 1 | 1 |
| 5 | 19 | 2,14 | 1,08 | 1,24 |
| 7 | 25 | 3,02 | 1,12 | 1,36 |
| 10 | 34 | 4,73 | 1,18 | 1,54 |
| 14 | 46 | 7,73 | 1,26 | 1,78 |
| 20 | 64 | 13,81 | 1,38 | 2,14 |
| 25 | 79 | 29,82 | 1,4 | 3,11 |
| 30 | 94 | 60,64 | 1,4 | 4,46 |
| 40 | 124 | 221,7 | 1,4 | 8,86 |

## Talentos
| Ramo | Talento (requisito) | Custos | Efeito por nível |
|---|---|---|---|
| Nexus | Vitalidade do Nexus | 20, 40, 60, 80, 100 | +10 de vida do Nexus |
| Nexus | Restauração (Vitalidade do Nexus 2) | 40, 80, 120 | +3 de cura entre ondas |
| Nexus | Pulsar Vital (Restauração 1) | 100, 200 | 0,15 de vida por segundo |
| Nexus | Égide Rúnica (Pulsar Vital 1) | 250 | Anula o 1º golpe de cada onda |
| Nexus+ | Engenharia Arcana | 40, 80, 120 | −5% no custo das melhorias do Nexus |
| Nexus+ | Raio Desperto (Engenharia Arcana 1) | 250 | Raio do Nexus nível 1 desde o início |
| Nexus+ | Campo Gélido (Raio Desperto 1) | 350 | Campo de Lentidão nível 1 desde o início |
| Nexus+ | Escudo Ancestral (Campo Gélido 1) | 450 | Escudo do Nexus nível 1 desde o início |
| Ouro | Tesouro Inicial | 15, 30, 45, 60, 75 | +6 de ouro inicial |
| Ouro | Fluxo Dourado (Tesouro Inicial 2) | 60, 120 | +1 ouro a cada 1,85 s |
| Ouro | Alquimia (Fluxo Dourado 1) | 50, 100, 150 | −6% no custo de evoluir |
| Ouro | Recompensa (Alquimia 1) | 100, 200 | +10% de ouro por abate |
| Exército | Fúria do Exército | 20, 40, 60, 80, 100 | +4% de dano |
| Exército | Prontidão (Fúria do Exército 2) | 60, 120, 180 | +3% de velocidade de ataque |
| Exército | Olhos Atentos (Prontidão 1) | 60, 120, 180 | +4% de alcance |
| Exército | Legião (Olhos Atentos 2) | 400 | +1 vaga de criatura |
| Herói | Força do Herói | 30, 60, 90 | +10% de dano do herói |
| Herói | Vigor (Força do Herói 1) | 30, 60, 90 | +10 de vida do herói |
| Herói | Foco do Pulso (Vigor 1) | 50, 100, 150 | −6% na recarga do Pulso |
| Herói | Passos Leves (Foco do Pulso 1) | 40, 80 | +10% de velocidade do herói |
| Herói | Renascer (Passos Leves 1) | 60, 120 | Herói renasce 20% mais rápido |
| Herói | Sabedoria (Renascer 1) | 50, 100, 150 | +6% de XP do herói |
| Herói | Pulso Amplo (Sabedoria 2) | 200 | +12% de raio do Pulso |
| Essência | Colheita de Almas | 30, 60, 90, 120, 150 | +10% de Essência por run |
| Essência | Dízimo da Vitória (Colheita de Almas 2) | 80, 160 | +20 de Essência ao vencer |
| Essência | Veterano (Dízimo da Vitória 1) | 100, 200 | +1 de Essência por onda |

Custo total da árvore: 7255 ✦.
