import { ImageResponse } from '@vercel/og';
import { createClient } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const isMock = !(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const db = isMock ? null : createClient({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

const getMotif = (type) => {
  const color = '#C9A84C'; // Using Ivory theme's gold accent for all OG for consistency
  switch (type.toLowerCase()) {
    case 'wedding':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M12 3s-3 6-3 10c0 4 3 8 3 8s3-4 3-8c0-4-3-10-3-10z" />
          <path d="M9 13s-6-1-8 5c0 0 4 4 10 2" />
          <path d="M15 13s6-1 8 5c0 0-4 4-10 2" />
        </svg>
      );
    case 'engagement':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </svg>
      );
    case 'birthday':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M12 2v6" />
          <path d="M9 14h6v8H9z" />
          <path d="M9 8h6v6H9z" />
        </svg>
      );
    case 'housewarming':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'pooja':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    default:
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return new Response('Missing code', { status: 400 });
    }
    
    if (isMock) {
      return new Response('OG images require KV database to render.', { status: 200 });
    }
    
    const data = await db.get(`invite:${code}`);
    if (!data) {
      return new Response('Not found', { status: 404 });
    }
    
    // We fetch Cormorant Garamond
    const fontUrl = 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpMtB8Q.ttf';
    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF7F2',
            color: '#1C1917',
            fontFamily: '"Cormorant Garamond"',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', marginBottom: 20 }}>
            {getMotif(data.eventType)}
          </div>
          
          <div style={{ fontSize: 72, marginBottom: 40, lineHeight: 1.2 }}>
            {data.names}
          </div>
          
          <div style={{ width: '200px', height: '1px', backgroundColor: '#C9A84C', marginBottom: 40 }} />
          
          <div style={{ fontSize: 32, fontFamily: 'sans-serif', color: '#78716C', marginBottom: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {data.date}
          </div>
          <div style={{ fontSize: 24, fontFamily: 'sans-serif', color: '#78716C', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {data.venueName} · {data.city}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Cormorant Garamond',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
