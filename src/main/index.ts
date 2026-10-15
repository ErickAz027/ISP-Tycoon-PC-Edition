import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs/promises'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: 'ISP Tycoon - NOC Dashboard',
    backgroundColor: '#030712',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Set up IPC handlers for game state save/load
function setupIpc(): void {
  const saveFilePath = join(app.getPath('userData'), 'isp-tycoon-save.json')

  ipcMain.handle('game:save', async (_event, data: string) => {
    try {
      await fs.writeFile(saveFilePath, data, 'utf-8')
      return { success: true, path: saveFilePath }
    } catch (err: any) {
      console.error('Failed to save game:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('game:load', async () => {
    try {
      const data = await fs.readFile(saveFilePath, 'utf-8')
      return { success: true, data }
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { success: false, notFound: true }
      }
      console.error('Failed to load game:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('game:getSavePath', () => {
    return saveFilePath
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.isptycoon.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpc()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
