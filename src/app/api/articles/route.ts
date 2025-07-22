import { type NextRequest, NextResponse } from 'next/server';

const BASE_MEDIAL_API = "https://prod.medial.app/api/v1/articles";
const ACCESS_TOKEN = process.env.MEDIAL_API_ACCESS_TOKEN;

const headers = {
    "access-token": ACCESS_TOKEN || '',
    "accept": "*/*",
    "origin": "https://medial.app",
    "referer": "https://medial.app/"
};

export async function GET(req: NextRequest) {
    if (!ACCESS_TOKEN) {
        return NextResponse.json({ error: 'Server configuration error: Missing access token' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const nextSegment = searchParams.get('nextSegment');

    let url = BASE_MEDIAL_API;
    if (nextSegment) {
        url += `?${nextSegment}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch articles. Status: ${response.status}`);
        }
        const data = await response.json();

        return NextResponse.json({
            data: data.data || [],
            nextSegment: data.nextSegment,
            status: "success"
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: "Failed to fetch articles", details: message }, { status: 502 });
    }
}
