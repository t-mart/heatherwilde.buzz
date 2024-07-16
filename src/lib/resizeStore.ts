import { Duration } from 'luxon';
import { readable } from 'svelte/store';

const defaultDebounceDuration = Duration.fromObject({ milliseconds: 100 });

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
 * Create a resize observer store for a target element
 *
 * @param target The element to observe
 *
 * @param debounceDuration How long to wait before calling the callback because
 * resize events can fire rapidly. Defaults to 100ms.
 *
 * @returns An object with a subscribe method to listen for resize events. The
 * subscribe method accepts a callback to run when a resize occurs and is passed
 * a Date object of the resize's occurence. The return value of the subscribe
 * method is method to stop observing the element.
 */
export function createResizeStore(target: Element, debounceDuration = defaultDebounceDuration) {
  return readable(new Date(), (set) => {
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        set(new Date());
      }, debounceDuration)
    );

    resizeObserver.observe(target, { box: 'border-box' });

    return () => {
      resizeObserver.disconnect();
    };
  });
}
