# Nexus — GDD v0.9

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
**Run:** onda 1 → posicionar criaturas da equipe (pagando ouro) e mover o herói → onda vencida → escolha de 1 entre 3 **melhorias** (+ **loja**) → próxima onda → chefe na onda 10 → vitória/derrota → **Essência** e conquistas → menu.

**Herói** `FEITO`: mover por WASD/setas ou clique; ataca sozinho; habilidade **Pulso** com recarga. **Um herói por raça** `FEITO`: o Cavaleiro (Humano) é o inicial; os outros são desbloqueados com Essência. Cada herói tem ataque e Pulso próprios e um **bônus para as criaturas da mesma raça** (seção 9). **Skins** `FEITO`: só cosméticas, liberadas por conquistas.

## 4. Raças e classes
**Estrutura** `DECIDIDO`: `Raça` → `Classe` → `Nível`. Nível permanente (duplicatas/fragmentos): `TBD`. Variantes (comum/rara com trait): **adiadas** (`TBD`).
**Evolução na run** `FEITO`: criaturas em campo evoluem com ouro do nível 1 ao 3; no nível 3 viram uma **forma evoluída** com nome, visual e habilidade turbinada.
**Coleção e equipe** `FEITO`: o Arqueiro vem na coleção; as outras criaturas são compradas com Essência. Quem ainda não tem nenhuma criatura mística ganha **uma de presente** (escolha única). A **equipe** tem até 6 criaturas; só ela aparece na run, **toda disponível desde a onda 1** (paga-se o ouro para invocar). **Ovos removidos.**
Gacha com dinheiro real: ver seção 10.
**Tags** (`HUMANO`, `SANGUE`, `FOGO`, `GELO`, `CONTROLE`...) `TBD` como sistema de sinergia.

**Roster** (12 `FEITO`):

| Raça | Classe | Papel | Mecânica | Forma evoluída (nível 3) |
|---|---|---|---|---|
| Humano | Arqueiro | DPS à distância | Alvo único, alcance alto | Patrulheiro: multi-tiro (2 alvos) |
| Humano | Guarda | Bloqueio | Segura até 2 inimigos (chefes passam) | Paladino: segura 4 |
| Vampiro | Duelista | DPS alvo único | Frenesi após 6 golpes | Conde Vampiro: frenesi a cada 4, mais longo e forte |
| Vampiro | Sanguinário | Sustento | Abates desta criatura curam o Nexus | Lorde de Sangue: cura o dobro |
| Dragão | Fogo | Área | Golpe com dano em raio | Dragão Ancião: área maior e mais forte |
| Dragão | Gelo | Controle | Golpes deixam inimigos lentos | Dragão Glacial: lentidão mais forte e longa |
| Lobisomem | Caçador | Corpo a corpo em cadeia | O golpe salta para até 2 inimigos próximos | Caçador Lunar: 4 saltos |
| Lobisomem | Alfa | Suporte (aura) | Criaturas próximas atacam mais rápido | Líder da Matilha: aura maior e mais forte |
| Fantasma | Assombração | Anti-armadura | Ignora armadura | Espírito Vingativo: +50% contra blindados |
| Fantasma | Banshee | Controle (empurrão) | Grito em leque que fere e empurra | Banshee Ancestral: leque e empurrão maiores |
| Bruxa | Feiticeira | Dano contínuo | Veneno (dano por segundo) | Arquibruxa: veneno mais forte e longo |
| Bruxa | Caldeirão | Área no chão | Poça de dano por segundo | Caldeirão Infernal: poça maior e mais forte |

**Depois** `PROPOSTA`: Fada (Encantadora: aura de dano/alcance; Travessa: confunde inimigos), Golem, Necromante, Medusa. Banco de 24 ideias antigas: v0.4.

## 5. Inimigos
Cada tipo cria um problema novo, não só mais vida.
- **Zumbi** (básico): às vezes vem em bando de 3. `FEITO`
- **Morcego** (rápido): voa em zigue-zague. `FEITO`
- **Ogro** (tanque): armadura que reduz dano por golpe, punindo dano fraco. `FEITO`
- **Rei Ogro** (chefe, onda 10): muita vida e armadura, causa muito dano ao Nexus. `FEITO`
- Estados `FEITO`: lento, segurado (Guarda), envenenado, com medo (foge do Nexus), empurrado. Chefes não são segurados, empurrados nem assustados.
- `PROPOSTA` próximos: ranged, invocador, anti-criatura.

## 6. Economia e progressão
**Na run** `FEITO`
- Ouro: invoca criaturas; vem de abates e de renda passiva. Custo progressivo por cópia da mesma classe.
- Limite de criaturas em campo. **Evolução** com ouro (níveis 1–3). **Vender** devolve 60% de tudo que foi pago.
- Entre ondas: 1 entre 3 melhorias temporárias + **loja** (sortear de novo, +1 vaga).

**Permanente** `FEITO`
- **Essência** ganha ao fim de toda run (mesmo perdendo).
- **Árvore de talentos** em 5 ramos (Nexus, Ouro, Exército, Herói, Essência), com nós filhos que exigem nível no pai (modelo do Myth TD).
- **Coleção** de criaturas e **heróis**, comprados com Essência; **equipe** de 6.
- **Conquistas** (estatísticas de todas as runs) liberam **skins** dos heróis.
- Salvamento local no navegador (chave `nx4`, migra saves antigos) e **exportar/importar** o progresso em arquivo JSON nas Configurações.
- `TBD` nível permanente de criatura (fragmentos).

## 7. Controles e interface (`FEITO`)
Tela de entrada "Clique para começar" (libera o áudio). Menu principal: Jogar, Herói, Equipe, Coleção, Talentos, Conquistas, Configurações.
Na run: mover o herói com WASD/setas ou clicar/segurar no chão. Invocar: arrastar a carta do painel até a arena, ou tecla 1–6 (ordem da equipe) e clicar (prévia mostra alcance; vermelha se não pode). Evoluir/vender: clicar na criatura e nos botões (ou tecla E). Pulso: Espaço ou botão (mostra o nome do Pulso do herói). Cancelar: botão direito ou Esc. Pausa: P, Esc ou botão. ⚙ abre as Configurações (volumes, silenciar, exportar/importar).
Painel lateral com retrato, custo, atalho e tooltip (descrição, atributos, habilidade, forma evoluída e bônus do herói). Coleção com ficha de cada criatura (descrição, lore, atributos, forma evoluída).

## 8. Modos
**Campanha** (estágios) e **Endless**. Ambos **fora do MVP** (hoje existe 1 estágio de 10 ondas).

## 9. Valores atuais do protótipo
Todos `PROPOSTA` até o playtest. Balanceados por simulação (30 runs por equipe/herói, bot com o herói parado): equipes de todas as raças e todos os heróis ficam entre 23 e 26 vitórias em 30 com 4 criaturas.

**Nexus:** 100 de vida (+10 de cura entre ondas). **Ouro inicial:** 30. **Renda passiva:** +1 a cada 2 s. **Limite de criaturas:** 5.
**Custo:** base × 1,5^(cópias já posicionadas da classe). **Venda:** 60% de tudo que foi pago.

| Criatura | Custo base | Dano | Alcance | Recarga | Especial | Desbloqueio |
|---|---|---|---|---|---|---|
| Arqueiro | 15 | 7 | 120 | 0,7 s | — | inicial |
| Guarda | 20 | 5 | 45 | 0,8 s | Bloqueio: 2 inimigos, raio 30 | 30 ✦ |
| Duelista | 20 | 8 | 90 | 0,5 s | Frenesi: 6 golpes → 3 s, ×1,5 dano, 2× vel. | 40 ✦ |
| Sanguinário | 25 | 6 | 100 | 0,8 s | Abate cura 2 | 50 ✦ |
| Dragão Fogo | 30 | 14 | 110 | 1,4 s | Área raio 40, 60% | 80 ✦ |
| Dragão Gelo | 25 | 4 | 100 | 1,0 s | Lentidão 50% por 1,5 s | 80 ✦ |
| Caçador | 25 | 12 | 75 | 0,6 s | Cadeia: 2 saltos, raio 60, 80% por salto | 60 ✦ |
| Alfa | 30 | 10 | 65 | 0,6 s | Aura: raio 80, +25% vel. de ataque | 70 ✦ |
| Assombração | 25 | 8 | 100 | 0,7 s | Ignora armadura | 60 ✦ |
| Banshee | 30 | 5 | 80 | 1,2 s | Leque ±0,5 rad, empurra 22 | 70 ✦ |
| Feiticeira | 25 | 6 | 110 | 0,8 s | Veneno 11/s por 3 s | 60 ✦ |
| Caldeirão | 35 | 5 | 100 | 1,8 s | Poça raio 30, 16/s por 3 s | 80 ✦ |

Criaturas atacam o inimigo mais próximo do Nexus dentro do alcance.

**Evolução:** nível 2 custa 1,5 × custo base (+50% dano, +10% alcance); nível 3 custa 3 × custo base (+120% dano, +20% alcance) e troca a habilidade pela da forma evoluída: Patrulheiro multi-tiro 2 · Paladino bloqueia 4 (raio 36) · Conde Vampiro frenesi a cada 4 golpes, 4 s, ×1,8 · Lorde de Sangue cura 4 · Dragão Ancião área 60 com 80% · Dragão Glacial lentidão 65% por 2,5 s · Caçador Lunar 4 saltos (raio 65, 80%) · Líder da Matilha aura raio 100, +40% · Espírito Vingativo +50% contra blindados · Banshee Ancestral ±0,75 rad, empurra 34 · Arquibruxa veneno 16/s por 4 s · Caldeirão Infernal poça raio 40, 24/s por 4 s.
**Loja entre ondas:** sortear de novo custa 10 (+10 a cada uso na run); +1 vaga custa 60, dobrando a cada compra, até +3 vagas.

**Heróis**

| Herói | Raça | Vel. | Ataque | Pulso | Bônus de raça | Preço |
|---|---|---|---|---|---|---|
| Cavaleiro | Humano | 115 | 10 a cada 0,5 s, alcance 60 | Onda de Choque: 35, raio 95, 12 s | +10% de alcance | inicial |
| Nobre Vampiro | Vampiro | 125 | 8 a cada 0,45 s, alcance 55; cada golpe cura 0,5 | Revoada de Morcegos: 25, raio 100, 12 s; cura 1 por inimigo | abates curam 1 | 150 ✦ |
| Draconato | Dragão | 105 | 8 em leque a cada 0,65 s, alcance 55 | Rugido Flamejante: 30, raio 130, 13 s | +10% de dano | 200 ✦ |
| Licantropo | Lobisomem | 135 | 6 a cada 0,3 s, alcance 48 | Uivo: 15, raio 110, 12 s; medo 2 s | +15% vel. de ataque | 200 ✦ |
| Espectro | Fantasma | 120 | 11 a cada 0,5 s, alcance 75, ignora armadura | Travessia: investida de 200 (largura 26), 45, 10 s | ignoram 2 de armadura | 220 ✦ |
| Bruxa | Bruxa | 115 | 8 a cada 0,7 s, alcance 110 | Maldição: 10, raio 115, 12 s; veneno 8/s por 4 s | venenos e poças +1 s | 220 ✦ |

**Inimigos**

| Inimigo | Vida | Vel. | Dano ao Nexus | Ouro | Notas |
|---|---|---|---|---|---|
| Zumbi | 20 | 30 | 5 | 3 | 30% de chance de bando de 3 |
| Morcego | 12 | 62 | 3 | 2 | zigue-zague; a partir da onda 2 |
| Ogro | 90 | 18 | 15 | 8 | armadura 3; a partir da onda 4 |
| Rei Ogro | 450 | 13 | 40 | 30 | armadura 4; onda 10 |

Dano por golpe contra armadura = `max(1, dano − armadura)`; veneno e poças ignoram armadura. Vida de todo inimigo × (1 + 0,12 × onda).
**Arena:** 640 × 360 unidades (16:9), Nexus no centro.
**Ondas (1–10):** quantidade = 4 + 3 × onda; intervalo de spawn = máx(0,35 s; 1,2 − 0,07 × onda) s; inimigos surgem 24 unidades além da borda da tela.
**Melhorias temporárias:** +30% dano · +20% alcance · +25% vel. de ataque · +40 ouro · +30 vida do Nexus · Pulso 30% mais rápido.
**Essência por run:** (3 × onda alcançada + 1 por 5 abates + 30 se vencer) com os bônus de talento.

**Árvore de talentos** (custos em Essência por nível)

| Ramo | Nó (pré-requisito) | Níveis | Custo | Efeito por nível |
|---|---|---|---|---|
| Nexus | **Vitalidade do Nexus** | 5 | 20, 40, 60, 80, 100 | +15 de vida máxima |
| Nexus | Restauração (Vitalidade 2) | 3 | 40, 80, 120 | +5 de cura entre ondas |
| Nexus | Pulsar Vital (Restauração 1) | 2 | 100, 200 | +0,25 de vida/s |
| Nexus | Égide Rúnica (Vitalidade 5) | 1 | 250 | anula o 1º golpe de cada onda |
| Ouro | **Tesouro Inicial** | 5 | 15, 30, 45, 60, 75 | +10 de ouro inicial |
| Ouro | Fluxo Dourado (Tesouro 2) | 2 | 60, 120 | renda 0,25 s mais rápida |
| Ouro | Alquimia (Tesouro 3) | 3 | 50, 100, 150 | −10% no custo de evoluir |
| Ouro | Recompensa (Fluxo 1) | 2 | 100, 200 | +20% de ouro por abate |
| Exército | **Fúria do Exército** | 5 | 20, 40, 60, 80, 100 | +8% de dano |
| Exército | Prontidão (Fúria 2) | 3 | 60, 120, 180 | +6% vel. de ataque |
| Exército | Olhos Atentos (Fúria 2) | 3 | 60, 120, 180 | +6% de alcance |
| Exército | Legião (Prontidão 2) | 1 | 300 | +1 vaga de criatura |
| Herói | **Força do Herói** | 3 | 30, 60, 90 | +15% de dano do herói |
| Herói | Foco do Pulso (Força 1) | 3 | 50, 100, 150 | −10% na recarga do Pulso |
| Herói | Passos Leves (Força 1) | 2 | 40, 80 | +10% de velocidade |
| Herói | Pulso Amplo (Foco 2) | 1 | 200 | +20% de raio/alcance do Pulso |
| Essência | **Colheita de Almas** | 5 | 30, 60, 90, 120, 150 | +10% de Essência |
| Essência | Dízimo da Vitória (Colheita 2) | 2 | 80, 160 | +20 de Essência ao vencer |
| Essência | Veterano (Colheita 3) | 2 | 100, 200 | +1 de Essência por onda |

As 3 melhorias permanentes antigas viraram as raízes (mesmo nível): dano → Fúria do Exército, vida → Vitalidade do Nexus, ouro → Tesouro Inicial.

**Conquistas e skins**

| Conquista | Meta | Skin liberada |
|---|---|---|
| Primeira Vitória | vencer uma run | — |
| Juramento Cumprido | vencer com o Cavaleiro | Templário |
| Intocável | vencer sem o Nexus abaixo de 50% | Cavaleiro Negro |
| Noite Eterna | vencer com o Nobre Vampiro | Conde Carmesim |
| Exterminador | 1000 abates no total | Lua de Sangue (Vampiro) |
| Sangue de Dragão | vencer com o Draconato | Obsidiana |
| Ascensão | 3 criaturas evoluídas ao mesmo tempo | Escama Dourada (Draconato) |
| Lua Cheia | vencer com o Licantropo | Lobo Ártico |
| Colecionador | todas as criaturas na coleção | Lobo Sombrio (Licantropo) |
| Além do Véu | vencer com o Espectro | Fogo-Fátuo |
| Maratonista | 25 runs | Ceifador (Espectro) |
| Feitiço Perfeito | vencer com a Bruxa | Bruxa da Floresta |
| Campeão | 10 vitórias | Bruxa da Lua |

## 10. Monetização (adiada)
Nada no MVP. Opções futuras: venda direta, cosméticos (as skins já existem como base), passe de batalha, doação. Gacha pago exige checar regras (no Brasil, ECA Digital sobre caixas de recompensa, além das lojas). Evitar economia com troca entre jogadores.

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
| 05/10/2026 | Myth TD como referência de meta-progressão (plano em `docs/plano-v0.9.md`) |
| 05/10/2026 | Equipe de até 6 criaturas da coleção, toda disponível desde a onda 1; **ovos removidos**; primeiro companheiro místico grátis |
| 05/10/2026 | Um herói jogável por raça; skins dos heróis liberadas por conquistas |
| 05/10/2026 | Moeda permanente única: Essência (talentos, criaturas, heróis) |
| 05/10/2026 | Árvore de talentos em 5 ramos substitui as melhorias permanentes |
| 05/10/2026 | Música procedural gótica (menu, run, chefe); volumes de música e efeitos independentes; exportar/importar save |
| 05/10/2026 | Lobisomem, Fantasma e Bruxa implementados (2 classes + herói cada) |

**Em aberto:** passivas de raça além do bônus do herói · duração real da run · nível permanente (fragmentos) · variantes · tags/sinergias · estágios e modos · arte e música finais · engine final.

## 13. Próximos passos
1. Playtest com outras pessoas pelo GitHub Pages (ritmo, custos de talentos/criaturas/heróis, evolução, loja).
2. Extras inspirados no Myth TD (plano E11): tutorial guiado, velocidade 2x, salvar run em andamento, raridade nas melhorias, painel de bônus ativos, simulador oficial `npm run sim`.
3. Mais inimigos (ranged, invocador, anti-criatura) e segundo estágio.
4. Novas raças (Fada, Golem, Necromante, Medusa).
5. Só depois decidir engine final e arte.
