<script lang="ts">
  import HamburgerIcon from '$lib/icons/Hamburger.svelte';
  import LogoIcon from '$lib/icons/Logo.svelte';
  import {
    PUBLIC_PLAUSIBLE_SCRIPT_SRC,
    PUBLIC_PLAUSIBLE_SCRIPT_DATA_DOMAIN
  } from '$env/static/public';

  let navCollapsed = true;
</script>

<svelte:head>
  <script
    defer
    data-domain={PUBLIC_PLAUSIBLE_SCRIPT_DATA_DOMAIN}
    src={PUBLIC_PLAUSIBLE_SCRIPT_SRC}
  ></script>
</svelte:head>

<div class="container">
  <header>
    <nav class="standard-black">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <ol class:collapsed={navCollapsed}>
        <li class="nav-buttons">
          <button
            class="hamburger"
            on:click={() => (navCollapsed = !navCollapsed)}
            aria-label="Toggle Navigation"
          >
            <HamburgerIcon open={!navCollapsed} />
          </button>
          <a href="/" class="logo"><LogoIcon /></a>
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

  :global(.logo) {
    width: 3rem;
    min-width: 3rem;
    stroke: var(--up-color);
  }

  .hamburger {
    padding: 0;
    width: 3rem;
  }
</style>
