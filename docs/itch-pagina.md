# Página do Nexus TD no itch.io

Guia para publicar o jogo e, abaixo, todo o texto e as configurações da página.
Arquivos: o jogo em `release/nexus-td-1.0.0-itch.zip` (gerado por `npm run release:itch`); capa e capturas em `release/itch/`; banner, fundo, títulos e faixas da página em `release/itch/pagina/`.

## Como publicar (primeira vez, ~20 minutos)

1. **Criar a conta.** Em https://itch.io clique em **Register**, crie a conta e confirme o e-mail. O nome de usuário vira o endereço da página (`https://<usuario>.itch.io/nexus-td`).
2. **Criar o projeto.** No menu do seu avatar (canto superior direito), **Upload new project**.
3. **Preencher o topo do formulário** com a tabela "Configurações do projeto" abaixo: título, endereço, frase curta, *Classification* = Games e **Kind of project = HTML** (isso faz o jogo rodar na própria página).
4. **Preço.** Escolha **$0 or donate** e coloque **US$ 3** como valor sugerido: o jogo é grátis, e quem quiser pode pagar o quanto quiser (inclusive nada). Para o dinheiro chegar até você, faça a seção "Receber as doações" (abaixo) antes ou logo depois de publicar.
5. **Enviar o jogo.** Em *Uploads*, clique em **Upload files**, escolha `release/nexus-td-1.0.0-itch.zip` e, quando terminar de subir, marque **This file will be played in the browser**.
6. **Janela do jogo.** Em *Embed options*: **Viewport dimensions** = 1280 × 720; marque **Fullscreen button**; deixe **Mobile friendly** e **Automatically start on page load** desmarcados.
7. **Descrição.** Monte em *Description* o texto da seção "Descrição", enviando as imagens nos pontos marcados (botão de imagem do editor).
8. **Classificação.** *Genre* = Strategy; *Tags* da tabela; responda a pergunta sobre IA (sugestão: sim, código e arte feitos com ajuda de IA).
9. **Imagens.** *Cover image* = `release/itch/capa-630x500.png`; *Screenshots* = as 5 capturas de `release/itch/` (na ordem dos números).
10. **Comentários.** Em *Community*, escolha **Comments** (é por lá que os jogadores vão dar retorno).
11. **Salvar como rascunho.** Em *Visibility & access* deixe **Draft** e clique em **Save & view page**.
12. **Deixar a página bonita.** Ainda em rascunho, clique em **Edit theme** no topo da página e aplique a seção "Visual da página (tema)": banner, fundo e cores. Salve.
13. **Conferir.** Na página, clique em **Run game**: o jogo deve abrir na tela "Clique para começar". Jogue um pouco, teste o botão de tela cheia e recarregue a página para ver se o progresso continua salvo.
14. **Publicar.** Volte em **Edit game**, mude *Visibility & access* para **Public** e salve. Pronto: o jogo está no ar.
15. **Divulgar.** Use a mensagem pronta do fim deste arquivo, com o link da página.

## Como atualizar (cada versão nova)

1. Rodar `npm run release:itch` (gera o .zip com o número da versão).
2. No itch.io: **Edit game** → *Uploads* → remover o .zip antigo (lixeira) → **Upload files** com o novo → marcar de novo **played in the browser** → **Save**.
3. Opcional: escrever um *devlog* (**Edit game → Devlog**) contando o que mudou; quem seguiu o jogo recebe aviso.

O save dos jogadores fica no navegador deles e continua valendo depois da atualização.

## Receber as doações

1. **Settings → Payouts**: cadastrar PayPal (mais simples) ou Stripe.
2. Preencher o formulário fiscal **W-8BEN** (pessoa física fora dos EUA; o itch.io guia o preenchimento online). Sem ele, os EUA retêm uma parte maior de imposto.
3. Em **Settings → Payouts** também dá para escolher quanto o itch.io fica de cada pagamento (padrão 10%; você pode baixar).

Se o itch.io não deixar salvar "$0 or donate" antes disso, publique com **No payments** e troque para "$0 or donate" depois do cadastro, em **Edit game → Pricing** (não precisa enviar o jogo de novo).

## Configurações do projeto

| Campo | Valor |
|---|---|
| Title | Nexus TD |
| Project URL | `nexus-td` (fica `https://<seu-usuario>.itch.io/nexus-td`) |
| Short description or tagline | One hero. An army of monsters. Defend the Nexus! |
| Classification | Games |
| Kind of project | **HTML** |
| Release status | **In development** |
| Pricing | **$0 or donate**, valor sugerido **US$ 3** (ver "Receber as doações") |
| Uploads | `release/nexus-td-1.0.0-itch.zip` → marcar **This file will be played in the browser** |
| Embed options → Viewport dimensions | **1280 × 720** |
| Embed options → marcar | **Fullscreen button**; deixar **Mobile friendly** desmarcado (o jogo é para computador) |
| Frame options | **Click to launch in fullscreen**: desmarcado (joga na própria página; o botão de tela cheia fica disponível) |
| Genre | Strategy |
| Tags | tower-defense, roguelite, roguelike, fantasy, monsters, 2d, singleplayer, strategy |
| AI disclosure (se perguntado) | Sim: código e arte foram feitos com ajuda de IA |
| Cover image | `release/itch/capa-630x500.png` |
| Screenshots | `release/itch/captura-1…5` |
| Community | **Comments** (canal de retorno dos jogadores) |
| Visibility & access | **Draft** para conferir se o jogo abre → **Public** (decidido em 20/10/2026: publicar direto, sem playtest fechado) |

## Visual da página (tema)

Com a página aberta em rascunho, clique em **Edit theme** (barra no topo da sua página). Imagens em `release/itch/pagina/`.

| Opção do tema | Valor |
|---|---|
| **Banner** (Header image) | `01-banner-960x250.png` (troca o título em texto pelo logo, com o Arcanjo e o Arquidemônio) |
| **Hide title** | marcar (o banner já mostra o nome) |
| **Background image** | `02-fundo-1920x1080.png`, sem repetir (*No repeat*), centralizado, fixo se houver a opção |
| **Background color** (BG) | `#0b0716` |
| **Background 2** (fundo da coluna do conteúdo) | `#160d2b` |
| **Text** | `#e8dcff` |
| **Link** | `#ffd25a` |
| **Button** | `#7a4fd0` (texto do botão branco) |
| **Fonts** | Título/Cabeçalhos: **Cinzel** se existir na lista; senão uma serifada (ex.: *Lora*). Texto: *Lato* ou *Open Sans* |

Depois de salvar o tema, a página fica escura e roxa como o jogo, com o banner no topo.

## Descrição (campo "Description")

> O editor do itch.io tem um botão de **imagem** na barra de formatação: onde aparece **[imagem: arquivo]** abaixo, envie a imagem de `release/itch/pagina/` (ou uma captura de `release/itch/`) naquele ponto. Os textos em **negrito** e as listas são feitos com os botões do próprio editor.
>
> O inglês vem completo porque é o idioma de quem chega pelo itch.io; português e espanhol vêm curtos no fim. O jogo em si segue o idioma do navegador.

---

**One hero. An army of monsters. Defend the Nexus!**

Nexus TD mixes **tower defense**, **survivor action** and a **roguelite** run. You fight on the battlefield with your hero while the creatures you summon hold the line as living towers around the Nexus.

[imagem: `release/itch/captura-1-citadel.png`]

[imagem: `titulo-features.png`]

- 🛡️ **Summon creatures** and place them along the enemy paths. Damage, area, control, blocking or support: every creature has a role.
- ⚔️ **Fight with your hero**: move with WASD, attack automatically and unleash a unique **Pulse** ability.
- ⬆️ **Evolve** creatures mid-battle and choose one of two paths at level 3. Awakened creatures reach a **Supreme Form**.
- 💎 **Upgrade the Nexus** with gold: more health, a bolt, a shield and a slowing field.
- 🎲 After each wave, **pick 1 of 3 upgrades**. Every run plays differently.

[imagem: `titulo-heroes.png`]

**12 heroes**, one per race, each with their own attack, Pulse and race bonus.

[imagem: `faixa-herois.png`]

[imagem: `titulo-creatures.png`]

**36 creatures** across 12 races, each with two evolution paths, a Supreme Form and collectible variants.

[imagem: `faixa-criaturas.png`]

[imagem: `titulo-stages.png`]

**5 stages**, each with its own rules: sticky mud, cracking ice and blizzards, sandstorms with two Obelisks to protect, and a sky that tears open into portals.

[imagem: `faixa-fases.png`]

[imagem: `release/itch/captura-2-tundra.png`]

Plus **permanent progression** (talents, a Sanctuary, Relics dropped by bosses, an Altar of cosmetic variants, achievements and skins), an **Endless mode** with mutations and **Ascension** levels.

[imagem: `titulo-controls.png`]

**WASD / arrows / click** move · **1–8 or drag a card** summon · **click a creature** evolve or sell · **E** evolve · **V** sell · **N** upgrade the Nexus · **Space** Pulse · **F** speed · **0** freeze time · **mouse wheel** zoom · **P / Esc** pause

Made for **desktop browsers** with mouse and keyboard. Your progress is saved in your browser (Settings → Export/Import save to move it). The game is **in development**: feedback in the comments is very welcome! 💜

[imagem: `titulo-portugues.png`]

**Um herói. Um exército de monstros. Defenda o Nexus!** Tower defense, ação survivor e roguelite: invoque criaturas como torres vivas, lute com seu herói e evolua seu exército. 5 fases, 12 heróis, 36 criaturas, progresso permanente e modo Sem Fim. O jogo abre em português se o seu navegador estiver em português (ou troque em Configurações → Idioma). Feito para computador. Comentários são muito bem-vindos!

[imagem: `titulo-espanol.png`]

**Un héroe. Un ejército de monstruos. ¡Defiende el Nexus!** Tower defense, acción survivor y roguelite: invoca criaturas como torres vivientes, lucha con tu héroe y haz evolucionar a tu ejército. 5 fases, 12 héroes, 36 criaturas, progreso permanente y modo Sin Fin. El juego se abre en español si tu navegador está en español (o cámbialo en Ajustes → Idioma). Hecho para ordenador. ¡Los comentarios son muy bienvenidos!

## Mensagem para divulgar (amigos, grupos, redes)

> Para mandar junto com o link.

Oi! Estou testando meu jogo, o **Nexus TD**, e queria muito a sua opinião.
- **Link:** `https://<seu-usuario>.itch.io/nexus-td`
- Jogue no computador, com mouse e teclado. Uma partida leva uns 15–25 minutos.
- Depois, deixe um comentário na página (ou me mande mensagem) contando: o que achou divertido, o que ficou confuso, até que fase chegou e se encontrou algum problema.
Obrigado!
