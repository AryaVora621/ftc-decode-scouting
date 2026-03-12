import { MatchEntry, PitEntry } from './types';

const MATCH_KEY = 'ftc_match_entries';
const PIT_KEY = 'ftc_pit_entries';

export function getMatchEntries(): MatchEntry[] {
  try {
    return JSON.parse(localStorage.getItem(MATCH_KEY) || '[]');
  } catch { return []; }
}

export function saveMatchEntry(entry: MatchEntry) {
  const entries = getMatchEntries();
  entries.push(entry);
  localStorage.setItem(MATCH_KEY, JSON.stringify(entries));
}

export function getPitEntries(): PitEntry[] {
  try {
    return JSON.parse(localStorage.getItem(PIT_KEY) || '[]');
  } catch { return []; }
}

export function savePitEntry(entry: PitEntry) {
  const entries = getPitEntries();
  entries.push(entry);
  localStorage.setItem(PIT_KEY, JSON.stringify(entries));
}

export function clearAllData() {
  localStorage.removeItem(MATCH_KEY);
  localStorage.removeItem(PIT_KEY);
}
