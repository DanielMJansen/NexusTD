import { findNexusColor, NEXUS_MODELS, type NexusLook } from '../data/nexusSkins';
import { STAGES, type StageId } from '../data/stages';
import type { NexusAppearance } from './arena';

/** Modelo e paleta do Nexus para a fase: "do mapa" usa o modelo da fase; "original" usa as cores do modelo. */
export function resolveNexus(look: NexusLook, stage: StageId): NexusAppearance {
  const model = look.model === 'map' ? STAGES[stage].nexusModel : look.model;
  const color = look.color === 'original' ? undefined : findNexusColor(look.color);
  return { model, palette: color?.palette ?? NEXUS_MODELS[model].palette, animated: color?.animated };
}
