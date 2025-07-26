
"use client";

import { useState } from 'react';
import type { StartupQuizData, QuizOption } from '@/lib/startup-types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ThumbsUp, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn, rewriteSourceUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function QuizCard({ item }: { item: StartupQuizData }) {
  const {
    promptText,
    options,
    pick, // 1-based index
    viewCount,
    likesCount,
    link
  } = item;

  const [selectedOption, setSelectedOption] = useState<number | null>(null); // 0-based index
  const { toast } = useToast();

  const totalVotes = options.reduce((sum, option) => sum + option.selectionCount, 0);
  const correctIndex = pick - 1; // Convert to 0-based index

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    
    if (index === correctIndex) {
        toast({
            title: "Correct!",
            description: "You picked the right answer.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Incorrect",
            description: "Better luck next time!",
        });
    }
  };

  const getOptionState = (index: number) => {
    if (selectedOption === null) return 'default';
    if (index === correctIndex) return 'correct';
    if (index === selectedOption) return 'incorrect';
    return 'default';
  };

  const finalLearnMoreUrl = link?.url ? rewriteSourceUrl(link.url) : '#';

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {link?.imageUrl && (
        <div className="relative w-full h-48">
          <img
            src={link.imageUrl}
            alt={link.title || 'Quiz Image'}
            className="absolute inset-0 w-full h-full object-cover"
            data-ai-hint="quiz related"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-tight">{promptText}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.selectionCount / totalVotes) * 100 : 0;
          const state = getOptionState(index);

          return (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto justify-start p-3 relative text-left whitespace-normal"
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.text}</span>
                {selectedOption !== null && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-bold">{percentage.toFixed(0)}%</span>
                    {state === 'correct' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {state === 'incorrect' && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                )}
              </div>
              {selectedOption !== null && (
                <Progress
                  value={percentage}
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-full -z-10 rounded-md",
                    state === 'correct' && 'bg-green-500/20',
                    state === 'incorrect' && 'bg-red-500/20',
                    state === 'default' && 'bg-muted/50'
                  )}
                  indicatorClassName={cn(
                    state === 'correct' && 'bg-green-500/50',
                    state === 'incorrect' && 'bg-red-500/50',
                  )}
                />
              )}
            </Button>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
        <div className="flex flex-wrap items-center justify-between w-full text-xs text-muted-foreground">
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
            {selectedOption !== null && selectedOption === correctIndex && (
                 <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <Award className="w-4 h-4" />
                    <span>You are correct!</span>
                 </div>
            )}
        </div>
        {link?.url && (
             <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full bg-accent/20 hover:bg-accent/40 border-accent text-accent-foreground"
            >
                <a href={finalLearnMoreUrl} target="_blank" rel="noopener noreferrer">
                    Learn More
                </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
