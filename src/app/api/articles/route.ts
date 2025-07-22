import { type NextRequest, NextResponse } from 'next/server';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7';

const BASE_MEDIAL_API = "https://prod.medial.app/api/v1/articles";
const ACCESS_TOKEN = process.env.MEDIAL_API_ACCESS_TOKEN;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET_KEY;
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const REQUEST_TOLERANCE_MS = 30000; // 30 seconds

const headers = {
    "access-token": ACCESS_TOKEN || '',
    "accept": "*/*",
    "origin": "https://medial.app",
    "referer": "https://medial.app/"
};

export async function GET(req: NextRequest) {
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
