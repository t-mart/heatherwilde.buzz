<script lang="ts">
	import { type ContentAction } from 'svelte-floating-ui';
	import { type Writable } from 'svelte/store';

	export let tooltipFloatingAction: ContentAction;
	export let tooltipArrowStore: Writable<HTMLElement | null>;
	export let onCloseFn: () => void;
</script>

<div class="tooltip" role="presentation" use:tooltipFloatingAction on:click={onCloseFn}>
	<slot></slot>
	<div class="arrow" bind:this={$tooltipArrowStore}></div>
</div>

<style>
	.tooltip {
		padding: 1rem;
		background-color: var(--text-color);
		color: var(--background-color);
		z-index: 3;
		border-radius: var(--border-radius);
		border: 1px solid var(--background-color);
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
