import { createClient } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const isMock = !(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const db = isMock ? null : createClient({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400 });
  }
  
  if (isMock) {
    return new Response(JSON.stringify({ mock: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const data = await db.get(`invite:${code}`);
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
