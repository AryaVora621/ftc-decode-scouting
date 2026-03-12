import { useState, useMemo } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { getMatchEntries, getPitEntries } from '@/lib/storage';
import { computeTeamSummaries } from '@/lib/analytics';
import TeamLookup from '@/components/data/TeamLookup';
import Rankings from '@/components/data/Rankings';
import MatchLog from '@/components/data/MatchLog';
import PitData from '@/components/data/PitData';

const subTabs = [
  { to: '/data/lookup', label: 'Lookup' },
  { to: '/data/rankings', label: 'Rankings' },
  { to: '/data/log', label: 'Match Log' },
];

export default function DataPage() {
  const [mode, setMode] = useState<'match' | 'pit'>('match');
  const entries = useMemo(() => getMatchEntries(), []);
  const pitEntries = useMemo(() => getPitEntries(), []);
  const summaries = useMemo(() => computeTeamSummaries(entries), [entries]);

  return (
    <div className="container max-w-4xl mx-auto pt-4 pb-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Data View</h1>

      <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1 max-w-xs">
        {[
          { id: 'match' as const, label: 'Match scouting' },
          { id: 'pit' as const, label: 'Pit scouting' },
        ].map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === option.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === 'match' ? (
        <>
          <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
            {subTabs.map(t => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>
          <Routes>
            <Route index element={<Navigate to="lookup" replace />} />
            <Route path="lookup" element={<TeamLookup entries={entries} summaries={summaries} />} />
            <Route path="rankings" element={<Rankings summaries={summaries} />} />
            <Route path="log" element={<MatchLog entries={entries} />} />
          </Routes>
        </>
      ) : (
        <PitData entries={pitEntries} />
      )}
    </div>
  );
}
