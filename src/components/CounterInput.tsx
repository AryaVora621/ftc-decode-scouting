import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface CounterInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  label: string;
}

export default function CounterInput({ value, onChange, min = 0, label }: CounterInputProps) {
  const [flash, setFlash] = useState(false);

  const bump = (delta: number) => {
    const next = Math.max(min, value + delta);
    onChange(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  return (
    <div className="flex items-center justify-between card-surface p-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => bump(-1)} className="counter-btn bg-secondary text-foreground hover:bg-accent">
          <Minus className="w-5 h-5" />
        </button>
        <span className={`font-display text-2xl font-bold min-w-[2ch] text-center ${flash ? 'score-flash' : ''}`}>
          {value}
        </span>
        <button type="button" onClick={() => bump(1)} className="counter-btn bg-primary text-primary-foreground hover:bg-primary/80">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
