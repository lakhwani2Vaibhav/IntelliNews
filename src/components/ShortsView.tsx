
"use client";

import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { NewsArticle } from '@/lib/types';
import ShortCard from './ShortCard';
import { Loader } from '@/components/ui/loader';
import { NewsCardSkeleton } from './NewsCardSkeleton';

interface ShortsViewProps {
  news: NewsArticle[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  lang: 'en' | 'hi';
}

export default function ShortsView({ news, isLoading, hasMore, onLoadMore, lang }: ShortsViewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    containScroll: false,
    align: 'start',
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    
    const selectedIndex = emblaApi.selectedScrollSnap();
    const totalSlides = emblaApi.scrollSnapList().length;
    const threshold = Math.floor(totalSlides * 0.7);

    if (selectedIndex >= threshold && hasMore) {
      onLoadMore();
    }
  }, [emblaApi, hasMore, onLoadMore]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (isLoading && news.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!isLoading && news.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No news articles found.</div>;
  }

  return (
    <div className="overflow-hidden h-full w-full" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {news.map((article) => (
          <div className="flex-shrink-0 w-full h-full relative" key={article.hash_id}>
            <ShortCard article={article} lang={lang} />
          </div>
        ))}
        {hasMore && (
          <div className="flex-shrink-0 w-full h-full relative flex items-center justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
