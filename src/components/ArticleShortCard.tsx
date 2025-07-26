
"use client";

import { useState } from 'react';
import type { Article } from '@/lib/article-types';
import { Button } from '@/components/ui/button';
import { Globe, User, Calendar, Heart, Bookmark, ChevronUp } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { rewriteSourceUrl, cn } from '@/lib/utils';

export default function ArticleShortCard({ article, isActive }: { article: Article, isActive: boolean }) {
  const {
    title,
    imageUrl,
    sourceUrl,
    source,
    publishedAt,
    likesCount,
    bookmarksCount,
  } = article.data;

  const [imgSrc, setImgSrc] = useState(imageUrl || `https://placehold.co/600x400.png`);
  const formattedDate = formatInTimeZone(new Date(publishedAt), 'Asia/Kolkata', 'yyyy-MM-dd');
  
  const handleImageError = () => {
    setImgSrc(`https://placehold.co/600x400.png`);
  };

  const finalSourceUrl = rewriteSourceUrl(sourceUrl);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg flex flex-col justify-end text-white">
      <img
        src={imgSrc}
        alt={title}
        onError={handleImageError}
        className={cn(
            "absolute inset-0 w-full h-full object-cover -z-10",
            isActive && "animate-zoom-out"
        )}
        data-ai-hint="article feature background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />

      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        
        <div className="flex items-center gap-2 text-sm opacity-90">
            {source.displayImage && (
              <img src={source.displayImage} alt={source.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />
            )}
            <span>{source.name}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-4 h-4" />
            <span>{bookmarksCount}</span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full bg-white/20 border-white/50 hover:bg-white/30 text-white"
        >
          <a href={finalSourceUrl} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read Full Article
          </a>
        </Button>
        
        <div className='flex flex-col items-center justify-center pt-6 text-sm opacity-60 animate-bounce'>
            <ChevronUp className='w-6 h-6' />
            <span>Swipe up for next short</span>
        </div>
      </div>
    </div>
  );
}
