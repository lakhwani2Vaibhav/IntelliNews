import { type NextRequest, NextResponse } from 'next/server';

const NEWS_API_BASE_URL = 'http://127.0.0.1:5000/news';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slugPath = params.slug ? params.slug.join('/') : '';
  const { search } = new URL(req.url);

  const apiUrl = `${NEWS_API_BASE_URL}/${slugPath}${search}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: `API request failed: ${errorBody}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error while fetching from news API.' },
      { status: 500 }
    );
  }
}
