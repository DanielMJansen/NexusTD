# Proposta: Pulsos com personalidade

> Status: **aprovada e implementada em 07/10/2026**, com dois ajustes (Espectro e Bruxa, abaixo). Valores atuais em `docs/valores.md`. Regras que valem para todos: o dano cresce +10% por nível do herói; nenhum Pulso cura o Nexus; Pulsos direcionais miram no mouse (ou na direção do WASD).

A ideia: cada Pulso é o "momento épico" do herói — algo que só ele faz, com visual e som próprios — em vez de variações de "dano em círculo".

| Herói | Hoje | Proposta | Como funciona |
|---|---|---|---|
| **Cavaleiro** (Humano) | Onda de Choque: dano em círculo | **Carga Heroica** | Avança com o escudo na direção da mira, atropelando: quem está no caminho leva dano e é **arremessado para longe do Nexus**. |
| **Nobre Vampiro** | Revoada: dano em círculo + cura | **Revoada de Morcegos** | Um enxame sai do herói e **caça os 6 inimigos mais próximos** (cada morcego voa até um alvo), morde, faz sangrar, e **volta curando o herói**. |
| **Draconato** (Dragão) | Rugido: dano em círculo | **Lança-Chamas** | Por 2,5 s, cospe um **jato de fogo contínuo** em leque na direção da mira (dá para varrer o campo mexendo o mouse); quem é atingido fica queimando. |
| **Licantropo** (Lobisomem) | Uivo: dano + medo | **Fúria Lunar** | O herói **se transforma num lobisomem gigante** por 6 s: maior, ataca 2× mais rápido, golpes em leque e cada golpe cura o herói. Ao transformar, uiva (medo ao redor). |
| **Espectro** (Fantasma) | Travessia: investida | **Travessia** (refeita) | Em vez de teleportar, **desliza translúcido** pelo campo em ~0,6 s deixando rastros fantasmagóricos; quem é atravessado leva dano e fica **com medo** por 1,5 s. |
| **Bruxa** | Maldição: dano + veneno em círculo | **Feitiço do Sapo** | Transforma os inimigos comuns no raio em **sapos** por 4 s: pulam devagar, levam +50% de dano e não ferem o herói nem o Nexus. Chefes resistem (só levam dano). (O Caldeirão Fervente foi descartado por repetir a torre Caldeirão.) |
| **Rainha Fada** | Bênção Feérica: acelera criaturas | **Bênção Feérica** (mantém) | Já é característico. Acréscimo: chuva de pó dourado visível sobre cada criatura acelerada. |
| **Colosso** (Golem) | Terremoto: dano + atordoa | **Fenda Sísmica** | Soca o chão e abre uma **fenda em linha** na direção da mira: tudo na fenda é atordoado e leva dano; a fenda fica no chão por 3 s deixando quem passa **lento**. |
| **Senhor dos Mortos** | Erguer Mortos: 3 esqueletos | **Erguer Mortos** (refinado) | Ergue esqueletos **dos inimigos que morreram há pouco** (até 5, onde caíram); sem corpos recentes, ergue 2 ao redor do herói. |
| **Rainha Górgona** | Olhar Fatal: petrifica em leque | **Olhar Fatal** (mantém) | Já é característico. Acréscimo: inimigos petrificados que morrem **se despedaçam** em lascas que ferem os vizinhos. |
| **Arquidemônio** | Pacto: explosão que custa vida | **Chuva de Meteoros** | Custa 25% da vida do herói: **5 meteoros caem em sequência** em pontos ao redor da mira, cada um com explosão em área e chão em chamas. |
| **Arcanjo** | Juízo: raio em linha | **Juízo Celestial** | Marca uma área na mira; após 0,8 s, **uma coluna de luz desce do céu** com muito dano; chefes atingidos ficam **marcados** (+dano recebido) por 4 s. |

Mantidos (já têm personalidade): Rainha Fada e Rainha Górgona — com os pequenos acréscimos acima.
