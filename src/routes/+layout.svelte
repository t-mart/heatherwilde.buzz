<script lang="ts">
	let navCollapsed = true;
</script>

<div class="container">
	<header>
		<nav class="standard-black">
			<ol class:collapsed={navCollapsed}>
				<li class="nav-buttons">
					<button
						class="hamburger"
						on:click={() => (navCollapsed = !navCollapsed)}
						aria-label="Toggle Navigation"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="100%" viewBox="0 0 24 24"
							><path
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 17h14M5 12h14M5 7h14"
							/></svg
						>
					</button>
					<a href="/">
						<svg
							class="logo"
							viewBox="-34.5 0 122 100"
							xmlns="http://www.w3.org/2000/svg"
							aria-label="Home Icon"
						>
							<path
								d="M0 0v100-40a10 10 180 1 1 30 0v18a10 10 180 1 0 30 0V38v40a10 10 180 1 0 30 0V38"
								fill="none"
								stroke-width="15"
								transform="skewX(-15)"
							/>
						</svg></a
					>
				</li>
				<li><a href="/">Home</a></li>
				<li><a href="https://discord.gg/fYS3BTXJdr">Discord</a></li>
				<li><a href="/optimum">Optimum</a></li>
				<li><a href="/cool-local-stuff">Cool Local Stuff</a></li>
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
		max-width: 80ch;
		padding: 2rem;
	}

	nav {
		font-size: 1.5rem;
	}

	nav a {
		color: var(--text-color);
	}

	nav a:visited {
		color: var(--text-color);
	}

	nav a:hover {
		color: var(--up-color);
	}

	nav ol {
		margin-bottom: 1.5rem;
		margin-top: 0;
		display: flex;
		align-items: baseline;
		flex-direction: column;
		list-style-type: none;
		display: flex;
		gap: 1rem;
		padding-inline-start: 0;
	}

	nav ol .hamburger {
		display: unset;
	}

	nav ol.collapsed li:not(.hamburger, .nav-buttons) {
		display: none;
	}

	.nav-buttons {
		display: flex;
		align-items: center;
		gap: 1rem;
	}


	@media (min-width: 80ch) {
		nav ol {
			flex-direction: row;
		}

		nav ol.collapsed li:not(.nav-buttons) {
			display: unset;
			align-self: flex-end;
		}

		nav ol li .hamburger {
			display: none;
		}
	}

	nav {
		margin-bottom: 2rem;
	}

	svg {
		width: 3rem;
		min-width: 3rem;
	}

	svg.logo {
		stroke: var(--up-color);
	}

	.hamburger {
		padding: 0;
	}

	.hamburger svg {
		stroke: var(--text-color);
		border: 3px solid var(--text-color);
		border-radius: 0.5rem;
	}

	.hamburger:hover svg {
		stroke: var(--up-color);
	}
</style>
