<script lang="ts">
  export let open = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <line id="hamburger-line" x1="0" y1="0" x2="14" y2="0" transform="skewX(15)" />
  </defs>
  <g class="lines" class:rotated={open}>
    <use href="#hamburger-line" class="line" x="5" y="6" />
    <use href="#hamburger-line" class="line" x="5" y="12" />
    <use href="#hamburger-line" class="line" x="5" y="18" />
  </g>
</svg>

<style>
  .line {
    stroke: var(--text-color);
    stroke-width: 3;
  }

  svg:hover .line {
    stroke: var(--up-color);
  }

  svg {
    border: 3px solid var(--text-color);
    border-radius: var(--border-radius);
    width: 100%;
    height: 100%;
  }

  .lines {
    transition: transform 0.1s;
    transform-origin: center;
  }

  .lines.rotated {
    transform: rotate(90deg);
  }
</style>
