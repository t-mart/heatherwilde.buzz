import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
import { storePopup } from '@skeletonlabs/skeleton';
storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
			

import '../layers.css';
import '../reset.css';
import '../base.css';
import '../fonts.css';

inject();
injectSpeedInsights();

export const prerender = true;
