// Textos dos dados em inglês, por conjunto (caminho → tradução). Carregado só quando o idioma é escolhido.
import type { DataTranslation } from '../../dataText';
import { CREATURES_EN } from './creatures';
import { ENEMIES_EN } from './enemies';
import { CREATURE_VARIANTS_EN, FEATURES_EN, TUTORIAL_EN } from './guide';
import { CREATURE_CLASSES_EN, HEROES_EN } from './heroes';
import {
  ACHIEVEMENTS_EN,
  ASCENSION_EN,
  GIFTS_EN,
  HERO_UPGRADES_EN,
  LORE_EN,
  MUTATIONS_EN,
  NEXUS_COLORS_EN,
  NEXUS_MODELS_EN,
  NEXUS_UPGRADES_EN,
  RACES_EN,
  SKINS_EN,
  UPGRADE_TIERS_EN,
  UPGRADES_EN,
  VARIANT_THEMES_EN,
  VARIANTS_EN,
} from './misc';
import { RELICS_EN, TALENT_BRANCHES_EN, TALENTS_EN } from './progress';
import { STAGES_EN } from './stages';

export const DATA: DataTranslation = {
  creatures: CREATURES_EN,
  creatureClasses: CREATURE_CLASSES_EN,
  heroes: HEROES_EN,
  enemies: ENEMIES_EN,
  relics: RELICS_EN,
  talents: TALENTS_EN,
  talentBranches: TALENT_BRANCHES_EN,
  achievements: ACHIEVEMENTS_EN,
  upgrades: UPGRADES_EN,
  upgradeTiers: UPGRADE_TIERS_EN,
  heroUpgrades: HERO_UPGRADES_EN,
  nexusUpgrades: NEXUS_UPGRADES_EN,
  stages: STAGES_EN,
  variantThemes: VARIANT_THEMES_EN,
  creatureVariants: CREATURE_VARIANTS_EN,
  variants: VARIANTS_EN,
  skins: SKINS_EN,
  mutations: MUTATIONS_EN,
  features: FEATURES_EN,
  nexusModels: NEXUS_MODELS_EN,
  nexusColors: NEXUS_COLORS_EN,
  lore: LORE_EN,
  races: RACES_EN,
  ascension: ASCENSION_EN,
  tutorial: TUTORIAL_EN,
  gifts: GIFTS_EN,
};
