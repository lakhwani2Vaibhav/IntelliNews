
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechProps {
  text: string;
  lang: 'en' | 'hi';
}

export default function TextToSpeech({ text, lang }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
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
      // Cancel any ongoing speech before starting a new one
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      const languageCode = lang === 'hi' ? 'hi-IN' : 'en-US';
      const voices = window.speechSynthesis.getVoices();
      
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
      utterance.rate = 1.2; // Increased speed
      utterance.pitch = 1;
      utterance.volume = 1; // Max volume

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
        // Removed toast per user request
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, isPaused, text, lang, toast]);

  // Cleanup on component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also cancel on component unmount
    };
  }, []);

  return (
    <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full backdrop-blur-sm">
        <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSpeech();
            }}
            className="text-white hover:bg-white/20 hover:text-white h-8 w-8 rounded-full"
            aria-label={isSpeaking && !isPaused ? "Pause" : "Play"}
        >
            {isSpeaking ? (isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />) : <Volume2 className="w-4 h-4" />}
        </Button>
    </div>
  );
}
