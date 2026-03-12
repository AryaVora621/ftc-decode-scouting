interface SegmentControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  colorMap?: Partial<Record<T, string>>;
}

export default function SegmentControl<T extends string>({ options, value, onChange, colorMap }: SegmentControlProps<T>) {
  return (
    <div className="segment-control">
      {options.map(opt => {
        const isActive = opt.value === value;
        const customColor = isActive && colorMap?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`segment-option ${isActive ? (customColor || 'segment-option-active') : ''}`}
            style={customColor ? { backgroundColor: customColor, color: '#F8FAFC' } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
