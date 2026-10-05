import './style.css';

// Passo 1 da reescrita: só a base do projeto. O jogo completo ainda roda em /legacy/.
const canvas = document.querySelector<HTMLCanvasElement>('#arena');
const ctx = canvas?.getContext('2d');
if (!canvas || !ctx) throw new Error('Canvas #arena não encontrado');

ctx.fillStyle = '#07050f';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#f0eaff';
ctx.font = '14px Georgia';
ctx.textAlign = 'center';
ctx.fillText('Reescrita em andamento', canvas.width / 2, canvas.height / 2 - 10);
ctx.fillText('Protótipo antigo: /legacy/', canvas.width / 2, canvas.height / 2 + 14);
