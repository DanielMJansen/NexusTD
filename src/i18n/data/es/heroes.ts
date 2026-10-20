// Heróis e classes de criatura em espanhol.
export const CREATURE_CLASSES_ES: Record<string, string> = {
  melee: 'Atacante cuerpo a cuerpo',
  ranged: 'Tirador a distancia',
  area: 'Área',
  control: 'Control',
  blocker: 'Bloqueador',
  support: 'Apoyo',
};

export const HEROES_ES: Record<string, string> = {
  'knight.name': 'Caballero',
  'knight.role': 'Guardián cuerpo a cuerpo',
  'knight.description': 'Guardián versátil: espada rápida y una embestida con escudo que aleja el peligro del Nexus.',
  'knight.lore':
    'El último de la Orden de la Vigilia, caballeros juramentados para guardar el Nexus de la capital. La orden cayó en una sola noche y solo él salió en pie, con la espada rota y el juramento intacto. No tiene alas, garras ni magia: tiene disciplina y la terquedad de quien ya lo perdió todo una vez y no piensa volver a perderlo.',
  'knight.pulse.name': 'Carga Heroica',
  'vampireLord.name': 'Noble Vampiro',
  'vampireLord.role': 'Duelista cuerpo a cuerpo que se cura luchando',
  'vampireLord.description': 'Duelista elegante: cada golpe le devuelve vida, y su bandada de murciélagos hace sangrar a los enemigos.',
  'vampireLord.lore':
    'Vivió cuatro siglos entre bailes e intrigas, alimentándose de la nobleza que lo temía. Cuando los Nexus empezaron a caer, entendió antes que nadie que un mundo sin vivos es un mundo sin banquete. Lucha con elegancia y sin prisa, y cada enemigo que cae lo deja un poco más joven.',
  'vampireLord.pulse.name': 'Bandada de Murciélagos',
  'draconian.name': 'Dracónido',
  'draconian.role': 'Lanzallamas resistente, daño en área',
  'draconian.description': 'Medio dragón lento y resistente: escupe fuego en abanico y suelta un chorro de llamas que sigue tu puntería.',
  'draconian.lore':
    'El último huevo de una nidada que los cazadores de dragones nunca encontraron. Eclosionó solo, entre las cenizas del nido donde murió su madre, y creció sin nadie que le enseñara lo que era. Aprendió a volar cayendo y a escupir fuego quemándose la garganta. Hoy lleva la sangre de una raza casi extinta y no piensa ser el último: si los Nexus caen, no habrá mundo donde los dragones puedan renacer.',
  'draconian.pulse.name': 'Lanzallamas',
  'lycan.name': 'Licántropo',
  'lycan.role': 'Fiera cuerpo a cuerpo, muy rápida',
  'lycan.description': 'Fiera de garras rapidísimas. Con el Pulso se convierte en un hombre lobo gigante que ataca en abanico y se cura con cada golpe.',
  'lycan.lore':
    'Era cazador de hombres lobo hasta que lo mordió la fiera que perseguía desde hacía diez años. Hoy lidera la manada que un día cazó y aprendió a escuchar a la luna en vez de temerla. Todavía lleva las marcas de sus dos vidas: el olfato de la fiera y la paciencia del cazador.',
  'lycan.pulse.name': 'Furia Lunar',
  'specter.name': 'Espectro',
  'specter.role': 'Atraviesa todo, ignora la armadura',
  'specter.description': 'Ignora las armaduras. Su Pulso es una travesía translúcida que hiere todo a su paso y espanta a quien sobrevive.',
  'specter.lore':
    'Murió defendiendo un Nexus y se negó a cruzar el velo mientras el cristal no estuviera a salvo. No siente frío, no siente dolor y no recuerda su propio nombre, solo el deber. Las armaduras no lo detienen porque no las necesita: atraviesa todo, incluso a los enemigos.',
  'specter.pulse.name': 'Travesía',
  'witch.name': 'Bruja',
  'witch.role': 'Hechicera a distancia, control',
  'witch.description': 'Ataca de lejos con orbes. Su hechizo convierte a los enemigos cercanos en sapos lentos, frágiles e inofensivos.',
  'witch.lore':
    'Vivió recluida en lo más hondo del Pantano, coleccionando venenos, secretos y enemistades. Fue la primera en notar que los Nexus se apagaban, porque sus pociones dejaron de funcionar. No lucha por heroísmo: lucha porque sin magia en el mundo no es más que una vieja con un caldero.',
  'witch.pulse.name': 'Hechizo del Sapo',
  'faeQueen.name': 'Reina Hada',
  'faeQueen.role': 'Apoyo a distancia',
  'faeQueen.description': 'Frágil, pero rápida. Su Bendición Feérica hace que todas las criaturas ataquen mucho más rápido durante unos segundos.',
  'faeQueen.lore':
    'Gobierna un reino escondido entre el rocío y la luz de la mañana, invisible para quien no cree. Los Nexus alimentan las flores de su reino, y las flores se están marchitando. Frágil como un ala, pero una palabra suya hace que un ejército entero luche el doble de rápido.',
  'faeQueen.pulse.name': 'Bendición Feérica',
  'colossus.name': 'Coloso',
  'colossus.role': 'Tanque, control',
  'colossus.description': 'Lento y muy resistente. Aplasta todo al frente y abre una grieta en el suelo que aturde y ralentiza a quien pasa.',
  'colossus.lore':
    'Fue esculpido hace milenios para proteger el primer Nexus y durmió de pie a su lado hasta el día en que el cristal tembló. Habla poco, camina despacio y no olvida nada. Cada piedra de su cuerpo es una promesa antigua, y ninguna se ha roto todavía.',
  'colossus.pulse.name': 'Grieta Sísmica',
  'deathLord.name': 'Señor de los Muertos',
  'deathLord.role': 'Invocador cuerpo a cuerpo',
  'deathLord.description': 'Corta en abanico con la guadaña. Su Pulso levanta esqueletos que luchan a tu lado.',
  'deathLord.lore':
    'Lo enterraron vivo por orden de un rey que temía lo que sabía. Pasó siete días en la oscuridad de la cripta, escuchando a los muertos a su alrededor, hasta que uno de ellos respondió. Salió de allí con la guadaña del sepulturero y un ejército que ningún rey podría comprar. Conoce el otro lado del velo mejor que cualquier vivo, y sabe que lo que espera allí no quiere sirvientes. Solo quiere un mundo vacío.',
  'deathLord.pulse.name': 'Alzar a los Muertos',
  'gorgonQueen.name': 'Reina Gorgona',
  'gorgonQueen.role': 'Controladora a media distancia',
  'gorgonQueen.description': 'Ataca a media distancia con la lanza serpiente. Su Mirada Fatal petrifica todo en un abanico al frente.',
  'gorgonQueen.lore':
    'Reina de un pueblo exiliado en ruinas de mármol, rodeada de las estatuas de quienes un día intentaron cazarla. Los humanos la llaman monstruo, pero fue ella quien guardó el Nexus del Desierto durante siglos, sola. Ahora acepta aliados por primera vez y, por cortesía, no mira directamente a ninguno.',
  'gorgonQueen.pulse.name': 'Mirada Fatal',
  'archdemon.name': 'Archidemonio',
  'archdemon.role': 'Destructor de área',
  'archdemon.description': 'Lanza llamas en abanico. Su Lluvia de Meteoros cuesta parte de la vida del héroe, pero incendia un área entera.',
  'archdemon.lore':
    'Un señor del abismo que hizo un pacto con el propio Nexus: poder a cambio de protección. Nadie sabe con certeza quién salió ganando, ni siquiera él. Paga con su propia vida cada explosión y sonríe mientras paga, porque para un demonio todo precio vale un buen espectáculo.',
  'archdemon.pulse.name': 'Lluvia de Meteoros',
  'archangel.name': 'Arcángel',
  'archangel.role': 'Cazador de jefes',
  'archangel.description': 'Espada de luz rápida. Su Juicio Celestial hace descender una columna de luz que golpea fuerte y marca a los enemigos.',
  'archangel.lore':
    'Bajó de la Ciudadela Celeste cuando el Serafín que la gobernaba fue corrompido por la misma fuerza que caza a los Nexus. Carga con la vergüenza de no haberse dado cuenta a tiempo y con una espada de luz que no perdona. Lucha como quien quiere arreglar el cielo entero, un enemigo cada vez.',
  'archangel.pulse.name': 'Juicio Celestial',
  'alicorn.name': 'Alicornio',
  'alicorn.role': 'Encantador a distancia',
  'alicorn.description': 'Unicornio alado. Ataca con el rayo de su cuerno; su Arcoíris hiere y encanta a una fila de enemigos, que pasan a luchar de tu lado.',
  'alicorn.lore':
    'Un ser tan raro que la mayoría lo considera una leyenda, incluso los demás unicornios. Nació de la primera luz que emitió un Nexus y siente cada cristal que se apaga como una herida en su propio cuerpo. La luz de su cuerno no solo hiere: les recuerda a los enemigos de qué lado deberían estar.',
  'alicorn.pulse.name': 'Arcoíris',
};
