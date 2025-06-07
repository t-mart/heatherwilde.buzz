import { createClient } from '@supabase/supabase-js'

import { Database } from '#lib/db/schema.ts'

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', supabaseKey);

const targetUrls = process.env.PING_TARGET_URLS?.split(',') ?? [];

const pingTimeoutMilliseconds = 5000;

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
type InsertedPingData = Pick<InsertedPing, 'duration_milliseconds' | 'failure_reason'>;

async function ping(targetUrl: string): Promise<InsertedPing> {
  const controller = new AbortController();
  const signal = controller.signal;
  
  const timestamp = new Date().toISOString();
  let pingData: InsertedPingData;
  
  const timeoutId = setTimeout(() => controller.abort(), pingTimeoutMilliseconds);

  try {
    const startMilliseconds = performance.now();
    await fetch(targetUrl, { signal });
    const endMilliseconds = performance.now();
    pingData = {
      duration_milliseconds: Math.trunc(endMilliseconds - startMilliseconds),
    };
  } catch (error) {
    pingData = {
      duration_milliseconds: undefined,
      failure_reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    timestamp,
    target_url: targetUrl,
    ...pingData,
  };
}

async function savePings(pings: InsertedPing[]) {
  return await supabase
    .from('pings')
    .insert(pings)
    .select();
}