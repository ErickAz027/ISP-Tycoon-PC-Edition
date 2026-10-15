import { ElectronAPI } from '@electron-toolkit/preload'

export interface IpcGameAPI {
  saveGame: (data: string) => Promise<{ success: boolean; path?: string; error?: string }>
  loadGame: () => Promise<{ success: boolean; data?: string; notFound?: boolean; error?: string }>
  getSavePath: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    gameAPI: IpcGameAPI
  }
}
