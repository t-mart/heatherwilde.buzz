<script lang="ts">
</script>

<div class="container">
	<header>
		<nav>
			<a href="/" aria-label="Home" id="foo">
				<svg viewBox="-34.5 0 122 100" xmlns="http://www.w3.org/2000/svg" aria-label="Home Icon">
					<path
						d="M0 0v100-40a10 10 180 1 1 30 0v18a10 10 180 1 0 30 0V38v40a10 10 180 1 0 30 0V38"
						fill="none"
						stroke-width="15"
						transform="skewX(-15)"
					/>
				</svg></a
			>
			<ol>
				<li><a href="/">Home</a></li>
				<li><a href="https://discord.gg/fYS3BTXJdr">Discord</a></li>
				<li><a href="/internet">My Optimum Internet</a></li>
			</ol>
		</nav>
	</header>

	<main>
		<slot></slot>
	</main>
</div>

<style>
	.container {
		margin-left: auto;
		margin-right: auto;
		padding-left: 2rem;
		padding-right: 2rem;
		max-width: 800px;
	}

	nav {
		margin-bottom: 1.5rem;
		margin-top: 1rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	svg {
		width: 3rem;
		min-width: 3rem;
		stroke: var(--up-color);
	}

	a:hover svg {
		stroke: var(--text-color);
	}

	nav ol {
		list-style-type: none;
		display: flex;
		gap: 1rem;
		padding-inline-start: 0;
		align-items: center;
	}
</style>
