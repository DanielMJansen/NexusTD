# Nexus — GDD

Documento de design (regras, decisões). Plano e propostas: [roadmap.md](roadmap.md). Números exatos: [valores.md](valores.md).

**Status das decisões:** `DECIDIDO` · `PROPOSTA` (testar) · `TBD` (em aberto) · `FEITO` (implementado no protótipo)
**Regra:** nada vira `DECIDIDO` sem entrar no Registro de Decisões (seção 12). Valores numéricos estão na seção 9 e são ponto de partida de balanceamento, não verdade final.

---

## 1. Visão

**Nexus** é um jogo de **Tower Defense + Survivor + Roguelite + Coleção de Criaturas**. Hordas cercam um **Nexus central**. O jogador controla um **herói** e o defende com criaturas místicas colecionáveis (vampiros, dragões, lobisomens, fantasmas, bruxas...).

**Referência de estrutura:** Kingdom Rush (herói + torres + base que perde vida), mas com inimigos vindo de **todos os lados**. Meta-progressão inspirada no Myth TD (árvore de talentos, coleção e equipe).
**Fantasia:** "Um herói que vai montando um exército de monstros cada vez mais absurdo."

**Pilares**
1. **Pressão de todos os lados:** o Nexus é cercado; posição importa.
2. **Ação constante:** o jogador age (herói), não só observa.
3. **Raça e classe mudam o jogo:** cada uma muda como o jogador pensa a build; o herói fortalece a própria raça.
4. **Coleção que abre opções:** progressão permanente amplia escolhas (criaturas, heróis, talentos), não só multiplica atributos.

## 2. Plataforma, stack e direção de arte
- `DECIDIDO` **Navegador no computador**: paisagem 16:9, mouse e teclado. Celular fora do escopo por enquanto.
- `PROPOSTA` Run de 5–8 min.
- `DECIDIDO` Protótipo web em **TypeScript + Vite** (Canvas 2D), publicado via **GitHub Pages** (https://danielmjansen.github.io/NexusTD/). Jogo final: `TBD` (Godot 4 ou Unity/Steam são hipóteses; decidir após validar a diversão).
- `DECIDIDO` Direção de arte: **gótico sombrio** (roxos, neon, runas, lápides). `FEITO` sprites vetoriais desenhados em código, estilo chibi (cabeça grande, olhos expressivos, contorno), com animações de idle/ataque/caminhada; cenário de cemitério; interface gótica com fontes Cinzel e Crimson Pro (Google Fonts). Arte final: `TBD`.
- `FEITO` **Áudio** 100% sintetizado (WebAudio), sem arquivos: efeitos com intervalo mínimo entre repetições e "pop" de abate que sobe de tom em combos; **música procedural** em ré menor (sequenciador com agendamento à frente, como no Myth TD): trilha do **menu** lenta com sinos, trilha da **run** que acelera (96 → 156 BPM) e ganha camadas a cada onda, e trilha do **chefe**. Volumes de música e efeitos independentes. Música e áudio finais: `TBD`.

## 3. Loop
**Fora da run (menu):** escolher **herói** e **equipe** (até 6 criaturas da coleção), comprar **talentos**, **criaturas** e **heróis** com Essência, ver **conquistas** e escolher **skins**.
**Run:** onda 1 → posicionar criaturas da equipe (pagando ouro) e mover o herói → onda vencida → escolha de 1 entre 3 **melhorias** (+ **loja**) → próxima onda → chefes nas ondas 7, 14 e 20 → vitória/derrota → **Essência** e conquistas → menu. Depois da vitória, a run pode seguir no **Sem Fim**.

**Herói** `FEITO`: mover por WASD/setas ou clique; ataca sozinho; habilidade **Pulso** com recarga. **Um herói por raça** `FEITO`: o Cavaleiro (Humano) é o inicial; os outros são desbloqueados com Essência. Cada herói tem ataque e Pulso próprios e um **bônus para as criaturas da mesma raça** (seção 9). **Skins** `FEITO`: só cosméticas, liberadas por conquistas.
**Herói vivo** `FEITO`: o herói tem vida e leva dano de contato dos inimigos; ao cair, renasce no Nexus depois de 8 s. Ganha XP a cada abate e, a cada nível, escolhe 1 entre 3 **melhorias só do herói** (o jogo pausa).

## 4. Raças e classes
**Estrutura** `DECIDIDO`: `Raça` → `Classe` → `Nível`. Nível permanente (duplicatas/fragmentos): `TBD`. Variantes (comum/rara com trait): **adiadas** (`TBD`).
**Evolução na run** `FEITO`: criaturas em campo evoluem com ouro do nível 1 ao 3; no nível 3 viram uma **forma evoluída** com nome, visual e habilidade turbinada.
**Coleção e equipe** `FEITO`: o Arqueiro vem na coleção; as outras criaturas são compradas com Essência. Quem ainda não tem nenhuma criatura mística ganha **uma de presente** (escolha única). A **equipe** tem até 8 criaturas (com 6 ou mais, o painel mostra cartas compactas em duas colunas); só ela aparece na run, **toda disponível desde a onda 1** (paga-se o ouro para invocar). **Ovos removidos.**
Gacha com dinheiro real: ver seção 10.
**Tags** (`HUMANO`, `SANGUE`, `FOGO`, `GELO`, `CONTROLE`...) `TBD` como sistema de sinergia.

**Roster** (18 `FEITO`; cada raça atual tem 3 classes):

| Raça | Classe | Papel | Mecânica | Forma evoluída (nível 3) |
|---|---|---|---|---|
| Humano | Arqueiro | DPS à distância | Alvo único, alcance alto | Patrulheiro: multi-tiro (2 alvos) |
| Humano | Guarda | Bloqueio | Segura até 2 inimigos (chefes passam) | Paladino: segura 4 |
| Vampiro | Duelista | DPS alvo único | Frenesi após 6 golpes | Conde Vampiro: frenesi a cada 4, mais longo e forte |
| Vampiro | Sanguinário | Sustento | Abates desta criatura curam o herói | Lorde de Sangue: cura o dobro |
| Dragão | Fogo | Área | Golpe com dano em raio | Dragão Ancião: área maior e mais forte |
| Dragão | Gelo | Controle | Golpes deixam inimigos lentos | Dragão Glacial: lentidão mais forte e longa |
| Lobisomem | Caçador | Corpo a corpo em cadeia | O golpe salta para até 2 inimigos próximos | Caçador Lunar: 4 saltos |
| Lobisomem | Alfa | Suporte (aura) | Criaturas próximas atacam mais rápido | Líder da Matilha: aura maior e mais forte |
| Fantasma | Assombração | Anti-armadura | Ignora armadura | Espírito Vingativo: +50% contra blindados |
| Fantasma | Banshee | Controle (empurrão) | Grito em leque que fere e empurra | Banshee Ancestral: leque e empurrão maiores |
| Bruxa | Feiticeira | Dano contínuo | Veneno (dano por segundo) | Arquibruxa: veneno mais forte e longo |
| Bruxa | Caldeirão | Área no chão | Poça de dano por segundo | Caldeirão Infernal: poça maior e mais forte |
| Humano | Clériga | Suporte (bênção) | Criaturas próximas causam mais dano | Sacerdotisa (bênção maior + proteção) · Inquisidora (luz que atordoa) |
| Vampiro | Enxame | Área móvel | Morcegos mordem todos ao redor do alvo | Nuvem Sangrenta (área + sangramento) · Revoada Faminta (abates aceleram) |
| Dragão | Tempestade | Raio em cadeia | Raio salta entre 3 inimigos | Dragão do Trovão (6 saltos) · Olho da Tormenta (raio atordoa) |
| Lobisomem | Uivador | Controle (medo) | Uivo periódico: dano e medo em área | Uivo Lunar (medo maior) · Grito de Guerra (acelera aliados) |
| Fantasma | Possessor | Controle (possessão) | O inimigo possuído luta contra os outros | Marionetista (2 de uma vez) · Devorador (possuído explode) |
| Bruxa | Herbalista | Controle (raízes) | Raízes prendem o alvo | Jardim Venenoso (raízes envenenam) · Guardiã do Bosque (raízes em área) |

**Raças novas do F10** `FEITO` (3 classes com 2 vertentes + herói cada):

| Raça | Classe | Papel | Mecânica | Vertentes (nível 3) |
|---|---|---|---|---|
| Fada | Encantadora | Suporte (bênção) | Bênção raio 85: +12% dano, +10% alcance (voa); 30 ouro, 90 ✦ | Rainha das Flores (raio 110, +20% dano, +15% alcance) · Fada Guerreira (pó de estrelas em 3 alvos, +140% dano) |
| Fada | Travessa | Controle (confusão) | 30% de confundir (anda para trás) por 1,6 s; 25 ouro, 80 ✦ | Pregadora de Peças (confusão em área raio 35) · Ladra de Ouro (confusos que morrem: +3 ouro) |
| Fada | Lumina | Suporte (marca) | Marca: +20% de dano recebido por 3 s; 30 ouro, 90 ✦ | Farol (marca 3 alvos, +25%) · Estrela Cadente (marcados explodem ao morrer) |
| Golem | Muralha | Bloqueio (atordoar) | Segura 3 (raio 32); golpes com 25% de atordoar 1 s; 30 ouro, 90 ✦ | Fortaleza (segura 6, raio 40) · Avalanche (golpe em área raio 50, 40% de atordoar 1,2 s, +60% dano) |
| Golem | Cristal | Raio em linha | Raio que atravessa tudo (largura 10); dano 9, alcance 120; 35 ouro, 100 ✦ | Prisma (3 raios em leque) · Amplificador (aura: +1× dano crítico às criaturas próximas) |
| Golem | Magma | Área ao redor | Golpe em área raio 45 + queimadura 4/s por 2 s; 30 ouro, 90 ✦ | Vulcão (raio 65, queimadura 7/s) · Lava Viva (arremessa lava: poça raio 30, 18/s por 3 s) |
| Necromante | Esqueleto | Corpo a corpo barato | Dano 7 a cada 0,7 s, alcance 45; 15 ouro, 70 ✦ | Cavaleiro da Morte (+50% dano, ignora armadura) · Legião de Ossos (35% de erguer esqueleto aliado por 6 s ao abater) |
| Necromante | Ceifador | Executor | Executa inimigos comuns abaixo de 15% de vida; 30 ouro, 90 ✦ | Ceifador Sombrio (abaixo de 25%) · Colhedor de Almas (+3 ouro por execução, +30% dano) |
| Necromante | Drenador | Controle (enfraquecer) | Enfraquece por 3 s: 25% mais lento e −30% de dano ao Nexus; 25 ouro, 80 ✦ | Sanguessuga (40% lento, −50% dano, 3,5 s) · Corruptor (também corrói 3 de armadura) |
| Górgona | Domadora | Veneno à distância | Veneno 6/s por 3 s (ignora armadura), alcance 115; 25 ouro, 80 ✦ | Víbora (veneno 11/s por 3,5 s) · Naja (cuspe em leque ±0,5 rad) |
| Górgona | Medusa | Controle (petrificar) | 20% de petrificar por 1,8 s; 35 ouro, 100 ✦ | Olhar Pétreo (35% por 2,4 s) · Górgona Ancestral (25% por 2 s + alvo vulnerável: +50% de dano por 2 s) |
| Górgona | Basilisco | Anti-armadura (corrosão) | Corrói 3 de armadura por 3 s; 25 ouro, 80 ✦ | Basilisco Rei (área raio 35, corrói 4) · Cuspidor (poça ácida raio 28, 12/s por 3 s) |
| Demônio | Diabrete | DPS barato e rápido | Dano 5 a cada 0,5 s, alcance 95 (voa); 15 ouro, 80 ✦ | Diabrete Flamejante (queimadura 5/s por 2 s) · Diabrete Ladino (12% de roubar 1 ouro por golpe) |
| Demônio | Súcubo | Controle (puxar) | Puxa o alvo 18 na direção dela (chefes resistem); 30 ouro, 90 ✦ | Sedutora (puxa 3 de uma vez) · Tormento (puxa 15 e deixa vulnerável: +60% de dano por 2,5 s) |
| Demônio | Infernal | Área pesada | Bola de fogo 22 a cada 2,4 s, área raio 40 com 80%; 40 ouro, 110 ✦ | Senhor do Abismo (raio 60 com 90%) · Berserker (+5% de dano por abate na onda, máx. +100%) |
| Anjo | Querubim | Ricochete | Cadeia: 2 saltos, raio 70, 85% (voa); 25 ouro, 80 ✦ | Serafim (4 saltos, 90%) · Arauto (marca: +20% de dano recebido por 3 s) |
| Anjo | Valquíria | Caçadora de fortes | Mira no mais forte ao alcance (chefes e elites primeiro); dano 14 a cada 1,1 s; 35 ouro, 100 ✦ | Matadora de Reis (+60% contra elites e chefes) · Lança Celeste (lança que atravessa em linha) |
| Anjo | Guardião | Suporte (proteção) | Aura raio 80: criaturas imunes a teia e atordoamento (voa); 30 ouro, 90 ✦ | Égide Celeste (raio 100, +12% dano) · Juiz (inimigos na aura sofrem 10/s) |
<!-- f10-rows -->

**Heróis novos:**
- **Rainha Fada** (Fada, 240 ✦): vida 85, vel. 130; pó mágico 7 a cada 0,45 s, alcance 95; Pulso **Bênção Feérica**: 15 de dano (raio 90) e todas as criaturas +50% de vel. de ataque por 5 s (recarga 14 s); bônus: Fadas +12% de alcance.
- **Colosso** (Golem, 260 ✦): vida 220, vel. 85; esmaga em leque 12 a cada 0,9 s, alcance 45; Pulso **Terremoto**: 25 de dano (raio 100) e atordoa 1,8 s (recarga 13 s); bônus: Golems +12% de dano.
- **Senhor dos Mortos** (Necromante, 260 ✦): vida 110, vel. 110; foice em leque 9 a cada 0,6 s, alcance 55; Pulso **Erguer Mortos**: 10 de dano (raio 80) e 3 esqueletos aliados por 8 s (recarga 14 s); bônus: Necromantes +12% de vel. de ataque.
- **Rainha Górgona** (Górgona, 260 ✦): vida 100, vel. 115; lança-serpente 9 a cada 0,55 s, alcance 85; Pulso **Olhar Fatal**: 20 de dano em leque (alcance 140, ±0,5 rad) e petrifica 2,2 s (recarga 13 s); bônus: efeitos das Górgonas +1 s.
- **Arquidemônio** (Demônio, 280 ✦): vida 130, vel. 120; chamas em leque 9 a cada 0,55 s, alcance 60; Pulso **Pacto**: 90 de dano (raio 110), custa 30% da vida do herói (recarga 12 s); bônus: Demônios +10% de chance de crítico.
- **Arcanjo** (Anjo, 280 ✦): vida 120, vel. 125; espada de luz 11 a cada 0,5 s, alcance 60; Pulso **Juízo**: raio sagrado em linha de 220 (largura 22), 70 de dano (recarga 12 s); bônus: Anjos +25% de dano contra elites e chefes.
<!-- f10-heroes -->

**Efeitos de golpe** `FEITO` (combináveis, reaproveitados pelas raças novas): dano contínuo, atordoar/raízes/petrificar, medo/confusão, marca (+dano recebido, pode explodir), vulnerável, corrosão de armadura, enfraquecer (lento e menos dano ao Nexus), puxar, possuir (aliado temporário), executar, +dano contra fortes, acúmulo por abate (velocidade ou dano), roubar ouro, ouro ao abater, erguer esqueleto aliado. Padrões de ataque novos: **bênção** (aura de dano/alcance/velocidade/crítico/proteção), **golpe em área ao redor de si** e **raio que atravessa em linha**.

**Depois** `PROPOSTA`: Fada (Encantadora: aura de dano/alcance; Travessa: confunde inimigos), Golem, Necromante, Medusa. Banco de 24 ideias antigas: v0.4.

## 5. Inimigos
Cada tipo cria um problema novo, não só mais vida.
- **Zumbi** (básico): às vezes vem em bando de 3. `FEITO`
- **Morcego** (rápido): voa em zigue-zague. `FEITO`
- **Ogro** (tanque): armadura que reduz dano por golpe, punindo dano fraco. `FEITO`
- **Esqueleto Arqueiro** (a distância): atira no herói, avançando devagar enquanto mira. `FEITO`
- **Lodo** (divisão): ao morrer, vira 2 Lodinhos. `FEITO`
- **Aranha** (anti-criatura): teia na criatura mais próxima, que ataca 50% mais devagar. `FEITO`
- **Gárgula** (voadora blindada): voa rápido e pousa como pedra, parada e com armadura extra. `FEITO`
- **Cavaleiro Sem Cabeça** (investida): de tempos em tempos corre muito mais rápido. `FEITO`
- **Banshee Sombria** (curandeira): cura os inimigos ao redor. `FEITO`
- **Necromante** (invocador): ergue zumbis enquanto caminha. `FEITO`
- **Chefes** `FEITO`: **Rei Ogro** (onda 7) pisa e atordoa criaturas próximas · **Rainha Aranha** (onda 14, `PROPOSTA`: o plano não definia o chefe do meio) prende até 3 criaturas na teia e choca aranhas · **Lich** (onda 20, final) atira no herói, invoca esqueletos, se protege com escudo e enfurece abaixo de 50% da vida.
- **Fase 2 · Pântano** `FEITO` (F13a; rende Fragmentos — F13b): **Sapo-Boi** (salta por cima de bloqueios) · **Sanguessuga** (bando; cada golpe a cura) · **Bruxa do Brejo** (praga: a criatura mais próxima ataca 40% mais devagar) · **Crocodilo** (blindado; submerso e intocável na lama) · **Fogo-fátuo** (isca: as criaturas atiram nele primeiro). Chefes: **Rei Sapo** (7: salta e engole uma criatura até levar 12% da vida em dano), **Crocodilo Ancião** (14: mergulha e reaparece a 130 do Nexus em investida), **Hidra** (20: cada cabeça é uma barra de vida; cabeças cortadas renascem em dobro após 10 s, até 5; cospe ácido por cabeça). Regra de mapa: 4 poças de lama (criaturas nelas −25% de velocidade de ataque; herói −40% de velocidade).
- **Elites** `FEITO`: a partir da onda 8, inimigos comuns podem vir como elite (brilho dourado, maiores, mais fortes e rendem mais).
- **Escalonamento** `FEITO`: a cada onda, mais vida, velocidade e dano (seção 9).
- **Códex** `FEITO` no menu: ficha de cada inimigo (atributos, habilidades, onda em que aparece); os ainda não enfrentados ficam em silhueta.
- Estados `FEITO`: lento, segurado (Guarda), envenenado, com medo (foge do Nexus), empurrado. Chefes não são segurados, empurrados nem assustados. Criaturas podem ficar presas na teia (atacam devagar) ou atordoadas (não atacam).

## 6. Economia e progressão
**Na run** `FEITO`
- Ouro: invoca criaturas; vem de abates e de renda passiva. Custo progressivo por cópia da mesma classe.
- Limite de criaturas em campo. **Evolução** com ouro (níveis 1–3), com custo proporcional ao que **aquela cópia** custou para invocar (a 2ª cópia, mais cara, também evolui mais caro). **Vender** devolve 60% de tudo que foi pago.
- **Nexus upável** `FEITO`: clicar no Nexus (ou tecla N, ou o botão "Melhorar o Nexus") abre o quadro com 5 melhorias pagas em ouro, que valem só para a run: Vitalidade (vida máxima), Muralha (menos dano recebido), Raio do Nexus (ataque automático), Escudo (ao levar um golpe com o escudo pronto, fica imune por alguns segundos) e Campo de Lentidão (inimigos perto do Nexus andam devagar).
- **Loot** `FEITO`: inimigos podem soltar **moedas** e **baús** no chão; o herói coleta passando por cima. Chefes sempre soltam baú. O baú abre uma escolha de 1 entre 3 melhorias **Raras ou melhores** (o jogo pausa). O loot some depois de 12 s de onda e continua no chão entre as ondas (não é recolhido sozinho). Melhoria do herói **Ímã** aumenta o raio de coleta.
- Entre ondas: 1 entre 3 melhorias temporárias **com raridade** (comum 60% / incomum 30% / rara 10%) + **loja** (sortear de novo, +1 vaga).
- **Run salva** automaticamente a cada onda vencida e ao fechar a aba; pausa com "Salvar e sair" e "Abandonar run"; menu com "Continuar run".

**Permanente** `FEITO`
- **Essência** ganha ao fim de toda run (mesmo perdendo).
- **Árvore de talentos** em 6 ramos (Nexus, Nexus+, Ouro, Exército, Herói, Essência), cada um uma **cadeia vertical**: cada nó exige um nível mínimo no de cima. Cor e ícone por ramo; a linha entre os nós acende quando o requisito é cumprido.
- **Coleção** de criaturas e **heróis**, comprados com Essência; **equipe** de 6.
- **Conquistas** (estatísticas de todas as runs) liberam **skins** dos heróis.
- Salvamento local no navegador (chave `nx4`, migra saves antigos) e **exportar/importar** o progresso em arquivo JSON nas Configurações.
- `TBD` nível permanente de criatura (fragmentos).

## 7. Controles e interface (`FEITO`)
Tela de entrada "Clique para começar" (libera o áudio). Menu principal: Continuar run (se houver), Jogar, Herói, Equipe, Coleção, Talentos, Conquistas, Códex, Configurações. **Tutorial guiado** na primeira run (7 passos; pular a qualquer momento; rever nas Configurações).
Na run: mover o herói com WASD/setas ou clicar/segurar no chão. Invocar: arrastar a carta do painel até a arena, ou tecla 1–6 (ordem da equipe) e clicar (prévia mostra alcance; vermelha se não pode). Evoluir/vender: clicar na criatura e nos botões (ou tecla E). Pulso: Espaço ou botão (mostra o nome do Pulso do herói). Cancelar: botão direito ou Esc. Pausa: P, Esc ou botão. Velocidade 1x/2x/4x: botão ou F. Alcance do herói sempre visível (destacado com Shift ou mouse sobre ele). ⚙ abre as Configurações (volumes, silenciar, números de dano, rever tutorial, exportar/importar, apagar progresso).
Cartas verdes quando dá para invocar e vermelhas sem ouro ou sem vaga (não deixa escolher). Criatura selecionada: quadro sobre ela na arena (atributos, habilidade, evolução com "atual → depois", as duas vertentes lado a lado no nível 2 com prévia do alcance ao passar o mouse, venda com confirmação) e o mesmo resumo no painel lateral; seta ⇧ sobre criaturas que podem evoluir.
Painel lateral com retrato, custo, atalho e tooltip (descrição, atributos, habilidade, forma evoluída e bônus do herói). Coleção com ficha de cada criatura (descrição, lore, atributos, forma evoluída).

## 8. Modos
**Run normal:** 20 ondas, chefes nas ondas 7, 14 e 20. **Sem Fim** `FEITO`: depois da vitória, a mesma run pode seguir; as ondas continuam escalando, com um chefe a cada 5 ondas (Rei Ogro → Rainha Aranha → Lich, em rodízio). A vitória e a Essência das 20 ondas são pagas na hora; a Essência das ondas extras vem quando o Nexus cair. O perfil guarda a onda mais alta. **Fases** (`PROPOSTA`, ver roadmap F12–F16): a run atual vira a Fase 1 (Cemitério); cada fase nova traz bioma, inimigos, chefes e uma regra de mapa, e destrava uma mecânica para o jogo todo (Fragmentos, Sinergias, Relíquias, Ascensão e Desafio diário). Ascensão vem depois das fases.

## 9. Valores atuais do protótipo
Todos `PROPOSTA` até o playtest. **Os números exatos ficam em [`docs/valores.md`](valores.md)**, gerado a partir de `src/data` com `npm run docs:values` (criaturas, vertentes, heróis, Pulsos, inimigos, ondas, talentos, Nexus, loot, XP). Esta seção guarda as regras e a calibragem.

**Regras de cálculo**
- Custo de invocar: base × 1,5^(cópias da mesma classe em campo). Evoluir: 1,5× (nível 2) e 3× (nível 3) o custo daquela cópia; vender devolve 60% do pago.
- Dano por golpe contra armadura = `max(1, dano − armadura)`; veneno, poças e auras que ferem ignoram armadura. Marca e vulnerável multiplicam o dano de todas as fontes.
- Melhorias da run: % somam dentro da categoria (com os talentos); categorias diferentes multiplicam.
- Inimigos que chegam ao Nexus **param e golpeiam até morrer** (dano por golpe a cada 2 s; chefes a cada 2,5 s). Égide, Escudo e Muralha valem para cada golpe.
- Força dos inimigos por onda (o = onda − 1): vida × (1 + 0,18·o + 0,023·o²); velocidade +2%/onda (máx. +40%); dano +6%/onda. Quantidade = 4 + 3 × onda.
- Sem Fim: além disso, por onda depois da 20, vida ×1,08 e dano ×1,05 (exponencial) e elites até 35%.
- XP do herói para o próximo nível: 15 + 12·(n − 1) + 3·(n − 1)² (≈ nível 14–15 numa vitória; Sem Fim vai além).
- Dano do Pulso: × (1 + 0,1 × (nível do herói − 1)), além dos talentos e melhorias do herói. Pulsos que curam, curam o **herói** (nunca o Nexus).
- **Pulsos com personalidade** (`docs/arquivo/proposta-pulsos.md`): Carga Heroica (Cavaleiro), Revoada que caça (Vampiro), Lança-Chamas contínuo (Draconato), Fúria Lunar (Licantropo vira lobisomem gigante), Travessia que desliza (Espectro), Feitiço do Sapo (Bruxa), Bênção Feérica (Fada), Fenda Sísmica (Colosso), Erguer Mortos dos caídos (Senhor dos Mortos), Olhar Fatal (Górgona; petrificados se despedaçam), Chuva de Meteoros (Arquidemônio), Juízo Celestial (Arcanjo). Pulsos direcionais miram no mouse ou no WASD.

**Calibragem de 07/10/2026** (simulação real, 30 runs por equipe; bot que invoca, evolui escolhendo vertentes ao acaso, compra vagas e Nexus, abre baús, busca loot e usa o Pulso; cada raça com o Arqueiro + suas 3 classes e o próprio herói). Talentos comprados do mais barato para o mais caro:

| Talentos | Vitórias (média das 12 raças + time misto) | Leitura |
|---|---|---|
| Nenhum | ~27% | primeira run difícil; perder rende Essência |
| ~1.000 ✦ (≈ 8 runs) | ~44% | |
| ~2.500 ✦ (≈ 20 runs) | ~65% | |
| Árvore completa (7.255 ✦) | ~88% | |

Depois dos Pulsos novos (mesma média: ~25% sem talentos, ~68% com 2.500 ✦): Bruxa, Fantasma, Lobisomem e Fada no topo (~85–95% com 2.500 ✦); Necromante, Humano e Anjo embaixo (~35–45%). Revisar com playtest real: o bot não posiciona criaturas nem move o herói como um jogador.

**Calibragem com o novo motor** (07/10/2026, 30 runs por equipe, bot posiciona em volta do Nexus): Cemitério ~72% de vitórias com 2.500 ✦ e ~93% com a árvore completa; Pântano ~37% e ~69%. Necromante e Humano embaixo na Fase 1; Fantasma muito fraco no Pântano (4/30 com a árvore completa) — ajustar no playtest/raças. Tundra: ~29% com 2.500 ✦ e ~61% com a árvore completa; raças de fogo e à distância vão bem, Lobisomem e Fantasma sofrem (gelo + congelamento).

## 10. Monetização (adiada)
Nada por enquanto. Direção de 07/10/2026: demo grátis na web; versão paga na Steam só quando houver bem mais conteúdo (fases), com DLCs de conteúdo e cosméticos. Sem moeda paga, sem gacha pago (save local editável; ECA Digital e lojas restringem caixas de recompensa). Gacha só com moeda do jogo e só cosmético (Altar de Variantes, `PROPOSTA` no roadmap).

## 11. Riscos
Escopo grande (4 gêneros) · explosão de conteúdo (raças × classes × heróis) · combinações demais para balancear "no feeling" (usar simulação) · humanos obsoletos após as criaturas · herói roubando o protagonismo · posição irrelevante · power creep da Essência.

## 12. Registro de decisões e pendências

| Data | Decisão |
|---|---|
| 05/10/2026 | Mobile primeiro; protótipo web; jogo final TBD |
| 05/10/2026 | Início como Humano; criaturas por ovos; Raça → Classe; variantes adiadas |
| 05/10/2026 | Herói jogável; referência Kingdom Rush |
| 05/10/2026 | Direção gótico sombrio; sprites vetoriais; áudio sintetizado |
| 05/10/2026 | Essência (meta-progressão), chefe na onda 10, venda a 60% |
| 05/10/2026 | Código reescrito do zero em TypeScript modular (dados · simulação · render · entrada · UI · áudio · save) |
| 05/10/2026 | Plataforma: navegador no computador (paisagem 16:9, mouse e teclado); celular fora do escopo |
| 05/10/2026 | A run começa com a escolha de 1 entre 3 ovos de criatura mística (substituída abaixo) |
| 05/10/2026 | Visual vetorial caprichado (chibi, contorno, animações) e interface gótica com fontes do Google Fonts |
| 05/10/2026 | Ouro tem uso: evolução de criaturas na run (níveis 1–3, forma evoluída) e loja entre ondas (sortear de novo, +1 vaga) |
| 05/10/2026 | Guarda = bloqueio de até 2 inimigos (chefes passam); Sanguinário = abates curam o Nexus |
| 05/10/2026 | Herói começa Humano; outras raças de herói desbloqueáveis com Essência |
| 05/10/2026 | Próximas raças: Lobisomem, Fantasma e Bruxa |
| 05/10/2026 | Myth TD como referência de meta-progressão (plano em `docs/arquivo/plano-v0.9.md`) |
| 05/10/2026 | Equipe de até 6 criaturas da coleção, toda disponível desde a onda 1; **ovos removidos**; primeiro companheiro místico grátis |
| 05/10/2026 | Um herói jogável por raça; skins dos heróis liberadas por conquistas |
| 05/10/2026 | Moeda permanente única: Essência (talentos, criaturas, heróis) |
| 05/10/2026 | Árvore de talentos em 5 ramos substitui as melhorias permanentes |
| 05/10/2026 | Música procedural gótica (menu, run, chefe); volumes de música e efeitos independentes; exportar/importar save |
| 05/10/2026 | Lobisomem, Fantasma e Bruxa implementados (2 classes + herói cada) |
| 06/10/2026 | Melhorias 2.0: famílias com tiers (Comum → Lendária), chance de tier alto crescendo na run, % somando por categoria, crítico e sinergias de raça |
| 06/10/2026 | Melhorias da run com raridade; run salva com continuar; tutorial guiado; velocidade 1x/2x/4x |
| 06/10/2026 | Herói vivo: vida, dano de contato, renascimento em 8 s, XP por abate e melhorias só do herói a cada nível; conquista "Sem Torres" |
| 06/10/2026 | Run de 20 ondas com chefes nas ondas 7 (Rei Ogro), 14 (Rainha Aranha) e 20 (Lich); escalonamento de vida, velocidade e dano; elites; 7 inimigos novos com habilidades; códex; modo Sem Fim; curva de XP do herói mais íngreme |
| 06/10/2026 | Ouro com destino: evolução proporcional ao custo da cópia, Nexus upável (Vitalidade, Muralha, Raio, Escudo, Campo de Lentidão), moedas e baús no chão coletados pelo herói, melhoria Ímã; vida dos inimigos sobe mais rápido para compensar |
| 06/10/2026 | Talentos 2.0: ramos em cadeia vertical com cor e ícone; ramo Nexus+ (desconto e habilidades do Nexus desde o início); Herói ganha Vigor, Renascer e Sabedoria |
| 06/10/2026 | Vertentes de evolução: no nível 3 o jogador escolhe entre duas formas evoluídas por criatura (novas habilidades: crítico, atordoar, pavor, poça dourada) |
| 06/10/2026 | Próximas etapas: terceira classe das raças atuais, equipe de 8 e 12 raças novas com 3 classes + herói cada (Necromante, Golem, Fada, Górgona, Demônios, Anjos, Zumbis, Unicórnio, Sereia, Centauro, Goblin, Elementais) |
| 07/10/2026 | F9: terceira classe de cada raça (Clériga, Enxame, Tempestade, Uivador, Possessor, Herbalista), sem cura do Nexus; sistema de efeitos de golpe; equipe de 8 |
| 07/10/2026 | F10: raça Fada (3 classes com vertentes + herói) |
| 07/10/2026 | F10: raça Golem (3 classes com vertentes + herói) |
| 07/10/2026 | F10: raça Necromante (3 classes com vertentes + herói) |
| 07/10/2026 | F10: raça Górgona (3 classes com vertentes + herói) |
| 07/10/2026 | F10: raça Demônio (3 classes com vertentes + herói) |
| 07/10/2026 | F10: raça Anjo (3 classes com vertentes + herói) |
| 07/10/2026 | Bônus de alcance (Olhar Aguçado e talento Olhos Atentos) passam a valer também para o herói, somando com a melhoria Alcance do herói |
| 07/10/2026 | Melhorias do herói mostram o total acumulado (carta "Agora → depois", "Seu herói agora", "Seus bônus" entre ondas); tooltip do Pulso mostra dano, área e recarga atuais da run |
| 07/10/2026 | Desempenho: brilho (shadowBlur) e filtros dos personagens aplicados uma vez por sprite (camada), olhos brilhantes com halo pré-desenhado; com ~70 inimigos o quadro caiu de ~57 ms para ~32 ms no teste. Coleção: desbloquear pede confirmação mostrando a Essência que sobra e redesenha no mesmo lugar, com a criatura liberada em destaque |
| 07/10/2026 | Grito da Banshee: cada inimigo só é empurrado/assustado de novo após um tempo (base 2 s, Ancestral 2,5 s, Arauto do Pavor 3,5 s; o dano continua), evitando prender o mesmo inimigo para sempre. HUD: contador de inimigos da onda (restantes/total); ficha do herói (passar o mouse no chip do herói e na pausa). Fora da run, o topo mostra o perfil (Essência, melhor onda, coleção, heróis, vitórias) e esconde HUD, painel, pausa e velocidade. Heróis: compra pede confirmação. Ataque do Enxame com morcegos visíveis e mordida |
| 07/10/2026 | Documentação unificada (GDD + roadmap + checklist + valores; antigos em `docs/arquivo/`). Direção: fases novas antes da Ascensão, cada fase destrava uma mecânica para o jogo todo; Fragmentos a partir de uma fase intermediária; Steam só com mais conteúdo; sem gacha pago |
| 07/10/2026 | Nome do jogo: **Nexus TD**. F12: estrutura de fases (`src/data/stages.ts`: bioma, composição, chefes, chefes do Sem Fim, força base, fase exigida); a run atual é a Fase 1 — Cemitério; menu com escolha de fase e tela de fases (recorde e vitórias por fase). Perfil ganha `selectedStage` e `stageRecords` (a Fase 1 herda vitórias e recorde antigos). Cada fase nova: 20 ondas e 3 chefes novos |
| 07/10/2026 | F13a: **Fase 2 · Pântano** (liberada ao vencer a Fase 1): 5 inimigos e 3 chefes novos, lama como regra de mapa, Essência ×1,25; habilidades novas de inimigo (salto, suga, praga, submerso, isca, engolir, mergulho, cabeças). Calibrada com o bot (ver seção 9). Altar de Variantes em revisão (preço e garantia a repensar; garantia só a cada X sorteios) |
| 07/10/2026 | F13b: **Fragmentos de raça** (❖) caem só em fases que os dão (a partir da Fase 2): ondas vencidas + 4 por chefe, repartidos pelas raças conforme as criaturas invocadas na run. **Santuário** (menu, aparece com a Fase 2 liberada): nível permanente por criatura, 1 a 5, custos 10/20/35/55/80 Fragmentos da raça; +4% de dano e +2% de velocidade de ataque por nível; compra com confirmação |
| 07/10/2026 | F13c: **Altar de Variantes** (liberado ao vencer a Fase 2): sorteio de 600 ✦; prêmios 200 ✦ de volta (32%), 12 Fragmentos (32%), variante Rara (26%), Épica (8,5%), Lendária (1,5%); garantia de Épica a cada 20 e de Lendária a cada 60 sorteios; variantes só visuais (escolhidas na Coleção), repetidas viram Fragmentos |
| 07/10/2026 | HUD com legendas: rótulo em cada chip, valores por extenso ("9 de 13") e vida/XP do herói com números (quanto falta para o próximo nível) |
| 07/10/2026 | F13.5a: **equipes salvas** — cada uma guarda herói + 8 criaturas e um nome; 3 grátis, 4ª e 5ª por 300 ✦ (com confirmação); troca na tela de Equipes e no menu; mudar equipe/herói grava na equipe ativa. Próximo: skins do Nexus (modelo + cor, padrão "do mapa", obtidas por fase, Essência, conquistas e Altar) |
| 07/10/2026 | F13.5b: **skins do Nexus** — modelo (Cristal Rúnico; Lótus Ancestral ao vencer o Pântano) + cor (Rubi/Esmeralda/Safira por 400 ✦; Prata Lunar, Sangue, Ouro Real e Obsidiana por conquista; Vazio e Aurora no Altar, 20% das Épicas/Lendárias). Padrão "do mapa". **Biomas revistos**: Fases 3–5 = Tundra Gelada → Deserto Dourado → Cidadela Celeste (do escuro para a luz) |
| 07/10/2026 | Skins do Nexus passam a ser **por fase** (cada fase guarda seu modelo e cor; save antigo aplica a escolha a todas). Aprovados: **motor de mapas inteiro antes da Tundra** (mundo maior com câmera, trilhas/entradas, roteiro de ondas por dados, objetos interativos, objetivos variados como escolta e dois Nexus); Tundra com 18 ondas; Cemitério e Pântano revistos depois |
| 07/10/2026 | **Motor de mapas** (F13.9) pronto: mundo maior que a tela com câmera e minimapa, entradas com trilhas, roteiro de ondas por fase (tipos e tréguas), fogueiras e nevasca, pontos extras a defender e escolta. Fases atuais inalteradas (bot confere) |
| 07/10/2026 | Nenhuma criatura cura o Nexus: Sanguinário (e Lorde de Sangue) e o bônus de raça do Nobre Vampiro passam a curar o **herói** por abate. Sinergias de raça aprovadas com números reduzidos (roadmap, F14) |
| 07/10/2026 | **Cemitério e Pântano no novo motor**: Cemitério murado 960×540 com 4 portões e alamedas (voadores pulam o muro), roteiro de 20 ondas (Revoada, Rei Ogro, Noite dos Mortos, Trégua, Cavaleiros, Rainha Aranha, Ninhada, Guarda do Lich, Lich); Pântano 1280×540 cortado por um rio (crocodilos e chefes vêm pelo rio, o resto pelas margens), lama no rio e nas trilhas, roteiro com Enxame de Sanguessugas, Rei Sapo, Trégua, Revoada de Fogos-fátuos, Crocodilo Ancião, Coro dos Sapos e Hidra. Recalibrado: força Cemitério 0,75× vida / 0,85× dano, Pântano 0,9× vida; Hidra 250 por cabeça |
| 07/10/2026 | **Interface 2.0**: run em tela cheia com HUD sobreposto (referência: Soulstone Survivors) — Nexus e melhorias no canto superior esquerdo, herói/criaturas/Pulso na barra inferior; menus como páginas cheias, com abas, sem caixa com rolagem |
| 07/10/2026 | **Fase 3 · Tundra Gelada** (F14a/b; liberada ao vencer o Pântano): cenário claro com lago congelado 1280×720, ilha do Nexus (Pináculo Glacial) e 3 passagens; gelo — inimigos deslizam (×1,3, não podem ser segurados) e o gelo racha onde muitos passam (buraco 18 s; quem cai morre, chefes não); nevasca a cada 60 s (alcance −30% longe das 3 fogueiras, que o herói reacende); fogo vs. gelo (+25% e corta a regeneração); 5 inimigos (Lobo Gélido, Golem de Neve, Espírito do Gelo, Troll da Geleira, Kobold Escavador) e 2 chefes (Yeti Ancião, Wyrm de Gelo); 18 ondas com Matilha, Avalanche, Trégua, Gigantes, Nevasca Eterna e Grande Matilha. Força 1,1× de vida, Essência ×1,5. Aviso de Pulso pronto; câmera volta a seguir o herói; vender com V |
| 07/10/2026 | F14c: **Sinergias de raça** (destravadas quando a Tundra é liberada, valem em todas as fases): 2 classes diferentes da raça em campo = nível 1, 3 classes = nível 2; valores em `src/data/synergies.ts` (tabela do roadmap); faixa no HUD com o nível e o próximo; aviso "Sinergia: Raça". Tundra com sinergias: ~25% com 2.500 ✦, ~72% com a árvore completa |
| 07/10/2026 | Desempenho: aliados, clarão de golpe, pedra e cadáveres usam tinta na camada do sprite em vez de filtro do canvas (quadro estável com 140+ inimigos e esqueletos). Esqueletos aliados: no máximo 12; abates feitos por aliados não erguem outros pela sinergia. Senhor dos Mortos mostra os corpos que vai erguer (caveirinhas e contador no Pulso) e o esqueleto sobe da terra. Invocar: clique na carta só escolhe; posiciona com novo clique na arena ou soltando o arrasto sobre a arena |
| 07/10/2026 | Configurações › Desempenho: **Qualidade gráfica** (Automática — padrão, ajusta a resolução da arena pelo FPS —, Alta, Média ≤1600 px, Baixa ≤1100 px) e **Mostrar FPS**; retratos das cartas a ~15 fps; vinheta em cache |
| 07/10/2026 | **Câmera sempre no herói** (sem zona morta e sem rolagem pela borda; minimapa só mostra). Tela de **Fases em carrossel** com miniatura do mapa, vitórias e melhor onda por fase (sem lista de chefes); topo do menu sem Fragmentos e Melhor onda; abas de Heróis com retrato. **Fenda Sísmica** do Colosso com visual maior (só visual; números iguais) |
| 07/10/2026 | **Tutorial por fase** (quadro de mecânicas na primeira run de cada fase e na pausa; perfil guarda `seenStageIntros`). **Escudo ao nascer**: herói invulnerável por 3 s no início e ao renascer. **Ímã**: moedas e baús a até 40 voam até o herói (coleta continua a 16); o upgrade Ímã aumenta o raio do ímã. Painel do Nexus não refaz o HTML a cada quadro (cliques de compra se perdiam). Variantes do Altar também nos retratos das formas evoluídas e nas cartas da run. Desempenho: brilhos de elite/lento/fúria/variante e clarão de golpe com halo em cache em vez de camada com shadowBlur/tinta |
| 07/10/2026 | Arqueira da Górgona vira Domadora de Serpentes (evita dois arqueiros; mesma função e vertentes); jogo pausa sozinho ao perder o foco no meio de uma onda |
| 07/10/2026 | Inimigos param no Nexus e golpeiam até morrer; velocidade 0x (tempo parado sem pausa, tecla 0); melhorias de Pulso no nível do herói (Pulso Ampliado, Eco do Pulso); melhoria da run Sabedoria (+XP); animação de ataque para todos os inimigos; recalibrado |
| 07/10/2026 | Heróis do F10 com 3 skins cada: vencer com o herói libera a 2ª; alcançar a onda 30 do Sem Fim com ele libera a 3ª (12 conquistas novas) |
| 07/10/2026 | Pulsos refeitos com personalidade (12 tipos); ataque do Nobre Vampiro cura o herói; ajuste de raças (Golem, Demônio, Necromante +; Fantasma, Bruxa, Fada −) |
| 07/10/2026 | Pulsos: dano cresce +10% por nível do herói; a Revoada do Vampiro cura o herói em vez do Nexus |
| 07/10/2026 | Recalibragem completa: talentos bem mais fracos (Nexus+ e Legião mais caros), inimigos mais fortes e numerosos, Sem Fim com escalada exponencial, XP do herói mais lenta, raças aproximadas; valores exatos em `docs/valores.md` (gerado) |
| 06/10/2026 | Plano v1.0: herói com XP, vida e renascimento; run de 20 ondas com 3 chefes, escalonamento, inimigos com habilidades e modo Sem Fim; ouro para loot, Nexus upável e evolução progressiva (a implementar) |

**Em aberto:** passivas de raça além do bônus do herói · duração real da run · nível permanente (fragmentos) · variantes · tags/sinergias · estágios e modos · arte e música finais · engine final.

## 13. Próximos passos
Ver [roadmap.md](roadmap.md).
