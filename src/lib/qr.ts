import LZString from 'lz-string';

export type EntryKind = 'match' | 'pit';

export interface QRChunk {
  v: 1;
  type: EntryKind;
  idx: number;
  total: number;
  data: string;
}

const DATA_BUDGET = 2200;

export function serializeToChunks<T>(entries: T[], type: EntryKind): QRChunk[] {
  if (entries.length === 0) return [];

  // Greedy bin-packing: accumulate entries until compressed size exceeds budget
  const batches: T[][] = [];
  let current: T[] = [];

  for (const entry of entries) {
    const candidate = [...current, entry];
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(candidate));
    if (compressed.length > DATA_BUDGET && current.length > 0) {
      batches.push(current);
      current = [entry];
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) batches.push(current);

  const total = batches.length;
  return batches.map((batch, idx) => ({
    v: 1,
    type,
    idx,
    total,
    data: LZString.compressToEncodedURIComponent(JSON.stringify(batch)),
  }));
}

export function encodeChunk(chunk: QRChunk): string {
  return JSON.stringify(chunk);
}

export function decodeChunk(raw: string): QRChunk {
  const parsed = JSON.parse(raw);
  if (parsed.v !== 1 || !parsed.type || parsed.idx === undefined || !parsed.data) {
    throw new Error('Invalid QR chunk');
  }
  return parsed as QRChunk;
}

export function decompressChunkData<T>(chunk: QRChunk): T[] {
  const json = LZString.decompressFromEncodedURIComponent(chunk.data);
  if (!json) throw new Error('Failed to decompress chunk data');
  return JSON.parse(json) as T[];
}

export function assembleChunks<T>(chunks: QRChunk[]): T[] {
  return [...chunks]
    .sort((a, b) => a.idx - b.idx)
    .flatMap((c) => decompressChunkData<T>(c));
}
