import { useEffect, useState, useMemo } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import {
  getMatchEntries,
  getPitEntries,
  syncMatchEntriesFromCloud,
  syncPitEntriesFromCloud,
} from "@/lib/storage";
import { computeTeamSummaries } from "@/lib/analytics";
import { exportExcel, exportCSV } from "@/lib/export";
import TeamLookup from "@/components/data/TeamLookup";
import Rankings from "@/components/data/Rankings";
import MatchLog from "@/components/data/MatchLog";
import PitData from "@/components/data/PitData";

const subTabs = [
  { to: "/data/lookup", label: "Lookup" },
  { to: "/data/rankings", label: "Rankings" },
  { to: "/data/log", label: "Match Log" },
];

export default function DataPage() {
  const [mode, setMode] = useState<"match" | "pit">("match");
  const [entries, setEntries] = useState(() => getMatchEntries());
  const [pitEntries, setPitEntries] = useState(() => getPitEntries());
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const [matchFromCloud, pitFromCloud] = await Promise.all([
        syncMatchEntriesFromCloud(),
        syncPitEntriesFromCloud(),
      ]);
      setEntries(matchFromCloud);
      setPitEntries(pitFromCloud);
    })();
  }, []);

  const summaries = useMemo(() => computeTeamSummaries(entries), [entries]);

  return (
    <div className="container max-w-4xl mx-auto pt-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Data View</h1>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {exportOpen && (
            <>
              {/* backdrop to close */}
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 mt-1 z-20 w-52 rounded-lg border border-border bg-card shadow-lg py-1 text-sm">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Excel</p>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => { exportExcel(entries, pitEntries, summaries); setExportOpen(false); }}
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500" />
                  All sheets (.xlsx)
                </button>

                <div className="my-1 border-t border-border" />
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">CSV</p>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => { exportCSV(entries, pitEntries, summaries, 'match'); setExportOpen(false); }}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  Match data
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => { exportCSV(entries, pitEntries, summaries, 'pit'); setExportOpen(false); }}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  Pit data
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => { exportCSV(entries, pitEntries, summaries, 'rankings'); setExportOpen(false); }}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  Team rankings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1 max-w-xs">
        {[
          { id: "match" as const, label: "Match scouting" },
          { id: "pit" as const, label: "Pit scouting" },
        ].map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === option.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "match" ? (
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
