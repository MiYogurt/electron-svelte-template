<div class="music-page { $music ?'show':'hidden' } ">
    <Back/>
    <div>
        <ul class="main">
            {#each files as file, index}
            <li on:click="$set({index})">{handleName(file)}</li>
            {/each}
        </ul>
        <div class="control">
            <div class="title">{title}</div>
            <div class="flex">
                <button on:click="file()"><img src="{staticPath + "plus-circle.png"}" width="25" height="25" alt="add"></button>
                <button on:click="play()"><img src="{staticPath+"play-circle.png"}" width="25" height="25" alt="play"></button>
                <button on:click="pause()"><img src="{staticPath + "time-out.png"}" width="25" height="25" alt="stop"></button>
                <button on:click="prev()"><img src="{staticPath+ "left-circle.png"}" width="25" height="25" alt="prev"></button>
                <button on:click="next()"><img src="{staticPath+"right-circle.png"}" width="25" height="25" alt="next"></button>
            </div>
        </div>
    </div>
</div>

<script>
    import {
        ipcRenderer,
        remote
    } from "electron";
    const {
        dialog,
        app
    } = remote
    const {
        readdir
    } = remote.require('fs-extra')

    import {
        resolve
    } from 'path'

    function handleName(name) {
        return name.replace('.mp3', '').split('-')[1]
    }

    function getStaticPath() {
        // eslint-disable-next-line no-process-env
        const isDevelopment = process.env.NODE_ENV === 'development';
        const staticPath = isDevelopment ? '' : "file://" + __dirname.replace(/app\.asar$/, 'static');
        return staticPath;
    }

    export default {
        data() {
            return {
                files: [],
                title: '',
                staticPath: getStaticPath() + '/'
            };
        },
        helpers: {
            handleName
        },
        components: {
            Back: '../components/Back.svelte'
        },
        oncreate() {
            this.player = new Audio()
            document.querySelector('#app').appendChild(this.player)

            const {
                files
            } = this.store.get()

            this.set({
                files
            })

            this.player.onended = this.next.bind(this)
            let listener = this.store.on('state', ({
                changed
            }) => {
                if (changed.index || changed.files) {
                    const {
                        files,
                        index
                    } = this.store.get()
                    this.player.src = "file://" + files[index]
                    this.set({
                        title: handleName(this.get().files[index])
                    })
                    this.play()
                }
            })
            this.on('destroy', listener.cancel)
        },
        ondestroy() {
            document.querySelectorAll("audio").forEach(a => a.remove())
        },
        methods: {
            next() {
                const {
                    index,
                    files
                } = this.store.get()
                let i = index + 1
                if (i > files.length - 1) {
                    i = files.length - 1
                }
                this.store.set({
                    index: i
                })
            },
            prev() {
                const {
                    index,
                    files
                } = this.store.get()
                let i = index - 1
                if (i < 0) {
                    i = 0
                }
                this.store.set({
                    index: i
                })
            },
            play() {
                if (!this.player.currentSrc) {
                    const {
                        files,
                        index
                    } = this.store.get()
                    this.set({
                        title: handleName(files[index])
                    })
                    this.player.src = "file://" + files[index]
                }
                this.player.play()
            },
            pause() {
                this.player.pause()
            },
            file() {
                dialog.showOpenDialog({
                    title: '选择音乐目录',
                    defaultPath: app.getPath('home'),
                    properties: ['openDirectory']
                }, async(folders) => {
                    if (folders.length > 0) {
                        const folder = folders[0]
                        let files = await readdir(folder)
                        this.set({
                            files
                        })
                        const compare = (a, b) => {
                            let t1 = a.split('-')[0];
                            let t2 = b.split('-');
                            return parseInt(t1) - parseInt(t2)
                        }
                        files = files.sort(compare).map(file => resolve(folder, file))
                        this.store.set({
                            files,
                            index: 0
                        })
                    }
                })
            }
        }
    };
</script>


<style>
    .music-page {
        transition: all ease-in .1s;
        height: 100vh;
    }
    
    .hidden {
        transform: translate(100%, 0)
    }
    
    .show {
        transform: translate(0, 0)
    }
    
    .control {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: #383A41;
        display: flex;
        flex-direction: column;
    }
    
    .title {
        color: #f8f8f8;
        padding: 1rem 0;
        text-align: center;
        font-size: .8rem;
        min-height: 54px;
        user-select: none;
    }
    
    .flex {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-basis: 100%;
    }
    
    .control button {
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
    }
    
    .control button:hover {
        background: #2f2f2f;
    }
    
    .main {
        height: calc(100vh - 160px);
        margin-bottom: 60px;
        overflow: scroll;
        background: #303238;
    }
    
    li {
        color: #f8f8f8;
        padding: 1.1rem 1rem;
        font-size: .9rem;
        cursor: pointer;
    }
    
    li:hover {
        background: #2f2f2f;
    }
    
     ::-webkit-scrollbar-thumb {
        background: #383A41;
    }
    
    .control button {
        line-height: 0;
        padding: .5rem 1rem;
    }
</style>