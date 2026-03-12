import { useMemo, useState } from 'react';
import type { PitEntry } from '@/lib/types';
import { Search } from 'lucide-react';

interface Props {
  entries: PitEntry[];
}

export default function PitData({ entries }: Props) {
  const [search, setSearch] = useState('');

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.teamNumber === b.teamNumber) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return a.teamNumber - b.teamNumber;
      }),
    [entries]
  );

  const filtered = useMemo(() => {
    if (!search) return sorted;
    const num = Number(search);
    if (Number.isNaN(num)) return [];
    return sorted.filter(e => e.teamNumber === num);
  }, [sorted, search]);

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No pit data yet. Scout some pits first!</p>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="number"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by team number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-display text-lg focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {search ? `No pit data found for team ${search}` : 'No pit entries to display.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="card-surface p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg">Team {entry.teamNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Auto cap" value={entry.autoCapacity} />
                  <Metric label="Teleop cap" value={entry.teleopCapacity} />
                  <Metric label="Park" value={entry.parkStatus} />
                  <Metric label="Auto reliab." value={entry.autoReliability} />
                  <Metric label="Pattern" value={entry.patternGood ? 'Good' : 'Inconsistent'} />
                  <Metric label="Cycle" value={entry.cycleStyle} />
                </div>
              </div>

              {(entry.humanPlayerNotes || entry.generalNotes) && (
                <div className="pt-2 border-t border-border/50 text-xs space-y-1">
                  {entry.humanPlayerNotes && (
                    <p>
                      <span className="font-semibold text-muted-foreground">HP:</span> {entry.humanPlayerNotes}
                    </p>
                  )}
                  {entry.generalNotes && (
                    <p>
                      <span className="font-semibold text-muted-foreground">Notes:</span> {entry.generalNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-right">
      <p className="metric-label text-[11px]">{label}</p>
      <p className="font-display text-sm font-semibold">{value}</p>
    </div>
  );
}

