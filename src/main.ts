import './style.css';
import { App } from './app';
import { setLang, translateStatic } from './i18n/i18n';
import { loadSettings } from './save/settings';

// idioma antes de qualquer tela: os textos fixos do HTML são traduzidos uma vez, os demais passam por t() ao desenhar
setLang(loadSettings().language);
translateStatic(document.body);

const app = new App();
app.start();

// Só em desenvolvimento: acesso pelo console (window.nexus) para testar e balancear.
if (import.meta.env.DEV) {
  void import('./data/stages').then((stages) => Object.assign(window, { nexus: app, nexusStages: stages.STAGES }));
}
