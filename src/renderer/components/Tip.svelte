{#if $msg.content.length}
<p class={$msg.type} transition:slide>{$msg.content}</p>
{/if}

<script>
    import {
        slide
    } from 'svelte-transitions'
    export default {
        transitions: {
            slide
        },
    }
</script>
<style>
    .info {
        background: #6633FF;
    }
    
    .warring {
        background: #FF9900;
    }
    
    .success {
        background: #4BCB7C;
    }
    
    p {
        line-height: 60px;
        text-align: center;
        color: #fff;
        font-size: .9rem;
        letter-spacing: 5px;
        cursor: default;
        user-select: none;
        display: block;
        transition: background .5s;
    }
    
    @keyframes flash {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    
    p::after,
    p::before {
        animation: flash .7s ease-in infinite alternate
    }
    
    p::after {
        content: '·'
    }
    
    p::before {
        content: '·'
    }
</style>