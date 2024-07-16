/**
 * Stores for global tooltip state
 */
import { writable } from 'svelte/store';

const tooltipOwnerStore = writable<string | null>(null);

/**
 * Subscribe to the tooltip owner store and run a preemption function if the
 * owner is not us.
 *
 * @param myName A unique name to differentiate among other subscribers
 *
 * @param preemptFn The function to call if the owner is not us
 *
 * @returns A function to set the tooltip owner to the current component
 */
export function subscribeTooltipOwner(myName: string, preemptFn: () => void) {
  tooltipOwnerStore.subscribe((owner) => {
    if (owner !== myName) {
      preemptFn();
    }
  });
  return () => {
    tooltipOwnerStore.set(myName);
  };
}
