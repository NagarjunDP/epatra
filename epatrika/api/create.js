import { createClient } from '@vercel/kv';
import { nanoid } from 'nanoid';

export const config = {
  runtime: 'edge',
};

const isMock = !(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const db = isMock ? null : createClient({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  
  try {
    const data = await req.json();
    
    if (!data.hostName || !data.eventType || !data.names || !data.date || !data.time || !data.venueName || !data.city || !data.whatsapp || !data.theme) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    
    const code = nanoid(8);
    
    if (isMock) {
      return new Response(JSON.stringify({ success: true, code, mock: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    await db.set(`invite:${code}`, data, { ex: 31536000 }); // 1 year expiry
    
    return new Response(JSON.stringify({ success: true, code }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
