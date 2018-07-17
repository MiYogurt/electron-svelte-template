import { speech } from 'baidu-aip-sdk'
import from2 from 'from2'
import { createWriteStream } from 'fs'
import concatstream from 'mp3-concat'
import { ensureDir, readJson } from 'fs-extra'
import { resolve } from 'path'
import { ready, handleStop } from './helper'
import log from './statusLog'

import { store } from './tray'
import { timer } from 'rxjs'

let APP_ID = store.get('APP_ID')
let API_KEY = store.get('API_KEY')
let SECRET_KEY = store.get('SECRET_KEY')
let TTS_WAIT = store.get('TTS_WAIT')
store.onDidChange('APP_ID', (newValue: any) => (APP_ID = newValue))
store.onDidChange('API_KEY', (newValue: any) => (API_KEY = newValue))
store.onDidChange('SECRET_KEY', (newValue: any) => (SECRET_KEY = newValue))
store.onDidChange('TTS_WAIT', (newValue: any) => (TTS_WAIT = newValue))

let client: any = null

try {
  client = new speech(APP_ID, API_KEY, SECRET_KEY)
} catch (e) {
  log({ type: 'audio', step: 'new_speech_error', message: e.message })
}

const splitText = (text: string) => {
  const length = text.length
  const datas = []
  let index = 0
  while (index <= length) {
    let currentText = text.substr(index, 510)
    index += 510
    datas.push(currentText)
  }
  return datas
}

const saveFile = (datas: Buffer[], path: string) => {
  const saveStream = createWriteStream(path)
  const [yes, _, promise] = ready()
  from2(datas)
    .pipe(concatstream())
    .pipe(saveStream)
    .on('close', yes)
  return promise
}

const getMp3Data: any = async (text: string, opts: any = {}) => {
  const textArr = splitText(text)
  return Promise.all(
    textArr.map(async chunk => {
      const { data } = await client.text2audio(chunk, opts)
      return data
    })
  ).catch(() => getMp3Data(text, opts))
}

const transform = async (pathRoot: string) => {
  const chaptersPath = resolve(pathRoot, 'chapters.json')
  const chapterSavePath = resolve(pathRoot, 'audio')
  await ensureDir(chapterSavePath)
  try {
    const chapters = await readJson(chaptersPath)
    let i = 0
    const len = chapters.length
    while (i < len) {
      if (
        await handleStop(chapterSavePath, {
          type: 'stop',
          message: '已停止音频队列'
        })
      ) {
        break
      }
      let chapter = chapters[i]
      const chapterPath = resolve(
        pathRoot,
        'text',
        `${i}-${chapter.title}.json`
      )
      const text = await readJson(chapterPath)
      const datas = await getMp3Data(text, client)
      await timer(TTS_WAIT).toPromise()
      await saveFile(
        datas,
        resolve(chapterSavePath, `${i}-${chapter.title}.mp3`)
      )
      log({
        title: `${i}-${chapter.title}.mp3`,
        type: 'audio',
        percent: Math.ceil((i / len) * 100)
      })
      i += 1
    }
  } catch (error) {
    log({ type: 'error', message: error.message })
  }
}

export default transform
