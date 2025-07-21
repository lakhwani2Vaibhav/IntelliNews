"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Play, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechProps {
  text: string;
  lang: 'en' | 'hi';
}

export default function TextToSpeech({ text, lang }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();

  const handleSpeech = useCallback(() => {
    if (!window.speechSynthesis) {
      toast({
        variant: 'destructive',
        title: 'Speech Synthesis Not Supported',
        description: 'Your browser does not support text-to-speech.',
      });
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      const languageCode = lang === 'hi' ? 'hi-IN' : 'en-US';
      
      let voices = window.speechSynthesis.getVoices();
      let femaleVoice = voices.find(
        (voice) =>
          voice.lang === languageCode && voice.name.toLowerCase().includes('female')
      );

      if (!femaleVoice) {
         femaleVoice = voices.find((voice) => voice.lang === languageCode);
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (voices.length > 0) {
        // Fallback to the first available voice for the language if no female voice is found
        const fallbackVoice = voices.find(v => v.lang.startsWith(lang));
        if (fallbackVoice) {
            utterance.voice = fallbackVoice;
        }
      }

      utterance.lang = languageCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        toast({
            variant: 'destructive',
            title: 'Speech Error',
            description: 'Could not play the audio for this article.',
        });
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.cancel(); // Stop any previous speech
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, isPaused, text, lang, toast]);
  
  const handleStop = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);
  
  // Ensure voices are loaded
  useEffect(() => {
      const handleVoicesChanged = () => {
        // Voices loaded, component will re-render if it needs to find a voice.
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
  }, []);

  return (
    <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full backdrop-blur-sm">
        <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
                e.stopPropagation();
                handleSpeech();
            }}
            className="text-white hover:bg-white/20 hover:text-white h-8 w-8 rounded-full"
            aria-label={isSpeaking && !isPaused ? "Pause" : "Play"}
        >
            {isSpeaking ? (isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />) : <Volume2 className="w-4 h-4" />}
        </Button>
        {isSpeaking && (
             <Button
                size="icon"
                variant="ghost"
                onClick={handleStop}
                className="text-white hover:bg-white/20 hover:text-white h-8 w-8 rounded-full"
                aria-label="Stop"
            >
                <StopCircle className="w-4 h-4" />
            </Button>
        )}
    </div>
  );
}
