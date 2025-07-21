import Image from 'next/image';
import type { NewsArticle } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, User, Calendar } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { isValid } from 'date-fns';

export default function NewsCard({
  article,
  section,
}: {
  article: NewsArticle;
  section?: string;
}) {
  const {
    title,
    content,
    image_url,
    source_url,
    author_name,
    position_expire_time,
  } = article.news_obj;

  let dateToFormat: Date;
  
  // Robustly check if the timestamp is a valid number and creates a valid date.
  if (typeof position_expire_time === 'number' && !isNaN(position_expire_time)) {
    const d = new Date(position_expire_time * 1000);
    if (isValid(d)) {
      dateToFormat = d;
    } else {
      dateToFormat = new Date(); // Fallback for invalid date from a number
    }
  } else {
    dateToFormat = new Date(); // Fallback for null, undefined, or non-numeric types
  }
  
  const formattedDate = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'yyyy-MM-dd');

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-48">
        <Image
          src={image_url || `https://placehold.co/600x400.png`}
          alt={title}
          fill
          objectFit="cover"
          data-ai-hint={`${section || 'news'} article`}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm">{content}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{author_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full bg-accent/20 hover:bg-accent/40 border-accent text-accent-foreground"
        >
          <a href={source_url} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read More
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
