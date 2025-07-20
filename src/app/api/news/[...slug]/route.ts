import { type NextRequest, NextResponse } from 'next/server';

const INSHORTS_API_URL = 'https://inshorts.com/api';

const handleApiError = (error: unknown, defaultMessage: string) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ error: message }, { status: 502 });
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';
  const slugPath = params.slug ? params.slug.join('/') : '';
  
  try {
    if (slugPath === 'get-news') {
      const url = `${INSHORTS_API_URL}/${lang}/news?category=top_stories&max_limit=10&include_card_data=true`;
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
