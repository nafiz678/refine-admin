import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface KeywordsFieldProps {
  value: string[];
  onChange: (keywords: string[]) => void;
}

export function KeywordsField({ value, onChange }: KeywordsFieldProps) {
  const [input, setInput] = useState('');

  const handleAddKeyword = () => {
    if (input.trim()) {
      const newKeywords = [...value, input.trim()];
      onChange(newKeywords);
      setInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = value.filter((_, i) => i !== index);
    onChange(newKeywords);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a keyword..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-border/50"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddKeyword}
          className="border-border/50"
        >
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5"
            >
              <span className="text-sm text-foreground">{keyword}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
