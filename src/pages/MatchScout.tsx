import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import CounterInput from '@/components/CounterInput';
import SegmentControl from '@/components/SegmentControl';
import AutoPathCanvas from '@/components/AutoPathCanvas';
import { saveMatchEntry } from '@/lib/storage';
import type { AllianceColor, ParkStatus, AutoReliability, CycleStyle, MatchEntry } from '@/lib/types';

const defaultForm = {
  teamNumber: '',
  matchNumber: '',
  scoutName: '',
  allianceColor: 'red' as AllianceColor,
  autoScore: 0,
  autoLeave: true,
  autoReliability: 'medium' as AutoReliability,
  patternGood: true,
  autoPath: [] as { x: number; y: number }[],
  teleopScore: 0,
  cycleStyle: 'both' as CycleStyle,
  humanPlayerNotes: '',
  parkStatus: 'none' as ParkStatus,
  endgameScore: 0,
  generalNotes: '',
};

export default function MatchScoutPage() {
  const [form, setForm] = useState(defaultForm);

  const set = <K extends keyof typeof defaultForm>(key: K, val: typeof defaultForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.teamNumber || !form.matchNumber) {
      toast.error('Team # and Match # are required');
      return;
    }
    const entry: MatchEntry = {
      id: crypto.randomUUID(),
      teamNumber: Number(form.teamNumber),
      matchNumber: Number(form.matchNumber),
      allianceColor: form.allianceColor,
      scoutName: form.scoutName,
      timestamp: new Date().toISOString(),
      autoScore: form.autoScore,
      autoLeave: form.autoLeave,
      autoReliability: form.autoReliability,
      patternGood: form.patternGood,
      autoPathJson: form.autoPath,
      teleopScore: form.teleopScore,
      cycleStyle: form.cycleStyle,
      humanPlayerNotes: form.humanPlayerNotes,
      parkStatus: form.parkStatus,
      endgameScore: form.endgameScore,
      generalNotes: form.generalNotes,
      totalScore: form.autoScore + form.teleopScore + form.endgameScore,
    };
    saveMatchEntry(entry);
    toast.success(`Match ${entry.matchNumber} saved for team ${entry.teamNumber}`);
    setForm(defaultForm);
  };

  const handleClear = () => {
    setForm(defaultForm);
    toast('Form cleared');
  };

  return (
    <div className="container max-w-lg mx-auto pb-24 pt-4 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Match Scouting</h1>

      {/* Header */}
      <div className="card-surface p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="metric-label">Team #</label>
            <input
              type="number"
              value={form.teamNumber}
              onChange={e => set('teamNumber', e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-md bg-secondary text-foreground font-display text-lg border border-border focus:ring-2 focus:ring-primary outline-none"
              placeholder="00000"
            />
          </div>
          <div>
            <label className="metric-label">Match #</label>
            <input
              type="number"
              value={form.matchNumber}
              onChange={e => set('matchNumber', e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-md bg-secondary text-foreground font-display text-lg border border-border focus:ring-2 focus:ring-primary outline-none"
              placeholder="1"
            />
          </div>
        </div>
        <div>
          <label className="metric-label">Scout</label>
          <input
            type="text"
            value={form.scoutName}
            onChange={e => set('scoutName', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border focus:ring-2 focus:ring-primary outline-none"
            placeholder="Initials"
          />
        </div>
        <div>
          <label className="metric-label mb-1 block">Alliance</label>
          <SegmentControl
            options={[
              { value: 'red', label: 'Red' },
              { value: 'blue', label: 'Blue' },
            ]}
            value={form.allianceColor}
            onChange={v => set('allianceColor', v)}
            colorMap={{ red: 'hsl(0 84% 60%)', blue: 'hsl(217 91% 60%)' }}
          />
        </div>
      </div>

      {/* Autonomous */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-primary">Autonomous</h2>
        <CounterInput label="Auto Scored" value={form.autoScore} onChange={v => set('autoScore', v)} />
        <div className="card-surface p-3">
          <label className="metric-label mb-1 block">Left Starting Zone?</label>
          <SegmentControl
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            value={form.autoLeave ? 'yes' : 'no'}
            onChange={v => set('autoLeave', v === 'yes')}
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
        <AutoPathCanvas points={form.autoPath} onChange={p => set('autoPath', p)} />
      </div>

      {/* Teleop */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-primary">Teleop</h2>
        <CounterInput label="Teleop Scored" value={form.teleopScore} onChange={v => set('teleopScore', v)} />
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
        <div className="card-surface p-4">
          <label className="metric-label mb-1 block">Human Player Notes</label>
          <textarea
            value={form.humanPlayerNotes}
            onChange={e => set('humanPlayerNotes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
            placeholder="HP performance notes..."
          />
        </div>
      </div>

      {/* Endgame */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-primary">Endgame</h2>
        <CounterInput label="Endgame Score" value={form.endgameScore} onChange={v => set('endgameScore', v)} />
        <div className="card-surface p-3">
          <label className="metric-label mb-1 block">Park Status</label>
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
      </div>

      {/* Notes */}
      <div className="card-surface p-4">
        <label className="metric-label mb-1 block">General Notes</label>
        <textarea
          value={form.generalNotes}
          onChange={e => set('generalNotes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
          placeholder="Defense, drive quality, failures..."
        />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        <button onClick={handleClear} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-accent transition-colors">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
        <button onClick={handleSave} className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/80 transition-colors">
          <Save className="w-4 h-4" /> Save Match
        </button>
      </div>
    </div>
  );
}
