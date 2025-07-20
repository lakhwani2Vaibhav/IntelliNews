"use client";

import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, TrendingTopic, ApiResponse, GeneralNewsResponseData, TopicNewsResponseData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import NewsFeed from '@/components/NewsFeed';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedTopics from '@/components/SuggestedTopics';
import { Newspaper, Flame } from 'lucide-react';
import { generateTopicNews, type GenerateTopicNewsOutput } from '@/ai/flows/generate-topic-news';
import { generateSuggestedNews, type GenerateSuggestedNewsOutput } from '@/ai/flows/generate-suggested-news';
import { generateId } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Sparkles } from 'lucide-react';
import NewsCard from './NewsCard';


export default function NewsExplorer() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [suggestedNews, setSuggestedNews] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAiTopic, setSelectedAiTopic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [isAiNewsLoading, setIsAiNewsLoading] = useState(false);

  const { toast } = useToast();

  const fetchTrendingTopics = useCallback(async (currentLang: 'en' | 'hi', controller?: AbortController) => {
    try {
      const res = await fetch(`/api/news/trending-list?lang=${currentLang}`, { signal: controller?.signal });
      if (!res.ok) throw new Error('Failed to fetch trending topics');
      const json: ApiResponse<TrendingTopicsResponseData> = await res.json();
      setTrendingTopics(json.data.trending_tags || []);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load trending topics.' });
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchTrendingTopics(lang);
  }, [lang, fetchTrendingTopics]);
  
  useEffect(() => {
    // This effect handles fetching real news when topic, page or language changes.
    if (selectedAiTopic) return;
    
    const controller = new AbortController();

    const fetchNews = async () => {
        const isLoadMore = page > 1;
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setNews([]);
        }

        try {
            let url = '';
            if (selectedTopic) {
                url = `/api/news/topic-news/${selectedTopic}?lang=${lang}&page=${page}`;
            } else {
                url = `/api/news/get-news?lang=${lang}`;
            }
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error('Failed to fetch news');
            
            const json: ApiResponse<GeneralNewsResponseData | TopicNewsResponseData> = await res.json();
            const newArticles = json.data.news_list || [];
            
            setNews(prev => isLoadMore ? [...prev, ...newArticles] : newArticles);
            setHasMore(newArticles.length > 0 && !!selectedTopic);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load news articles.' });
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        }
    };
    
    fetchNews();

    return () => {
        controller.abort();
    };
  }, [selectedTopic, page, lang, selectedAiTopic, toast]);

  useEffect(() => {
    // Fetch suggested news when reading history changes, but only for top stories view
    if (readingHistory.length > 0 && !selectedTopic && !selectedAiTopic) {
      setIsAiNewsLoading(true);
      generateSuggestedNews({
        readingHistory: readingHistory.join(', '),
        numberOfArticles: 4,
      }).then(result => {
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
      }).catch(error => {
        console.error("Failed to generate suggested news:", error);
        // Don't show a toast for this, it's a background feature
      }).finally(() => {
        setIsAiNewsLoading(false);
      });
    } else if (!selectedTopic && !selectedAiTopic) {
      setSuggestedNews([]); // Clear suggestions if history is cleared
    }
  }, [readingHistory, selectedTopic, selectedAiTopic]);


  const handleSelectTopic = (topic: string) => {
    setPage(1); 
    setSelectedAiTopic(null);
    setSuggestedNews([]);
    if (topic === selectedTopic) {
        setSelectedTopic(null);
    } else {
        setSelectedTopic(topic);
        const topicObject = trendingTopics.find(t => t.tag === topic);
        const historyTopic = topicObject ? topicObject.label : topic;
        setReadingHistory(prev => [...new Set([historyTopic, ...prev])].slice(0, 10));
    }
  };

  const handleSelectSuggestedTopic = (topic: string) => {
    setIsLoading(true);
    setSelectedTopic(null);
    setSelectedAiTopic(topic);
    setNews([]);
    setSuggestedNews([]);
    setHasMore(false);

    generateTopicNews({ topic, numberOfArticles: 10 })
      .then(result => {
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
      })
      .catch(error => {
        console.error("Failed to generate AI news for topic:", error);
        toast({ variant: "destructive", title: "AI Error", description: `Could not generate news for ${topic}.` });
        setNews([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSetLang = (newLang: 'en' | 'hi') => {
    if (newLang !== lang) {
        setLang(newLang);
        setPage(1);
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
            {suggestedNews.length > 0 && !selectedTopic && !selectedAiTopic && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Suggested For You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {suggestedNews.map(article => (
                    <NewsCard key={article.hash_id} article={article} />
                  ))}
                </div>
                <Separator className="my-8" />
              </div>
            )}
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
