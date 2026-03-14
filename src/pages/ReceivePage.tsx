import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { decodeChunk, assembleChunks, QRChunk } from '@/lib/qr';
import { importMatchEntries, importPitEntries } from '@/lib/storage';
import { MatchEntry, PitEntry } from '@/lib/types';

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

export default function ReceivePage() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [receivedChunks, setReceivedChunks] = useState<QRChunk[]>([]);
  const [expectedTotal, setExpectedTotal] = useState<number | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // Mutable refs so the scan callback always sees latest values without stale closure
  const localChunksRef = useRef<QRChunk[]>([]);
  const localTotalRef = useRef<number | null>(null);

  // Initialize scanner only after the div is in the DOM (scanState === 'scanning')
  useEffect(() => {
    if (scanState !== 'scanning') return;

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    localChunksRef.current = [];
    localTotalRef.current = null;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          let chunk: QRChunk;
          try {
            chunk = decodeChunk(decodedText);
          } catch {
            return;
          }

          const key = `${chunk.type}-${chunk.idx}`;
          if (localChunksRef.current.some((c) => `${c.type}-${c.idx}` === key)) return;

          localChunksRef.current = [...localChunksRef.current, chunk];
          if (localTotalRef.current === null) localTotalRef.current = chunk.total;

          setExpectedTotal(chunk.total);
          setReceivedChunks([...localChunksRef.current]);

          if (localChunksRef.current.length === localTotalRef.current) {
            const captured = localChunksRef.current;
            scanner.stop().catch(() => {}).finally(() => {
              scannerRef.current = null;
              try {
                const matchChunks = captured.filter((c) => c.type === 'match');
                const pitChunks = captured.filter((c) => c.type === 'pit');
                const matchEntries = matchChunks.length > 0 ? assembleChunks<MatchEntry>(matchChunks) : [];
                const pitEntries = pitChunks.length > 0 ? assembleChunks<PitEntry>(pitChunks) : [];
                const count = importMatchEntries(matchEntries) + importPitEntries(pitEntries);
                setImportedCount(count);
                setScanState('done');
              } catch (e) {
                setErrorMsg(String(e));
                setScanState('error');
              }
            });
          }
        },
        () => {} // per-frame decode failures are normal, ignore
      )
      .catch((e) => {
        scannerRef.current = null;
        setErrorMsg(String(e));
        setScanState('error');
      });

    return () => {
      // Cleanup if component unmounts while scanning
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanState]);

  function startScanning() {
    setReceivedChunks([]);
    setExpectedTotal(null);
    setErrorMsg('');
    setScanState('scanning'); // triggers useEffect above after render
  }

  async function cancelScanning() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanState('idle');
    setReceivedChunks([]);
    setExpectedTotal(null);
  }

  function reset() {
    setScanState('idle');
    setReceivedChunks([]);
    setExpectedTotal(null);
    setImportedCount(0);
    setErrorMsg('');
  }

  return (
    <div className="container py-6 flex flex-col items-center gap-6">
      <h1 className="text-xl font-semibold">Receive Data</h1>

      {scanState === 'idle' && (
        <button
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          onClick={startScanning}
        >
          Start Scanning
        </button>
      )}

      {/* The div must always be in the DOM when scanState==='scanning' so the useEffect can mount the scanner into it */}
      {scanState === 'scanning' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          <p className="text-sm text-muted-foreground">
            {expectedTotal !== null
              ? `Scanned ${receivedChunks.length} / ${expectedTotal} QR codes`
              : 'Point camera at QR code...'}
          </p>
          <button
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
            onClick={cancelScanning}
          >
            Cancel
          </button>
        </div>
      )}

      {scanState === 'done' && (
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold text-primary">Import complete!</p>
          <p className="text-muted-foreground">{importedCount} new entries imported.</p>
          <button
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
            onClick={reset}
          >
            Scan Another Device
          </button>
        </div>
      )}

      {scanState === 'error' && (
        <div className="text-center space-y-3">
          <p className="text-destructive font-semibold">Scan failed</p>
          <p className="text-xs text-muted-foreground max-w-xs break-words">{errorMsg}</p>
          <button
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
            onClick={reset}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
