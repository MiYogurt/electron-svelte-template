import util from 'electron-util'
declare module 'electron-util' {
  export function loadFile(win?: any, path?: string): void
}
