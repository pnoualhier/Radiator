import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

console.log('[RadioFrance:Init] 🚀 Démarrage du point d\'entrée principal (main.tsx)...');

// Global error handlers to display fatal runtime errors directly in the UI instead of a blank white screen
window.addEventListener('error', (event) => {
  console.error('[RadioFrance:GlobalError]', event.error || event.message);
  displayFatalErrorInUI(event.error?.message || event.message || 'Erreur inconnue');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[RadioFrance:UnhandledRejection]', event.reason);
  const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
  displayFatalErrorInUI(msg);
});

function displayFatalErrorInUI(errorMessage: string) {
  const root = document.getElementById('root');
  if (root && root.children.length <= 1) {
    root.innerHTML = `
      <div style="min-height: 100vh; background-color: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: monospace;">
        <div style="max-width: 480px; width: 100%; background-color: #0f172a; border: 1px solid #334155; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px;">⚠️</div>
          <h2 style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 0 0 8px;">Incident d'initialisation détecté</h2>
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px; line-height: 1.5;">L'application a intercepté une exception lors du montage initial. Vous pouvez recharger l'interface.</p>
          <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; font-size: 11px; color: #fcd34d; text-align: left; max-height: 120px; overflow-y: auto; margin-bottom: 20px; word-break: break-all;">
            ${errorMessage}
          </div>
          <button onclick="window.location.reload()" style="background-color: #f59e0b; color: #020617; font-weight: bold; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: monospace;">Recharger l'application</button>
        </div>
      </div>
    `;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[RadioFrance:Init] ❌ Élément DOM #root introuvable!');
  const fallbackDiv = document.createElement('div');
  fallbackDiv.id = 'root';
  document.body.appendChild(fallbackDiv);
}

try {
  const target = document.getElementById('root')!;
  console.log('[RadioFrance:Init] 📦 Montage du composant React dans #root...');
  const root = createRoot(target);
  root.render(
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
  console.log('[RadioFrance:Init] ✅ createRoot.render() exécuté avec succès.');
} catch (err: any) {
  console.error('[RadioFrance:Init] ❌ Échec critique lors du render:', err);
  displayFatalErrorInUI(err?.message || String(err));
}
