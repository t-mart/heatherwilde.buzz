import { createClient } from '@supabase/supabase-js'

import { Database } from '#database-schema.ts'

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabase = createClient<Database>('https://gsmzdmodeuprbsorflhh.supabase.co', supabaseKey);

const targetUrls = process.env.PING_TARGET_URLS?.split(',') || [];

export async function GET(request: Request) {
  // ensure authorized client because this endpoint is public.
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (key !== process.env.PING_TRIGGER_API_KEY) {
    console.error('Invalid API key provided');
    return Response.json({
      error: 'Invalid API key',
    }, {
      status: 401,
    });
  }

  const responses = await Promise.all(
    targetUrls.map(async (targetUrl) => {
      const pingResponse = await ping(targetUrl);
      return pingResponse;
    })
  );

  const { error, data } = await savePings(responses);

  if (error) {
    console.error('Failed to save ping data:', error);
    return Response.json({
      error: 'Failed to save ping data',
      details: error.message,
    }, {
      status: 500,
    });
  }

  console.log('Ping data saved successfully:', responses);
  return Response.json({
    pings: data,
  });
}

type InsertedPing = Database['public']['Tables']['pings']['Insert'];

async function ping(targetUrl: string): Promise<InsertedPing> {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const timestamp = new Date().toISOString();
  const startMilliseconds = performance.now();
  let response;

  try {
    response = await fetch(targetUrl, { signal });
  } catch (error) {
    console.log('Ping failed or did not return 200 status, inserting null duration', error);
  } finally {
    clearTimeout(timeoutId);
  }

  const endMilliseconds = performance.now();

  // eslint-disable-next-line unicorn/no-null
  const durationMilliseconds = response?.status === 200 ? Math.trunc(endMilliseconds - startMilliseconds) : null;

  return {
    timestamp,
    target_url: targetUrl,
    duration_milliseconds: durationMilliseconds,
  };
}

async function savePings(pings: InsertedPing[]) {
  return await supabase
    .from('pings')
    .insert(pings)
    .select();
}