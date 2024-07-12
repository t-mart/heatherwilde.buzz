// screenSizeStore.js
import { writable } from 'svelte/store';

const debounceDurationMilliseconds = 100;

function createScreenSizeStore() {
	const { subscribe, set } = writable(getViewportWidthVar());

	function getViewportWidthVar() {
		return (
			// use vars, i want to try to avoid coupling values from css. see
			// layout.svelte for the values
			getComputedStyle(document.documentElement).getPropertyValue('--viewport-width-name').trim()
		);
	}

	function updateScreenSize() {
		const viewportWidthVar = getViewportWidthVar();
		set(viewportWidthVar);
	}

	// Debounce function
	function debounce<T extends (...args: any[]) => void>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: number | undefined;
		return function (this: any, ...args: Parameters<T>) {
			const context: any = this;
			clearTimeout(timeout);
			timeout = window.setTimeout(() => func.apply(context, args), wait);
		};
	}

	// Use ResizeObserver to detect changes
	const resizeObserver = new ResizeObserver(
		debounce(() => {
			updateScreenSize();
		}, debounceDurationMilliseconds)
	);

	resizeObserver.observe(document.documentElement);

	return {
		subscribe,
		updateScreenSize // Expose the update function if manual updates are needed
	};
}

export const screenSizeStore = createScreenSizeStore();
