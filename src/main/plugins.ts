import { app, ipcMain } from 'electron'
import { resolve } from 'path'
import { readdirSync, ensureDirSync, writeFile, remove } from 'fs-extra'
import requireFoolWebpack from 'require-fool-webpack'
import { store } from './tray'
import { promisified } from 'phin'
import { on } from './helper'

const pluginsPath = store.get(
  'PLUGIN_PATH',
  resolve(app.getPath('home'), '.reader-app-scripts')
)
ensureDirSync(pluginsPath)

// https://github.com/webpack/webpack/issues/196
// https://github.com/sindresorhus/require-fool-webpack

const loadPlugins = () => {
  let files = readdirSync(pluginsPath)
  return [
    files,
    files.map(filename =>
      requireFoolWebpack(resolve(pluginsPath, filename))(requireFoolWebpack)
    )
  ]
}
const saveToSetting = (all?: any) => {
  const [files, _] = loadPlugins()
  store.set('LOACAL_PLUGINS', files)
  all && ipcMain.emit('get_local_plugins', all.event, all.args)
}
saveToSetting()
on('reload_local_plugins').subscribe(saveToSetting)
on('get_local_plugins').subscribe(({ event, args }) => {
  event.sender.send('local_plugins', store.get('LOACAL_PLUGINS', []))
})

const storeURL =
  'https://raw.githubusercontent.com/MiYogurt/reader-store/master/db.json'

const fetchAllPlugins = (event: any) => {
  promisified(storeURL).then((res: any) => {
    let db = []
    try {
      db = JSON.parse(res.body.toString())
    } catch (e) {}
    event.sender.send('all_plugins', db)
    store.set('ALL_PLUGINS', db)
  })
}

on('reload_all_plugins').subscribe(async ({ event, args }) => {
  await fetchAllPlugins(event)
  ipcMain.emit('get_all_plugins', event, args)
})

on('get_all_plugins').subscribe(({ event, args }) => {
  const db = store.get('ALL_PLUGINS', [])
  if (db.length > 0) {
    return event.sender.send('all_plugins', db)
  }
  fetchAllPlugins(event.sender.send)
})

on('download_plugin').subscribe(async ({ event, args }) => {
  const { filename, url } = args
  await promisified(url)
    .then(({ body }) => body.toString())
    .then(data => (console.log(data), data))
    .then(data => writeFile(pluginsPath + '/' + filename, data))
  ipcMain.emit('reload_local_plugins', event, args)
  event.sender.send('download_plugin_success', filename)
})

on('delete_plugin').subscribe(async ({ event, args }) => {
  const { filename } = args
  await remove(pluginsPath + '/' + filename)
  ipcMain.emit('reload_local_plugins', event, args)
  event.sender.send('delete_plugin_success', filename)
})

export default loadPlugins
