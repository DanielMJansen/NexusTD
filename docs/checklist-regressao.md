# Checklist de regressão manual

Rodar após mudanças grandes (`npm run dev`), no navegador do computador, com mouse e teclado. Testar também uma janela menor (ex.: 1366×768) e um save antigo (ver "Save").

## Entrada, menu e configurações
- [ ] Tela "Clique para começar" (ou Enter/Espaço) leva ao menu e a música do menu começa.
- [ ] Jogador novo: aparece "Escolha seu primeiro companheiro" (só criaturas místicas); a escolhida entra na coleção e na equipe; não aparece de novo.
- [ ] Menu: Essência, herói + equipe em miniatura (com 8 criaturas, tudo numa linha dentro do quadro), botões Jogar / Herói / Equipe / Coleção / Talentos / Conquistas / Códex / Configurações.
- [ ] Essência sempre com ✦ lilás e ouro sempre com ◉ dourado, em todas as telas.
- [ ] ⚙ (topo, menu ou pausa): sliders de música e efeitos mudam o volume ao vivo; "Silenciar tudo" e o botão 🔊 ficam sincronizados; tudo persiste ao recarregar.
- [ ] Exportar save baixa `nexus-save-AAAA-MM-DD.json`; importar pede confirmação, substitui tudo e recarrega; arquivo inválido mostra erro e não quebra nada.

## Meta-progressão
- [ ] Talentos: 6 colunas em cadeia (cor e ícone por ramo); a linha entre os nós mostra "Nv N" até cumprir o requisito e depois acende com ✓; nós bloqueados ficam cinza; comprar desconta Essência, mostra "Atual / Próximo" e persiste.
- [ ] Nexus+: Raio Desperto / Campo Gélido / Escudo Ancestral fazem a run começar com a habilidade no nível 1; Engenharia Arcana baixa os preços no quadro do Nexus.
- [ ] Coleção: ficha de cada criatura (descrição, lore, atributos, habilidade, forma evoluída com retrato); bloqueadas em silhueta com preço; comprar adiciona à equipe se houver vaga.
- [ ] Equipe: 6 vagas; clicar adiciona/remove; "Jogar" desabilita com equipe vazia; ordem da equipe = atalhos 1–6.
- [ ] Heróis: todos com 3 skins (heróis novos: vencer com ele e chegar à onda 30 do Sem Fim com ele); comprar e escolher; descrição de ataque, Pulso e bônus de raça; skins liberadas por conquista são selecionáveis e aparecem na run.
- [ ] Conquistas: lista com progresso (abates, runs, vitórias, coleção) e a skin que cada uma libera.

## Tutorial e run salva
- [ ] Primeira run: tutorial de 7 passos; leitura pausa; ações avançam; "Pular" funciona; "Rever tutorial" nas Configurações reativa.
- [ ] Pausa → "Salvar e sair" → menu mostra "Continuar run (onda, herói)"; continuar volta pausado com tudo igual.
- [ ] Recarregar a página no meio da onda e continuar: volta onde estava. Onda vencida salva sozinha. "Nova run" pede confirmação.
- [ ] "Abandonar run" pede confirmação e apaga a run salva (sem Essência).

## Run
- [ ] Começa direto na onda 1 (sem ovos), com faixa "Onda 1" e música da run acelerando a cada onda; música do chefe nas ondas 7, 14 e 20 (volta à trilha normal na onda seguinte).
- [ ] Inimigos novos aparecem conforme as ondas: Esqueleto atira no herói (flecha), Lodo se divide, Aranha prende criaturas na teia, Gárgula pousa cinza como pedra, Cavaleiro Sem Cabeça dispara com rastro, Banshee Sombria cura (anel verde), Necromante ergue zumbis.
- [ ] Chefes: Rei Ogro pisa (anel e criaturas com estrelinhas), Rainha Aranha prende 3 criaturas, Lich atira no herói, invoca esqueletos, ganha escudo (bolha) e enfurece ("Segunda fase").
- [ ] Elites com brilho dourado, barra de vida dourada e mais ouro.
- [ ] Menu → Códex: inimigos enfrentados com ficha; os outros em silhueta com a onda em que aparecem.
- [ ] Vencer a onda 20 → "Seguir no Sem Fim" → escolha de recompensa → "Onda 21 · Sem Fim" no HUD; ao cair, "Fim do Sem Fim" com a Essência só das ondas extras.
- [ ] HUD: onda, ouro, vida do Nexus, criaturas/limite. Renda +1 ouro a cada 2 s (talentos aceleram).
- [ ] Herói anda com WASD/setas e clique/segurar; anel sob os pés na cor do herói (sem brilho ciano).
- [ ] Painel mostra só a equipe; tooltip com descrição, atributos, habilidade, forma evoluída e bônus do herói (em dourado) quando a raça bate.
- [ ] Arrastar a carta ou tecla 1–6 + clique posiciona; prévia vermelha onde não pode; botão direito/Esc cancelam.
- [ ] Evoluir a 2ª/3ª cópia de uma criatura custa mais que a 1ª (proporcional ao custo de invocação dela).
- [ ] Clique no Nexus, tecla N ou botão "Melhorar o Nexus": quadro com 5 melhorias, bolinhas de nível, botão verde com ouro e "Máx." no fim; a ajuda de controles some enquanto o quadro está aberto. Campo de Lentidão aparece no chão; Raio dispara faíscas douradas; Escudo mostra um losango dourado quando pronto e uma bolha quando ativo.
- [ ] Moedas (giram) e baús (balançam) caem no chão, piscam antes de sumir e são coletados pelo herói; baú pausa e oferece 3 melhorias Raras ou melhores; loot que sobra fica no chão para a próxima onda.
- [ ] Trocar de aba, minimizar ou clicar fora da janela no meio de uma onda abre a pausa.
- [ ] Velocidade: botão/F cicla 1x → 2x → 4x → 0x; tecla 0 congela/descongela; em 0x aparece "Tempo parado", dá para invocar/evoluir e a pausa não abre.
- [ ] Inimigos que chegam ao Nexus ficam colados nele dando trancos (golpes a cada ~2 s) até morrer; todos os inimigos têm pose de ataque (Nexus, herói, tiro, teia, invocação).
- [ ] Nível do herói pode oferecer Pulso Ampliado (Pulso maior/mais longo/mais numeroso) e Eco do Pulso ("Eco!" e recarga quase imediata); entre ondas pode aparecer Sabedoria (+XP).
- [ ] Nível do herói: cada carta mostra o total "Agora X → Y" e a linha "Seu herói agora"; "Seus bônus" entre ondas lista as melhorias do herói; tooltip do Pulso (Espaço) mostra o dano atual (sobe com nível e Pulso Potente) e a recarga atual.
- [ ] Coleção: "Desbloquear" troca o rodapé por "Desbloquear por X ✦? Sobram Y ✦" com Cancelar/Confirmar; após confirmar a tela não volta ao topo e o card liberado brilha.
- [ ] Desempenho: ondas cheias (60+ inimigos, elites, lentos, petrificados) sem queda forte; brilho de elite/frenesi/forma evoluída e clarão de acerto continuam visíveis e sem cortes (inclusive chefes).
- [ ] HUD com legendas: cada chip tem rótulo (Onda, Ouro, Vida do Nexus, Herói · nível N, Criaturas, Inimigos vivos) e valor ("1 de 20", "4 de 5", "9 de 13"; "entre ondas"); barras do herói com números ("♥ 90/90" e "XP 12/15 → nível 2"); tudo cabe no topo com os botões à direita. Chip ☗ conta inimigos restantes/total da onda; passar o mouse no chip do herói mostra a ficha (dano, ataques/s, alcance, vida, velocidade, Pulso); a pausa mostra a mesma ficha.
- [ ] Menu/telas fora da run: topo com legendas (Essência, Fragmentos — só com o Santuário liberado —, Melhor onda, Coleção "2 de 36", Heróis "1 de 12", Vitórias "N de M runs"); botões do menu com "de" (Equipe 2 de 8, Códex N de M vistos); sem HUD da run, painel de criaturas, pausa ou velocidade.
- [ ] Fase 2 · Pântano: bloqueada até vencer a Fase 1 (a vitória mostra "Fase 2 · Pântano liberada!"); cenário com 4 poças de lama, juncos e vagalumes; criatura na lama ataca mais devagar e o herói anda mais devagar nela.
- [ ] Pântano: Sapo-Boi e Rei Sapo saltam em arco; Sanguessuga se cura ao golpear; Bruxa do Brejo lança praga verde (espirais e caveirinha na criatura); Crocodilo na lama vira só olhos e bolhas e não leva dano; criaturas atiram primeiro no Fogo-fátuo.
- [ ] Chefes do Pântano: Rei Sapo engole uma criatura ("engolida · Ns", contorno tracejado) e a cospe ao levar dano; Crocodilo Ancião mergulha e reaparece em investida; Hidra mostra "N cabeças", corta cabeça ("Cabeça cortada!") e renasce em dobro após 10 s.
- [ ] Menus como páginas (fora da run): sem arena atrás e sem rolagem em 1440×900; menu em duas colunas; abas lembram a última escolhida (Coleção/Santuário/Equipes por raça, Heróis por herói, Códex por fase, Conquistas Gerais/Heróis); talentos mostram detalhes ao passar o mouse.
- [ ] Sinergias (só com a Tundra liberada): faixa abaixo das criaturas com "Raça N/3" por raça da equipe; 2 classes diferentes em campo acendem (nível 1), 3 brilham (nível 2) e aparece "Sinergia: Raça"; o título do chip mostra o bônus e o do próximo nível.
- [ ] Tundra (liberada ao vencer o Pântano): cenário claro, lago com ilha e Pináculo Glacial, neve caindo; inimigos deslizam no gelo e não são segurados; gelo racha (rachaduras crescem) e vira buraco (inimigos comuns "Caem no gelo!"); nevasca com aviso, fogueiras apagam e o herói reacende; criaturas congeladas ficam num bloco de gelo; Yeti joga bolas de neve; Wyrm mergulha (só bolhas) e emerge rachando o gelo; onda 10 avisa a Avalanche (trilha pisca vermelho) e a neve desce esmagando inimigos; faixas Matilha, Gigantes, Nevasca Eterna, Grande Matilha.
- [ ] Configurações › Desempenho: Qualidade gráfica (Automática/Alta/Média/Baixa) muda a resolução interna da arena (Baixa fica um pouco mais suave/borrada); Automática reduz sozinha se o FPS cair abaixo de ~45 por 2 s e volta a subir quando folgado; "Mostrar FPS" exibe "N fps · largura×altura" no topo da arena.
- [ ] Invocar: clicar e soltar na carta só escolhe a criatura (prévia segue o mouse); um novo clique na arena posiciona; arrastar da carta até a arena posiciona ao soltar; soltar sobre o HUD não posiciona.
- [ ] Senhor dos Mortos: caveirinhas verdes marcam os corpos que o Pulso vai erguer (somem em 6 s); o botão do Pulso mostra "☠ N corpos"; esqueletos sobem da terra com poeira; no máximo 12 esqueletos ao mesmo tempo; sem queda de desempenho com muitos inimigos e aliados.
- [ ] Pulso pronto: ao recarregar, anel + "Pulso pronto!" sobre o herói e um toque sonoro; enquanto pronto, aura pulsando sob o herói e o botão do Pulso brilhando.
- [ ] Vender: clicar na criatura abre o popup (Vender 2×) ou V duas vezes; a câmera rola um pouco além das bordas do mundo para nada ficar preso atrás do HUD. A engrenagem funciona também na tela "clique para começar".
- [ ] HUD da run (tela cheia): topo central onda/ouro/inimigos; Nexus (vida + "Melhorar N" com o quadro de melhorias) no canto superior esquerdo; botões e minimapa à direita; barra inferior com herói (♥ e XP com números), criaturas como slots (retrato, tecla, custo; verde/vermelho; tooltip para cima; arrastar ou 1–8) e Pulso; controles na pausa.
- [ ] Cemitério: mapa maior com câmera e minimapa, muro com 4 portões e alamedas; ondas 1–3 só pelos portões oeste/leste; faixas com título nas ondas especiais (Revoada, Noite dos Mortos, Trégua, Cavaleiros, Ninhada, Guarda do Lich, chefes). Pântano: rio no meio com lama, trilhas nas margens, crocodilos e Crocodilo Ancião/Hidra pelo rio; faixas (Enxame de Sanguessugas, Trégua, Revoada de Fogos-fátuos, Coro dos Sapos).
- [ ] Motor de mapas (testar no console com `nexusStages.<fase>.entrances/script/weather/interactables/guards/escort` antes de jogar): inimigos seguem trilhas; ondas roteirizadas mostram título/cor na faixa e "N de total" no HUD; trégua sem inimigos com cartas Raras+; nevasca com aviso, véu de neve, fogueiras apagam e o herói reacende parado perto; ponto extra leva dano (número laranja) e, vital, encerra a run ao cair; escolta move Nexus/criaturas/herói ("A caravana avançou").
- [ ] Câmera (mapas maiores que a tela): sempre centrada no herói, acompanhando onde ele anda (suave, sem trancos); roda do mouse dá zoom (afasta até o mapa inteiro, aproxima até 1,25×) e invocar/clicar continua preciso; não há rolagem pela borda; minimapa no canto só para ver (Nexus, inimigos, criaturas, herói, retângulo da vista); invocar/clicar funciona com a vista deslocada.
- [ ] Nexus (menu): abas por fase liberada (cada fase guarda seu modelo e cor); prévias animadas de modelo e cor; "Do mapa" padrão (Cemitério = Cristal, Pântano = Lótus); Lótus bloqueado até vencer o Pântano; cores à venda (400 ✦, confirmação), por conquista e do Altar (Vazio/Aurora); a cor escolhida aparece na arena; Aurora muda de cor.
- [ ] Equipes salvas: tela Equipes com abas (herói + nome + nº de criaturas); trocar aba muda equipe e herói; renomear pelo campo Nome (Enter); "Trocar herói" abre Heróis e volta para Equipes; "+ Nova equipe 300 ✦" pede confirmação (até 5); menu mostra as equipes como botões e "Equipes · nome · N de 8"; a run usa a equipe ativa; tudo persiste ao recarregar.
- [ ] Altar de Variantes: botão no menu só após vencer a Fase 2; mostra chances e "garantida em N sorteios"; "Sortear 600 ✦" pede confirmação; resultado aparece no topo (reembolso, Fragmentos ou variante com retrato); variante aparece na Coleção ("Variante: Normal/Rara/…"), escolhê-la muda o retrato e a criatura na arena (cores; Épica com brilho; Lendária dourada com faíscas).
- [ ] Santuário: botão no menu só com a Fase 2 liberada (mostra o total de ❖); cartas por raça com saldo; "Fortalecer" pede confirmação com o saldo que sobra; nível sobe (★) e a tela não volta ao topo; na run, a criatura tem o bônus (dano/recarga no tooltip); fim de run no Pântano mostra "Fragmentos: ❖ +N Raça"; Cemitério não dá Fragmentos.
- [ ] Fases: menu mostra "Fase 1 · Cemitério" e o objetivo da fase; tela de Fases em carrossel (◀ ▶ e bolinhas), uma fase por vez com miniatura do mapa e do Nexus, vitórias e melhor onda ("· Sem Fim" se passou do total); bloqueada fica acinzentada com o requisito; perfil antigo com vitórias aparece como Fase 1 vencida; título "NEXUS TD".
- [ ] Topo do menu: Essência, Coleção, Heróis e Vitórias (sem Fragmentos e sem Melhor onda). Abas da tela de Heróis com o retrato de cada herói (silhueta se bloqueado).
- [ ] Fenda Sísmica (Colosso): rachadura larga na direção da mira, com magma pulsando e bordas de pedra, pedras e brasas saltando e tremor forte.
- [ ] Heróis: "Desbloquear" pede confirmação com a Essência que sobra; escolher/skin/compra não voltam a tela ao topo.
- [ ] Banshee: o mesmo inimigo não é empurrado/assustado em sequência (texto da habilidade cita o tempo).
- [ ] Enxame: ataque mostra 5 morcegos voando até o alvo e uma mordida vermelha.
- [ ] Equipe de até 8: com 6 ou mais, cartas compactas em duas colunas (nome inteiro, custo e atalho 1–8).
- [ ] Classes do F9: Clériga (bênção; Sacerdotisa protege de teia/pisão), Enxame (nuvem de morcegos), Tempestade (raio que salta), Uivador (uivo em área, "!" de medo), Possessor (inimigo fica esverdeado e luta contra os outros; Devorador explode), Herbalista (raízes nos pés).
- [ ] Clicar numa criatura abre um quadro sobre ela (abaixo, se não couber em cima; sempre dentro da arena) com dano, ataques/s, alcance, habilidade, evolução com "atual → depois" e Vender (2 cliques). No nível 2, as duas vertentes ficam lado a lado com as diferenças; passar o mouse numa vertente mostra o alcance dela tracejado na arena; ao escolher, banner com o nome da forma, aura e emblema na cor da vertente, e o desenho muda conforme a vertente (paleta e acessórios próprios). Na Coleção, sob cada criatura, as duas vertentes do nível 3 aparecem lado a lado (retrato e nome na cor da vertente); no primeiro companheiro, cada vertente tem seu retrato. Coleção, tooltip das cartas e primeiro companheiro mostram as duas vertentes.
- [ ] Clicar numa criatura: nome, estrelas (N cheias no nível N), quadro de atributos no painel, "Evoluir" verde com ouro / cinza sem, "Vender" pede confirmação; nível 3 mostra nome da forma evoluída, aura e acessório.
- [ ] Seta ⇧ verde sobre criaturas que podem evoluir. Cartas verdes/vermelhas; sem ouro ou vaga a carta treme e não é escolhida.
- [ ] Herói: chip no HUD com nível, vida e XP; barra de vida sobre o herói quando ferido; ao cair, "Renasce em N s" no Nexus e volta com vida cheia em 8 s.
- [ ] Subir de nível pausa o jogo e mostra 3 melhorias do herói; vários níveis de uma vez abrem uma escolha por nível.
- [ ] Com o jogo pausado, a tooltip das cartas aparece por cima da tela de pausa.
- [ ] Alcance do herói visível; Shift ou mouse sobre o herói destaca. Tooltip no botão do Pulso.
- [ ] Números de dano aparecem (e somem ao desligar nas Configurações). Velocidade 1x/2x/4x (botão ou F).
- [ ] Pulsos (Espaço, miram no mouse ou WASD): Cavaleiro avança e arremessa; Vampiro solta morcegos que caçam 6 alvos e curam o herói; Draconato cospe fogo contínuo que segue o mouse; Licantropo vira lobisomem gigante (6 s); Espectro desliza translúcido com rastros; Bruxa transforma inimigos em sapos; Fada acelera as criaturas (pó dourado); Colosso abre uma fenda que atordoa e deixa lento; Senhor dos Mortos ergue esqueletos onde inimigos caíram; Górgona petrifica em leque (petrificados se despedaçam); Arquidemônio chama 5 meteoros (aviso no chão); Arcanjo derruba uma coluna de luz após o aviso dourado.
- [ ] Habilidades: Guarda segura 2 (anel tracejado), Sanguinário cura, Caçador salta entre alvos, Alfa mostra a aura e acelera vizinhos, Assombração ignora armadura, Banshee grita em leque e empurra, Feiticeira envenena, Caldeirão cria poças.
- [ ] Inimigos piscam ao levar dano (veneno e poças não piscam); morte com fantasma, moedas e "+ouro".

## Entre ondas e fim
- [ ] 3 melhorias com raridade (cinza/verde/dourada brilhando) + loja (sortear 10/20/30…, +1 vaga 60/120/240).
- [ ] Fim: onda, abates, Essência e conquistas novas com as skins liberadas; Continuar volta ao menu com tudo salvo.

## Save
- [ ] Save `nx3` (ou `nx2`) antigo abre com a mesma Essência; melhorias antigas viram as raízes da árvore no mesmo nível; criaturas compradas continuam na coleção.

## Geral
- [ ] P/Esc pausam; "Sair para o menu" funciona.
- [ ] Sem erros no console.
- [ ] `npm run build` e `npm run preview` funcionam.
- [ ] Tutorial de fase: na primeira run de cada fase aparece o quadro "Como funciona" (jogo parado até "Começar"); não aparece de novo; na pausa, "📜 Como funciona esta fase" mostra o quadro e "← Voltar" retorna à pausa. Na primeira run do jogo, o tutorial guiado começa depois do quadro.
- [ ] Herói nasce com escudo (bolha dourada, ~3 s, pisca no fim): não toma dano no início da run nem ao renascer.
- [ ] Ímã: moedas e baús perto do herói voam até ele; o upgrade Ímã aumenta de onde eles são puxados.
- [ ] Painel do Nexus: comprar várias vezes seguidas funciona com o Nexus apanhando (o clique não se perde).
- [ ] Variante do Altar aparece também nas formas evoluídas (Coleção, nível 3) e na carta da criatura na run.
- [ ] Cartas de melhoria (ondas e baús) mostram "Agora X → Y" e "(máx.)" quando batem no teto (crítico 75%, desconto de evolução 75%, recarga do Pulso 65%).
- [ ] Humanos: passiva Disciplina (evoluem 40% mais barato) aparece na Coleção e no tooltip da carta; o custo de evoluir no quadro da criatura já vem com o desconto.
- [ ] Herói para no nível 30 (barra de XP cheia com "Nível máximo"); a Precisão não aparece mais com 100% de crítico.
- [ ] Lobisomem: passiva Caçada na Coleção e no tooltip; inimigo atingido mostra arranhões vermelhos, fica mais lento e não desliza no gelo; sem alvo no alcance, o lobisomem salta até um inimigo (arco de ida e volta) a cada 10 s.
- [ ] Código de presente (Configurações): código errado mostra "Código inválido."; o certo libera a raça Unicórnio (aba na Coleção, Alicórnio em Heróis) e continua após recarregar/exportar/importar. Sem o código, nada do Unicórnio aparece nem conta (Coleção X de 36, Heróis X de 12). Unicórnios não são presos por teia, atordoamento, congelamento nem pelo Rei Sapo. Arco-Íris encanta inimigos comuns na linha.
- [ ] Estrelas: depois do nível 3 o quadro oferece "Estrela ★4" com o ganho; ★5 aparece bloqueada ("só despertadas com Forma Suprema, até 2 por run"); a Ascensão não dá estrelas. Santuário: no nível 5, "✦ Despertar ❖ 100 + ◆ 8" (desabilitado sem Cristais); fim de run mostra Cristais Ancestrais ganhos (vitória da Fase 2+, Sem Fim a cada 10 ondas).
- [ ] Formas Supremas dos Humanos: Arqueiro/Guarda/Clériga despertados em ★5 viram Mestre Arqueiro / Olho do Falcão / Bastião / Juiz de Ferro / Santa / Grã-Inquisidora, cada uma com visual próprio; a Coleção mostra a linha "✦ Forma Suprema" em cada vertente.
- [ ] Admin: o código de administrador em Configurações mostra "Modo administrador ativado" e o botão 🛠 Admin no menu; definir/somar moedas, tirar/pôr criaturas e heróis, Santuário ±, Despertar, variantes, conquistas (skins), fases vencidas, cores do Nexus, talentos e presentes; Liberar tudo; despertadas continuam após recarregar.
- [ ] Tetos: ao chegar no teto (ex.: dano +300%), a carta mostra "(máx.)" e a família some das ofertas. Sem Fim: na onda 25 (fase de 20) entra a 1ª mutação com faixa rosa e chip "Mutações" no topo (ícones; título com nome e efeito); Escudados mostram anel que quebra no 1º golpe; Divisores soltam 2 menores; Explosivos atordoam criaturas perto (unicórnios não).
- [ ] Santuário: 1ª visita abre o tutorial (Entrar no Santuário); "? Como funciona" reabre; cards com pontinhos de nível e ✦ no 5; desperta com moldura animada e selo; Admin › Rever tutoriais mostra de novo.
- [ ] Equipes: arrastar uma vaga sobre outra muda a posição; ◀ ▶ movem uma posição; ✕ tira da equipe; a ordem vale para os atalhos 1–8 na run e é salva na equipe ativa.
- [ ] Auras no chão: Alfa (velocidade) e bênçãos (Clériga, Encantadora, Guardião, Unicórnio Guardião...) mostram área preenchida e borda com tracejado girando; auras que ferem (Lança Celeste, Juiz) ficam laranja com ondas saindo do centro e faíscas.
- [ ] Formas Supremas: cada criatura despertada em ★5 vira a forma suprema da vertente com visual próprio (Admin › Criaturas › Despertar e evoluir até ★5 na run para conferir); a Coleção mostra a linha "✦ Forma Suprema" em todas as vertentes.
- [ ] Variante escolhida (Coleção) aparece em todos os retratos: menu, Equipes, Santuário, Coleção, Heróis/Equipes salvas e cartas da run; "Normal" volta à original.
- [ ] Deserto (Fase 4): liberado ao vencer a Tundra; tutorial da fase; dois Obeliscos com barra de vida (o leste espelha a vida do principal e cura entre ondas); inimigos atacam o Obelisco mais próximo; qualquer um caindo encerra a run; herói recupera vida parado num oásis.
- [ ] Tempestade de areia (Deserto): aviso 5 s antes; névoa alaranjada; inimigos longe do herói e das criaturas viram vultos, não são atacados e somem do minimapa; ao chegar perto aparecem; HUD com Obelisco Oeste e Leste.
- [ ] Inimigos do Deserto: Múmia cai e levanta uma vez (não levanta se levou fogo); Serpente some na areia e emerge perto do Obelisco atordoando criaturas; Saqueador rouba ouro (−N ◉) e devolve ao morrer; Djinn se teleporta rumo ao Obelisco mais ferido; Escorpião (onda 10) ferroa à distância; Faraó (onda 20) ergue Múmias, amaldiçoa e levanta uma vez. Códex descreve todas as habilidades.
- [ ] Deserto: roteiro de 20 ondas com faixas (Enxame, Caravana pela estrada leste, Tumba Aberta, Escorpião, Trégua, Tempestade Eterna, Ventos do Djinn, Grande Enxame, Tumba Real, Grande Caravana, Faraó); Obelisco Leste também é protegido pela Égide/Escudo/Blindagem do Nexus.
- [ ] Relíquias: botão no menu bloqueado antes de vencer a Tundra; depois, tela com vagas (1/2/3 com as condições), equipar/tirar, "Sem vaga"; 1º abate de um chefe mostra a faixa "Relíquia: …" e ela aparece no fim da run e na tela; Ankh salva o Obelisco uma vez ("☥ O Ankh salvou…"); bônus equipados valem na run (ex.: Filactério dá +1 vaga).
- [ ] Controles: Configurações → Controles troca teclas (Esc cancela; tecla em uso troca com a outra; Restaurar padrão); textos de ajuda (pausa, Pulso) mostram a tecla nova; segurar a tecla do Pulso solta ao recarregar.
- [ ] Menu: cartão da fase escolhida (miniatura e nome; clicar abre as fases) e equipe de 8 numa linha só.
