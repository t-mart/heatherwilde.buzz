import { createClient } from '@supabase/supabase-js'

import { Database } from '#database-schema.ts'

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient<Database>('https://gsmzdmodeuprbsorflhh.supabase.co', supabaseKey);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (key !== process.env.PING_TRIGGER_API_KEY) {
    return Response.json({
      error: 'Invalid API key',
    }, {
      status: 401,
    });
  }

  const target = process.env.PING_TARGET_URL;
  if (!target) {
    return new Response('Ping target URL is not set', { status: 500 });
  }

  const startMilliseconds = performance.now();
  const response = await fetch(target);
  const endMilliseconds = performance.now();
  const durationMilliseconds = response.status === 200 ? Math.trunc(endMilliseconds - startMilliseconds) : undefined;

  if (!durationMilliseconds) {
    console.error('Ping failed or did not return 200 status, inserting null duration');
  }

  const { data, error } = await supabase
    .from('pings')
    .insert({
      timestamp: new Date().toISOString(),
      // eslint-disable-next-line unicorn/no-null
      duration_milliseconds: durationMilliseconds ?? null,
    })
    .select()

  if (error) {
    console.error('Error inserting ping data:', error);
    return Response.json({
      error: 'Failed to log ping data',
      details: error.message,
    }, {
      status: 500,
    });
  }

  return Response.json({
    ping: data[0],
  }, {
    status: response.status,
  });
}