<Back/>
<div>
    <p>{JSON.stringify(status)}</p>
    <p>{JSON.stringify(errors)}</p>
    <button on:click="download()">xiazai</button>
</div>

<script>
    import {
        ipcRenderer
    } from "electron";
    export default {
        data() {
            return {
                status: null,
                errors: []
            };
        },
        components: {
            Back: '../components/Back.svelte'
        },
        oncreate() {
            ipcRenderer.on("download-status", (event, args) => {
                if (args.step == "error") {
                    console.log(args);
                    const {
                        errors
                    } = this.get()
                    console.log(errors);
                    errors.push(args)
                    return this.set({
                        errors
                    })
                }
                console.log(args);
                this.set({
                    status: args
                });
            });
        },
        methods: {
            download() {
                console.log("download");
                ipcRenderer.send("download", {
                    url: "https://www.ybdu.com/xiaoshuo/0/910"
                });
            }
        }
    };
</script>