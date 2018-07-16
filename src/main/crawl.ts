import { app } from 'electron'
import { resolve } from 'path'

export interface downloadOptions {
  path?: string
  concurrence?: number
  waitTime?: number
  charset?: string
}

const defaultOptions: downloadOptions = {
  path: resolve(app.getPath('home'), 'xiaoshuo'),
  concurrence: 4,
  waitTime: 500,
  charset: 'utf-8'
}

export { defaultOptions }

export interface Chatper {
  title: string
  url: string
}

export interface Crawl {
  opts?: downloadOptions
  text(select: any): Chatper[]
  chapter(select: any, url: string): Chatper[]
}
