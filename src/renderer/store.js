import { Store } from 'svelte/store.js';
import Download from './pages/Download.svelte'
import CrawlStore from './pages/CrawlStore.svelte'
import Main from './pages/Main.svelte'

const store = new Store({
    currentPage: Main,
    msg: {
        type: 'success',
        content: ''
    },
    start: false,
    files: [],
    index: 0,
    music: false
});

store.changePage = changePage.bind(store)

function changePage(pageName) {
    const map = {
        Download,
        Main,
        CrawlStore
    }
    const current = store.get().currentPage
    store.set({ 'currentPage': map[pageName] || current })
}

function setMsg(type, content) {
    store.set({
        msg: {
            type,
            content
        }
    })
}

function resetMsg() {
    store.set({
        msg: {
            type: 'info',
            content: ''
        }
    })
}

function success(content, timer = 1000) {
    store.set({
        msg: {
            type: 'success',
            content
        }
    })
    setTimeout(resetMsg, timer);
}

function warring(content, timer = 1000) {
    store.set({
        msg: {
            type: 'warring',
            content
        }
    })
    setTimeout(resetMsg, timer);
}

store.setMsg = setMsg.bind(store)
store.success = success.bind(store)
store.warring = warring.bind(store)

export { changePage, setMsg, success }

export default store