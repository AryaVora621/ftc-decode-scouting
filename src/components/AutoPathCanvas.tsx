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

  const margin = 8;
  const innerWidth = width - margin * 2;
  const innerHeight = height - margin * 2;

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
        {/* Field base */}
        <rect
          x={margin}
          y={margin}
          width={innerWidth}
          height={innerHeight}
          rx={4}
          fill="hsl(220 10% 30%)"
        />

        {/* Tile grid: 6x6 */}
        {Array.from({ length: 7 }).map((_, i) => {
          const x = margin + (innerWidth / 6) * i;
          return (
            <line
              key={`gv-${i}`}
              x1={x}
              y1={margin}
              x2={x}
              y2={height - margin}
              stroke="hsl(210 10% 45%)"
              strokeWidth={0.6}
            />
          );
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const y = margin + (innerHeight / 6) * i;
          return (
            <line
              key={`gh-${i}`}
              x1={margin}
              y1={y}
              x2={width - margin}
              y2={y}
              stroke="hsl(210 10% 45%)"
              strokeWidth={0.6}
            />
          );
        })}

        {/* Decode-style diagonals */}
        {/*
          Approximate the reference: big V from top corners into center,
          and smaller V from bottom corners.
        */}
        <line
          x1={margin}
          y1={margin}
          x2={width / 2}
          y2={height / 2}
          stroke="white"
          strokeWidth={2}
        />
        <line
          x1={width - margin}
          y1={margin}
          x2={width / 2}
          y2={height / 2}
          stroke="white"
          strokeWidth={2}
        />
        <line
          x1={margin}
          y1={height - margin}
          x2={width / 2}
          y2={height * 0.75}
          stroke="white"
          strokeWidth={2}
        />
        <line
          x1={width - margin}
          y1={height - margin}
          x2={width / 2}
          y2={height * 0.75}
          stroke="white"
          strokeWidth={2}
        />

        {/* Alliance scoring squares (near bottom center) */}
        {(() => {
          const squareSize = innerWidth / 6;
          const y = height * 0.6;
          const leftX = width / 2 - squareSize * 1.8;
          const rightX = width / 2 + squareSize * 0.8;
          return (
            <>
              <rect
                x={leftX}
                y={y}
                width={squareSize}
                height={squareSize}
                fill="none"
                stroke="hsl(0 84% 60%)"
                strokeWidth={2}
              />
              <rect
                x={rightX}
                y={y}
                width={squareSize}
                height={squareSize}
                fill="none"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
              />
            </>
          );
        })()}

        {/* Alliance perimeter rails on left/right */}
        <line
          x1={margin + innerWidth * 0.05}
          y1={margin + innerHeight * 0.1}
          x2={margin + innerWidth * 0.05}
          y2={height - margin * 1.5}
          stroke="hsl(0 84% 60%)"
          strokeWidth={3}
        />
        <line
          x1={width - (margin + innerWidth * 0.05)}
          y1={margin + innerHeight * 0.1}
          x2={width - (margin + innerWidth * 0.05)}
          y2={height - margin * 1.5}
          stroke="hsl(217 91% 60%)"
          strokeWidth={3}
        />

        {/* Low bars on each side */}
        {["left", "right"].map(side => {
          const baseX =
            side === "left"
              ? margin + innerWidth * 0.1
              : width - (margin + innerWidth * 0.1);
          const sign = side === "left" ? 1 : -1;
          const color = "white";
          return [0.3, 0.45, 0.6].map((factor, idx) => (
            <line
              // eslint-disable-next-line react/no-array-index-key
              key={`${side}-bar-${idx}`}
              x1={baseX}
              y1={margin + innerHeight * factor}
              x2={baseX + sign * (innerWidth * 0.12)}
              y2={margin + innerHeight * factor}
              stroke={color}
              strokeWidth={2}
            />
          ));
        })}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="hsl(217 91% 60%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
