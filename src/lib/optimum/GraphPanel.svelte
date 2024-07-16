<script lang="ts">
	export let title: string;
</script>

<div class="container">
	<div class="header">
		<h4>{title}</h4>
		<slot name="header-right"></slot>
	</div>
	<slot name="main"></slot>
</div>

<style>
	.container {
		padding: 1rem;
		border: 1px solid var(--non-data-color);
		border-radius: var(--border-radius);
		margin-bottom: 2rem;
	}

	h4 {
		margin: 0 0 0.5rem 0;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
</style>
