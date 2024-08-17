import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

// order important here
import '../layers.css';

import '../reset.css';

import '../base.css';

import '../fonts.css';

inject();
injectSpeedInsights();

export const prerender = true;
export const ssr = true;
