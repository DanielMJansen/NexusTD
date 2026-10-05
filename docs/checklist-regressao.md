# Checklist de regressão manual

Rodar após cada passo de refatoração (`npm run dev`), em retrato no celular (ou DevTools em modo mobile) e com teclado/mouse.

## Menu
- [ ] Título NEXUS, Essência atual e texto de instruções aparecem.
- [ ] Melhorias permanentes mostram nível (●○) e custo; botão desabilitado sem Essência ou no nível 5 (MÁX).
- [ ] Comprar melhoria desconta Essência, sobe o nível, toca som e persiste após recarregar a página.
- [ ] Desbloquear criatura inicial (Duelista 40, Fogo 80, Gelo 80) mostra ✔ e persiste.
- [ ] ▶ JOGAR inicia a onda 1.

## Run
- [ ] HUD: `Onda X/10 · 💰 ouro · Nexus vida/máx · criaturas/5`.
- [ ] Ouro inicial = 30 + 10 × nível da melhoria; vida do Nexus = 100 + 15 × nível.
- [ ] Renda passiva: +1 ouro a cada 2 s.
- [ ] Herói se move tocando/segurando na arena e com setas/WASD; marcador de destino aparece; não sai da tela.
- [ ] Herói ataca sozinho o inimigo mais próximo (alcance 60).
- [ ] Cartas bloqueadas ficam escondidas; carta mostra sprite, nome e custo.
- [ ] Tocar carta → arrastar na arena mostra alcance e prévia; soltar posiciona (desconta ouro, custo da próxima cópia sobe ×1,5).
- [ ] Não posiciona: sem ouro, com 5 criaturas, ou em cima do Nexus.
- [ ] Tocar criatura mostra alcance e “Vender +X”; tocar no botão vende por 60% e devolve ouro flutuante.
- [ ] Pulso (botão ⚡): dano em área ao redor do herói, anel roxo, recarga de 12 s exibida no botão.
- [ ] Arqueiro (flecha), Duelista (Frenesi: brilho vermelho após 6 golpes), Fogo (área), Gelo (lentidão com brilho azul).
- [ ] Morcegos em zigue-zague a partir da onda 2; Ogros a partir da onda 4; zumbis às vezes em bando de 3.
- [ ] Abate: +ouro flutuante, partículas, som.
- [ ] Inimigo que chega ao Nexus causa dano e some.

## Entre ondas
- [ ] Onda 1 vencida: oferece ovos (criaturas bloqueadas) e “Seu primeiro ovo choca...”.
- [ ] Ondas seguintes: 3 opções entre melhorias e ovos; Nexus cura +10.
- [ ] Escolher aplica o efeito e inicia a próxima onda.

## Fim
- [ ] Onda 10 tem o Rei Ogro (som de chefe, coroa).
- [ ] Vitória ao limpar a onda 10; derrota com Nexus a 0.
- [ ] Tela final mostra abates e Essência ganha (3 × onda + abates/5 + 30 se vencer); Continuar volta ao menu com a Essência somada e salva.

## Controles gerais
- [ ] ⏸, P ou Esc pausam/retomam; “Sair para o menu” funciona.
- [ ] 🔊/🔇 alterna o som.
- [ ] Sem erros no console.
- [ ] `npm run build` e `npm run preview` funcionam (caminho relativo `base: './'`).
