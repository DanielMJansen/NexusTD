# Plano v0.9 — o que trazer do Myth TD, heróis por raça e novas raças

> Documento de trabalho para seguirmos em etapas. Cada etapa termina com o jogo rodando (`npm run build` sem erro), commit próprio, teste no navegador e atualização do GDD/CLAUDE.md quando mudar regra ou valor.
> **Situação (05/10/2026):** E0–E10 feitas (E3+E5+E6+E7 num commit só). Foi acrescentado um primeiro companheiro místico grátis para quem não tem nenhum, consequência de remover os ovos. Próximo: playtest e escolher os extras da E11.
>
> Status das etapas: `[ ]` a fazer · `[~]` em andamento · `[x]` feita.

## 1. O que analisei no Myth TD (`D:\Games\myth-td`)

Tower defense roguelite em TypeScript + Vite + Canvas, mesma stack do Nexus. O que vale aproveitar:

| Recurso do Myth TD | Onde está | Como aproveitar no Nexus |
|---|---|---|
| **Equipe (team builder)**: antes da run, escolher até 10 torres; só elas aparecem na run; equipe persiste entre sessões | `src/game/team.ts`, tela "Equipe" em `src/main.ts` | Tela **Equipe**: montar o roster da run a partir da Coleção (seção 3, decisão D1) |
| **Cartas com descrição em linguagem simples**, agrupadas por panteão; bloqueadas esmaecidas com preço | `TOWER_OPTIONS` e `towerCardHtml` em `src/main.ts` | Tela **Coleção** com ficha de cada criatura (lore, papel, atributos, habilidade, forma evoluída) |
| **Loja** de torres com moeda permanente | `TOWER_PRICES` em `src/game/meta.ts` | Compra de criaturas, heróis e skins com Essência |
| **Árvore de melhorias** em colunas (ramos), nós com pré-requisito de nível no nó pai | `UPGRADES` em `src/game/meta.ts`, `renderUpgrades` em `src/main.ts` | **Árvore de talentos** substituindo as 3 melhorias permanentes atuais |
| **Configurações**: volume de música e efeitos (0–100%), silenciar tudo, rever tutorial, exportar/importar | `src/game/settings.ts` | Tela **Configurações** igual em espírito |
| **Exportar/importar save** em JSON (`format`, `version`, `exportedAt`, `data`), validação com mensagens legíveis, confirmação e recarga | `src/game/backup.ts` | Mesmo formato, adaptado às chaves do Nexus |
| **Música procedural**: sequenciador próprio (lookahead no relógio do WebAudio), trilha de menu calma e trilha de run que **acelera e adensa** com a intensidade; pad + baixo + lira + percussão; eco; fade entre trilhas | `src/game/audio.ts` | Trilhas góticas próprias do Nexus, mesma arquitetura (seção 4, E2) |
| **Tela de entrada** "Clique para começar" (destrava o áudio e a música do menu já toca) e áudio suspenso com a aba oculta | `src/main.ts`, `audio.ts` | Igual |
| Tiros com **intervalo mínimo de som** e "pop" de abate que sobe de tom em combos | `audio.ts` | Igual (hoje 30 abates = 30 sons iguais) |
| Tutorial guiado, controle de velocidade 1x/2x/4x, salvar run em andamento, confirmar ao sair, raridade nas recompensas, painel "Bônus ativos", simulador `npm run sim` com bot | vários | Etapa opcional E11 (escolher depois) |

O que **não** trazer: grid/orientação de torres e torres únicas por tipo (o Nexus é arena livre com herói); pixel art 16×16 (o Nexus decidiu vetorial chibi).

## 2. Ajustes rápidos pedidos

- **Símbolo da Essência**: hoje aparece lilás no contador (`.essence`) e dourado nos custos (`<b>` do `.shop-item`). Unificar: Essência sempre com o mesmo símbolo e a mesma cor (lilás/roxo, `✦`) em todo lugar; ouro sempre `◉` dourado.
- **Aura do herói**: hoje o herói tem brilho `#7fd8ff`, a mesma cor da lentidão do Dragão de Gelo. Trocar por uma marca própria de herói: **anel rúnico dourado girando sob os pés** + brilho na cor da raça do herói (seção 3, D4). Ciano fica reservado para lentidão/gelo.

## 3. Decisões

**Respostas (05/10/2026):**
- **D1 = B.** Equipe de 6 com criaturas da Coleção, todas disponíveis desde o início da run (paga-se o ouro para invocar). **Os ovos deixam de existir**: a run começa direto na onda 1 e as escolhas entre ondas passam a ser só melhorias (mais a loja).
- **D2:** seguir a tabela proposta abaixo; novas raças depois.
- **D3:** skins **por conquista** (a etapa E9 inclui um sistema de conquistas).
- **D4:** moeda única, a Essência.
- **D5:** árvore livre, tomando a do Myth TD como base (ramos em colunas, nós filhos com pré-requisito de nível do pai).
- **D6:** como proposto.

Texto original das propostas, para referência:

**D1. Equipe e ovos (afeta E6).** Hoje: criaturas compradas começam liberadas e os ovos sorteiam as bloqueadas.
- **A (recomendado):** a **Equipe** tem 6 vagas (atalhos 1–6) montadas com criaturas da Coleção. Na run, só a equipe aparece no painel. A run começa com **2 da equipe chocadas** (o jogador escolhe quais são as "iniciais") e os **ovos sorteiam entre as outras 4**. Mantém a fantasia do ovo e dá planejamento de build. A Coleção cresce comprando criaturas com Essência.
- **B:** equipe de 6, todas disponíveis desde o início; ovos deixam de existir (entram outras recompensas).
- **C:** sem equipe; tudo como hoje, só com a tela de Coleção.

**D2. Heróis por raça (afeta E8 e E10).** "Um personagem jogável por raça", desbloqueado com Essência; o Humano é o inicial. Proposta de identidade (valores na etapa):

| Raça | Herói | Ataque | Pulso (habilidade) | Bônus para criaturas da mesma raça |
|---|---|---|---|---|
| Humano | Cavaleiro (atual) | espada, corpo a corpo | Onda de choque (atual) | +10% de alcance |
| Vampiro | Nobre Vampiro | rapieira, rouba vida do Nexus | Revoada de morcegos que drena inimigos | abates curam +1 |
| Dragão | Draconato | bafo curto em cone | Rugido flamejante em área maior | +10% de dano em área |
| Lobisomem | Licantropo | garras rápidas | Uivo: inimigos fogem por 2 s | +15% vel. de ataque |
| Fantasma | Espectro | toque gélido que ignora armadura | Atravessa o campo: dano em linha | ignora +1 de armadura |
| Bruxa | Bruxa | orbe à distância | Maldição em área: veneno | veneno dura +1 s |

**D3. Skins (afeta E9).** Recomendado: cada herói com 2–3 skins só cosméticas (paleta + acessório), compradas com Essência. Exemplos: Cavaleiro "Sentinela" (azul, atual), "Templário" (branco e dourado), "Cavaleiro Negro" (preto e roxo). Alternativa: skins por conquistas (fica para depois das conquistas existirem).

**D4. Moeda.** Recomendado: **Essência** para tudo (talentos, criaturas, heróis, skins). Uma moeda só é mais simples de balancear agora.

**D5. Árvore de talentos (afeta E7).** Proposta de ramos (valores `PROPOSTA`, a calibrar no playtest):

| Ramo | Raiz | Filhos (pré-requisito: nível do pai) |
|---|---|---|
| Nexus | +15 vida do Nexus (5 níveis, migra a atual) | Cura entre ondas +5 (3) · Regeneração 0,5/s (2) · Escudo: ignora o 1º golpe de cada onda (1) |
| Ouro | +10 ouro inicial (5, migra a atual) | Renda passiva +1 a cada 2 s → 1,5 s (2) · Evolução 15% mais barata (3) · 1ª invocação de cada onda grátis (1) |
| Exército | +8% dano (5, migra a atual) | +8% vel. de ataque (3) · +10% alcance (3) · +1 vaga de criatura (1) |
| Herói | +15% dano do herói (3) | Pulso recarrega 15% mais rápido (3) · +10% velocidade (2) · Pulso maior (1) |
| Essência | +10% de Essência por run (5) | +20 de Essência ao vencer (2) · ovo extra no início da run (1) |

**D6. Música.** Recomendado: duas trilhas próprias, mesma técnica do Myth TD mas com clima **gótico** (ré menor, órgão/pad escuro, sino, coro sintetizado). O **menu** é lento e sem percussão. A **run** acelera e adensa a cada onda, e uma **variação de chefe** toca na onda 10.

## 4. Etapas

Ordem pensada para destravar dependências: primeiro áudio e configurações, depois o novo formato de save (que tudo usa), depois as telas de meta-progressão e por fim o conteúdo novo.

### E0. Ajustes rápidos `[x]`
- Essência com símbolo e cor únicos em menu, custos, fim de run e tooltips.
- Herói sem brilho ciano: anel rúnico dourado sob os pés (a cor da raça entra na E8).
- **Pronto quando:** nenhum ciano no herói; Essência idêntica em todas as telas.

### E1. Configurações e volumes `[x]`
- `src/settings/settings.ts` (chave `nexus-settings-v1`): `musicVolume`, `sfxVolume` (0–1), `muted`.
- `SoundPlayer` com barramentos separados (mestre → música / efeitos), volumes aplicados ao vivo.
- Tela **Configurações** (botão ⚙ no topo e no menu): dois sliders, "Silenciar tudo" e os botões de exportar/importar (ligados na E4). O botão 🔊 continua como atalho do mudo.
- Tela de entrada "Clique para começar" (destrava o áudio); suspender o áudio com a aba oculta.
- Intervalo mínimo entre sons de tiro/acerto; o "pop" de abate sobe de tom em combos.
- **Pronto quando:** volumes independentes persistem após recarregar; sem som "metralhadora" na onda 10.

### E2. Música procedural `[x]`
- `src/audio/music.ts`: sequenciador com lookahead (como o `AudioEngine` do Myth TD), fade entre trilhas.
- Trilhas em `src/audio/songs.ts` (dados: acordes, baixo, melodia, BPM mín./máx., instrumentos): **menu**, **run** (intensidade = onda/10) e **chefe**.
- **Pronto quando:** a música do menu toca desde a tela de entrada; a da run acelera ao longo das ondas; troca suave entre telas; o volume de música respeita a configuração.

### E3. Perfil v4 e migração do save `[x]`
Pré-requisito de E4–E10. Novo formato (chave `nx4`), com migração automática do `nx3` (e do `nx2` via `nx3`):

```ts
interface ProfileV4 {
  essence: number;
  talents: Record<TalentId, number>;      // árvore (E7)
  ownedCreatures: CreatureId[];           // Coleção (Arqueiro e Guarda grátis, se D1 = A)
  team: CreatureId[];                     // Equipe (E6)
  startingCreatures: CreatureId[];        // as "iniciais" da equipe (D1 = A)
  ownedHeroes: HeroId[];  selectedHero: HeroId;            // E8
  ownedSkins: SkinId[];   selectedSkin: Record<HeroId, SkinId>; // E9
}
```

- Migração `nx3 → nx4`: `metaLevels.damage/nexusHp/startGold` → raízes Exército/Nexus/Ouro da árvore (mesmo nível, sem perder Essência gasta); `unlockedCreatures` → `ownedCreatures`; equipe padrão = criaturas possuídas (até 6); herói = Cavaleiro.
- O `nx3` não é apagado (rollback possível).
- **Pronto quando:** um save `nx3` real abre no `nx4` com a mesma Essência, os mesmos níveis e as mesmas criaturas.

### E4. Exportar/importar save `[x]`
- `src/save/backup.ts`: arquivo `nexus-save-AAAA-MM-DD.json` = `{ format: "nexus-save", version, exportedAt, data: { profile, settings } }`.
- Importar: valida (JSON, formato, versão não mais nova, perfil presente), pede confirmação ("substitui todo o progresso"), grava, recarrega. Mensagens de erro legíveis.
- Botões na tela Configurações.
- **Pronto quando:** exportar → limpar o navegador → importar restaura tudo; arquivo inválido mostra erro sem quebrar nada.

### E5. Coleção (fichas das criaturas) `[x]`
- Dados novos em `src/data/creatures.ts`: `lore` (1–2 frases de flavor) e `description` (o que faz, em linguagem simples).
- Tela **Coleção**: cartas agrupadas por raça, com retrato animado, papel, atributos, habilidade e forma evoluída (com retrato no nível 3). Bloqueadas aparecem esmaecidas com o preço; comprar com Essência.
- Substitui a coluna "Começar a run com" do menu atual.
- **Pronto quando:** toda criatura tem ficha; comprar atualiza a Coleção e salva.

### E6. Equipe (roster da run) `[x]` — D1 = B
- Tela **Equipe**: 6 vagas; clicar na carta adiciona/remove; "Jogar" fica desabilitado se a equipe estiver vazia.
- Na run, o painel lateral mostra só a equipe (atalhos 1–6 na ordem da equipe), todas disponíveis desde o início.
- Remover os ovos: sem escolha inicial; escolhas entre ondas só com melhorias.
- Resolve o crescimento do painel com 12+ criaturas.
- **Pronto quando:** runs diferentes com equipes diferentes; o ovo nunca oferece criatura fora da equipe.

### E7. Árvore de talentos `[x]` — depende de D5
- `src/data/talents.ts` (ramos, nós, pré-requisitos, custos, efeitos como dados); `src/game/talents.ts` resolve os modificadores (como o `MetaModifiers` do Myth TD).
- Tela **Talentos**: colunas por ramo, nós com nível em bolinhas, custo, efeito no nível atual → próximo, bloqueio por pré-requisito.
- Os efeitos novos (regeneração, escudo, desconto de evolução etc.) entram na simulação via `RunSetup`.
- **Pronto quando:** níveis migrados aparecem certos; cada nó comprado altera a run como descrito.

### E8. Heróis por raça `[x]` — depende de D2
- `src/data/heroes.ts`: atributos, tipo de ataque, Pulso (parâmetros), bônus de raça, cor da aura, preço. `HERO` de `config.ts` vira o Cavaleiro.
- Simulação: ataque e Pulso dirigidos por dados (cone, linha, drenar, assustar, veneno), como já é com as habilidades das criaturas.
- Tela **Heróis** (ou aba na Coleção): retrato animado, descrição, comprar e selecionar.
- Sprites: Nobre Vampiro e Draconato nesta etapa; os heróis de Lobisomem, Fantasma e Bruxa entram junto com cada raça na E10.
- **Pronto quando:** dá para jogar uma run inteira com cada herói disponível; o bônus de raça aparece no tooltip das criaturas.

### E9. Conquistas e skins `[x]` — D3 = por conquista
- `src/data/achievements.ts`: conquistas como dados (ex.: vencer com cada herói, evoluir 3 criaturas ao nível 3 numa run, vencer sem o Nexus cair abaixo de 50%); progresso salvo no perfil; aviso ao desbloquear; lista no menu.
- Cada skin aponta para a conquista que a libera.
- `src/data/skins.ts`: por herói, paleta e acessório; os sprites leem cores da skin em vez de constantes.
- Seleção na tela de Heróis; prévia animada; compra com Essência.
- **Pronto quando:** cada herói tem a skin padrão + 2 alternativas selecionáveis e salvas.

### E10. Novas raças `[x]`
Uma sub-etapa por raça, cada uma com 2 classes (dados, mecânica, sprite níveis 1 e 3, efeitos, som, ficha da Coleção) + o herói da raça (E8):
- **E10a Lobisomem:** Caçador (salta entre alvos) · Alfa (aura que acelera criaturas próximas).
- **E10b Fantasma:** Assombração (dano que ignora armadura) · Banshee (grito em cone que empurra).
- **E10c Bruxa:** Feiticeira (veneno ao longo do tempo) · Caldeirão (poça de dano no chão).
- Mecânicas novas na simulação: salto entre alvos, aura de velocidade, ignorar armadura, empurrão, veneno (dano ao longo do tempo), poça no chão.
- **Pronto quando:** cada raça aparece na Coleção, na Equipe, nos ovos e no herói correspondente; a taxa de vitória da simulação fica próxima das equipes atuais.

### E11. Extras inspirados no Myth TD `[x]` — raridade nas melhorias, salvar run e tutorial feitos; velocidade entrou no F1 do plano v1.0; o resto foi para o plano v1.0
Tutorial guiado da 1ª run · velocidade 1x/2x · salvar run em andamento e "Salvar e sair" · raridade nas recompensas entre ondas (comum/incomum/rara) · painel "Bônus ativos" · simulador oficial `npm run sim` com bot (substitui os scripts avulsos de teste).

## 5. Riscos e cuidados

- **Escopo:** E10 sozinha é grande (6 criaturas + 3 heróis com arte). Uma raça por vez, com playtest entre elas.
- **Balanceamento:** talentos + heróis + equipe multiplicam combinações. Formalizar o simulador (E11) cedo se as taxas de vitória começarem a variar demais.
- **Save:** migração testada com saves reais antes de publicar; nunca apagar a chave antiga na mesma versão.
- **Painel e atalhos:** com a Equipe limitada a 6, o painel e as teclas 1–6 continuam cabendo.
- **Áudio:** música + efeitos somados podem saturar; usar barramentos com limitador (compressor) no mestre.

## 6. Documentação a cada etapa

- GDD: novas regras e valores (`PROPOSTA` até o playtest) e linha no Registro de Decisões.
- CLAUDE.md: novas pastas/arquivos e chaves de save (`nx4`, `nexus-settings-v1`).
- `docs/checklist-regressao.md`: itens de teste da etapa.
- Este plano: marcar o status da etapa.
