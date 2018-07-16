<div class="wrap">
    <Link className="download-page-btn" to="Download">下载页面</Link>
    <Link className="music-page-btn" to="Music">播放器</Link>
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
    
    .wrap :global(a) {
        display: inline-flex;
        width: 50%;
        text-decoration: none;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 1rem;
        letter-spacing: 5px;
        transition: all .2s;
    }
    
    .wrap :global(a):hover {
        background: #fb584c
    }
</style>