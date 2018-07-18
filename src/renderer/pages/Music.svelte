<div class="music-page { $music ?'show':'hidden' } ">
    <Back/>
    <div>
        <ul class="main {list?'hidden':'show'}">
            {#each files as file, index}
            <li on:click="$set({index})">{handleName(file)}</li>
            {/each}
        </ul>
        <div class="main play-canvs {list?'show':'hidden'}" on:click="toggleList()">
            <canvas ref:box width="400" height="400"></canvas>
        </div>
        <div class="control">
            <div class="title" on:click="toggleList()">{title}</div>
            <div class="flex">
                <button on:click="file()"><img src="{staticPath + "plus-circle.png"}" width="25" height="25" alt="add"></button>
                <button on:click="play()"><img src="{staticPath + "play-circle.png"}" width="25" height="25" alt="play"></button>
                <button on:click="pause()"><img src="{staticPath + "time-out.png"}" width="25" height="25" alt="stop"></button>
                <button on:click="prev()"><img src="{staticPath + "left-circle.png"}" width="25" height="25" alt="prev"></button>
                <button on:click="next()"><img src="{staticPath +"right-circle.png"}" width="25" height="25" alt="next"></button>
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
                list: true,
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

            this.ac = new AudioContext()
            this.analyser = this.ac.createAnalyser()

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
            toggleList(){
                let list = !this.get().list
                this.set({list})
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

                this.audioSource = this.ac.createMediaElementSource(this.player)

                this.audioSource.connect(this.analyser)
                this.analyser.connect(this.ac.destination)

                const animate = () => {
                    this.datas = new Uint8Array(this.analyser.frequencyBinCount)
                    this.analyser.getByteFrequencyData(this.datas)
                    this.animation()
                    this.rid = requestAnimationFrame(animate)
                }
                animate()
            },
            pause() {
                this.audioSource.disconnect(this.analyser);
                this.audioSource.disconnect(this.ac.destination);
                if(this.rid) {
                    cancelAnimationFrame(rid)
                }
                this.player.pause()
            },

            animation(){
                const cvs = this.refs.box
                const ctx = cvs.getContext('2d')
                const height = cvs.height
                const width = cvs.width
                let w = 20
                let h = 10
                let margin = 5 // 间隔
                let maxSize = 24 // 最高方块
                let widthSize = Math.ceil(width / w + margin) // 列数
                let GreenHightArray = new Array(widthSize + 1).fill(height)
                let v = (h + margin) * 1 // 下降速度
                let lines = Math.ceil(height / (h + margin)) // 计算行数
                const step = 10 // 步进，按比例取其中的值
                const Run = () => {
                  ctx.clearRect(0, 0, width, height)
                  for (let j = 0; j <= widthSize; j++) {
                    let val = (this.datas[j * step])
                    let currentSize = Math.ceil( (val / 255 ) * maxSize)
                    let g = ctx.createLinearGradient(0, height, 0 , 0)
                    g.addColorStop(0, '#233142')
                    g.addColorStop(0.6, '#455d7a')
                    g.addColorStop(0.8, '#f95959')
                    ctx.fillStyle = g
                    ctx.fillRect(j * w + margin * j, height - (h + margin) * currentSize, w, (h + margin) * currentSize)
                    // 绿块逻辑
                    ctx.fillStyle = '#08c299'

                    let currentGreenHight = height - currentSize * (h + margin)  // 制高点 y 坐标。

                    if (GreenHightArray[j] + v > currentGreenHight) {
                      GreenHightArray[j] = currentGreenHight
                      ctx.fillRect(j * w + margin * j, GreenHightArray[j], w, h + margin)
                    } else {
                      GreenHightArray[j] += v
                      ctx.fillRect(j * w + margin * j, GreenHightArray[j], w, h + margin)
                    }
                  }
                  for (var i = 0; i <= lines; i++) {
                    ctx.clearRect(0, height - i * (h + margin) , width, margin)
                  }
                  setTimeout(Run, 500)
                }
                Run()
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
        transform: translate(100%, 0);
        position: absolute;
    }

    .show {
        transform: translate(0, 0);
        position: static;
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
