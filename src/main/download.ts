import { promisified } from 'phin'
import { ServerRequest } from 'http'
import { decode } from 'iconv-lite'
import { load as cheerio } from 'cheerio'
import { writeJSON, ensureDir, readJson } from 'fs-extra'
import { resolve } from 'path'

import { from, of, timer, throwError } from 'rxjs'
import { pluck, map, concatAll, catchError, tap } from 'rxjs/operators'

import log from './statusLog'
import { downloadOptions, defaultOptions, Crawl, Chatper } from './crawl'
import { store } from './tray'

import { handleStop } from './helper'

// 请求
const request = (url: string) => from(promisified(url))

// cheerio 载入
const toSelector = (text: string) => {
  if (text) {
    return cheerio(text)
  }
  return throwError('没有抓取到内容')
}

// 处理 301、302
const handleFollowRedirect = (res: ServerRequest) => {
  const { headers } = res
  if (headers['location']) {
    return request(headers['location']!)
  }
  return of(res)
}

// 解码
const decodeCharset = (charset: string = 'utf-8') => (text: Buffer) =>
  decode(text, charset)

const getSelector = (url: string, charset?: string) =>
  request(url).pipe(
    map(handleFollowRedirect),
    concatAll(),
    pluck('body'),
    map(decodeCharset(charset)),
    map(toSelector),
    catchError(err => {
      log({ type: 'error', message: err.message })
      return of(err)
    })
  )

async function downloadChapter(
  url: string,
  crawl: Crawl,
  opts: Required<downloadOptions>
) {
  const { path, charset } = opts
  const savePath = resolve(path, `chapters.json`)
  return getSelector(url, charset)
    .pipe(
      tap(() => log({ type: 'crawl', step: 'chapter', percent: 30 })),
      map($ => crawl.chapter($, url)),
      tap(() => log({ type: 'crawl', step: 'chapter', percent: 60 })),
      map(chatpers => writeJSON(savePath, chatpers)),
      tap(() => log({ type: 'crawl', step: 'chapter', percent: 100 })),
      catchError(err => {
        log({ type: 'crawl', step: 'error', message: err.message })
        return of(err)
      })
    )
    .toPromise()
}

async function downloadText(
  chapter: Chatper,
  crawl: Crawl,
  index: number,
  opts: Required<downloadOptions>
) {
  const { path, charset } = opts
  const savePath = resolve(path, `text/${index}-${chapter.title}.json`)
  const selector = await getSelector(chapter.url, charset).toPromise()
  const text = crawl.text(selector)
  await writeJSON(savePath, text)
}

const chunk = (array: any[], chunkSize: number) => {
  let index = 0
  let retArr = []
  while (index <= array.length) {
    retArr.push(array.slice(index, index + chunkSize))
    index += chunkSize
  }
  return retArr
}

const invoke = (fn: Function) => fn()

async function downloadAllText(crawl: Crawl, opts: Required<downloadOptions>) {
  const { path, concurrence, waitTime } = opts
  const chaptersPath = resolve(path, 'chapters.json')
  let chapters = await readJson(chaptersPath)

  const needInvoke = chapters.map((chapter: Chatper, i: number) => () =>
    downloadText(chapter, crawl, i, opts)
  )

  let chaptersChunk = chunk(needInvoke, concurrence)

  for (let index = 0; index < chaptersChunk.length; index++) {
    const promies: Promise<void>[] = chaptersChunk[index].map(invoke)
    await Promise.all(promies)
    const percent = Math.ceil((index / chaptersChunk.length) * 100)
    const first =
      index * concurrence <= chapters.length - 1
        ? index * concurrence
        : chapters.length - 1
    log({
      type: 'crawl',
      step: 'text',
      percent,
      title: chapters[first].title
    })
    waitTime && (await timer(waitTime).toPromise())

    if (
      await handleStop(resolve(path, 'text'), {
        type: 'stop',
        message: '已停止下载队列'
      })
    ) {
      break
    }
  }
}

async function download(url: string, crawl: Crawl, opts: downloadOptions) {
  let concurrence = 5
  try {
    concurrence = parseInt(store.get('CONCURRENCE'))
  } catch (e) {}
  opts = Object.assign(
    {},
    {
      concurrence
    },
    defaultOptions,
    crawl.opts,
    opts
  )
  try {
    await ensureDir(resolve(opts.path!, 'text'))
    await downloadChapter(url, crawl, opts as Required<downloadOptions>)
    await downloadAllText(crawl, opts as Required<downloadOptions>)
  } catch (e) {
    console.log(e)
    log({ type: 'crawl', step: 'error', message: e.message })
  }
}

export default download
