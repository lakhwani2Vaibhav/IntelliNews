import Image from 'next/image';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, User, Calendar, Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

export default function NewsCard({ article }: { article: NewsArticle }) {
  const { title, content, image_url, source_url, author_name, position_expire_time } = article.news_obj;

  // Use a fallback timestamp only if position_expire_time is null or undefined.
  // This prevents invalid values from being passed to the Date constructor.
  // Multiplying by 1000 converts the UNIX timestamp (in seconds) to milliseconds.
  const timestamp = (position_expire_time ?? (Date.now() / 1000)) * 1000;
  const dateToFormat = new Date(timestamp);

  const formattedDate = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'yyyy-MM-dd');
  const formattedTime = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'HH:mm:ss');

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-48">
        <Image
          src={image_url}
          alt={title}
          fill
          objectFit="cover"
          data-ai-hint="news article"
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
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
            </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full bg-accent/20 hover:bg-accent/40 border-accent text-accent-foreground">
          <a href={source_url} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read More
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
