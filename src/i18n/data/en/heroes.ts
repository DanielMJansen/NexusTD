// Heróis e classes de criatura em inglês.
export const CREATURE_CLASSES_EN: Record<string, string> = {
  melee: 'Melee attacker',
  ranged: 'Ranged shooter',
  area: 'Area',
  control: 'Control',
  blocker: 'Blocker',
  support: 'Support',
};

export const HEROES_EN: Record<string, string> = {
  'knight.name': 'Knight',
  'knight.role': 'Melee guardian',
  'knight.description': 'A versatile guardian: a quick sword and a shield charge that throws danger away from the Nexus.',
  'knight.lore':
    'The last of the Order of the Watch, knights sworn to guard the capital\'s Nexus. The order fell in a single night and only he walked away, with a broken sword and an unbroken oath. He has no wings, claws or magic: he has discipline, and the stubbornness of someone who has lost everything once and does not intend to lose it again.',
  'knight.pulse.name': 'Heroic Charge',
  'vampireLord.name': 'Vampire Noble',
  'vampireLord.role': 'Melee duelist who heals while fighting',
  'vampireLord.description': 'An elegant duelist: every strike gives him life back, and his flock of bats makes enemies bleed.',
  'vampireLord.lore':
    'He lived four centuries among balls and intrigue, feeding on the nobility that feared him. When the Nexuses began to fall, he understood before anyone else that a world without the living is a world without a feast. He fights with elegance and without hurry, and every enemy that falls leaves him a little younger.',
  'vampireLord.pulse.name': 'Flock of Bats',
  'draconian.name': 'Draconian',
  'draconian.role': 'Sturdy flamethrower, area damage',
  'draconian.description': 'A slow, sturdy half-dragon: spits fire in a fan and unleashes a jet of flame that follows your aim.',
  'draconian.lore':
    'The last egg of a clutch the dragon hunters never found. It hatched alone, in the ashes of the nest where its mother died, and grew up with no one to tell it what it was. It learned to fly by falling and to breathe fire by burning its own throat. Today it carries the blood of a nearly extinct race and does not intend to be the last of it: if the Nexuses fall, there will be no world where dragons can be reborn.',
  'draconian.pulse.name': 'Flamethrower',
  'lycan.name': 'Lycan',
  'lycan.role': 'Very fast melee beast',
  'lycan.description': 'A beast with lightning-fast claws. Its Pulse turns it into a giant werewolf that attacks in a fan and heals with every strike.',
  'lycan.lore':
    'He was a werewolf hunter until he was bitten by the beast he had chased for ten years. Today he leads the pack he once hunted and has learned to listen to the moon instead of fearing it. He still carries the marks of both lives: the nose of the beast and the patience of the hunter.',
  'lycan.pulse.name': 'Lunar Fury',
  'specter.name': 'Specter',
  'specter.role': 'Phaser, ignores armor',
  'specter.description': 'Ignores armor. Its Pulse is a translucent crossing that hurts everything in its path and frightens the survivors.',
  'specter.lore':
    'He died defending a Nexus and refused to cross the veil while the crystal was not safe. He feels no cold, feels no pain and does not remember his own name, only his duty. Armor does not stop him because he does not need it: he passes through everything, enemies included.',
  'specter.pulse.name': 'Crossing',
  'witch.name': 'Witch',
  'witch.role': 'Ranged sorceress, control',
  'witch.description': 'Attacks from afar with orbs. Her spell turns nearby enemies into slow, fragile, harmless frogs.',
  'witch.lore':
    'She lived as a recluse deep in the Swamp, collecting poisons, secrets and enemies. She was the first to notice the Nexuses were fading, because her potions stopped working. She does not fight out of heroism: she fights because without magic in the world she is just an old woman with a cauldron.',
  'witch.pulse.name': 'Frog Hex',
  'faeQueen.name': 'Fae Queen',
  'faeQueen.role': 'Ranged support',
  'faeQueen.description': 'Fragile, but fast. Her Fae Blessing makes every creature attack much faster for a few seconds.',
  'faeQueen.lore':
    'She rules a kingdom hidden between the dew and the morning light, invisible to those who do not believe. The Nexuses feed the flowers of her kingdom, and the flowers are wilting. Fragile as a wing, but one word from her makes a whole army fight twice as fast.',
  'faeQueen.pulse.name': 'Fae Blessing',
  'colossus.name': 'Colossus',
  'colossus.role': 'Tank, control',
  'colossus.description': 'Slow and very sturdy. Crushes everything in front and opens a rift in the ground that stuns and slows whoever crosses it.',
  'colossus.lore':
    'It was carved millennia ago to protect the first Nexus and slept standing beside it until the day the crystal trembled. It says little, walks slowly and forgets nothing. Every stone of its body is an ancient promise, and none has been broken yet.',
  'colossus.pulse.name': 'Seismic Rift',
  'deathLord.name': 'Lord of the Dead',
  'deathLord.role': 'Melee summoner',
  'deathLord.description': 'Slashes in a fan with his scythe. His Pulse raises skeletons that fight at your side.',
  'deathLord.lore':
    'He was buried alive on the orders of a king who feared what he knew. He spent seven days in the dark of the crypt, listening to the dead around him, until one of them answered. He came out with the gravedigger\'s scythe and an army no king could buy. He knows the other side of the veil better than anyone alive, and he knows that what waits there does not want servants. It only wants an empty world.',
  'deathLord.pulse.name': 'Raise the Dead',
  'gorgonQueen.name': 'Gorgon Queen',
  'gorgonQueen.role': 'Mid-range controller',
  'gorgonQueen.description': 'Attacks from mid range with her serpent spear. Her Fatal Gaze petrifies everything in a fan in front of her.',
  'gorgonQueen.lore':
    'Queen of a people exiled to marble ruins, surrounded by the statues of those who once tried to hunt her. Humans call her a monster, but she is the one who guarded the Desert Nexus for centuries, alone. Now she accepts allies for the first time, and out of courtesy she does not look directly at any of them.',
  'gorgonQueen.pulse.name': 'Fatal Gaze',
  'archdemon.name': 'Archdemon',
  'archdemon.role': 'Area destroyer',
  'archdemon.description': 'Breathes flames in a fan. His Meteor Shower costs part of the hero\'s life, but sets a whole area ablaze.',
  'archdemon.lore':
    'A lord of the abyss who made a pact with the Nexus itself: power in exchange for protection. Nobody knows for sure who got the better deal, not even him. He pays with his own life for every explosion and smiles while paying, because for a demon, any price is worth a good show.',
  'archdemon.pulse.name': 'Meteor Shower',
  'archangel.name': 'Archangel',
  'archangel.role': 'Boss hunter',
  'archangel.description': 'A fast sword of light. His Celestial Judgment brings down a column of light that hits hard and marks enemies.',
  'archangel.lore':
    'He came down from the Celestial Citadel when the Seraph who ruled it was corrupted by the same force that hunts the Nexuses. He carries the shame of not noticing in time, and a sword of light that does not forgive. He fights like someone trying to fix the whole sky, one enemy at a time.',
  'archangel.pulse.name': 'Celestial Judgment',
  'alicorn.name': 'Alicorn',
  'alicorn.role': 'Ranged enchanter',
  'alicorn.description': 'A winged unicorn. Attacks with the beam of its horn; its Rainbow hurts and charms a line of enemies, who start fighting on your side.',
  'alicorn.lore':
    'A being so rare that most consider it a legend, other unicorns included. It was born from the first light a Nexus ever shed and feels every crystal that goes dark as a wound in its own body. The light of its horn does more than hurt: it reminds enemies which side they should be on.',
  'alicorn.pulse.name': 'Rainbow',
};
