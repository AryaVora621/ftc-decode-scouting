import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MatchEntry, TeamSummary } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = {
  primary: 'hsl(217, 91%, 60%)',
  success: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 20%, 65%)',
};

interface Props {
  entries: MatchEntry[];
  summaries: TeamSummary[];
}

export default function TeamLookup({ entries, summaries }: Props) {
  const [search, setSearch] = useState('');
  const teamNum = Number(search);
  const summary = summaries.find(s => s.teamNumber === teamNum);
  const teamEntries = useMemo(
    () => entries.filter(e => e.teamNumber === teamNum).sort((a, b) => a.matchNumber - b.matchNumber),
    [entries, teamNum]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="number"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search team number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-display text-lg focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {summary ? (
        <div className="space-y-4">
          {/* Hero Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <HeroCard label="Contribution Rating" value={summary.contributionRating} />
            <HeroCard label="Reliability Index" value={`${summary.reliabilityIndex}%`} color={summary.reliabilityIndex >= 70 ? 'text-success' : summary.reliabilityIndex >= 40 ? 'text-warning' : 'text-destructive'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Avg Auto" value={summary.avgAutoScore} />
            <MetricCard label="Avg Teleop" value={summary.avgTeleopScore} />
            <MetricCard label="Avg Total" value={summary.avgTotalScore} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Park Rate" value={`${summary.parkSuccessRate}%`} />
            <MetricCard label="Pattern" value={`${summary.patternSuccessRate}%`} />
            <MetricCard label="Matches" value={summary.matchCount} />
          </div>

          {/* Trend Line */}
          {teamEntries.length > 1 && (
            <div className="card-surface p-4">
              <h3 className="metric-label mb-3">Score Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={teamEntries.map(e => ({ match: `M${e.matchNumber}`, total: e.totalScore, auto: e.autoScore, teleop: e.teleopScore }))}>
                  <XAxis dataKey="match" stroke={COLORS.muted} fontSize={11} />
                  <YAxis stroke={COLORS.muted} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(217,33%,17%)', border: '1px solid hsl(217,33%,25%)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="total" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="auto" stroke={COLORS.success} strokeWidth={1.5} strokeDasharray="4" />
                  <Line type="monotone" dataKey="teleop" stroke={COLORS.warning} strokeWidth={1.5} strokeDasharray="4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Park Pie */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-surface p-4">
              <h3 className="metric-label mb-3">Park Outcomes</h3>
              <ParkPie entries={teamEntries} />
            </div>
            <div className="card-surface p-4">
              <h3 className="metric-label mb-3">Cycle Style</h3>
              <CyclePie entries={teamEntries} />
            </div>
          </div>
        </div>
      ) : search ? (
        <p className="text-muted-foreground text-center py-12">No data found for team {search}</p>
      ) : (
        <p className="text-muted-foreground text-center py-12">Enter a team number to view analytics</p>
      )}
    </div>
  );
}

function HeroCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="card-surface p-4">
      <p className="metric-label">{label}</p>
      <p className={`hero-metric mt-1 ${color || ''}`}>{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card-surface p-3 text-center">
      <p className="metric-label">{label}</p>
      <p className="font-display text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ParkPie({ entries }: { entries: MatchEntry[] }) {
  const data = [
    { name: 'Full', value: entries.filter(e => e.parkStatus === 'full').length },
    { name: 'Partial', value: entries.filter(e => e.parkStatus === 'partial').length },
    { name: 'None', value: entries.filter(e => e.parkStatus === 'none').length },
  ].filter(d => d.value > 0);
  const colors = [COLORS.success, COLORS.warning, COLORS.muted];
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={45} dataKey="value" label={({ name }) => name} labelLine={false} fontSize={10}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function CyclePie({ entries }: { entries: MatchEntry[] }) {
  const data = [
    { name: 'Ground', value: entries.filter(e => e.cycleStyle === 'ground').length },
    { name: 'Feeder', value: entries.filter(e => e.cycleStyle === 'feeder').length },
    { name: 'Both', value: entries.filter(e => e.cycleStyle === 'both').length },
  ].filter(d => d.value > 0);
  const colors = [COLORS.primary, COLORS.warning, COLORS.success];
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={45} dataKey="value" label={({ name }) => name} labelLine={false} fontSize={10}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
