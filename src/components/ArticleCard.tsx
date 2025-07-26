
"use client";

import { useState } from 'react';
import type { Article } from '@/lib/article-types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, User, Calendar, Heart, Bookmark } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { rewriteSourceUrl } from '@/lib/utils';

export default function ArticleCard({ article }: { article: Article }) {
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
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-48">
        <img
          src={imgSrc}
          alt={title}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="article feature"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {source.displayImage && (
              <img src={source.displayImage} alt={source.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />
            )}
            <span>{source.name}</span>
         </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
        <div className="flex flex-wrap items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{bookmarksCount}</span>
                </div>
            </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full bg-accent/20 hover:bg-accent/40 border-accent text-accent-foreground"
        >
          <a href={finalSourceUrl} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read Full Article
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
