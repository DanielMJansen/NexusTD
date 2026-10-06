// Exportar/importar todo o progresso num arquivo JSON, para levar a outro
// computador ou navegador. Formato inspirado no backup do Myth TD.
import { loadProfile, PROFILE_VERSION, profileFromData, saveProfile } from './save';
import { rawSavedRun, writeRawSavedRun } from './runSave';
import { loadSettings, sanitizeSettings, saveSettings } from './settings';

const FORMAT = 'nexus-save';
const FORMAT_VERSION = 1;

interface BackupFile {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  /** run: run em andamento salva (opcional). */
  data: { profileVersion: number; profile: unknown; settings: unknown; run?: unknown };
}

export function exportBackup(): string {
  const file: BackupFile = {
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: { profileVersion: PROFILE_VERSION, profile: loadProfile(), settings: loadSettings(), run: rawSavedRun() },
  };
  return JSON.stringify(file, null, 2);
}

/** Valida o arquivo e substitui o progresso atual. Lança Error com mensagem legível se for inválido. */
export function importBackup(text: string): void {
  let file: Partial<BackupFile>;
  try {
    file = JSON.parse(text) as Partial<BackupFile>;
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  if (!file || file.format !== FORMAT || typeof file.data !== 'object' || file.data === null) {
    throw new Error('Esse arquivo não é um save do Nexus.');
  }
  if (typeof file.version !== 'number' || file.version > FORMAT_VERSION) {
    throw new Error('Esse save é de uma versão mais nova do jogo.');
  }
  if (!file.data.profile) throw new Error('O arquivo não tem os dados de progresso.');
  const profile = profileFromData(file.data.profile, file.data.profileVersion);
  saveProfile(profile);
  saveSettings(sanitizeSettings(file.data.settings));
  writeRawSavedRun(file.data.run);
}

export const backupFileName = (): string => `nexus-save-${new Date().toISOString().slice(0, 10)}.json`;

/** Baixa o save como arquivo. */
export function downloadBackup(): void {
  const blob = new Blob([exportBackup()], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = backupFileName();
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/** Abre o seletor de arquivo e devolve o texto escolhido (ou null se cancelado). */
export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, () => resolve(null));
    });
    input.click();
  });
}
