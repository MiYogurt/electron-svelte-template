<Tip/>
<svelte:component this="{$currentPage}" name="page" />

<script>
    export default {
        components: {
            Tip: './components/Tip.svelte'
        },
    };
</script>