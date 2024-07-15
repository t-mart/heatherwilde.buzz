<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
	<defs>
		<line id="close-line" x1="0" y1="0" x2="22" y2="0" />
	</defs>
	<g class="lines">
		<!-- translate x=1 because that's (24 - 22) / 2 -->
		<!-- and translate y=12 because thats 24 / 2 -->
		<use
			href="#close-line"
			class="line"
			transform="rotate(45) translate(1,12)"
			transform-origin="center"
		/>
		<use
			href="#close-line"
			class="line"
			transform="rotate(-45) translate(1,12)"
			transform-origin="center"
		/>
	</g>
</svg>

<style>
	.lines {
		/* stroke: var(--background-color); */
		stroke-width: 3;
	}

	svg:hover .lines {
		stroke: var(--up-color);
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
