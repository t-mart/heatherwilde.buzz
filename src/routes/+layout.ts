import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import '../layers.css';
import '../reset.css';
import '../base.css';
import '../fonts.css';

inject();
injectSpeedInsights();

export const prerender = true;
