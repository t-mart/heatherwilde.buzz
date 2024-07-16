<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_LINK } from '$env/static/public';

  type CoolThing = {
    title: string;
    desc: string;
    url: string;
  };

  let coolThings: CoolThing[] = [
    {
      title: 'Heatherwilde Optimum Internet Monitor',
      desc: 'Shows the current status of my Optimum internet connection.',
      url: '/optimum'
    },
    {
      title: 'Trash This Week',
      desc: 'See if its trash and recycling or just trash collection this week.',
      url: 'https://trashthisweek.com'
    }
  ];
</script>

<svelte:head>
  <title>Cool Stuff - heatherwilde.buzz</title>
</svelte:head>

<div class="cool-local-stuff">
  <h1 class="heading">Cool Local Stuff</h1>

  <ul>
    {#each coolThings as coolThing}
      <li>
        <h2><a href={coolThing.url}>{coolThing.title}</a></h2>
        <p class="desc">{coolThing.desc}</p>
      </li>
    {/each}
  </ul>

  <p class="cta">
    Want your cool local thing added to this list? Ask on the <a href={PUBLIC_DISCORD_INVITE_LINK}
      >Discord</a
    >.
  </p>
</div>

<style>
  .cta {
    margin-top: 2rem;
  }

  h2 {
    margin-bottom: 1rem;
  }

  li {
    /* this is actually just for the bullets */
    font-size: 2rem;
  }

  .desc {
    font-size: var(--text-font-size);
  }
</style>
