"use client";

import { useState, useEffect } from 'react';
import { suggestRelevantTopics, type SuggestRelevantTopicsOutput } from '@/ai/flows/suggest-relevant-topics';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuggestedTopicsProps {
  readingHistory: string[];
  onSelectTopic: (topic: string) => void;
}

export default function SuggestedTopics({ readingHistory, onSelectTopic }: SuggestedTopicsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (readingHistory.length === 0) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      setIsLoading(true);
      try {
        const result: SuggestRelevantTopicsOutput = await suggestRelevantTopics({
          readingHistory: readingHistory.join(', '),
          numberOfSuggestions: 3,
        });
        setSuggestions(result.suggestedTopics);
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
      <SidebarMenu>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}><Skeleton className="h-8 w-full" /></SidebarMenuItem>
          ))
        ) : (
          suggestions.map(topic => (
            <SidebarMenuItem key={topic}>
              <Button variant="ghost" className="w-full justify-start" onClick={() => onSelectTopic(topic)}>
                {topic}
              </Button>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
