<Back/>
<div class="wrap">
    {#if !$start}
        <label>文件名</label>
        <input bind:value=folderName />
        <label>爬取网址</label>
        <input bind:value=url />
    {/if}
    <div class="oprator">
        {#if !$start} 
            <button on:click="download()">下载</button> 
        {:else}
            <button on:click="stop()">中断</button>
        {/if}
    </div>

        {#if status.type }
            <div class="type">
                {status.type == 'crawl' && status.step == 'chapter' ?  '爬取章节': ''}
                {status.type == 'crawl' && status.step == 'text'? '爬取内容': ''}
                {status.type == 'audio'? '转换音频': ''}
            </div>
        {/if}
        
        {#if status.title}
            <div class="title">
                {status.title}
            </div>
        {/if}

        <div class="box {$start?'show':''}">
            <canvas ref:canvas id="canvas" width="250" height="250"></canvas> 
        </div>
</div>

<script>
  import { ipcRenderer } from "electron";

  const color = {
    text: "#00CC99",
    audio: "#3399CC",
    stop: "#FF3333"
  };

  export default {
    data() {
      return {
        url: "https://www.ybdu.com/xiaoshuo/0/910/",
        folderName: "123",
        status: {
          type: " ",
          title: " ",
          percent: 0
        }
      };
    },
    components: {
      Back: "../components/Back.svelte"
    },
    oncreate() {
      let once = false;
      ipcRenderer.on("download-status", (event, args) => {
        if (
          (args.typw == "audio" && args.percent == 100) ||
          args.type == "stop"
        ) {
          this.set({
            status: {
              type: "",
              percent: 0
            }
          });
          this.store.set({ start: false });

          if (once) {
            once = false;
            return;
          }
          this.store.success(args.message);
          once = true;
          return;
        }

        if (args.type == "error") {
          console.error(args);
          this.store.warring(args.message);
          this.store.set({ start: false });
          return;
        }

        this.set({
          status: args
        });
        this.store.set({
          start: true
        });
      });

      this.draw();
      const drawFrame = () => {
        if (!this) {
          return;
        }
        this.context.clearRect(0, 0, this.centerX * 2, this.centerY * 2);
        this.text();
        this.whiteCircle();
        this.blueCircle();
        this && window.requestAnimationFrame(drawFrame);
      };
      drawFrame();
    },
    ondestroy() {
      ipcRenderer.removeAllListeners("download-status");
    },
    methods: {
      download() {
        const { url, folderName } = this.get();
        if (url.length && folderName.length) {
          console.log(url);
          console.log(folderName);
          ipcRenderer.send("download", {
            url,
            folderName
          });
          this.store.set({ start: true });
        }
      },
      stop() {
        ipcRenderer.send("stop");
      },
      draw() {
        let canvas = document.querySelector("#canvas");
        this.context = canvas.getContext("2d");
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.rad = Math.PI * 2 / 100;
      },
      text() {
        const { status } = this.get();
        if (!status) {
          return;
        }
        this.context.save();
        this.context.fillStyle = "#888";
        this.context.font = "40px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(status.percent + "%", this.centerX, this.centerY);
        this.context.restore();
      },
      blueCircle() {
        const { status } = this.get();
        if (!status) {
          return;
        }
        this.context.save();
        this.context.beginPath();
        this.context.strokeStyle = color[status.step] || "#9900FF";
        this.context.lineWidth = 12;
        this.context.arc(
          this.centerX,
          this.centerY,
          100,
          -Math.PI / 2,
          -Math.PI / 2 + status.percent * this.rad,
          false
        );
        this.context.stroke();
        this.context.restore();
      },
      whiteCircle() {
        this.context.save();
        this.context.beginPath();
        this.context.strokeStyle = "#383a41";
        this.context.lineWidth = 12;
        this.context.arc(this.centerX, this.centerY, 100, 0, Math.PI * 2, false);
        this.context.stroke();
        this.context.closePath();
        this.context.restore();
      }
    }
  };
</script>

<style>
  .wrap {
    min-height: calc(100vh - 60px);
    background: #303238;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  input {
    margin-bottom: 1rem;
    height: 2rem;
    line-height: 2rem;
    outline: none;
    border-radius: 4px;
    color: #fff;
    background: #383a41;
    border: 1px solid rgba(56, 58, 65, 0.52);
    font-size: 1.1rem;
    padding: 0 0.5rem;
  }

  label {
    margin-bottom: 1rem;
    color: #fff;
  }

  button {
    border: none;
    outline: none;
    border-radius: 2px;
    padding: 0.3rem 1rem;
    color: #efefef;
    background: transparent;
    cursor: pointer;
    margin-right: 1rem;
  }
  .box {
    text-align: center;
    margin: 1.5rem;
    display: none;
  }
  .type {
    color: #888;
    text-align: center;
    margin-top: 3rem;
    font-size: 1.2rem;
  }
  .show {
    display: block;
  }
  .title {
    text-align: center;
    user-select: none;
    color: #888;
    margin-top: 1rem;
  }
</style>