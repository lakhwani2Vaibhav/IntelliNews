export interface NewsArticle {
  hash_id: string;
  news_obj: {
    title: string;
    content: string;
    image_url: string;
    source_url: string;
    author_name: string;
    created_at: number;
    shortened_url: string;
    category?: string;
  };
}

export interface TrendingTopic {
  label: string;
  tag: string;
}

export interface TopicNewsResponseData {
  news_list: NewsArticle[];
}

export interface GeneralNewsResponseData {
  news_list: NewsArticle[];
  min_news_id?: string | null;
}

export interface TrendingTopicsResponseData {
  trending_tags: TrendingTopic[];
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
