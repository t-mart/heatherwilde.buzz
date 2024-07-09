<script lang="ts">
	import { PUBLIC_DISCORD_INVITE_LINK } from '$env/static/public';
</script>

<svelte:head>
	<title>A friendly neighborhood site for Heatherwilde in Pflugerville, Texas - heatherwilde.buzz</title>
</svelte:head>

<div class="howdy">
	<h1 class="heading">Howdy, Heatherwilde neighbor!</h1>

	<ul>
		<li>Party or event coming up?</li>
		<li>Is the internet down?</li>
		<li>Got stuff to sell or give away?</li>
		<li>Lost or found a pet?</li>
		<li>Wanna game together?</li>
		<li>Tired of Nextdoor spam?</li>
	</ul>

	<p class="cta heading">
		Come on by <br/><a href={PUBLIC_DISCORD_INVITE_LINK}>Discord</a><br/> and talk about it!
	</p>

	<p>
		Hi! I'm Tim and I live in <a
			href="https://www.google.com/maps/place/Heatherwilde,+Pflugerville,+TX+78660/@30.457596,-97.6332716,15z/"
			>Heatherwilde</a
		> of Pflugerville, Texas. I made this website to connect with my neighbors more easily. I ain't selling
		you nothing — this is just for fun.
	</p>
</div>

<style>
	.cta {
		font-size: 4rem;
		margin-block-start: 1em;
		text-align: center;
	}

	.cta a {
		color: var(--up-color);
	}

	.cta a:hover {
		color: var(--text-color);
	}
</style>
