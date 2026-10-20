// Textos dos dados em espanhol, por conjunto (caminho → tradução). Carregado só quando o idioma é escolhido.
import type { DataTranslation } from '../../dataText';
import { CREATURES_ES } from './creatures';
import { ENEMIES_ES } from './enemies';
import { CREATURE_VARIANTS_ES, FEATURES_ES, TUTORIAL_ES } from './guide';
import { CREATURE_CLASSES_ES, HEROES_ES } from './heroes';
import {
  ACHIEVEMENTS_ES,
  ASCENSION_ES,
  GIFTS_ES,
  HERO_UPGRADES_ES,
  LORE_ES,
  MUTATIONS_ES,
  NEXUS_COLORS_ES,
  NEXUS_MODELS_ES,
  NEXUS_UPGRADES_ES,
  RACES_ES,
  SKINS_ES,
  UPGRADE_TIERS_ES,
  UPGRADES_ES,
  VARIANT_THEMES_ES,
  VARIANTS_ES,
} from './misc';
import { RELICS_ES, TALENT_BRANCHES_ES, TALENTS_ES } from './progress';
import { STAGES_ES } from './stages';

export const DATA: DataTranslation = {
  creatures: CREATURES_ES,
  creatureClasses: CREATURE_CLASSES_ES,
  heroes: HEROES_ES,
  enemies: ENEMIES_ES,
  relics: RELICS_ES,
  talents: TALENTS_ES,
  talentBranches: TALENT_BRANCHES_ES,
  achievements: ACHIEVEMENTS_ES,
  upgrades: UPGRADES_ES,
  upgradeTiers: UPGRADE_TIERS_ES,
  heroUpgrades: HERO_UPGRADES_ES,
  nexusUpgrades: NEXUS_UPGRADES_ES,
  stages: STAGES_ES,
  variantThemes: VARIANT_THEMES_ES,
  creatureVariants: CREATURE_VARIANTS_ES,
  variants: VARIANTS_ES,
  skins: SKINS_ES,
  mutations: MUTATIONS_ES,
  features: FEATURES_ES,
  nexusModels: NEXUS_MODELS_ES,
  nexusColors: NEXUS_COLORS_ES,
  lore: LORE_ES,
  races: RACES_ES,
  ascension: ASCENSION_ES,
  tutorial: TUTORIAL_ES,
  gifts: GIFTS_ES,
};
