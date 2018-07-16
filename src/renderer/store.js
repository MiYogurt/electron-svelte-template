import { Store } from 'svelte/store.js';
import Status from './pages/Status.svelte'
import Download from './pages/Download.svelte'
import CrawlStore from './pages/CrawlStore.svelte'
import Main from './pages/Main.svelte'

const store = new Store({
    currentPage: CrawlStore,
    msg: {
        type: 'success',
        content: ''
    }
});

store.changePage = changePage.bind(store)

function changePage(pageName) {
    const map = {
        Status,
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

store.setMsg = setMsg.bind(store)
store.success = success.bind(store)

export { changePage, setMsg, success }

export default store