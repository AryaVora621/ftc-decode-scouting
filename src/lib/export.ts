import * as XLSX from 'xlsx';
import { MatchEntry, PitEntry, TeamSummary } from './types';

// ── helpers ──────────────────────────────────────────────────────────────────

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sheetToCSV(ws: XLSX.WorkSheet): Blob {
  return new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv;charset=utf-8;' });
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── row mappers ──────────────────────────────────────────────────────────────

function matchRow(e: MatchEntry) {
  return {
    'Match #': e.matchNumber,
    'Team #': e.teamNumber,
    Alliance: e.allianceColor,
    Scout: e.scoutName,
    Timestamp: e.timestamp,
    'Auto Score': e.autoScore,
    'Auto Leave': e.autoLeave ? 'Yes' : 'No',
    'Auto Reliability': e.autoReliability,
    'Pattern Good': e.patternGood ? 'Yes' : 'No',
    'Teleop Score': e.teleopScore,
    'Cycle Style': e.cycleStyle,
    'HP Notes': e.humanPlayerNotes,
    'Park Status': e.parkStatus,
    'Endgame Score': e.endgameScore,
    'Total Score': e.totalScore,
    Notes: e.generalNotes,
  };
}

function pitRow(e: PitEntry) {
  return {
    'Team #': e.teamNumber,
    Timestamp: e.timestamp,
    'Auto Capacity': e.autoCapacity,
    'Teleop Capacity': e.teleopCapacity,
    'Park Status': e.parkStatus,
    'Auto Reliability': e.autoReliability,
    'Pattern Good': e.patternGood ? 'Yes' : 'No',
    'Cycle Style': e.cycleStyle,
    'HP Notes': e.humanPlayerNotes,
    Notes: e.generalNotes,
  };
}

function summaryRow(s: TeamSummary) {
  return {
    'Team #': s.teamNumber,
    Matches: s.matchCount,
    'Avg Auto': s.avgAutoScore,
    'Avg Teleop': s.avgTeleopScore,
    'Avg Endgame': s.avgEndgameScore,
    'Avg Total': s.avgTotalScore,
    'Park Success %': s.parkSuccessRate,
    'Auto Reliability': s.autoReliabilityScore,
    'Pattern Success %': s.patternSuccessRate,
    'Contribution Rating': s.contributionRating,
    'Reliability Index': s.reliabilityIndex,
  };
}

// ── public API ────────────────────────────────────────────────────────────────

export function exportExcel(
  matchEntries: MatchEntry[],
  pitEntries: PitEntry[],
  summaries: TeamSummary[]
) {
  const wb = XLSX.utils.book_new();

  const wsMatch = XLSX.utils.json_to_sheet(matchEntries.map(matchRow));
  XLSX.utils.book_append_sheet(wb, wsMatch, 'Match Data');

  const wsPit = XLSX.utils.json_to_sheet(pitEntries.map(pitRow));
  XLSX.utils.book_append_sheet(wb, wsPit, 'Pit Data');

  const wsSummary = XLSX.utils.json_to_sheet(summaries.map(summaryRow));
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Team Rankings');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  download(new Blob([buf], { type: 'application/octet-stream' }), `ftc-scout-${today()}.xlsx`);
}

export function exportCSV(
  matchEntries: MatchEntry[],
  pitEntries: PitEntry[],
  summaries: TeamSummary[],
  sheet: 'match' | 'pit' | 'rankings'
) {
  const map = {
    match: { rows: matchEntries.map(matchRow), name: 'match-data' },
    pit:   { rows: pitEntries.map(pitRow),     name: 'pit-data'   },
    rankings: { rows: summaries.map(summaryRow), name: 'rankings' },
  };
  const { rows, name } = map[sheet];
  const ws = XLSX.utils.json_to_sheet(rows);
  download(sheetToCSV(ws), `ftc-scout-${name}-${today()}.csv`);
}
