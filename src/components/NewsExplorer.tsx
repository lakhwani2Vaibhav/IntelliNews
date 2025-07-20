"use client";

import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, TrendingTopic, ApiResponse, GeneralNewsResponseData, TopicNewsResponseData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import NewsFeed from '@/components/NewsFeed';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedTopics from '@/components/SuggestedTopics';
import { Newspaper, Flame } from 'lucide-react';
import { generateTopicNews } from '@/ai/flows/generate-topic-news';
import { generateSuggestedNews } from '@/ai/flows/generate-suggested-news';
import { generateId } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Sparkles } from 'lucide-react';
import NewsCard from './NewsCard';

function NewsExplorerContent() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [suggestedNews, setSuggestedNews] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAiTopic, setSelectedAiTopic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nextPageOffset, setNextPageOffset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [isAiNewsLoading, setIsAiNewsLoading] = useState(false);

  const { toast } = useToast();
  const sidebar = useSidebar();

  const fetchTrendingTopics = useCallback(async (currentLang: 'en' | 'hi') => {
    try {
      const res = await fetch(`/api/news/trending-list?lang=${currentLang}`);
      if (!res.ok) throw new Error('Failed to fetch trending topics');
      const json: ApiResponse<{ trending_tags: TrendingTopic[] }> = await res.json();
      setTrendingTopics(json.data.trending_tags || []);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load trending topics.' });
    }
  }, [toast]);

  useEffect(() => {
    fetchTrendingTopics(lang);
  }, [lang, fetchTrendingTopics]);
  
  useEffect(() => {
    if (selectedAiTopic) return;

    const controller = new AbortController();

    const fetchNews = async () => {
      const isLoadMore = page > 1 || (!!nextPageOffset && !selectedTopic);
      
      if (!isLoadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      try {
        let url = '';
        if (selectedTopic) {
            url = `/api/news/topic-news/${selectedTopic}?lang=${lang}&page=${page}`;
        } else {
            const offsetParam = nextPageOffset ? `&news_offset=${nextPageOffset}` : '';
            url = `/api/news/get-news?lang=${lang}${offsetParam}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch news');
        
        const json: ApiResponse<GeneralNewsResponseData | TopicNewsResponseData> = await res.json();
        const newArticles = json.data.news_list || [];

        if (page === 1 && selectedTopic && newArticles.length === 0) {
          toast({
            title: 'No articles found',
            description: `No articles found for this topic. Showing Top Stories instead.`,
          });
          setSelectedTopic(null); // Fallback to top stories
          setNews([]);
          setPage(1);
          setNextPageOffset(null);
          return;
        }
        
        setNews(prevNews => isLoadMore ? [...prevNews, ...newArticles] : newArticles);
        
        if (selectedTopic) {
          setHasMore('next_page_hash' in json.data && !!json.data.next_page_hash);
        } else {
          const nextOffset = ('min_news_id' in json.data) ? json.data.min_news_id : null;
          setNextPageOffset(nextOffset);
          setHasMore(!!nextOffset);
        }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, page, lang, selectedAiTopic, nextPageOffset]);

  useEffect(() => {
    if (readingHistory.length > 0 && !selectedTopic && !selectedAiTopic) {
      setIsAiNewsLoading(true);
      generateSuggestedNews({
        readingHistory: readingHistory.join(', '),
        numberOfArticles: 4,
        language: lang === 'hi' ? 'Hindi' : 'English',
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
            category: article.category,
          }
        }));
        setSuggestedNews(formattedNews);
      }).catch(error => {
        console.error("Failed to generate suggested news:", error);
      }).finally(() => {
        setIsAiNewsLoading(false);
      });
    } else if (!selectedTopic && !selectedAiTopic) {
      setSuggestedNews([]); 
    }
  }, [readingHistory, selectedTopic, selectedAiTopic, lang]);

  const closeSidebarOnMobile = () => {
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false);
    }
  }

  const handleSelectTopic = (topicTag: string) => {
    setNews([]);
    setPage(1);
    setNextPageOffset(null);
    setSelectedAiTopic(null);
    setSuggestedNews([]);

    if (topicTag === selectedTopic) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topicTag);
      const topicObject = trendingTopics.find(t => t.tag === topicTag);
      const historyTopic = topicObject ? topicObject.label : topicTag;
      setReadingHistory(prev => [...new Set([historyTopic, ...prev])].slice(0, 10));
    }
    closeSidebarOnMobile();
  };

  const handleSelectSuggestedTopic = (topic: string) => {
    setPage(1);
    setNextPageOffset(null);
    setIsLoading(true);
    setSelectedTopic(null);
    setSelectedAiTopic(topic);
    setNews([]);
    setSuggestedNews([]);
    setHasMore(false);
    closeSidebarOnMobile();

    generateTopicNews({ topic, numberOfArticles: 10, language: lang === 'hi' ? 'Hindi' : 'English' })
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
        setNews([]);
        setLang(newLang);
        setPage(1);
        setNextPageOffset(null);
        setTrendingTopics([]);
        setReadingHistory([]);
        setSelectedTopic(null);
        setSelectedAiTopic(null);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore) return;

    if (selectedTopic) {
      setPage(prevPage => prevPage + 1);
    } else {
      // For top stories, useEffect handles fetching with nextPageOffset
      // This click is just to trigger the loading state and effect
      setIsLoadingMore(true);
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
    <>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Newspaper className="w-7 h-7" />
            IntelliNews
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
          <SuggestedTopics readingHistory={readingHistory} onSelectTopic={handleSelectSuggestedTopic} lang={lang} />
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
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isTopStories={!selectedTopic && !selectedAiTopic}
          />
        </main>
      </SidebarInset>
    </>
  );
}


export default function NewsExplorer() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <NewsExplorerContent />
      </SidebarProvider>
    </div>
  );
}

    