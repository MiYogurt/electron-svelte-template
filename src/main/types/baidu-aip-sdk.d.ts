declare module 'baidu-aip-sdk' {
  class AipSpeechClient {
    constructor(...args: any[])
    text2audio(text: string, opts: any): { data: Buffer }
  }
  export { AipSpeechClient as speech }
}
