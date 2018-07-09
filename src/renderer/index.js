import App from './App.svelte'
import { ipcRenderer } from 'electron'

const app = new App({
  target: document.querySelector('#app'),
  data: {
    name: 'world'
  }
})
