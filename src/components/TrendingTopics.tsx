"use client";

import type { TrendingTopic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
}

export default function TrendingTopics({ topics, selectedTopic, onSelectTopic }: TrendingTopicsProps) {
  if (topics.length === 0) {
    return (
      <div className="px-2 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <SidebarMenu>
      {topics.map(topic => (
        <SidebarMenuItem key={topic.tag}>
          <Button
            variant={selectedTopic === topic.tag ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onSelectTopic(topic.tag)}
          >
            {topic.label}
          </Button>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
