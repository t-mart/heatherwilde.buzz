<script lang="ts">
	import { PUBLIC_DISCORD_INVITE_LINK } from '$env/static/public';
</script>

<svelte:head>
	<title>Howdy! - heatherwilde.buzz</title>
</svelte:head>

<div class="howdy">
	<h1>Howdy, Heatherwilde neighbor!</h1>

	<ul>
		<li>How ya doin'?</li>
		<li>Party or event coming up?</li>
		<li>Is the internet down?</li>
        <li>Got stuff to sell or give away?</li>
        <li>Lost or found a pet?</li>
		<li>Wanna game together?</li>
        <li>Tired of Nextdoor spam?</li>
	</ul>

	<p class="cta">Come on by the <a href={PUBLIC_DISCORD_INVITE_LINK}>Discord</a> and talk about it!</p>

    <p>Hi! I'm Tim and I live in <a href="https://maps.app.goo.gl/AzALBEXKtV4w57Tm9">Heatherwilde</a> of Pflugerville, Texas. I made this website to connect with my neighbors more easily. I ain't selling you nothing — this is just for fun.</p>
</div>

<style>
	h1 {
		font-family: var(--heading-font-family);
	}

	.cta {
		font-size: 4rem;
		font-family: var(--heading-font-family);
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
