import { MatchEntry } from '@/lib/types';

interface Props {
  entries: MatchEntry[];
}

export default function MatchLog({ entries }: Props) {
  const sorted = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No matches recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map(e => (
        <div key={e.id} className="card-surface p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: e.allianceColor === 'red' ? 'hsl(0,84%,60%)' : 'hsl(217,91%,60%)' }}
            />
            <div>
              <span className="font-display font-bold text-lg">{e.teamNumber}</span>
              <span className="text-muted-foreground text-sm ml-2">Match {e.matchNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="metric-label">Auto</p>
              <p className="font-display font-bold">{e.autoScore}</p>
            </div>
            <div className="text-center">
              <p className="metric-label">Teleop</p>
              <p className="font-display font-bold">{e.teleopScore}</p>
            </div>
            <div className="text-center">
              <p className="metric-label">Total</p>
              <p className="font-display font-bold text-primary">{e.totalScore}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
