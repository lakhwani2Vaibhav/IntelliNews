
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Article, ArticlesApiResponse } from '@/lib/article-types';
import ArticleShortCard from './ArticleShortCard';
import { Loader } from '@/components/ui/loader';
import { useToast } from "@/hooks/use-toast";

interface ArticleShortsViewProps {
  fetchApi: (url: string, options?: RequestInit) => Promise<any>;
}

export default function ArticleShortsView({ fetchApi }: ArticleShortsViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextSegment, setNextSegment] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);


  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    containScroll: false,
    align: 'start',
  });

  const fetchArticles = useCallback(async (isLoadMore = false) => {
    if (!hasMore && isLoadMore) return;
    setIsLoading(true);

    try {
        const segmentParam = isLoadMore && nextSegment ? `?nextSegment=${encodeURIComponent(nextSegment)}` : '';
        const url = `/api/articles${segmentParam}`;
        
        const json: ArticlesApiResponse = await fetchApi(url);
        
        if (json.status !== 'success') {
            throw new Error('API returned an error');
        }

        const newArticles = json.data || [];
        
        setArticles(prev => isLoadMore ? [...prev, ...newArticles] : newArticles);
        setNextSegment(json.nextSegment || null);
        setHasMore(!!json.nextSegment);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load articles.';
        toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
        setIsLoading(false);
    }
  }, [nextSegment, hasMore, toast, fetchApi]);
  
  useEffect(() => {
    fetchArticles(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi || isLoading) return;
    
    setSelectedIndex(emblaApi.selectedScrollSnap());
    const totalSlides = emblaApi.scrollSnapList().length;
    const threshold = Math.floor(totalSlides * 0.7);

    if (selectedIndex >= threshold && hasMore) {
      fetchArticles(true);
    }
  }, [emblaApi, hasMore, isLoading, fetchArticles, selectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    // Set initial index
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (isLoading && articles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!isLoading && articles.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No articles found.</div>;
  }

  return (
    <div className="overflow-hidden h-full w-full" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {articles.map((article, index) => (
          <div className="flex-shrink-0 w-full h-full relative" key={article.id}>
            <ArticleShortCard article={article} isActive={index === selectedIndex} />
          </div>
        ))}
        {hasMore && (
          <div className="flex-shrink-0 w-full h-full relative flex items-center justify-center bg-black">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
