"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { StartupItem, StartupApiResponse } from '@/lib/startup-types';
import { useToast } from "@/hooks/use-toast";
import { Loader } from '@/components/ui/loader';
import { NewsCardSkeleton } from './NewsCardSkeleton';
import StartupCard from './StartupCard';
import QuizCard from './QuizCard';

export default function StartupFeed() {
    const [items, setItems] = useState<StartupItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextSegment, setNextSegment] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { toast } = useToast();

    const observer = useRef<IntersectionObserver>();
  
    const fetchItems = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const segmentParam = isLoadMore && nextSegment ? `?nextSegment=${encodeURIComponent(nextSegment)}` : '';
            const url = `/api/startup${segmentParam}`;
            
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch startup feed');
            }

            const json: StartupApiResponse = await res.json();
            
            if (json.status !== 'success') {
                throw new Error('API returned an error');
            }

            const newItems = json.data || [];
            
            setItems(prev => isLoadMore ? [...prev, ...newItems] : newItems);
            setNextSegment(json.nextSegment || null);
            setHasMore(!!json.nextSegment && newItems.length > 0);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not load startup feed.';
            toast({ variant: 'destructive', title: 'Error', description: message });
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [nextSegment, toast]);
    
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoadingMore) return; 
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                if (items.length > 0) {
                     fetchItems(true);
                }
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoadingMore, hasMore, items.length, fetchItems]);


    useEffect(() => {
        fetchItems(false);
    }, [fetchItems]);

    if (isLoading) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        );
    }
    
    if (items.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No items found.</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => {
                    let card;
                    if (item.type === 'NEWS') {
                        card = <StartupCard item={item.data} />;
                    } else if (item.type === 'QUIZ') {
                        card = <QuizCard item={item.data} />;
                    } else {
                        return null; // or a fallback component
                    }

                    if (items.length === index + 1) {
                        return (
                            <div ref={lastElementRef} key={item.id}>
                                {card}
                            </div>
                        );
                    }
                    return <div key={item.id}>{card}</div>;
                })}
            </div>
            
            {isLoadingMore && <Loader />}
            
            {!hasMore && items.length > 0 && (
                <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
            )}
        </>
    );
}
