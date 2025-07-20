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
  };
}

export interface TrendingTopic {
  label: string;
  tag: string;
}

export interface TopicNewsResponseData {
  news_list: NewsArticle[];
  next_page_hash?: string | null;
}

export interface GeneralNewsResponseData {
  news_list: NewsArticle[];
}

export interface TrendingTopicsResponseData {
  trending_tags: TrendingTopic[];
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
