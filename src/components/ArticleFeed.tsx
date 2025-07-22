"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Article, ArticlesApiResponse } from '@/lib/article-types';
import { useToast } from "@/hooks/use-toast";
import { Loader } from '@/components/ui/loader';
import { NewsCardSkeleton } from './NewsCardSkeleton';
import ArticleCard from './ArticleCard';

interface ArticleFeedProps {
    fetchApi: (url: string, options?: RequestInit) => Promise<any>;
}

export default function ArticleFeed({ fetchApi }: ArticleFeedProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextSegment, setNextSegment] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { toast } = useToast();

    const observer = useRef<IntersectionObserver>();
  
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoadingMore) return; 
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
            // Check needed because the IntersectionObserver is created on the client
            // after the initial render, and it might trigger an immediate call
            // to onLoadMore if the last element is already visible. We only want
            // to fetch more data on subsequent intersections.
            if (articles.length > 0) {
                 fetchArticles(true);
            }
        }
        });

        if (node) observer.current.observe(node);
    }, [isLoadingMore, hasMore, articles.length]);


    const fetchArticles = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

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
            setIsLoadingMore(false);
        }
    }, [nextSegment, toast, fetchApi]);
    
    useEffect(() => {
        fetchArticles(false);
    }, []);

    if (isLoading) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        );
    }
    
    if (articles.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No articles found.</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article, index) => {
                    const card = <ArticleCard article={article} />;
                    if (articles.length === index + 1) {
                        return (
                            <div ref={lastElementRef} key={article.id}>
                                {card}
                            </div>
                        );
                    }
                    return <div key={article.id}>{card}</div>;
                })}
            </div>
            
            {isLoadingMore && <Loader />}
            
            {!hasMore && articles.length > 0 && (
                <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
            )}
        </>
    );
}
