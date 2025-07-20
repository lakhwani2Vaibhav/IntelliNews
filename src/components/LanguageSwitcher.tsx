"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
}

export default function LanguageSwitcher({ lang, setLang }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center p-1 rounded-full bg-muted">
      <Button
        size="sm"
        onClick={() => setLang('en')}
        className={cn(
            "rounded-full transition-colors duration-300",
            lang === 'en' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-transparent text-muted-foreground hover:bg-background/50'
        )}
      >
        EN
      </Button>
      <Button
        size="sm"
        onClick={() => setLang('hi')}
        className={cn(
            "rounded-full transition-colors duration-300",
            lang === 'hi' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-transparent text-muted-foreground hover:bg-background/50'
        )}
      >
        HI
      </Button>
    </div>
  );
}
