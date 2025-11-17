const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let nextServer;

// Configuration pour le développement vs production
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    show: false, // Ne pas montrer tant que la page n'est pas prête
    title: 'Gestion de Stocks'
  });

  // Afficher la fenêtre une fois prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Barre de chargement pendant le démarrage
  mainWindow.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loader {
            text-align: center;
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h1 { margin: 0; font-size: 28px; }
          p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h1>Gestion de Stocks</h1>
          <p>Démarrage de l'application...</p>
        </div>
      </body>
    </html>
  `);

  // Démarrer le serveur Next.js
  startNextServer();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  console.log('Démarrage du serveur Next.js...');

  // Commande pour démarrer Next.js
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';

  nextServer = spawn(npmCommand, ['run', 'dev'], {
    cwd: __dirname,
    env: { ...process.env, PORT: PORT.toString() },
    shell: true
  });

  nextServer.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);

    // Détecter quand le serveur est prêt
    if (data.toString().includes('Ready') || data.toString().includes('started server')) {
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.loadURL(`http://localhost:${PORT}`);
        }
      }, 1000);
    }
  });

  nextServer.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });

  nextServer.on('close', (code) => {
    console.log(`Le serveur Next.js s'est arrêté avec le code ${code}`);
  });
}

// Quand Electron est prêt
app.whenReady().then(createWindow);

// Quitter quand toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Arrêter le serveur Next.js
    if (nextServer) {
      nextServer.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Arrêter proprement le serveur à la fermeture
app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
});
