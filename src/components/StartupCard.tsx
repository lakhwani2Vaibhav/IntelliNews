"use client";

import { useState } from 'react';
import type { StartupItem } from '@/lib/startup-types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Calendar, Eye, ThumbsUp } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { isValid } from 'date-fns';

export default function StartupCard({ item }: { item: StartupItem }) {
  const {
    title,
    imageUrl,
    sourceUrl,
    source,
    publishedAt,
    curatedText,
    likesCount,
    viewCount,
  } = item.data;

  const [imgSrc, setImgSrc] = useState(imageUrl || `https://placehold.co/600x400.png`);

  let dateToFormat: Date;
  const d = new Date(publishedAt);
  if (isValid(d)) {
    dateToFormat = d;
  } else {
    dateToFormat = new Date(); // Fallback for invalid date
  }
  const formattedDate = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'yyyy-MM-dd');
  
  const handleImageError = () => {
    setImgSrc(`https://placehold.co/600x400.png`);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-48">
        <img
          src={imgSrc}
          alt={title}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="startup tech"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
         {source && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {source.displayImage && (
                <img src={source.displayImage} alt={source.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />
                )}
                <span>{source.name}</span>
            </div>
         )}
         <CardDescription className="text-sm">{curatedText}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
        <div className="flex flex-wrap items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{viewCount}</span>
                </div>
            </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full bg-accent/20 hover:bg-accent/40 border-accent text-accent-foreground"
        >
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read Full Story
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
