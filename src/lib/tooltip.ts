import { arrow, createFloatingActions } from 'svelte-floating-ui';
import { flip, offset, shift, type VirtualElement } from 'svelte-floating-ui/dom';
import { get, writable, type Writable } from 'svelte/store';

const defaultOptions = {
	autoUpdateOnAnimationFrame: false
}

export function setupTooltip(options = defaultOptions) {
	const arrowStore = writable<HTMLElement | null>(null);
	const [referenceAction, floatingAction, updatePositionFn] = createFloatingActions({
		strategy: 'absolute',
		placement: 'top',
		middleware: [offset(6), flip(), shift(), arrow({ element: arrowStore })],
		autoUpdate: options.autoUpdateOnAnimationFrame && {
			animationFrame: true
		} || undefined,
		onComputed({ placement, middlewareData }) {
			const arrowRefValue = get(arrowStore);
			if (!arrowRefValue) return;

			const { x, y } = middlewareData.arrow!;
			const staticSide = {
				top: 'bottom',
				right: 'left',
				bottom: 'top',
				left: 'right'
			}[placement.split('-')[0]]!;

			Object.assign(arrowRefValue.style, {
				left: x != null ? `${x}px` : '',
				top: y != null ? `${y}px` : '',
				[staticSide]: '-4px'
			});
		}
	});
	return {
		// this works on SVGElement too, but author declared too narrowly, so we
		// cast. may accept my PR at a later date:
		// https://github.com/fedorovvvv/svelte-floating-ui/pull/17
		tooltipReferenceAction: referenceAction as (
			node: HTMLElement | SVGElement | Writable<VirtualElement> | VirtualElement
		) => void,
		tooltipFloatingAction: floatingAction,
		updateTooltipPositionFn: updatePositionFn,
		tooltipArrowStore: arrowStore
	};
}
