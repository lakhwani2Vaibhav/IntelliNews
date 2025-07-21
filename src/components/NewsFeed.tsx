"use client";

import { useCallback, useRef } from 'react';
import type { NewsArticle } from '@/lib/types';
import NewsCard from './NewsCard';
import { Loader } from '@/components/ui/loader';
import { NewsCardSkeleton } from './NewsCardSkeleton';

interface NewsFeedProps {
  news: NewsArticle[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  selectedAiTopic?: string | null;
  lang: 'en' | 'hi';
}

export default function NewsFeed({ news, isLoading, isLoadingMore, hasMore, onLoadMore, selectedAiTopic, lang }: NewsFeedProps) {
  const observer = useRef<IntersectionObserver>();
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return; 
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
      </div>
    );
  }

  if (news.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No news articles found.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((article, index) => {
          const card = (
            <NewsCard 
              article={article} 
              section={selectedAiTopic || 'news'}
              lang={lang}
            />
          );
          if (news.length === index + 1) {
            return (
              <div ref={lastElementRef} key={article.hash_id}>
                {card}
              </div>
            );
          }
          return <div key={article.hash_id}>{card}</div>;
        })}
      </div>
      
      {isLoadingMore && <Loader />}
      
      {!hasMore && news.length > 0 && (
        <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
      )}
    </>
  );
}
