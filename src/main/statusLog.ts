import { mainWindow } from './'
import { Subject } from 'rxjs'

interface Log {
  type: string
  step?: string
  percent?: number
  message?: string
  [index: string]: any
}

// 发送状态显示给用户
const createLog = () => {
  const log$ = new Subject<Log>()
  log$.subscribe(
    log => mainWindow && mainWindow.webContents.send('download-status', log)
  )
  return log$.next.bind(log$)
}

const log: (log: Log) => void = createLog()

export default log
