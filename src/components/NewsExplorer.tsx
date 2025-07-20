"use client";

import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, TrendingTopic, ApiResponse, GeneralNewsResponseData, TrendingTopicsResponseData, TopicNewsResponseData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import NewsFeed from '@/components/NewsFeed';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedTopics from '@/components/SuggestedTopics';
import { Newspaper, Flame } from 'lucide-react';

export default function NewsExplorer() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  const { toast } = useToast();

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const res = await fetch(`/api/news/trending-list?lang=${lang}`);
      if (!res.ok) throw new Error('Failed to fetch trending topics');
      const json: ApiResponse<TrendingTopicsResponseData> = await res.json();
      setTrendingTopics(json.data.trending_tags || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load trending topics.' });
    }
  }, [lang, toast]);

  const fetchNews = useCallback(async (topic: string | null, newPage: number) => {
    if (newPage === 1) {
        setIsLoading(true);
    } else {
        setIsLoadingMore(true);
    }

    try {
      let url = '';
      if (topic) {
        url = `/api/news/topic-news/${topic}?lang=${lang}&page=${newPage}`;
      } else {
        url = `/api/news/get-news?lang=${lang}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch news');
      const json: ApiResponse<GeneralNewsResponseData | TopicNewsResponseData> = await res.json();
      const newArticles = json.data.news_list || [];
      
      setNews(prev => newPage === 1 ? newArticles : [...prev, ...newArticles]);
      setHasMore(newArticles.length > 0);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load news articles.' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [lang, toast]);

  useEffect(() => {
    fetchTrendingTopics();
    setPage(1);
    setNews([]);
    setSelectedTopic(null);
    fetchNews(null, 1);
  }, [lang, fetchTrendingTopics, fetchNews]);

  useEffect(() => {
    setPage(1);
    setNews([]);
    fetchNews(selectedTopic, 1);
  }, [selectedTopic, fetchNews]);

  const handleSelectTopic = (topic: string) => {
    if (topic === selectedTopic) {
        setSelectedTopic(null);
    } else {
        setSelectedTopic(topic);
        setReadingHistory(prev => [...new Set([topic, ...prev])].slice(0, 10));
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && selectedTopic) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(selectedTopic, nextPage);
    }
  };

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
            <SuggestedTopics readingHistory={readingHistory} onSelectTopic={handleSelectTopic} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
             <h2 className="text-xl font-semibold text-foreground">
                {selectedTopic ? `Showing results for "${selectedTopic}"` : 'Top Stories'}
             </h2>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </header>
          <main className="p-4 md:p-6">
            <NewsFeed
              news={news}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={!!selectedTopic && hasMore}
              onLoadMore={handleLoadMore}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
