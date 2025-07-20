"use client";

import { useState, useEffect } from 'react';
import { generateSuggestedNews, type GenerateSuggestedNewsOutput } from '@/ai/flows/generate-suggested-news';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import type { NewsArticle } from '@/lib/types';
import NewsCard from './NewsCard';
import { NewsCardSkeleton } from './NewsCardSkeleton';
import { generateId } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';


interface SuggestedNewsProps {
  readingHistory: string[];
}

export default function SuggestedNews({ readingHistory }: SuggestedNewsProps) {
  const [suggestedNews, setSuggestedNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (readingHistory.length === 0) {
      setSuggestedNews([]);
      return;
    }

    const getSuggestions = async () => {
      setIsLoading(true);
      try {
        const result: GenerateSuggestedNewsOutput = await generateSuggestedNews({
          readingHistory: readingHistory.join(', '),
          numberOfArticles: 3,
        });
        
        const formattedNews: NewsArticle[] = result.suggestedNews.map(article => ({
          hash_id: generateId(),
          news_obj: {
            title: article.title,
            content: article.content,
            author_name: article.author_name,
            created_at: Math.floor(Date.now() / 1000),
            image_url: `https://placehold.co/600x400.png`,
            source_url: '#',
            shortened_url: '',
          }
        }));

        setSuggestedNews(formattedNews);

      } catch (error) {
        console.error("Failed to get topic suggestions:", error);
        toast({ variant: "destructive", title: "AI Error", description: "Could not fetch topic suggestions." });
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 500);
    return () => clearTimeout(timeoutId);

  }, [readingHistory, toast]);

  if (readingHistory.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Lightbulb /> Suggested For You
      </SidebarGroupLabel>
      <div className="px-2 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))
        ) : (
          suggestedNews.map(article => (
            <NewsCard key={article.hash_id} article={article} />
          ))
        )}
      </div>
    </SidebarGroup>
  );
}
