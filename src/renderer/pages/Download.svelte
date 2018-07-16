<Back/>
<input bind:value=folderName />
<input bind:value=url />
<button on:click="download()">下载</button>
<button on:click="stop()">中断</button>

<script>
    import {
        ipcRenderer
    } from 'electron'
    export default {
        data() {
            return {
                url: '',
                folderName: ''
            }
        },
        components: {
            Back: '../components/Back.svelte'
        },
        methods: {
            download() {
                const {
                    url,
                    folderName
                } = this.get()
                if (url.length && folderName.length) {
                    console.log(url);
                    console.log(folderName);
                    ipcRenderer.send('download', {
                        url,
                        folderName
                    })
                }
            },
            stop() {
                ipcRenderer.send('stop')
            }
        }
    }
</script>