import { createClient } from '@supabase/supabase-js'

import { Database } from '#database-schema.ts'

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient<Database>('https://gsmzdmodeuprbsorflhh.supabase.co', key);

export async function GET() {
  const target = process.env.PING_TARGET_URL;
  if (!target) {
    return new Response('Ping target URL is not set', { status: 500 });
  }

  const startMilliseconds = performance.now();
  const response = await fetch(target);
  const endMilliseconds = performance.now();
  const durationMilliseconds = response.status === 200 ? Math.trunc(endMilliseconds - startMilliseconds) : undefined;

  const { data, error } = await supabase
    .from('pings')
    .insert({
      timestamp: new Date().toISOString(),
      duration_milliseconds: durationMilliseconds,
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