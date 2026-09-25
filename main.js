const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        backgroundColor: '#1A1025',
        icon: path.join(__dirname, 'build', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Loads html using the ofic. method (works in both dev and exe)
    win.loadFile(path.join(__dirname, 'index.html'));

    Menu.setApplicationMenu(null);

    // Auto‑reloading only in development mode (npm start)
    if (!app.isPackaged) {
        let timeoutId = null;
        try {
            fs.watch(__dirname, { recursive: true }, (eventType, filename) => {
                if (!filename) return;
                if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist')) return;
                if (filename.endsWith('.html') || filename.endsWith('.js') || filename.endsWith('.css')) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        console.log(`🔄 Файл изменён: ${filename}, перезагружаем...`);
                        if (win && !win.isDestroyed()) win.reload();
                    }, 100);
                }
            });
        } catch (e) {
            console.log('fs.watch не запустился:', e.message);
        }
    }
}

ipcMain.on('minimize', () => { if (win) win.minimize(); });
ipcMain.on('maximize', () => {
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
});
ipcMain.on('close', () => { if (win) win.close(); });

app.whenReady().then(createWindow);

// Disables DevTools hotkeys in production
app.on('browser-window-created', (e, window) => {
    window.webContents.on('before-input-event', (event, input) => {
        if (app.isPackaged) {
            if (input.key === 'F12' ||
                (input.control && input.shift && input.key.toLowerCase() === 'i') ||
                (input.control && input.shift && input.key.toLowerCase() === 'j')) {
                event.preventDefault();
            }
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});