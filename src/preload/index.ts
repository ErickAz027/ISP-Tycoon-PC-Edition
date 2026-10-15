import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface IpcGameAPI {
  saveGame: (data: string) => Promise<{ success: boolean; path?: string; error?: string }>
  loadGame: () => Promise<{ success: boolean; data?: string; notFound?: boolean; error?: string }>
  getSavePath: () => Promise<string>
}

const gameAPI: IpcGameAPI = {
  saveGame: (data: string) => ipcRenderer.invoke('game:save', data),
  loadGame: () => ipcRenderer.invoke('game:load'),
  getSavePath: () => ipcRenderer.invoke('game:getSavePath')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('gameAPI', gameAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.gameAPI = gameAPI
}
