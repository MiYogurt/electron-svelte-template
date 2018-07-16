<Back/>
<div class="wrap">
    <h2>插件列表</h2>
    <button class="d-btn" on:click="refresh()">刷新</button>
    <ul ref:list>
        {#each plugins as plugin,index}
        <li in:fade class="plugin">
            <a class="title" target="_blank" href={plugin.repository} title="点我跳转到仓库页">{plugin.showname}</a>

            <p class="info {infoIndex == index? '': 'hidden'}" on:click="showInfo(index)">
                {@html marked(plugin.description || '')}
            </p>
            <p class="control">
                {plugin.author}
                <span class="right">
                {#if plugin.downloaded } 
                    <button class="d-btn del" on:click="del(plugin.filename)">
                    {#if inWorking(workingFilename, plugin.filename)}
                        ···
                    {:else}
                        删除
                    {/if}
                    </button> 
                {:else}
                    <button class="d-btn green" on:click="download(plugin.filename, plugin.url)">
                    {#if inWorking(workingFilename, plugin.filename)}
                        ···
                    {:else}
                        下载
                    {/if}
                    </button> 
                {/if}
            </span>
            </p>
        </li>
        {/each}
    </ul>
</div>

<script>
    import {
        ipcRenderer as ipc,
        shell
    } from 'electron'
    import marked from 'marked'
    import {
        fade
    } from 'svelte-transitions';

    import {
        push,
        splice
    } from 'svelte-extras';

    function addDownloaed(plugins, local_plugins) {
        return plugins.map(plugin => {
            plugin.downloaded = local_plugins.findIndex(local_plugin => local_plugin == plugin.filename) >= 0
            return plugin
        })
    }

    function inWorking(workingFilename, filename) {
        return workingFilename.indexOf(filename) >= 0
    }

    export default {
        data() {
            return {
                local_plugins: [],
                all_plugins: [],
                infoIndex: -1,
                workingFilename: []
            }
        },
        components: {
            Back: '../components/Back.svelte'
        },
        helpers: {
            marked,
            inWorking
        },
        transitions: {
            fade
        },
        computed: {
            plugins: ({
                all_plugins,
                local_plugins
            }) => addDownloaed(all_plugins, local_plugins)
        },
        methods: {
            push,
            splice,
            showInfo(index) {
                const oldIndex = this.get().infoIndex
                if (oldIndex == index) {
                    return this.set({
                        infoIndex: -1
                    })
                }
                this.set({
                    infoIndex: index
                })
            },
            refresh() {
                ipc.send('reload_local_plugins')
                ipc.send('reload_all_plugins')
            },
            download(filename, url) {
                if (inWorking(this.get().workingFilename, filename)) {
                    return
                }
                this.push('workingFilename', filename)
                this.store.setMsg('info', `下载插件中`)
                ipc.send('download_plugin', {
                    filename,
                    url
                })
            },
            del(filename) {
                if (inWorking(this.get().workingFilename, filename)) {
                    return
                }
                this.push('workingFilename', filename)
                this.store.setMsg('info', `删除插件中`)
                ipc.send('delete_plugin', {
                    filename
                })
            },
            all_plugins(event, all_plugins) {
                this.set({
                    all_plugins
                })
            },
            local_plugins(event, local_plugins) {
                this.set({
                    local_plugins
                })
            },
            download_plugin_success(event, filename) {
                const filenames = this.get().workingFilename || []
                let index = filenames.indexOf(filename)
                if (index >= 0) {
                    this.splice('workingFilename', index, 1)
                }
                if (this.get().workingFilename == 0) this.store.success('下载完成')
            },
            delete_plugin_success(event, filename) {
                const filenames = this.get().workingFilename || []
                let index = filenames.indexOf(filename)
                if (index >= 0) {
                    this.splice('workingFilename', index, 1)
                }
                if (this.get().workingFilename == 0) this.store.success('删除完成')
            }

        },
        ondestroy() {
            ipc.removeListener('all_plugins', this.all_plugins.bind(this))
            ipc.removeListener('local_plugins', this.local_plugins.bind(this))
            ipc.removeListener('download_plugin_success', this.download_plugin_success.bind(this))
            ipc.removeListener('delete_plugin_success', this.delete_plugin_success.bind(this))
        },
        oncreate() {
            ipc.send('get_all_plugins')
            ipc.send('get_local_plugins')

            ipc.on('all_plugins', this.all_plugins.bind(this))
            ipc.on('local_plugins', this.local_plugins.bind(this))
            ipc.on('download_plugin_success', this.download_plugin_success.bind(this))
            ipc.on('delete_plugin_success', this.delete_plugin_success.bind(this))

            this.refs.list.addEventListener("click", (e) => {
                if (e.target.tagName.toLowerCase() == 'a') {
                    e.preventDefault()
                    shell.openExternal(e.target.href)
                }
            }, true)
        }
    }
</script>

<style>
    h2 {
        color: #fff;
        font-weight: 600;
        padding: 1rem .5rem;
    }
    
    .wrap {
        height: 100vh;
        background: #303238;
    }
    
    h2~button {
        margin-left: .5rem;
        margin-bottom: 1rem;
    }
    
    ul {
        list-style: none;
        margin: .5rem
    }
    
    .plugin {
        padding: .5rem;
        background: #383A41;
        border-radius: .2rem;
        margin: .5rem 0;
    }
    
    .title {
        color: #fff;
        text-decoration: none;
        font-size: 20px;
        outline: none;
        font-weight: 900;
    }
    
    .info {
        color: #fff;
        font-size: .89rem;
        margin: .3rem 0;
        cursor: default;
        font-weight: 300;
        transition: all .2s;
        max-width: 100%;
    }
    
    .info :global(a) {
        text-decoration: none;
        color: #fff;
    }
    
    .info :global(a):hover {
        background: #fff;
        color: black;
    }
    
    .info.hidden {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    
    .control {
        font-size: .8rem;
        color: #fff;
        display: flex;
        align-items: center;
    }
    
    .right {
        margin-left: auto;
    }
    
    .d-btn {
        padding: .3rem 1rem;
        color: #fff;
        background: #54B3FF;
        border: none;
        outline: none;
        cursor: pointer;
        border-radius: 2px;
    }
    
    .del {
        background: transparent;
    }
    
    .green {
        background: #4BCB7C;
    }
    
    .solid {
        border: 1px solid #fff
    }
</style>