"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { NewsArticle, TrendingTopic, ApiResponse, GeneralNewsResponseData, TrendingTopicsResponseData, TopicNewsResponseData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import NewsFeed from '@/components/NewsFeed';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedTopics from '@/components/SuggestedTopics';
import { Newspaper, Flame, Sparkles } from 'lucide-react';
import { generateTopicNews, type GenerateTopicNewsOutput } from '@/ai/flows/generate-topic-news';
import { generateId } from '@/lib/utils';


export default function NewsExplorer() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAiTopic, setSelectedAiTopic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const fetchTrendingTopics = useCallback(async (currentLang: 'en' | 'hi') => {
    try {
      const res = await fetch(`/api/news/trending-list?lang=${currentLang}`);
      if (!res.ok) throw new Error('Failed to fetch trending topics');
      const json: ApiResponse<TrendingTopicsResponseData> = await res.json();
      setTrendingTopics(json.data.trending_tags || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load trending topics.' });
    }
  }, [toast]);

  const fetchNews = useCallback(async (topic: string | null, newPage: number, currentLang: 'en' | 'hi', isLoadMore: boolean) => {
    if (isLoadMore) {
        setIsLoadingMore(true);
    } else {
        setIsLoading(true);
    }

    try {
      let url = '';
      if (topic) {
        url = `/api/news/topic-news/${topic}?lang=${currentLang}&page=${newPage}`;
      } else {
        url = `/api/news/get-news?lang=${currentLang}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch news');
      const json: ApiResponse<GeneralNewsResponseData | TopicNewsResponseData> = await res.json();
      const newArticles = json.data.news_list || [];
      
      setNews(prev => isLoadMore ? [...prev, ...newArticles] : newArticles);
      setHasMore(newArticles.length > 0);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load news articles.' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);
  
  useEffect(() => {
    startTransition(() => {
      setIsLoading(true);
      fetchTrendingTopics(lang);
      fetchNews(selectedTopic, page, lang, false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);


  useEffect(() => {
    // This effect handles fetching real news when topic or page changes.
    // It will not run if an AI topic is selected.
    if (selectedAiTopic) return;
    
    startTransition(() => {
      fetchNews(selectedTopic, page, lang, page > 1);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, page, selectedAiTopic]);


  const handleSelectTopic = (topic: string) => {
    startTransition(() => {
        setPage(1); 
        setSelectedAiTopic(null);
        if (topic === selectedTopic) {
            setSelectedTopic(null);
        } else {
            setSelectedTopic(topic);
            const topicObject = trendingTopics.find(t => t.tag === topic);
            const historyTopic = topicObject ? topicObject.label : topic;
            setReadingHistory(prev => [...new Set([historyTopic, ...prev])].slice(0, 10));
        }
    });
  };

  const handleSelectSuggestedTopic = (topic: string) => {
    startTransition(async () => {
      setIsLoading(true);
      setSelectedTopic(null);
      setSelectedAiTopic(topic);
      setNews([]);
      setHasMore(false); // AI news is not paginated

      try {
        const result: GenerateTopicNewsOutput = await generateTopicNews({ topic });
        
        const formattedNews: NewsArticle[] = result.generatedNews.map(article => ({
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
        setNews(formattedNews);
      } catch (error) {
        console.error("Failed to generate AI news for topic:", error);
        toast({ variant: "destructive", title: "AI Error", description: `Could not generate news for ${topic}.` });
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSetLang = (newLang: 'en' | 'hi') => {
    if (newLang !== lang) {
      setLang(newLang);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && selectedTopic && !selectedAiTopic) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const getHeaderTitle = () => {
    if (selectedAiTopic) {
      return `AI News for: "${selectedAiTopic}"`
    }
    if (selectedTopic) {
      const topicLabel = trendingTopics.find(t => t.tag === selectedTopic)?.label || selectedTopic;
      return `Showing results for "${topicLabel}"`
    }
    return 'Top Stories';
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Newspaper className="w-7 h-7" />
              Inshorts Explorer
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2"><Flame /> Trending Topics</SidebarGroupLabel>
              <TrendingTopics
                topics={trendingTopics}
                selectedTopic={selectedTopic}
                onSelectTopic={handleSelectTopic}
              />
            </SidebarGroup>
            <SuggestedTopics readingHistory={readingHistory} onSelectTopic={handleSelectSuggestedTopic} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="md:hidden" />
               <h2 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  {getHeaderTitle()}
               </h2>
            </div>
            <LanguageSwitcher lang={lang} setLang={handleSetLang} />
          </header>
          <main className="p-4 md:p-6">
            <NewsFeed
              news={news}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={!!selectedTopic && hasMore && !selectedAiTopic}
              onLoadMore={handleLoadMore}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
