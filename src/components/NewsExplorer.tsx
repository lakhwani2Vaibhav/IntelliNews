"use client";

import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, TrendingTopic, ApiResponse, GeneralNewsResponseData, TopicNewsResponseData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import NewsFeed from '@/components/NewsFeed';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedTopics from '@/components/SuggestedTopics';
import { Flame } from 'lucide-react';
import { generateTopicNews } from '@/ai/flows/generate-topic-news';
import { generateSuggestedNews } from '@/ai/flows/generate-suggested-news';
import { generateId } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Sparkles } from 'lucide-react';
import NewsCard from './NewsCard';
import Image from 'next/image';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';


let apiSecret: string | null = null;
let encryptionKey: string | null = null;

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

  const fetchApi = useCallback(async (url: string) => {
    if (apiSecret === null) {
      apiSecret = process.env.NEXT_PUBLIC_API_SECRET_KEY || '';
    }
    if (encryptionKey === null) {
        encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
    }

    const encryptedSecret = AES.encrypt(apiSecret, encryptionKey).toString();

    const res = await fetch(url, {
        headers: {
            'X-API-Secret': encryptedSecret,
        }
    });
    if (res.status === 403) {
      throw new Error("Forbidden: Invalid API Secret");
    }
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
  }, []);

  const fetchTrendingTopics = useCallback(async (currentLang: 'en' | 'hi') => {
    try {
      const json: ApiResponse<{ trending_tags: TrendingTopic[] }> = await fetchApi(`/api/news/trending-list?lang=${currentLang}`);
      setTrendingTopics(json.data.trending_tags || []);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load trending topics.';
        toast({ variant: 'destructive', title: 'Error', description: message });
    }
  }, [toast, fetchApi]);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (selectedAiTopic) return;
    
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
        const offsetParam = isLoadMore && nextPageOffset ? `&news_offset=${nextPageOffset}` : '';
        url = `/api/news/get-news?lang=${lang}${offsetParam}`;
      }
      
      const json: ApiResponse<GeneralNewsResponseData | TopicNewsResponseData> = await fetchApi(url);
      const newArticles = json.data.news_list || [];
      
      if (!isLoadMore && page === 1 && selectedTopic && newArticles.length === 0) {
        toast({
          title: 'No articles found',
          description: `No articles found for this topic. Showing Top Stories instead.`,
        });
        setSelectedTopic(null);
        return;
      }

      setNews(prevNews => isLoadMore ? [...prevNews, ...newArticles] : newArticles);
      
      if ('min_news_id' in json.data) { // Top Stories
        const nextOffset = json.data.min_news_id;
        setNextPageOffset(nextOffset);
        setHasMore(!!nextOffset);
      } else { // Topic News
         setHasMore(newArticles.length > 0);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load news articles.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [lang, nextPageOffset, selectedAiTopic, selectedTopic, toast, page, fetchApi]);

  useEffect(() => {
    fetchTrendingTopics(lang);
  }, [lang, fetchTrendingTopics]);
  
  useEffect(() => {
    // Only fetch data when lang or selectedTopic changes
    // Not when page changes, that's handled by handleLoadMore
    fetchData(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, selectedTopic, selectedAiTopic]);
  
  useEffect(() => {
    if (page > 1) {
        fetchData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  useEffect(() => {
    if (readingHistory.length > 0 && !selectedTopic && !selectedAiTopic) {
      setIsAiNewsLoading(true);
      generateSuggestedNews({
        readingHistory: readingHistory.join(', '),
        numberOfArticles: 2,
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
    if (topicTag === selectedTopic) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topicTag);
      const topicObject = trendingTopics.find(t => t.tag === topicTag);
      const historyTopic = topicObject ? topicObject.label : topicTag;
      setReadingHistory(prev => [...new Set([historyTopic, ...prev])].slice(0, 10));
    }
    setNews([]);
    setPage(1);
    setNextPageOffset(null);
    setSelectedAiTopic(null);
    setSuggestedNews([]);
    closeSidebarOnMobile();
  };

  const handleSelectSuggestedTopic = (topic: string) => {
    setNextPageOffset(null);
    setIsLoading(true);
    setPage(1);
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
        setPage(prev => prev + 1);
    } else {
        // This is for top stories infinite scroll
        fetchData(true);
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
            <Image src="/Intelli News Logo.gif" alt="IntelliNews Logo" width={36} height={36} />
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
          <div className="flex items-center gap-2 min-w-0">
             <SidebarTrigger className="md:hidden" />
             <h2 className="text-lg md:text-xl font-semibold text-foreground">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
