import { MatchEntry, PitEntry } from "./types";

const MATCH_KEY = "ftc_match_entries";
const PIT_KEY = "ftc_pit_entries";

// Prefer env var, fall back to the URL you provided.
const SHEETS_ENDPOINT =
  (import.meta as any).env?.VITE_SHEETS_ENDPOINT ??
  "https://script.google.com/macros/s/AKfycbwalzfrtidPn-wRy85hQ6V6WzfTF5VyKujJyBf3iBSDeQWP8ujPDv2gMDdy5P-dLsw/exec";

function readLocal<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

async function fetchFromSheets<T>(type: "match" | "pit"): Promise<T[] | null> {
  if (!SHEETS_ENDPOINT) return null;
  try {
    const res = await fetch(`${SHEETS_ENDPOINT}?type=${type}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data as T[];
  } catch {
    return null;
  }
}

async function sendToSheets<T extends object>(
  type: "match" | "pit",
  payload: T
): Promise<void> {
  if (!SHEETS_ENDPOINT) return;
  try {
    await fetch(`${SHEETS_ENDPOINT}?type=${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Ignore; local cache still has the data.
  }
}

export function getMatchEntries(): MatchEntry[] {
  return readLocal<MatchEntry>(MATCH_KEY);
}

export async function syncMatchEntriesFromCloud(): Promise<MatchEntry[]> {
  const local = getMatchEntries();
  const cloud = await fetchFromSheets<MatchEntry>("match");
  if (!cloud) return local;
  // Merge: keep all local entries, add any cloud entries not already present
  const localIds = new Set(local.map((e) => e.id));
  const merged = [...local, ...cloud.filter((e) => !localIds.has(e.id))];
  writeLocal<MatchEntry>(MATCH_KEY, merged);
  return merged;
}

export function saveMatchEntry(entry: MatchEntry) {
  const entries = getMatchEntries();
  entries.push(entry);
  writeLocal(MATCH_KEY, entries);

  // Fire-and-forget sync to Google Sheets.
  void sendToSheets("match", entry);
}

export function getPitEntries(): PitEntry[] {
  return readLocal<PitEntry>(PIT_KEY);
}

export async function syncPitEntriesFromCloud(): Promise<PitEntry[]> {
  const local = getPitEntries();
  const cloud = await fetchFromSheets<PitEntry>("pit");
  if (!cloud) return local;
  const localIds = new Set(local.map((e) => e.id));
  const merged = [...local, ...cloud.filter((e) => !localIds.has(e.id))];
  writeLocal<PitEntry>(PIT_KEY, merged);
  return merged;
}

export function savePitEntry(entry: PitEntry) {
  const entries = getPitEntries();
  entries.push(entry);
  writeLocal(PIT_KEY, entries);

  void sendToSheets("pit", entry);
}

export function getUnsyncedMatchEntries(): MatchEntry[] {
  return getMatchEntries().filter((e) => !e.synced);
}

export function getUnsyncedPitEntries(): PitEntry[] {
  return getPitEntries().filter((e) => !e.synced);
}

export function markMatchEntriesSynced(ids: string[]): void {
  const entries = getMatchEntries().map((e) =>
    ids.includes(e.id) ? { ...e, synced: true } : e
  );
  writeLocal(MATCH_KEY, entries);
}

export function markPitEntriesSynced(ids: string[]): void {
  const entries = getPitEntries().map((e) =>
    ids.includes(e.id) ? { ...e, synced: true } : e
  );
  writeLocal(PIT_KEY, entries);
}

export function importMatchEntries(incoming: MatchEntry[]): number {
  const existing = getMatchEntries();
  const existingIds = new Set(existing.map((e) => e.id));
  const newEntries = incoming
    .filter((e) => !existingIds.has(e.id))
    .map((e) => ({ ...e, synced: true }));
  writeLocal(MATCH_KEY, [...existing, ...newEntries]);
  return newEntries.length;
}

export function importPitEntries(incoming: PitEntry[]): number {
  const existing = getPitEntries();
  const existingIds = new Set(existing.map((e) => e.id));
  const newEntries = incoming
    .filter((e) => !existingIds.has(e.id))
    .map((e) => ({ ...e, synced: true }));
  writeLocal(PIT_KEY, [...existing, ...newEntries]);
  return newEntries.length;
}

export function clearAllData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MATCH_KEY);
    localStorage.removeItem(PIT_KEY);
  }
  // We intentionally do not try to clear the Google Sheet from the client.
}


