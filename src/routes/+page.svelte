<script lang="ts">
	import { PUBLIC_DISCORD_INVITE_LINK } from '$env/static/public';
</script>

<svelte:head>
	<title>Howdy! - heatherwilde.buzz</title>
</svelte:head>

<div class="howdy">
	<h1>Howdy, Heatherwilde neighbor!</h1>

	<ul>
		<li>You doin' good?</li>
		<li>Is the internet down?</li>
		<li>Wanna game together?</li>
		<li>Party or event coming up?</li>
	</ul>

	<p class="cta">Come on by the <a href={PUBLIC_DISCORD_INVITE_LINK}>Discord</a>!</p>
</div>

<style>
	h1 {
		font-size: 2.5rem;
		font-weight: bold;
		font-family: 'ATNameSansDisplayTrial-BlackItalic', sans-serif;
	}

	.cta {
		font-size: 4rem;
		font-weight: bold;
		font-family: 'ATNameSansDisplayTrial-BlackItalic', sans-serif;
		color: var(--cta-color);
		margin-block-start: 1.5rem;
        text-align: center;
	}

	.howdy {
		font-size: 2rem;
	}
</style>
