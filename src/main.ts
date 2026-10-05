import './style.css';
import { App } from './app';

const app = new App();
app.start();

// Só em desenvolvimento: acesso pelo console (window.nexus) para testar e balancear.
if (import.meta.env.DEV) Object.assign(window, { nexus: app });
