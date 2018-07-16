<Link className="back" to="Main"><i class="back-icon"></i></Link>

<script>
    export default {
        components: {
            Link: './Link.svelte'
        }
    }
</script>

<style>
    .back-icon {
        border-left: 4px solid #fff;
        border-bottom: 4px solid #fff;
        display: inline-block;
        width: 15px;
        height: 15px;
        border-radius: 2px;
        transform: rotate(45deg);
        margin: 8px 8px 8px 0.8rem;
    }
    
     :global(.back) {
        width: 100%;
        height: 60px;
        background: #383A41;
        display: flex;
        align-items: center;
    }
</style>