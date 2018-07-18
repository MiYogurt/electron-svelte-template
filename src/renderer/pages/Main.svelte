<div class="wrap {$music ? 'hidden': 'show'}">
    <Link className="download-page-btn" to="Download">下载页面</Link>
    <div className="music-page-btn" on:click="$set({music: true})">播放器</div>
    <Link className="store-page-btn" to="CrawlStore">爬虫商店</Link>
</div>


<script>
    export default {
        components: {
            Link: '../components/Link.svelte'
        },
    };
</script>

<style>
    .wrap {
        display: flex;
        height: 100vh;
        flex-wrap: wrap;
        background: #333;
    }
    
    .hidden {
        display: none;
    }
    
    .wrap :global(a),
    .wrap div {
        display: inline-flex;
        width: 50%;
        text-decoration: none;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 1rem;
        letter-spacing: 5px;
        transition: all .2s;
        cursor: pointer;
    }
    
    .wrap :global(a):hover {
        background: #fb584c
    }
</style>