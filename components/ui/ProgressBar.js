export function ProgressBar({ pct, color, height = 8 }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div className="w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${clamped * 100}%`, background: color }} />
    </div>
  );
}

export function ProgressRing({ pct, size = 54, stroke = 6, color, track }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - clamped)} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}
