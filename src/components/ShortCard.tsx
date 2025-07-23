
import type { NewsArticle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Globe, User, Calendar, ChevronUp } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { isValid } from 'date-fns';
import TextToSpeech from './TextToSpeech';

export default function ShortCard({
  article,
  lang,
}: {
  article: NewsArticle;
  lang: 'en' | 'hi';
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
  
  if (typeof position_expire_time === 'number' && !isNaN(position_expire_time)) {
    const d = new Date(position_expire_time * 1000);
    if (isValid(d)) {
      dateToFormat = d;
    } else {
      dateToFormat = new Date();
    }
  } else {
    dateToFormat = new Date();
  }
  
  const formattedDate = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'yyyy-MM-dd');

  const textToRead = `${title}. ${content}`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg flex flex-col justify-end text-white">
      <img
        src={image_url || `https://placehold.co/600x400.png`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover -z-10"
        data-ai-hint="news background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
            <TextToSpeech text={textToRead} lang={lang} />
        </div>
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        <p className="text-base font-light">{content}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-80">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{author_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full bg-white/20 border-white/50 hover:bg-white/30 text-white"
        >
          <a href={source_url} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Read More
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
