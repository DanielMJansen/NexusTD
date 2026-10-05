# Checklist de regressão manual

Rodar após mudanças grandes (`npm run dev`), no navegador do computador, com mouse e teclado. Testar também uma janela menor (ex.: 1280×720) e uma tela de alta densidade, se houver.

## Menu
- [ ] Título, Essência, objetivo da run e as duas colunas (melhorias permanentes, criaturas iniciais) cabem sem rolagem.
- [ ] Melhorias mostram nível (●○) e custo; desabilitadas sem Essência ou no nível máximo (MÁX).
- [ ] Comprar melhoria ou criatura inicial desconta Essência, toca som e persiste após recarregar.
- [ ] ▶ Jogar abre a escolha do primeiro ovo.

## Início da run
- [ ] "Escolha seu primeiro ovo" mostra até 3 criaturas místicas ainda bloqueadas, com retrato animado, papel e habilidade.
- [ ] Ao escolher, a carta dela sai da silhueta no painel e aparece a faixa "Onda 1".
- [ ] Se todas já estiverem desbloqueadas no perfil, a run começa direto na onda 1.

## Durante a onda
- [ ] HUD: onda, ouro, barra de vida do Nexus (vermelha abaixo de 30%) e criaturas em campo.
- [ ] Renda passiva: +1 ouro a cada 2 s.
- [ ] Herói anda com WASD/setas e com clique/segurar no chão; vira para o lado do movimento; não sai da arena.
- [ ] Herói ataca sozinho o inimigo mais próximo (alcance 60), com animação de espada.
- [ ] Arrastar uma carta do painel até a arena posiciona a criatura; soltar fora da arena deixa a carta escolhida.
- [ ] Tecla 1–6 escolhe a carta; clicar na arena posiciona; a prévia segue o mouse e fica vermelha onde não pode (sem ouro, limite de 5, em cima do Nexus).
- [ ] Botão direito ou Esc cancelam a carta escolhida.
- [ ] Custo da próxima cópia sobe ×1,5 e fica vermelho quando falta ouro.
- [ ] Clicar numa criatura mostra nome, estrelas de nível, alcance e os botões "Evoluir ◉X" e "Vender +X".
- [ ] Evoluir (botão ou tecla E) desconta ouro, mostra efeito e "Nível 2"; no nível 3 aparece o nome da forma evoluída, aura e acessório (coroa, chifres dourados, arco dourado, auréola, orbes).
- [ ] Vender devolve 60% de tudo que foi pago (invocação + evoluções).
- [ ] Guarda segura até 2 inimigos (anel tracejado sob eles); o chefe passa direto. Paladino segura 4.
- [ ] Abates do Sanguinário curam o Nexus ("+2" verde).
- [ ] Tooltip ao passar o mouse na carta: atributos e habilidade.
- [ ] Pulso (Espaço ou botão): onda de choque ao redor do herói; botão mostra recarga.
- [ ] Arqueiro (flecha), Duelista (corte; Frenesi com aura vermelha após 6 golpes), Fogo (bola de fogo e explosão em área), Gelo (estilhaço e lentidão com brilho azul).
- [ ] Morcegos em zigue-zague a partir da onda 2; Ogros a partir da onda 4; zumbis às vezes em bando de 3.
- [ ] Inimigos piscam ao levar dano; ao morrer: fantasma, partículas, moedas e "+ouro".
- [ ] Inimigo que chega ao Nexus causa dano (número vermelho, cristal pisca, tela treme) e some.

## Entre ondas
- [ ] Onda 1 vencida: oferece só ovos (se houver).
- [ ] Ondas seguintes: 3 opções entre melhorias e ovos; Nexus cura +10.
- [ ] Loja no rodapé: "Sortear de novo" (10, depois 20, 30...) troca as opções; desabilitado quando não há outras opções. "+1 vaga" (60, 120, 240) aumenta o limite no HUD.
- [ ] Escolher aplica o efeito e mostra a faixa da próxima onda.

## Fim
- [ ] Onda 10: faixa "Rei Ogro chegou!", tremor de tela, coroa.
- [ ] Vitória ao limpar a onda 10; derrota com Nexus a 0.
- [ ] Tela final mostra onda, abates e Essência (3 × onda + abates/5 + 30 se vencer); Continuar volta ao menu com a Essência salva.

## Geral
- [ ] P/Esc ou botão pausam e retomam; "Sair para o menu" funciona.
- [ ] 🔊/🔇 alterna o som.
- [ ] Sem erros no console.
- [ ] `npm run build` e `npm run preview` funcionam (caminho relativo `base: './'`).
