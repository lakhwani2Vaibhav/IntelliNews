export interface StartupItemData {
    id: string;
    title: string;
    source: {
        name: string;
        displayImage: string;
    };
    imageUrl: string;
    curatedText: string;
    sourceUrl: string;
    publishedAt: string;
    likesCount: number;
    viewCount: number;
}

export interface StartupItem {
    data: StartupItemData;
    id: string;
    type: 'NEWS';
}

export interface StartupApiResponse {
    data: StartupItem[];
    nextSegment: string | null;
    status: string;
}
