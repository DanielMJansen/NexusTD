# Checklist de regressão manual

Rodar após mudanças grandes (`npm run dev`), no navegador do computador, com mouse e teclado. Testar também uma janela menor (ex.: 1366×768) e um save antigo (ver "Save").

## Entrada, menu e configurações
- [ ] Tela "Clique para começar" (ou Enter/Espaço) leva ao menu e a música do menu começa.
- [ ] Jogador novo: aparece "Escolha seu primeiro companheiro" (só criaturas místicas); a escolhida entra na coleção e na equipe; não aparece de novo.
- [ ] Menu: Essência, herói + equipe em miniatura, botões Jogar / Herói / Equipe / Coleção / Talentos / Conquistas / Códex / Configurações.
- [ ] Essência sempre com ✦ lilás e ouro sempre com ◉ dourado, em todas as telas.
- [ ] ⚙ (topo, menu ou pausa): sliders de música e efeitos mudam o volume ao vivo; "Silenciar tudo" e o botão 🔊 ficam sincronizados; tudo persiste ao recarregar.
- [ ] Exportar save baixa `nexus-save-AAAA-MM-DD.json`; importar pede confirmação, substitui tudo e recarrega; arquivo inválido mostra erro e não quebra nada.

## Meta-progressão
- [ ] Talentos: 6 colunas em cadeia (cor e ícone por ramo); a linha entre os nós mostra "Nv N" até cumprir o requisito e depois acende com ✓; nós bloqueados ficam cinza; comprar desconta Essência, mostra "Atual / Próximo" e persiste.
- [ ] Nexus+: Raio Desperto / Campo Gélido / Escudo Ancestral fazem a run começar com a habilidade no nível 1; Engenharia Arcana baixa os preços no quadro do Nexus.
- [ ] Coleção: ficha de cada criatura (descrição, lore, atributos, habilidade, forma evoluída com retrato); bloqueadas em silhueta com preço; comprar adiciona à equipe se houver vaga.
- [ ] Equipe: 6 vagas; clicar adiciona/remove; "Jogar" desabilita com equipe vazia; ordem da equipe = atalhos 1–6.
- [ ] Heróis: comprar e escolher; descrição de ataque, Pulso e bônus de raça; skins liberadas por conquista são selecionáveis e aparecem na run.
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
- [ ] Clicar numa criatura abre um quadro sobre ela (abaixo, se não couber em cima; sempre dentro da arena) com dano, ataques/s, alcance, habilidade, evolução com "atual → depois" e Vender (2 cliques). No nível 2, as duas vertentes ficam lado a lado com as diferenças; passar o mouse numa vertente mostra o alcance dela tracejado na arena; ao escolher, banner com o nome da forma, aura e emblema na cor da vertente, e o desenho muda conforme a vertente (paleta e acessórios próprios). Na Coleção e no primeiro companheiro, cada vertente tem seu retrato. Coleção, tooltip das cartas e primeiro companheiro mostram as duas vertentes.
- [ ] Clicar numa criatura: nome, estrelas (N cheias no nível N), quadro de atributos no painel, "Evoluir" verde com ouro / cinza sem, "Vender" pede confirmação; nível 3 mostra nome da forma evoluída, aura e acessório.
- [ ] Seta ⇧ verde sobre criaturas que podem evoluir. Cartas verdes/vermelhas; sem ouro ou vaga a carta treme e não é escolhida.
- [ ] Herói: chip no HUD com nível, vida e XP; barra de vida sobre o herói quando ferido; ao cair, "Renasce em N s" no Nexus e volta com vida cheia em 8 s.
- [ ] Subir de nível pausa o jogo e mostra 3 melhorias do herói; vários níveis de uma vez abrem uma escolha por nível.
- [ ] Com o jogo pausado, a tooltip das cartas aparece por cima da tela de pausa.
- [ ] Alcance do herói visível; Shift ou mouse sobre o herói destaca. Tooltip no botão do Pulso.
- [ ] Números de dano aparecem (e somem ao desligar nas Configurações). Velocidade 1x/2x/4x (botão ou F).
- [ ] Pulso (Espaço) com o nome do Pulso do herói: Onda de Choque, Revoada (cura), Rugido (raio maior), Uivo (inimigos com "!" fogem), Travessia (herói atravessa o campo), Maldição (veneno com bolhas verdes).
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
