"use client";

import { useState } from 'react';
import { generateSuggestedNews, type GenerateSuggestedNewsOutput } from '@/ai/flows/generate-suggested-news';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import type { NewsArticle } from '@/lib/types';
import NewsCard from './NewsCard';
import { NewsCardSkeleton } from './NewsCardSkeleton';
import { generateId } from '@/lib/utils';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';


interface SuggestedNewsProps {
  readingHistory: string[];
}

export default function SuggestedNews({ readingHistory }: SuggestedNewsProps) {
  const [suggestedNews, setSuggestedNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateNews = async () => {
    if (readingHistory.length === 0) {
      toast({ variant: "destructive", title: "No History", description: "Read some articles first to get suggestions." });
      return;
    }

    setIsLoading(true);
    setSuggestedNews([]); // Clear previous suggestions
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
      console.error("Failed to generate suggested news:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate suggested news." });
    } finally {
      setIsLoading(false);
    }
  };

  if (readingHistory.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Lightbulb /> Suggested For You
      </SidebarGroupLabel>
      <div className="px-2 space-y-4">
        <Button onClick={handleGenerateNews} disabled={isLoading} className="w-full">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate Suggestions
        </Button>

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
