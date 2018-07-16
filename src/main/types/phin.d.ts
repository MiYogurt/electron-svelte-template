declare module 'phin' {
  export function promisified(url: string, opts?: any): Promise<string>
  export function promisified(...args: any[]): Promise<any>
}
