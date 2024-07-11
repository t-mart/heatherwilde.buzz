import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import '../layers.scss';

inject();
injectSpeedInsights();

export const prerender = true;
