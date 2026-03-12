import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import CounterInput from '@/components/CounterInput';
import SegmentControl from '@/components/SegmentControl';
import AutoPathCanvas from '@/components/AutoPathCanvas';
import { savePitEntry } from '@/lib/storage';
import type { ParkStatus, AutoReliability, CycleStyle, PitEntry } from '@/lib/types';

const defaultForm = {
  teamNumber: '',
  autoCapacity: 0,
  teleopCapacity: 0,
  parkStatus: 'none' as ParkStatus,
  autoReliability: 'medium' as AutoReliability,
  patternGood: true,
  cycleStyle: 'both' as CycleStyle,
  humanPlayerNotes: '',
  generalNotes: '',
  autoPath: [] as { x: number; y: number }[],
};

export default function PitScoutPage() {
  const [form, setForm] = useState(defaultForm);

  const set = <K extends keyof typeof defaultForm>(key: K, val: typeof defaultForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.teamNumber) {
      toast.error('Team # is required');
      return;
    }
    const entry: PitEntry = {
      id: crypto.randomUUID(),
      teamNumber: Number(form.teamNumber),
      timestamp: new Date().toISOString(),
      autoCapacity: form.autoCapacity,
      teleopCapacity: form.teleopCapacity,
      parkStatus: form.parkStatus,
      autoReliability: form.autoReliability,
      patternGood: form.patternGood,
      cycleStyle: form.cycleStyle,
      humanPlayerNotes: form.humanPlayerNotes,
      generalNotes: form.generalNotes,
      autoPathJson: form.autoPath,
    };
    savePitEntry(entry);
    toast.success(`Pit data saved for team ${entry.teamNumber}`);
    setForm(defaultForm);
  };

  return (
    <div className="container max-w-lg mx-auto pb-24 pt-4 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pit Scouting</h1>

      <div className="card-surface p-4">
        <label className="metric-label">Team #</label>
        <input
          type="number"
          value={form.teamNumber}
          onChange={e => set('teamNumber', e.target.value)}
          className="w-full mt-1 px-3 py-2.5 rounded-md bg-secondary text-foreground font-display text-lg border border-border focus:ring-2 focus:ring-primary outline-none"
          placeholder="00000"
        />
      </div>

      <CounterInput label="Auto Capacity" value={form.autoCapacity} onChange={v => set('autoCapacity', v)} />
      <CounterInput label="Teleop Capacity" value={form.teleopCapacity} onChange={v => set('teleopCapacity', v)} />

      <div className="card-surface p-3">
        <label className="metric-label mb-1 block">Park Style</label>
        <SegmentControl
          options={[
            { value: 'none', label: 'None' },
            { value: 'partial', label: 'Partial' },
            { value: 'full', label: 'Full' },
          ]}
          value={form.parkStatus}
          onChange={v => set('parkStatus', v)}
        />
      </div>

      <div className="card-surface p-3">
        <label className="metric-label mb-1 block">Auto Reliability</label>
        <SegmentControl
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Med' },
            { value: 'high', label: 'High' },
          ]}
          value={form.autoReliability}
          onChange={v => set('autoReliability', v)}
          colorMap={{ low: 'hsl(0 84% 60%)', medium: 'hsl(38 92% 50%)', high: 'hsl(160 84% 39%)' }}
        />
      </div>

      <div className="card-surface p-3">
        <label className="metric-label mb-1 block">Pattern Success?</label>
        <SegmentControl
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          value={form.patternGood ? 'yes' : 'no'}
          onChange={v => set('patternGood', v === 'yes')}
        />
      </div>

      <div className="card-surface p-3">
        <label className="metric-label mb-1 block">Cycle Style</label>
        <SegmentControl
          options={[
            { value: 'ground', label: 'Ground' },
            { value: 'feeder', label: 'Feeder' },
            { value: 'both', label: 'Both' },
          ]}
          value={form.cycleStyle}
          onChange={v => set('cycleStyle', v)}
        />
      </div>

      <AutoPathCanvas points={form.autoPath} onChange={p => set('autoPath', p)} />

      <div className="card-surface p-4">
        <label className="metric-label mb-1 block">Human Player Notes</label>
        <textarea
          value={form.humanPlayerNotes}
          onChange={e => set('humanPlayerNotes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="card-surface p-4">
        <label className="metric-label mb-1 block">General Notes</label>
        <textarea
          value={form.generalNotes}
          onChange={e => set('generalNotes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="sticky-bottom-bar">
        <button onClick={() => { setForm(defaultForm); toast('Cleared'); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-accent transition-colors">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
        <button onClick={handleSave} className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/80 transition-colors">
          <Save className="w-4 h-4" /> Save Pit
        </button>
      </div>
    </div>
  );
}
