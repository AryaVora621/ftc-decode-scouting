import { useRef, useState, useCallback, type TouchEvent, type MouseEvent } from 'react';

interface AutoPathCanvasProps {
  points: { x: number; y: number }[];
  onChange: (points: { x: number; y: number }[]) => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
}

export default function AutoPathCanvas({ points, onChange, readOnly = false, width = 300, height = 200 }: AutoPathCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);

  const getPos = useCallback((e: MouseEvent | TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * 100),
      y: Math.round(((clientY - rect.top) / rect.height) * 100),
    };
  }, []);

  const handleStart = (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
    if (readOnly) return;
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    if (pos) onChange([pos]);
  };

  const handleMove = (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
    if (!drawing || readOnly) return;
    e.preventDefault();
    const pos = getPos(e);
    if (pos) onChange([...points, pos]);
  };

  const handleEnd = () => setDrawing(false);

  const pathD = points.length > 1
    ? `M ${points.map(p => `${p.x * 3} ${p.y * 2}`).join(' L ')}`
    : '';

  return (
    <div className="card-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Auto Path</span>
        {!readOnly && points.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-xs text-destructive hover:underline">
            Clear
          </button>
        )}
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full bg-secondary/50 rounded-md border border-border cursor-crosshair touch-none"
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* FTC field stylized background */}
        <rect x={8} y={8} width={width - 16} height={height - 16} rx={8} fill="hsl(222 39% 15%)" />

        {/* Grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const x = 8 + ((width - 16) / 4) * i;
          const y = 8 + ((height - 16) / 4) * i;
          return (
            <>
              <line
                key={`v-${i}`}
                x1={x}
                y1={8}
                x2={x}
                y2={height - 8}
                stroke="hsl(215 16% 32%)"
                strokeWidth={0.75}
                strokeDasharray="4 4"
              />
              <line
                key={`h-${i}`}
                x1={8}
                y1={y}
                x2={width - 8}
                y2={y}
                stroke="hsl(215 16% 32%)"
                strokeWidth={0.75}
                strokeDasharray="4 4"
              />
            </>
          );
        })}

        {/* Center diagonals */}
        <line
          x1={8}
          y1={8}
          x2={width - 8}
          y2={height - 8}
          stroke="hsl(210 40% 80%)"
          strokeWidth={1.5}
        />
        <line
          x1={width - 8}
          y1={8}
          x2={8}
          y2={height - 8}
          stroke="hsl(210 40% 80%)"
          strokeWidth={1.5}
        />

        {/* Alliance squares */}
        <rect
          x={16}
          y={height / 2 - 28}
          width={36}
          height={56}
          fill="none"
          stroke="hsl(0 84% 60%)"
          strokeWidth={2}
        />
        <rect
          x={width - 52}
          y={height / 2 - 28}
          width={36}
          height={56}
          fill="none"
          stroke="hsl(217 91% 60%)"
          strokeWidth={2}
        />

        {/* Dashed midline for orientation */}
        <line
          x1={width / 2}
          y1={8}
          x2={width / 2}
          y2={height - 8}
          stroke="hsl(215 20% 65%)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
        {pathD && (
          <path d={pathD} fill="none" stroke="hsl(217 91% 60%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.length > 0 && (
          <>
            <circle cx={points[0].x * 3} cy={points[0].y * 2} r="5" fill="hsl(160 84% 39%)" />
            {points.length > 1 && (
              <circle cx={points[points.length-1].x * 3} cy={points[points.length-1].y * 2} r="5" fill="hsl(0 84% 60%)" />
            )}
          </>
        )}
      </svg>
    </div>
  );
}
