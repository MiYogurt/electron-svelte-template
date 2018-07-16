import { Subject } from 'rxjs'
import { ipcMain as ipc } from 'electron'
import { store } from './tray'
import { remove } from 'fs-extra'
import log from './statusLog'

function ready() {
  let resolveFN, rejectFN
  let promise = new Promise(
    (resolve, reject) => ([resolveFN, rejectFN] = [resolve, reject])
  )
  return [resolveFN, rejectFN, promise]
}

interface CombineEvent {
  event: any
  args: any
}

function on(channel: string): Subject<CombineEvent> {
  const eventListner = new Subject<CombineEvent>()
  ipc.on(channel, (event: any, args: any) => eventListner.next({ event, args }))
  return eventListner
}

async function handleStop(path: string, logInfo: any) {
  if (store.get('stop')) {
    path && (await remove(path))
    log(logInfo)
    return true
  }
  return false
}

export { ready, on, handleStop }
