# Checklist de regressão manual

Rodar após mudanças grandes (`npm run dev`), no navegador do computador, com mouse e teclado. Testar também uma janela menor (ex.: 1366×768) e um save antigo (ver "Save").

## Entrada, menu e configurações
- [ ] Tela "Clique para começar" (ou Enter/Espaço) leva ao menu e a música do menu começa.
- [ ] Jogador novo: aparece "Escolha seu primeiro companheiro" (só criaturas místicas); a escolhida entra na coleção e na equipe; não aparece de novo.
- [ ] Menu: Essência, herói + equipe em miniatura, botões Jogar / Herói / Equipe / Coleção / Talentos / Conquistas / Configurações.
- [ ] Essência sempre com ✦ lilás e ouro sempre com ◉ dourado, em todas as telas.
- [ ] ⚙ (topo, menu ou pausa): sliders de música e efeitos mudam o volume ao vivo; "Silenciar tudo" e o botão 🔊 ficam sincronizados; tudo persiste ao recarregar.
- [ ] Exportar save baixa `nexus-save-AAAA-MM-DD.json`; importar pede confirmação, substitui tudo e recarrega; arquivo inválido mostra erro e não quebra nada.

## Meta-progressão
- [ ] Talentos: 5 colunas; nós bloqueados mostram o pré-requisito; comprar desconta Essência, mostra "Atual → Próximo" e persiste.
- [ ] Coleção: ficha de cada criatura (descrição, lore, atributos, habilidade, forma evoluída com retrato); bloqueadas em silhueta com preço; comprar adiciona à equipe se houver vaga.
- [ ] Equipe: 6 vagas; clicar adiciona/remove; "Jogar" desabilita com equipe vazia; ordem da equipe = atalhos 1–6.
- [ ] Heróis: comprar e escolher; descrição de ataque, Pulso e bônus de raça; skins liberadas por conquista são selecionáveis e aparecem na run.
- [ ] Conquistas: lista com progresso (abates, runs, vitórias, coleção) e a skin que cada uma libera.

## Run
- [ ] Começa direto na onda 1 (sem ovos), com faixa "Onda 1" e música da run acelerando a cada onda; música do chefe na onda 10.
- [ ] HUD: onda, ouro, vida do Nexus, criaturas/limite. Renda +1 ouro a cada 2 s (talentos aceleram).
- [ ] Herói anda com WASD/setas e clique/segurar; anel sob os pés na cor do herói (sem brilho ciano).
- [ ] Painel mostra só a equipe; tooltip com descrição, atributos, habilidade, forma evoluída e bônus do herói (em dourado) quando a raça bate.
- [ ] Arrastar a carta ou tecla 1–6 + clique posiciona; prévia vermelha onde não pode; botão direito/Esc cancelam.
- [ ] Clicar numa criatura: nome, estrelas, "Evoluir ◉X" (ou E) e "Vender +X"; nível 3 mostra nome da forma evoluída, aura e acessório.
- [ ] Pulso (Espaço) com o nome do Pulso do herói: Onda de Choque, Revoada (cura), Rugido (raio maior), Uivo (inimigos com "!" fogem), Travessia (herói atravessa o campo), Maldição (veneno com bolhas verdes).
- [ ] Habilidades: Guarda segura 2 (anel tracejado), Sanguinário cura, Caçador salta entre alvos, Alfa mostra a aura e acelera vizinhos, Assombração ignora armadura, Banshee grita em leque e empurra, Feiticeira envenena, Caldeirão cria poças.
- [ ] Inimigos piscam ao levar dano (veneno e poças não piscam); morte com fantasma, moedas e "+ouro".

## Entre ondas e fim
- [ ] 3 melhorias + loja (sortear 10/20/30…, +1 vaga 60/120/240).
- [ ] Fim: onda, abates, Essência e conquistas novas com as skins liberadas; Continuar volta ao menu com tudo salvo.

## Save
- [ ] Save `nx3` (ou `nx2`) antigo abre com a mesma Essência; melhorias antigas viram as raízes da árvore no mesmo nível; criaturas compradas continuam na coleção.

## Geral
- [ ] P/Esc pausam; "Sair para o menu" funciona.
- [ ] Sem erros no console.
- [ ] `npm run build` e `npm run preview` funcionam.
