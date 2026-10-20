import './style.css';
import { App } from './app';
import { setLang, translateStatic } from './i18n/i18n';
import { loadSettings } from './save/settings';

// idioma antes de qualquer tela: os textos dos dados são trocados (carregados só para o idioma escolhido),
// os textos fixos do HTML são traduzidos uma vez e os demais passam por t() ao desenhar
async function boot(): Promise<void> {
  const lang = loadSettings().language;
  setLang(lang);
  if (lang !== 'pt') {
    const [{ applyDataTranslations }, data] = await Promise.all([
      import('./i18n/dataText'),
      lang === 'en' ? import('./i18n/data/en') : import('./i18n/data/es'),
    ]);
    applyDataTranslations(data.DATA);
  }
  translateStatic(document.body);

  const app = new App();
  app.start();

  // Só em desenvolvimento: acesso pelo console (window.nexus) para testar e balancear.
  if (import.meta.env.DEV) {
    void import('./data/stages').then((stages) => Object.assign(window, { nexus: app, nexusStages: stages.STAGES }));
  }
}

void boot();
