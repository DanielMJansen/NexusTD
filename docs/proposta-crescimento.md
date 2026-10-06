# Proposta — crescer o jogo (fases, modos, moedas e receita)

Status: **PROPOSTA** — nada aqui está decidido; cada bloco precisa de aprovação antes de virar etapa do plano.

## 1. Fases (biomas)

Hoje a run inteira acontece no Cemitério. A ideia é transformar a run atual em **Fase 1** e abrir um mapa de fases, cada uma liberada ao vencer a anterior.

| Fase | Cenário | Inimigos novos (exemplos) | Chefe | Regra própria do mapa |
|---|---|---|---|---|
| 1. Cemitério | o atual | zumbis, esqueletos, gárgulas… | Lich | — |
| 2. Pântano | lama, névoa, vitórias-régias | sapos-gigantes, sanguessugas, bruxas do brejo | Hidra (cabeças que renascem) | poças de lama deixam criaturas e herói lentos |
| 3. Floresta Sombria | árvores retorcidas | lobos, ents, fadas corrompidas | Ent Ancião | árvores bloqueiam parte do alcance |
| 4. Forja Infernal | lava e correntes | diabretes, cães infernais, golens de magma | Senhor da Forja | fendas de lava periódicas no chão |
| 5. Cidadela Celeste | nuvens, ruínas | anjos caídos, grifos, sentinelas | Arcanjo Caído | ventos empurram projéteis |

Cada fase reaproveita o motor atual (ondas, elites, chefes, Sem Fim) e só acrescenta **dados** (inimigos, ondas, cenário) e no máximo **uma regra de mapa**. Isso cabe no modelo dirigido por dados.

Ligação natural com as raças: algumas raças podem ser liberadas ao vencer uma fase. As próximas raças planejadas (Zumbis, Sereia, Centauro, Goblin, Elementais) combinam com biomas específicos.

## 2. Modos de jogo

1. **Ascensão (dificuldade escalonada).** Ao vencer uma fase, libera o nível 1 de Ascensão daquela fase; cada nível soma um modificador (inimigos +15% de vida, Nexus começa com menos vida, elites mais cedo…). É o que mantém Slay the Spire e Hades jogáveis por centenas de horas, e reaproveita tudo.
2. **Desafio diário.** Mesma semente para todos no dia (fase, herói, equipe e melhorias sorteados). Rende uma recompensa pequena e um placar. Placar global exige servidor; sem servidor, fica só o recorde pessoal.
3. **Corrida de Chefes.** Só os chefes de todas as fases em sequência, com escolhas entre eles.
4. **Mutadores.** Regras divertidas para ligar em qualquer run ("só criaturas de uma raça", "herói sem Pulso, criaturas +50%", "ouro em dobro, inimigos em dobro"), com bônus de Essência por mutador difícil.

Ordem sugerida: Ascensão → Fase 2 → Desafio diário → resto.

## 3. Moedas

Hoje existe uma moeda permanente (Essência ✦) e uma da run (ouro ◉). Moeda nova só deve entrar se tiver um destino que a Essência não cubra bem:

- **Fragmentos de raça** (um tipo por raça, caem ao jogar com criaturas daquela raça). Destino: **nível permanente das criaturas** (pequeno, ex.: +3% por nível, até 5). Já está "em aberto" no GDD.
- **Selos de Fase** (vencer fases e níveis de Ascensão). Destino: cosméticos (skins de criaturas, cenários alternativos, efeitos do Nexus) e títulos. É o que mostra progresso de "jogador avançado" sem mexer em poder.

Recomendação: começar só com Fragmentos (gameplay) e deixar Selos para quando houver cosméticos suficientes.

## 4. Receita real

Fatos importantes antes de escolher:

- **O save é local** (`localStorage`). Qualquer coisa vendida "dentro do jogo" pode ser destravada editando o save. Vender moeda ou poder só funciona com **conta e servidor**, que é um projeto à parte (login, banco, pagamentos, antifraude, LGPD).
- O gênero (Vampire Survivors, Brotato, Halls of Torment) vende muito bem como **jogo pago barato** (US$ 3–7 / R$ 10–25) com conteúdo grande, sem microtransações. Os jogadores do gênero rejeitam pay-to-win.

Caminhos, do mais simples ao mais complexo:

1. **Itch.io (já dá para começar).** Versão web grátis + "pague quanto quiser" ou versão completa paga para baixar. Custo quase zero; serve para testar interesse e juntar uma comunidade.
2. **Portais web com anúncios** (CrazyGames, Poki, GameDistribution). Eles hospedam e pagam parte da receita de anúncios. Encaixe bom: **anúncio recompensado opcional** (ex.: "assistir para dobrar a Essência da run" ou "reviver o Nexus uma vez"), nunca forçado no meio da run. Exige integrar o SDK do portal.
3. **Steam (maior potencial).** Empacotar o mesmo código com Electron ou Tauri; taxa de US$ 100 por jogo. Modelo: jogo pago + DLCs de conteúdo (novas fases/raças) e talvez um "Pacote do Apoiador" cosmético. A Steam cuida de pagamento, conquistas e nuvem.
4. **Apoio direto** (Ko-fi, Catarse, Patreon): skins exclusivas ou nome nos créditos para apoiadores. Receita pequena, mas ajuda a validar.

Recomendação: **demo grátis na web (GitHub Pages / itch / portal) + versão completa paga na Steam**, com fases e raças novas como conteúdo da versão completa ou de DLCs. Nada de moeda paga nem gacha.

## 5. Perguntas para decidir

1. Fases: a tabela faz sentido? Qual seria a Fase 2?
2. Ascensão entra antes das fases novas?
3. Fragmentos de raça e nível permanente das criaturas: sim ou não?
4. Receita: qual caminho quer explorar primeiro (itch, portal com anúncios, Steam)?
5. O nome "Nexus" é provisório: vale definir o nome antes de publicar em lojas (marca, busca, domínio).
