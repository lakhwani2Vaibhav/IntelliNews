export interface ArticleSource {
    created_by: string;
    displayImage: string;
    id: string;
    name: string;
    published_at: string | null;
    slug: string;
    status: string;
    type: string;
}

export interface ArticleData {
    bookmarksCount: number;
    categories: any[];
    id: string;
    imageUrl: string;
    isLiked: boolean;
    likesCount: number;
    publishedAt: string;
    slug: string;
    source: ArticleSource;
    sourceUrl: string;
    title: string;
    viewCount: number;
}

export interface Article {
    data: ArticleData;
    id: string;
    type: 'ARTICLE';
}

export interface ArticlesApiResponse {
    data: Article[];
    nextSegment: string | null;
    status: string;
}
