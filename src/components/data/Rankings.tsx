import { useState } from 'react';
import { TeamSummary } from '@/lib/types';
import { ArrowUpDown } from 'lucide-react';

type SortKey = keyof Pick<TeamSummary, 'contributionRating' | 'avgAutoScore' | 'avgTeleopScore' | 'avgTotalScore' | 'reliabilityIndex' | 'patternSuccessRate' | 'parkSuccessRate'>;

const columns: { key: SortKey; label: string; short: string }[] = [
  { key: 'contributionRating', label: 'CR', short: 'CR' },
  { key: 'avgTotalScore', label: 'Avg Total', short: 'Tot' },
  { key: 'avgAutoScore', label: 'Avg Auto', short: 'Auto' },
  { key: 'avgTeleopScore', label: 'Avg Teleop', short: 'Tele' },
  { key: 'reliabilityIndex', label: 'Reliability', short: 'Rel' },
  { key: 'patternSuccessRate', label: 'Pattern', short: 'Pat' },
  { key: 'parkSuccessRate', label: 'Park', short: 'Park' },
];

interface Props {
  summaries: TeamSummary[];
}

export default function Rankings({ summaries }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('contributionRating');
  const [asc, setAsc] = useState(false);

  const sorted = [...summaries].sort((a, b) => asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc(!asc);
    else { setSortKey(key); setAsc(false); }
  };

  if (summaries.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No match data yet. Scout some matches first!</p>;
  }

  return (
    <div className="card-surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2 font-medium text-muted-foreground">#</th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Team</th>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="text-right px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
              >
                <span className="hidden sm:inline">{col.label}</span>
                <span className="sm:hidden">{col.short}</span>
                {sortKey === col.key && <ArrowUpDown className="inline w-3 h-3 ml-1" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr key={team.teamNumber} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
              <td className="px-3 py-2.5 text-muted-foreground font-display">{i + 1}</td>
              <td className="px-3 py-2.5 font-display font-bold text-foreground">{team.teamNumber}</td>
              <td className="text-right px-3 py-2.5 font-display font-bold text-primary">{team.contributionRating}</td>
              <td className="text-right px-3 py-2.5 font-display">{team.avgTotalScore}</td>
              <td className="text-right px-3 py-2.5 font-display">{team.avgAutoScore}</td>
              <td className="text-right px-3 py-2.5 font-display">{team.avgTeleopScore}</td>
              <td className="text-right px-3 py-2.5">
                <span className={team.reliabilityIndex >= 70 ? 'text-success' : team.reliabilityIndex >= 40 ? 'text-warning' : 'text-destructive'}>
                  {team.reliabilityIndex}%
                </span>
              </td>
              <td className="text-right px-3 py-2.5">{team.patternSuccessRate}%</td>
              <td className="text-right px-3 py-2.5">{team.parkSuccessRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
