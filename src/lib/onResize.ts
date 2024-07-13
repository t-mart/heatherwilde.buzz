import { Duration } from 'luxon';

const defaultdebounceDuration = Duration.fromObject({ milliseconds: 100 });

// Debounce function
function debounce<T extends (...args: any[]) => void>(
	func: T,
	waitDuration: Duration
): (...args: Parameters<T>) => void {
	let timeout: number | undefined;
	return function (this: any, ...args: Parameters<T>) {
		const context: any = this;
		clearTimeout(timeout);
		timeout = window.setTimeout(() => func.apply(context, args), waitDuration.toMillis());
	};
}

/**
 * Create a resize observer for an element
 * @param target The element to observe
 * @param callback What to do when the element resizes
 * @param debounceDuration How long to wait before calling the callback
 * @returns An object with a destroy method to stop observing the element
 */
export default function <T>(
	target: Element,
	callback: () => T,
	debounceDuration = defaultdebounceDuration
) {
	const resizeObserver = new ResizeObserver(
		debounce(() => {
			callback();
		}, debounceDuration)
	);

	resizeObserver.observe(target, { box: 'border-box' });

	return {
		destroy: () => {
			resizeObserver.disconnect();
		}
	};
}
