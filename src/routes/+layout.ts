import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import '../modern-normalize.css';
import '../global.css';

inject();
injectSpeedInsights();

export const prerender = true;
