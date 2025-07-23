
"use client";

import { useState } from 'react';
import type { StartupNewsData, StartupQuizData } from '@/lib/startup-types';
import { Button } from '@/components/ui/button';
import { Globe, Calendar, Eye, ThumbsUp, ChevronUp, CheckCircle2, XCircle, Award } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import TextToSpeech from './TextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type StartupShortCardProps = {
    item: { type: 'NEWS', data: StartupNewsData } | { type: 'QUIZ', data: StartupQuizData };
    lang: 'en' | 'hi';
}

function NewsContent({ item, lang }: { item: StartupNewsData, lang: 'en' | 'hi' }) {
  const {
    title,
    imageUrl,
    sourceUrl,
    source,
    publishedAt,
    curatedText,
    likesCount,
    viewCount,
  } = item;

  const [imgSrc, setImgSrc] = useState(imageUrl || `https://placehold.co/600x400.png`);
  
  let dateToFormat: Date;
  const d = new Date(publishedAt);
  if (isValid(d)) {
    dateToFormat = d;
  } else {
    dateToFormat = new Date();
  }
  const formattedDate = formatInTimeZone(dateToFormat, 'Asia/Kolkata', 'yyyy-MM-dd');
  
  const handleImageError = () => {
    setImgSrc(`https://placehold.co/600x400.png`);
  };

  const textToRead = `${title}. ${curatedText || ''}`;
  
  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col justify-end text-white">
      <img
        src={imgSrc}
        alt={title}
        onError={handleImageError}
        className="absolute inset-0 w-full h-full object-cover -z-10"
        data-ai-hint="startup tech background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />

      <div className="p-4 space-y-4">
        <div className="absolute top-4 right-4">
            <TextToSpeech text={textToRead} lang={lang} />
        </div>
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        
        {source && (
            <div className="flex items-center gap-2 text-sm opacity-90">
                {source.displayImage && (
                <img src={source.displayImage} alt={source.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />
                )}
                <span>{source.name}</span>
            </div>
        )}

        {curatedText && <p className="text-base font-light line-clamp-4">{curatedText}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-80">
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{formattedDate}</span></div>
            <div className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /><span>{likesCount}</span></div>
            <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /><span>{viewCount}</span></div>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full bg-white/20 border-white/50 hover:bg-white/30 text-white">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer"><Globe className="mr-2 h-4 w-4" />Read Full Story</a>
        </Button>
      </div>
    </div>
  )
}

function QuizContent({ item }: { item: StartupQuizData }) {
    const {
        promptText,
        options,
        pick,
        link,
    } = item;

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const { toast } = useToast();
    const totalVotes = options.reduce((sum, option) => sum + option.selectionCount, 0);
    const correctIndex = pick - 1;

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        
        if (index === correctIndex) {
            toast({ title: "Correct!", description: "You picked the right answer." });
        } else {
            toast({ variant: "destructive", title: "Incorrect", description: "Better luck next time!" });
        }
    };

    const getOptionState = (index: number) => {
        if (selectedOption === null) return 'default';
        if (index === correctIndex) return 'correct';
        if (index === selectedOption) return 'incorrect';
        return 'default';
    };

    return (
        <div className="relative h-full w-full overflow-hidden flex flex-col justify-end text-white">
             {link?.imageUrl && (
                <img
                    src={link.imageUrl}
                    alt={link.title || 'Quiz Image'}
                    className="absolute inset-0 w-full h-full object-cover -z-10"
                    data-ai-hint="quiz background"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10" />

            <div className="p-4 space-y-3">
                <h2 className="text-2xl font-bold leading-tight">{promptText}</h2>
                <div className="space-y-2">
                {options.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.selectionCount / totalVotes) * 100 : 0;
                    const state = getOptionState(index);

                    return (
                        <Button
                            key={index}
                            variant="outline"
                            className="w-full h-auto justify-start p-3 relative text-left whitespace-normal bg-white/10 border-white/30 hover:bg-white/20 text-white"
                            onClick={() => handleOptionClick(index)}
                            disabled={selectedOption !== null}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span>{option.text}</span>
                                {selectedOption !== null && (
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="font-bold">{percentage.toFixed(0)}%</span>
                                    {state === 'correct' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                    {state === 'incorrect' && <XCircle className="w-5 h-5 text-red-400" />}
                                </div>
                                )}
                            </div>
                            {selectedOption !== null && (
                                <Progress
                                value={percentage}
                                className="absolute bottom-0 left-0 w-full h-full -z-10 rounded-md bg-transparent"
                                indicatorClassName={cn(
                                    state === 'correct' && 'bg-green-500/50',
                                    state === 'incorrect' && 'bg-red-500/50',
                                    state === 'default' && 'bg-white/20'
                                )}
                                />
                            )}
                        </Button>
                    );
                })}
                </div>
                 {selectedOption !== null && selectedOption === correctIndex && (
                     <div className="flex items-center justify-center gap-1.5 text-green-400 font-semibold pt-2">
                        <Award className="w-5 h-5" />
                        <span>You got it right!</span>
                     </div>
                )}
                {link?.url && (
                    <Button asChild variant="outline" size="sm" className="w-full bg-white/20 border-white/50 hover:bg-white/30 text-white !mt-4">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">Learn More</a>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function StartupShortCard({ item, lang }: StartupShortCardProps) {
  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col justify-end text-white">
        {item.type === 'NEWS' ? <NewsContent item={item.data} lang={lang} /> : <QuizContent item={item.data} />}
        
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pt-6 text-sm opacity-60 animate-bounce'>
            <ChevronUp className='w-6 h-6' />
            <span>Swipe up</span>
        </div>
    </div>
  );
}

    