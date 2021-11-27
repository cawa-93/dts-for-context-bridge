declare module 'electron' {
    interface Shell {
        openExternal: (url: string) => Promise<void>
    }

    interface IpcRenderer {
        invoke: (...args: any) => Promise<any>
        send: (...args: any) => void
    }

    interface ContextBridge {
        exposeInMainWorld(apiKey: string, api: any): void
    }

    interface Electron {
        shell: Shell,
        ipcRenderer: IpcRenderer
        contextBridge: ContextBridge
    }

    const electron: Electron
    export default electron

    export const ipcRenderer: IpcRenderer
    export const shell: Shell
    export const contextBridge: ContextBridge

}