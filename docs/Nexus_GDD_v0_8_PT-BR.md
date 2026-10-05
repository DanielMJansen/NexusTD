# Nexus — GDD v0.8

**Status das decisões:** `DECIDIDO` · `PROPOSTA` (testar) · `TBD` (em aberto) · `FEITO` (implementado no protótipo)
**Regra:** nada vira `DECIDIDO` sem entrar no Registro de Decisões (seção 12). Valores numéricos estão na seção 9 e são ponto de partida de balanceamento, não verdade final.

---

## 1. Visão

**Nexus** é um jogo de **Tower Defense + Survivor + Roguelite + Coleção de Criaturas**. Hordas cercam um **Nexus central**. O jogador, um **herói humano**, o defende com criaturas místicas colecionáveis (vampiros, dragões, lobisomens, fantasmas...).

**Referência de estrutura:** Kingdom Rush (herói + torres + base que perde vida), mas com inimigos vindo de **todos os lados**.
**Fantasia:** "Sou um humano comum que vai montando um exército de monstros cada vez mais absurdo."

**Pilares**
1. **Pressão de todos os lados:** o Nexus é cercado; posição importa.
2. **Ação constante:** o jogador age (herói), não só observa.
3. **Raça e classe mudam o jogo:** cada uma muda como o jogador pensa a build.
4. **Coleção que abre opções:** progressão permanente amplia escolhas, não só multiplica atributos.

## 2. Plataforma, stack e direção de arte
- `DECIDIDO` **Navegador no computador**: paisagem 16:9, mouse e teclado. Celular fora do escopo por enquanto (substitui o antigo "mobile primeiro").
- `PROPOSTA` Run de 5–8 min.
- `DECIDIDO` Protótipo web em **TypeScript + Vite** (Canvas 2D), publicado via **GitHub Pages**. Jogo final: `TBD` (Godot 4 ou Unity/Steam são hipóteses; decidir após validar a diversão).
- `DECIDIDO` Direção de arte: **gótico sombrio** (roxos, neon, runas, lápides). `FEITO` sprites vetoriais desenhados em código, estilo chibi (cabeça grande, olhos expressivos, contorno), com animações de idle/ataque/caminhada; cenário de cemitério; interface gótica com fontes Cinzel e Crimson Pro (Google Fonts). Arte final: `TBD`.
- `FEITO` Áudio sintetizado (WebAudio), sem arquivos. Música e áudio final: `TBD`.

## 3. Loop da run
Menu (melhorias permanentes) → **escolha de 1 entre 3 ovos de criatura mística** → onda → posicionar criaturas e mover o herói → onda vencida → escolha de 1 entre 3 (melhoria ou ovo) → próxima onda → chefe na onda 10 → vitória/derrota → **Essência** → menu.

**Herói** `FEITO`: mover por WASD/setas ou clique; ataca sozinho o inimigo mais próximo; habilidade **Pulso** (dano em área ao redor dele, com recarga).
**Heróis de outras raças** `DECIDIDO` (a implementar): o herói começa Humano; outras raças de herói são desbloqueadas com Essência, cada uma com Pulso próprio e bônus para criaturas da mesma raça. Ideias `PROPOSTA`: Vampiro (revoada de morcegos que rouba vida), Lobisomem (uivo que assusta), Fantasma, Bruxa.

## 4. Raças e classes
**Estrutura** `DECIDIDO`: `Raça` → `Classe` → `Nível` (duplicatas/fragmentos, permanente: `TBD`). Variantes (comum/rara com trait): **adiadas** (`TBD`).
**Evolução na run** `FEITO`: criaturas em campo evoluem com ouro do nível 1 ao 3; no nível 3 viram uma **forma evoluída** com nome, visual e habilidade turbinada (valores na seção 9).
**Início da conta** `DECIDIDO`: Humano. Criaturas vêm de **ovos** (`FEITO`: a run começa com a escolha de 1 entre 3 ovos de criaturas místicas ainda bloqueadas; após a onda 1, outro ovo) e podem ser **desbloqueadas permanentemente** com Essência para já começar a run com elas (`FEITO`).
Gacha com dinheiro real: ver seção 10.
**Tags** (`HUMANO`, `SANGUE`, `FOGO`, `GELO`, `CONTROLE`...) `TBD` como sistema de sinergia.

**Roster do MVP** (6 `FEITO`):

| Raça | Classe | Papel | Mecânica | Forma evoluída (nível 3) | Estado |
|---|---|---|---|---|---|
| Humano | Arqueiro | DPS à distância | Alvo único, alcance alto | Patrulheiro: multi-tiro (2 alvos) | FEITO |
| Humano | Guarda | Bloqueio | Segura até 2 inimigos perto dele (chefes passam) | Paladino: segura 4 | FEITO |
| Vampiro | Duelista | DPS alvo único | Frenesi: após 6 golpes, 3 s de ataque mais rápido e mais forte | Conde Vampiro: frenesi a cada 4 golpes, mais longo e forte | FEITO |
| Vampiro | Sanguinário | Sustento | Abates desta criatura curam o Nexus | Lorde de Sangue: cura o dobro | FEITO |
| Dragão | Fogo | Área | Golpe com dano em raio | Dragão Ancião: área maior e mais forte | FEITO |
| Dragão | Gelo | Controle | Golpes deixam inimigos lentos | Dragão Glacial: lentidão mais forte e longa | FEITO |

**Próximas raças** `DECIDIDO` (a implementar, nesta ordem): Lobisomem, Fantasma, Bruxa. Classes `PROPOSTA`:

| Raça | Identidade | Classe 1 | Classe 2 |
|---|---|---|---|
| Lobisomem | fúria corpo a corpo | Caçador: salta entre alvos | Alfa: aura que acelera criaturas próximas |
| Fantasma | incorpóreo | Assombração: dano que ignora armadura | Banshee: grito em cone que empurra |
| Bruxa | maldições | Feiticeira: veneno ao longo do tempo | Caldeirão: poça de dano no chão |

**Depois** `PROPOSTA`: Fada (Encantadora: aura de dano/alcance; Travessa: confunde inimigos), Golem, Necromante, Medusa. Banco de 24 ideias antigas: v0.4.

## 5. Inimigos
Cada tipo cria um problema novo, não só mais vida.
- **Zumbi** (básico): às vezes vem em bando de 3. `FEITO`
- **Morcego** (rápido): voa em zigue-zague. `FEITO`
- **Ogre** (tanque): armadura que reduz dano por golpe, punindo dano fraco. `FEITO`
- **Rei Ogro** (chefe, onda 10): muito vida e armadura, causa muito dano ao Nexus. `FEITO`
- `PROPOSTA` próximos: ranged, invocador, anti-criatura.

## 6. Economia e progressão
**Na run**
- Ouro: compra criaturas; vem de abates e de renda passiva. Custo progressivo por cópia da mesma classe. `FEITO`
- Limite de criaturas em campo (valor na seção 9). `FEITO`
- **Vender** criatura devolve parte do ouro e reduz o custo da próxima cópia. `FEITO`
- Entre ondas: melhorias temporárias ou ovos. `FEITO`
- **Evolução** de criaturas em campo com ouro (níveis 1–3). `FEITO`
- **Loja entre ondas** (na tela de escolha): sortear as opções de novo e comprar +1 vaga de criatura. `FEITO`

**Permanente** `FEITO`
- **Essência** ganha ao fim de toda run (mesmo perdendo). Gasta no menu em melhorias (nível 1–5) e em criaturas iniciais.
- Salvamento local no navegador.
- `TBD` talentos que mudem *opções* (ex.: +1 slot), não só números; fragmentos de criatura; seleção de criaturas levadas à run.

## 7. Controles e interface (`FEITO`)
Mover o herói: WASD/setas ou clicar/segurar no chão. Invocar: arrastar a carta do painel lateral até a arena, ou tecla 1–6 e clicar (prévia mostra alcance; vermelha se não pode). Evoluir/vender: clicar na criatura e nos botões "Evoluir"/"Vender" (ou tecla E para evoluir). Pulso: Espaço ou botão. Cancelar: botão direito ou Esc. Pausa: P, Esc ou botão. Som: botão 🔊.
Painel lateral com retrato, custo e atalho de cada criatura; tooltip com atributos e habilidade; criaturas bloqueadas aparecem como silhueta. Feedback: faixas de "Onda N" e de chefe, projéteis e impactos por classe, clarão ao levar dano, morte com fantasma, moedas e números flutuantes, tremor de tela.

## 8. Modos
**Campanha** (estágios) e **Endless**. Ambos **fora do MVP** (hoje existe 1 estágio de 10 ondas).

## 9. Valores atuais do protótipo

**Herói:** velocidade 115 · dano 10 · alcance 60 · cooldown 0,5 s · **Pulso:** dano 35, raio 95, recarga 12 s.
**Nexus:** 100 de vida (+10 de cura entre ondas). **Ouro inicial:** 30. **Renda passiva:** +1 a cada 2 s. **Limite de criaturas:** 5.
**Custo:** base × 1,5^(cópias já posicionadas da classe). **Venda:** 60% do valor pago.

| Criatura | Custo base | Dano | Alcance | Cooldown | Especial |
|---|---|---|---|---|---|
| Arqueiro | 15 | 7 | 120 | 0,7 s | — |
| Guarda | 20 | 5 | 45 | 0,8 s | Bloqueio: até 2 inimigos num raio de 30 |
| Duelista | 20 | 8 | 90 | 0,5 s | Frenesi (6 golpes → 3 s, ×1,5 dano, 2× velocidade) |
| Sanguinário | 25 | 6 | 100 | 0,8 s | Cada abate cura 2 de vida do Nexus |
| Dragão Fogo | 30 | 14 | 110 | 1,4 s | Área raio 40 com 60% do dano |
| Dragão Gelo | 25 | 4 | 100 | 1,0 s | Lentidão 50% por 1,5 s |

Criaturas atacam o inimigo mais próximo do Nexus dentro do alcance.

**Evolução** `PROPOSTA` (valores iniciais): nível 2 custa 1,5 × custo base e dá +50% de dano e +10% de alcance; nível 3 custa 3 × custo base e dá +120% de dano e +20% de alcance, mais a habilidade da forma evoluída: Patrulheiro multi-tiro 2 · Paladino bloqueia 4 num raio de 36 · Conde Vampiro frenesi a cada 4 golpes, 4 s, ×1,8 · Lorde de Sangue cura 4 · Dragão Ancião área raio 60 com 80% · Dragão Glacial lentidão 65% por 2,5 s. A venda devolve 60% de tudo que foi pago (invocação + evoluções).
**Loja entre ondas** `PROPOSTA`: sortear de novo custa 10 (+10 a cada uso na run); +1 vaga custa 60, dobrando a cada compra, até +3 vagas.

| Inimigo | Vida | Vel. | Dano ao Nexus | Ouro | Notas |
|---|---|---|---|---|---|
| Zumbi | 20 | 30 | 5 | 3 | 30% de chance de bando de 3 |
| Morcego | 12 | 62 | 3 | 2 | zigue-zague; a partir da onda 2 |
| Ogre | 90 | 18 | 15 | 8 | armadura 3; a partir da onda 4 |
| Rei Ogro | 450 | 13 | 40 | 30 | armadura 4; onda 10 |

Dano por golpe contra armadura = `max(1, dano − armadura)`. Vida de todo inimigo × (1 + 0,12 × onda).
**Arena:** 640 × 360 unidades (16:9), Nexus no centro.
**Ondas (1–10):** quantidade = 4 + 3 × onda; intervalo de spawn = máx(0,35 s; 1,2 − 0,07 × onda) s; inimigos surgem 24 unidades além da borda da tela, em direção aleatória.
**Melhorias temporárias:** +30% dano · +20% alcance · +25% vel. de ataque · +40 ouro · +30 vida do Nexus · Pulso 30% mais rápido.
**Essência por run:** 3 × onda alcançada + 1 por 5 abates + 30 se vencer.
**Melhorias permanentes (máx. nível 5):** +8% dano (20 × (nv+1)) · +15 vida do Nexus (20 × (nv+1)) · +10 ouro inicial (15 × (nv+1)).
**Criaturas iniciais:** Guarda 30 ✦ · Duelista 40 ✦ · Sanguinário 50 ✦ · Dragão Fogo 80 ✦ · Dragão Gelo 80 ✦. O ovo inicial só oferece criaturas místicas (não humanas).

## 10. Monetização (adiada)
Nada no MVP. Opções futuras: venda direta, cosméticos, doação. Gacha pago exige checar regras (no Brasil, ECA Digital sobre caixas de recompensa, além das lojas). Evitar economia com troca entre jogadores.

## 11. Riscos
Escopo grande (4 gêneros) · explosão de conteúdo (raças × classes) · humanos obsoletos após as criaturas · herói roubando o protagonismo · posição irrelevante · power creep da Essência · balanceamento feito só "no feeling".

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
| 05/10/2026 | A run começa com a escolha de 1 entre 3 ovos de criatura mística |
| 05/10/2026 | Visual vetorial caprichado (chibi, contorno, animações) e interface gótica com fontes do Google Fonts |
| 05/10/2026 | Ouro tem uso: evolução de criaturas na run (níveis 1–3, forma evoluída) e loja entre ondas (sortear de novo, +1 vaga) |
| 05/10/2026 | Guarda = bloqueio de até 2 inimigos (chefes passam); Sanguinário = abates curam o Nexus |
| 05/10/2026 | Herói começa Humano; outras raças de herói desbloqueáveis com Essência |
| 05/10/2026 | Próximas raças: Lobisomem, Fantasma e Bruxa |

**Em aberto:** passivas de raça · duração real da run · seleção de criaturas da run · nível permanente (fragmentos) · talentos · variantes · tags/sinergias · estágios e modos · arte e música finais · engine final.

## 13. Próximos passos
1. Publicar no GitHub Pages e fazer playtest com outras pessoas (ritmo, custo da evolução, loja).
2. Lobisomem, Fantasma e Bruxa (2 classes cada).
3. Heróis desbloqueáveis de outras raças.
4. Tutorial da primeira run; mais inimigos; segundo estágio.
5. Balanceamento com planilha de valores (seção 9 como base); só depois decidir engine final e arte.
