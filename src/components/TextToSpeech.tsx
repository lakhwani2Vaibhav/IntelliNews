
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
      utteranceRef.current = utterance;

      const languageCode = lang === 'hi' ? 'hi-IN' : 'en-US';
      
      let preferredVoice = voices.find(
        (voice) => voice.lang === languageCode && voice.name.toLowerCase().includes('female')
      );

      if (!preferredVoice) {
        preferredVoice = voices.find((voice) => voice.lang === languageCode);
      }
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
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
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        toast({
            variant: 'destructive',
            title: 'Speech Error',
            description: 'Could not play the audio. The selected language or voice may not be supported on your browser.',
        });
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, isPaused, text, lang, toast, voices]);
  
  const handleStop = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
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
            disabled={voices.length === 0}
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
