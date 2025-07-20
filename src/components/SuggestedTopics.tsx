"use client";

import { useState, useEffect } from 'react';
import { suggestRelevantTopics, type SuggestRelevantTopicsOutput } from '@/ai/flows/suggest-relevant-topics';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

interface SuggestedTopicsProps {
  readingHistory: string[];
  onSelectTopic: (topic: string) => void;
}

export default function SuggestedTopics({ readingHistory, onSelectTopic }: SuggestedTopicsProps) {
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (readingHistory.length === 0) {
      setSuggestedTopics([]);
      return;
    }

    const getSuggestions = async () => {
      setIsLoading(true);
      try {
        const result: SuggestRelevantTopicsOutput = await suggestRelevantTopics({
          readingHistory: readingHistory.join(', '),
          numberOfSuggestions: 5,
        });
        setSuggestedTopics(result.suggestedTopics);
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
        <Sparkles className="w-4 h-4" /> AI Topic Suggestions
      </SidebarGroupLabel>
      {isLoading ? (
        <div className="px-2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <SidebarMenu>
          {suggestedTopics.map((topic, index) => (
            <SidebarMenuItem key={index}>
              <Button
                variant='ghost'
                className="w-full justify-start"
                onClick={() => onSelectTopic(topic)}
              >
                {topic}
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
