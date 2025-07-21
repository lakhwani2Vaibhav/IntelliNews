import { type NextRequest, NextResponse } from 'next/server';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7';

const INSHORTS_API_URL = 'https://inshorts.com/api';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET_KEY;
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const REQUEST_TOLERANCE_MS = 30000; // 30 seconds

const handleApiError = (error: unknown, defaultMessage: string) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ error: message }, { status: 502 });
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  /*
  const encryptedPayload = req.headers.get('X-API-Secret');
  
  if (!API_SECRET || !ENCRYPTION_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!encryptedPayload) {
    return NextResponse.json({ error: 'Forbidden: Missing secret' }, { status: 403 });
  }

  try {
    const key = Utf8.parse(ENCRYPTION_KEY);
    const decryptedBytes = AES.decrypt(
      encryptedPayload,
      key,
      { mode: ECB, padding: Pkcs7 }
    );
    
    const decryptedDataString = Utf8.stringify(decryptedBytes);
    if (!decryptedDataString) {
      throw new Error("Decryption resulted in empty string");
    }
    
    const decryptedPayload = JSON.parse(decryptedDataString);
    const { apiSecret: decryptedSecret, timestamp } = decryptedPayload;
    
    if (decryptedSecret !== API_SECRET) {
      return NextResponse.json({ error: 'Forbidden: Invalid secret' }, { status: 403 });
    }

    const requestTime = new Date(timestamp);
    const now = new Date();
    if (now.getTime() - requestTime.getTime() > REQUEST_TOLERANCE_MS) {
        return NextResponse.json({ error: 'Forbidden: Stale request' }, { status: 408 });
    }

  } catch (e) {
    console.error("Decryption Error:", e);
    return NextResponse.json({ error: 'Forbidden: Decryption failed' }, { status: 403 });
  }
  */


  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';
  const slugPath = params.slug ? params.slug.join('/') : '';
  
  try {
    if (slugPath === 'get-news') {
      const newsOffset = searchParams.get('news_offset');
      const offsetParam = newsOffset ? `&news_offset=${newsOffset}` : '';
      const url = `${INSHORTS_API_URL}/${lang}/news?category=top_stories&max_limit=10&include_card_data=true${offsetParam}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch top stories');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (slugPath.startsWith('topic-news/')) {
      const topic = params.slug[1];
      const page = searchParams.get('page') || '1';
      const url = `${INSHORTS_API_URL}/${lang}/search/trending_topics/${topic}?page=${page}&type=NEWS_CATEGORY`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch news for topic: ${topic}`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (slugPath === 'trending-list') {
      const url = `${INSHORTS_API_URL}/${lang}/search/trending_topics`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch trending topics');
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid API route' }, { status: 404 });

  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred.');
  }
}
