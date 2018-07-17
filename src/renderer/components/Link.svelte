<a class={className} href={to} ref:link>
    <slot/>
</a>

<script>
    export default {
        oncreate() {
            this.refs.link.addEventListener('click', (e) => {
                e.preventDefault();
                this.store.changePage(this.get().to)
            }, false)
            this.refs.link.addEventListener('dragstart', (e) => {
                e.preventDefault();
            }, false)
        }
    }
</script>