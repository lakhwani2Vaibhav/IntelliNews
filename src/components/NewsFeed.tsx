"use client";

import { useCallback, useRef, useEffect } from 'react';
import type { NewsArticle } from '@/lib/types';
import NewsCard from './NewsCard';
import { Loader } from '@/components/ui/loader';
import { NewsCardSkeleton } from './NewsCardSkeleton';
import { Button } from './ui/button';

interface NewsFeedProps {
  news: NewsArticle[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isTopStories: boolean;
}

export default function NewsFeed({ news, isLoading, isLoadingMore, hasMore, onLoadMore, isTopStories }: NewsFeedProps) {
  const observer = useRef<IntersectionObserver>();
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore || isTopStories) return; 
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore, isTopStories]);
  
  useEffect(() => {
    if (isTopStories && observer.current) {
        observer.current.disconnect();
    }
  }, [isTopStories]);

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
          if (news.length === index + 1 && !isTopStories) {
            return (
              <div ref={lastElementRef} key={article.hash_id}>
                <NewsCard article={article} />
              </div>
            );
          }
          return <NewsCard key={article.hash_id} article={article} />;
        })}
      </div>
      
      {isLoadingMore && <Loader />}
      
      {isTopStories && hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Loader className="mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}

      {!hasMore && news.length > 0 && (
        <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
      )}
    </>
  );
}
