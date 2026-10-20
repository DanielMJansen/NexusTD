# Página do Nexus TD no itch.io

Texto e configurações para a página do jogo. Copiar cada bloco para o campo indicado no painel do itch.io
(**Dashboard → Edit game**). O .zip sai de `npm run release:itch` (pasta `release/`); capa e capturas em `release/itch/`.

## Configurações do projeto

| Campo | Valor |
|---|---|
| Title | Nexus TD |
| Project URL | `nexus-td` (fica `https://<seu-usuario>.itch.io/nexus-td`) |
| Short description or tagline | One hero. An army of monsters. Defend the Nexus! |
| Classification | Games |
| Kind of project | **HTML** |
| Release status | **In development** |
| Pricing | **$0 or donate** com valor sugerido de **US$ 3** (exige PayPal/Stripe e o formulário W-8BEN em Settings → Payouts; até lá, **No payments**) |
| Uploads | `nexus-td-<versão>-itch.zip` → marcar **This file will be played in the browser** |
| Embed options → Viewport dimensions | **1280 × 720** |
| Embed options → marcar | **Fullscreen button**; deixar **Mobile friendly** desmarcado (o jogo é para computador) |
| Frame options | **Click to launch in fullscreen**: desmarcado (joga na própria página; o botão de tela cheia fica disponível) |
| Genre | Strategy |
| Tags | tower-defense, roguelite, roguelike, fantasy, monsters, 2d, singleplayer, strategy |
| AI disclosure (se perguntado) | Sim: código e arte foram feitos com ajuda de IA |
| Cover image | `release/itch/capa-630x500.png` |
| Screenshots | `release/itch/captura-1…5` |
| Community | **Comments** ligado (é o canal de retorno do playtest) |
| Visibility & access | **Draft** para conferir se o jogo abre → **Public** (decidido em 20/10/2026: publicar direto, sem playtest fechado) |

## Descrição (campo "Description")

> O itch.io aceita formatação simples. Colar os três blocos na ordem; o idioma do jogo segue o navegador e pode ser trocado em Settings → Language.

---

### 🇬🇧 English

**One hero. An army of monsters. Defend the Nexus!**

Nexus TD mixes **tower defense**, **survivor action** and a **roguelite** run: you control a hero on the battlefield while your summoned creatures hold the line as living towers around the Nexus.

**What you do**
- **Summon creatures** from your team and place them along the enemy paths. Each one has a role: damage, area, control, blocking or support.
- **Fight with your hero**: move with WASD, attack automatically and unleash a unique **Pulse** ability.
- **Evolve** creatures in battle and choose between two paths at level 3. Awakened creatures can reach a **Supreme Form**.
- **Upgrade the Nexus** with gold: health, a bolt, a shield and a slowing field.
- After each wave, **pick 1 of 3 upgrades** and build a different run every time.

**What's in it**
- **5 stages** with their own rules: the Graveyard, a Swamp of sticky mud, a Frozen Tundra with blizzards and cracking ice, a Golden Desert with two Obelisks to protect, and a Celestial Citadel where the sky tears open into portals.
- **12 races, 36 creatures and 12 heroes**, each with their own art, abilities and evolutions.
- **Permanent progression**: talents, a Sanctuary to strengthen your creatures, Relics dropped by bosses, an Altar of cosmetic variants, achievements and skins.
- **Endless mode** with mutations, and Ascension levels for an extra challenge.

**Controls**
WASD/arrows or click: move · 1–8 or drag a card: summon · Click a creature: evolve/sell · E: evolve · V: sell · N: upgrade the Nexus · Space: Pulse · F: speed · 0: freeze time · Mouse wheel: zoom · P/Esc: pause

**Good to know**
- Made for **desktop browsers** with mouse and keyboard.
- Your progress is saved **in your browser**. To move it to another computer, use Settings → Export/Import save.
- The game is **in development**: balance and content may change. Feedback in the comments is very welcome!

---

### 🇧🇷 Português

**Um herói. Um exército de monstros. Defenda o Nexus!**

Nexus TD mistura **tower defense**, **ação survivor** e uma **run roguelite**: você controla um herói no campo de batalha enquanto as criaturas que você invoca seguram a linha como torres vivas ao redor do Nexus.

**O que você faz**
- **Invoca criaturas** da sua equipe e posiciona ao longo das trilhas dos inimigos. Cada uma tem um papel: dano, área, controle, bloqueio ou suporte.
- **Luta com o herói**: anda com WASD, ataca sozinho e solta um **Pulso**, uma habilidade única de cada herói.
- **Evolui** as criaturas durante a batalha e escolhe entre duas vertentes no nível 3. Criaturas despertas chegam a uma **Forma Suprema**.
- **Melhora o Nexus** com ouro: vida, raio, escudo e campo de lentidão.
- Ao fim de cada onda, **escolhe 1 entre 3 melhorias** e monta uma run diferente a cada vez.

**O que tem no jogo**
- **5 fases** com regras próprias: o Cemitério, um Pântano de lama que prende, uma Tundra Gelada com nevascas e gelo que racha, um Deserto Dourado com dois Obeliscos para proteger e uma Cidadela Celeste onde o céu se rasga em portais.
- **12 raças, 36 criaturas e 12 heróis**, cada um com arte, habilidades e evoluções próprias.
- **Progresso permanente**: talentos, um Santuário para fortalecer as criaturas, Relíquias deixadas pelos chefes, um Altar de variantes cosméticas, conquistas e skins.
- **Modo Sem Fim** com mutações e níveis de Ascensão para quem quer mais desafio.

**Controles**
WASD/setas ou clique: mover · 1–8 ou arrastar a carta: invocar · Clique na criatura: evoluir/vender · E: evoluir · V: vender · N: melhorar o Nexus · Espaço: Pulso · F: velocidade · 0: congelar o tempo · Roda do mouse: zoom · P/Esc: pausar

**Bom saber**
- Feito para **navegador de computador**, com mouse e teclado.
- O progresso fica salvo **no seu navegador**. Para levar para outro computador, use Configurações → Exportar/Importar save.
- O jogo está **em desenvolvimento**: equilíbrio e conteúdo ainda podem mudar. Comentários são muito bem-vindos!

---

### 🇪🇸 Español

**Un héroe. Un ejército de monstruos. ¡Defiende el Nexus!**

Nexus TD mezcla **tower defense**, **acción survivor** y una **partida roguelite**: controlas a un héroe en el campo de batalla mientras las criaturas que invocas aguantan la línea como torres vivientes alrededor del Nexus.

**Qué haces**
- **Invocas criaturas** de tu equipo y las colocas a lo largo de los caminos enemigos. Cada una tiene un papel: daño, área, control, bloqueo o apoyo.
- **Luchas con el héroe**: te mueves con WASD, atacas automáticamente y lanzas un **Pulso**, una habilidad única de cada héroe.
- **Evolucionas** a las criaturas en plena batalla y eliges entre dos vertientes en el nivel 3. Las criaturas despertadas alcanzan una **Forma Suprema**.
- **Mejoras el Nexus** con oro: vida, rayo, escudo y campo de ralentización.
- Al final de cada oleada, **eliges 1 de 3 mejoras** y cada partida es distinta.

**Qué incluye**
- **5 fases** con reglas propias: el Cementerio, un Pantano de barro que atrapa, una Tundra Helada con ventiscas y hielo que se agrieta, un Desierto Dorado con dos Obeliscos que proteger y una Ciudadela Celeste donde el cielo se rasga en portales.
- **12 razas, 36 criaturas y 12 héroes**, cada uno con su arte, habilidades y evoluciones.
- **Progreso permanente**: talentos, un Santuario para fortalecer a tus criaturas, Reliquias que sueltan los jefes, un Altar de variantes cosméticas, logros y aspectos.
- **Modo Sin Fin** con mutaciones y niveles de Ascensión para quien quiera más desafío.

**Controles**
WASD/flechas o clic: mover · 1–8 o arrastrar la carta: invocar · Clic en una criatura: evolucionar/vender · E: evolucionar · V: vender · N: mejorar el Nexus · Espacio: Pulso · F: velocidad · 0: congelar el tiempo · Rueda del ratón: zoom · P/Esc: pausa

**Conviene saber**
- Hecho para **navegador de ordenador**, con ratón y teclado.
- Tu progreso se guarda **en tu navegador**. Para llevarlo a otro ordenador, usa Ajustes → Exportar/Importar progreso.
- El juego está **en desarrollo**: el equilibrio y el contenido aún pueden cambiar. ¡Los comentarios son muy bienvenidos!

## Mensagem para divulgar (amigos, grupos, redes)

> Para mandar junto com o link.

Oi! Estou testando meu jogo, o **Nexus TD**, e queria muito a sua opinião.
- **Link:** `https://<seu-usuario>.itch.io/nexus-td`
- Jogue no computador, com mouse e teclado. Uma partida leva uns 15–25 minutos.
- Depois, deixe um comentário na página (ou me mande mensagem) contando: o que achou divertido, o que ficou confuso, até que fase chegou e se encontrou algum problema.
Obrigado!
