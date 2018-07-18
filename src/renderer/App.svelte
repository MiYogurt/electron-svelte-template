<Tip/>
<svelte:component this="{$currentPage}" name="page" />
<Music/>
<script>
    export default {
        components: {
            Tip: './components/Tip.svelte',
            Music: './pages/Music.svelte'
        },
    };
</script>