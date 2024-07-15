<script lang="ts">
	import { type ContentAction } from 'svelte-floating-ui';
	import { type Writable } from 'svelte/store';

	export let tooltipFloatingAction: ContentAction;
	export let tooltipArrowStore: Writable<HTMLElement | null>;
	export let closeFn: () => void;
</script>

<div class="tooltip" role="presentation" use:tooltipFloatingAction on:click={closeFn}>
	<slot></slot>
	<div class="arrow" bind:this={$tooltipArrowStore}></div>
</div>

<style>
	.tooltip {
		padding: 1rem;
		background-color: var(--text-color);
		color: var(--background-color);
		z-index: 3;
		border-radius: 0.5rem;
	}

	.arrow {
		position: absolute;
		background: transparent;
		width: 8px;
		height: 8px;
		transform: rotate(45deg);
		background-color: var(--text-color);
	}
</style>
