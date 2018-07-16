import App from './App.svelte'
import store from './store'

const app = new App({
    target: document.querySelector('#app'),
    store
})
console.log(store);
window.store = store