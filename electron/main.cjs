const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();

  // --- HANDLERS ---

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("read-dir", async (event, dirPath) => {
    try {
      const items = fs.readdirSync(dirPath);
      const files = items
        .map((item) => {
          const fullPath = path.join(dirPath, item);
          try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
              return { name: item, type: "folder", path: fullPath };
            } else {
              const ext = path.extname(item).toLowerCase();
              if (
                [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext)
              ) {
                return {
                  name: item,
                  type: "image",
                  path: fullPath,
                  src: `file://${fullPath}`,
                };
              }
            }
            return { name: item, type: "unknown" };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      return { success: true, files };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // NUEVO HANDLER: Abrir ubicación del archivo
  ipcMain.handle("show-item-in-folder", async (event, filePath) => {
    shell.showItemInFolder(filePath);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
