import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  getUnsyncedMatchEntries,
  getUnsyncedPitEntries,
  markMatchEntriesSynced,
  markPitEntriesSynced,
} from '@/lib/storage';
import { serializeToChunks, encodeChunk, QRChunk } from '@/lib/qr';
import { MatchEntry, PitEntry } from '@/lib/types';

export default function SharePage() {
  const [matchEntries, setMatchEntries] = useState<MatchEntry[]>([]);
  const [pitEntries, setPitEntries] = useState<PitEntry[]>([]);
  const [chunks, setChunks] = useState<QRChunk[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMatchEntries(getUnsyncedMatchEntries());
    setPitEntries(getUnsyncedPitEntries());
  }, []);

  const totalUnsynced = matchEntries.length + pitEntries.length;

  function generate() {
    const matchChunks = serializeToChunks(matchEntries, 'match');
    const pitChunks = serializeToChunks(pitEntries, 'pit');
    const all = [...matchChunks, ...pitChunks];
    // Re-index so idx/total are global across the combined set
    const reindexed: QRChunk[] = all.map((c, i) => ({ ...c, idx: i, total: all.length }));
    setChunks(reindexed);
    setCurrentIdx(0);
  }

  function markSynced() {
    markMatchEntriesSynced(matchEntries.map((e) => e.id));
    markPitEntriesSynced(pitEntries.map((e) => e.id));
    setDone(true);
  }

  if (done) {
    return (
      <div className="container py-10 text-center space-y-4">
        <p className="text-2xl font-bold text-primary">All synced!</p>
        <p className="text-muted-foreground">
          {matchEntries.length} match + {pitEntries.length} pit entries marked as synced.
        </p>
        <button
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
          onClick={() => {
            setDone(false);
            setChunks([]);
            setMatchEntries(getUnsyncedMatchEntries());
            setPitEntries(getUnsyncedPitEntries());
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (totalUnsynced === 0) {
    return (
      <div className="container py-10 text-center space-y-2">
        <p className="text-xl font-semibold">Nothing to share</p>
        <p className="text-muted-foreground text-sm">All entries have already been synced.</p>
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <div className="container py-10 text-center space-y-4">
        <p className="text-xl font-semibold">Ready to Share</p>
        <p className="text-muted-foreground text-sm">
          {matchEntries.length} match + {pitEntries.length} pit unsynced entries
        </p>
        <button
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          onClick={generate}
        >
          Generate QR Codes
        </button>
      </div>
    );
  }

  const current = chunks[currentIdx];
  const isLast = currentIdx === chunks.length - 1;

  return (
    <div className="container py-6 flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground font-medium">
        QR {currentIdx + 1} of {chunks.length}
      </p>

      <div className="bg-white p-4 rounded-xl">
        <QRCode value={encodeChunk(current)} level="M" size={220} />
      </div>

      <p className="text-xs text-muted-foreground">
        {current.type === 'match' ? 'Match data' : 'Pit data'}
      </p>

      <div className="flex gap-3">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={isLast}
          onClick={() => setCurrentIdx((i) => i + 1)}
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <button
        disabled={!isLast}
        onClick={markSynced}
        className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
      >
        Mark as Synced
      </button>
      {!isLast && (
        <p className="text-xs text-muted-foreground">Advance to the last QR to enable this.</p>
      )}
    </div>
  );
}
