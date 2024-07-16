import { Timeframe } from '$lib';
import { type Writable, writable } from 'svelte/store';

export const timeframeStore: Writable<Timeframe> = writable(Timeframe.DAY);
