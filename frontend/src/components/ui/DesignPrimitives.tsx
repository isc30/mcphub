import React from 'react';

// ── Sparkline ─────────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}
export const Sparkline: React.FC<SparklineProps> = ({
  data, width = 80, height = 26,
  color = 'currentColor', fill = true, strokeWidth = 1.4,
}) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2] as [number, number]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const dFill = d + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={dFill} fill={color} opacity="0.08" />}
      <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Area chart ────────────────────────────────────────────────────────────
interface AreaChartProps {
  series: number[];
  width?: number;
  height?: number;
  color?: string;
  labels?: string[];
}
export const AreaChart: React.FC<AreaChartProps> = ({
  series, width = 720, height = 180, color = 'var(--ink)', labels = [],
}) => {
  const max = Math.max(...series, 10);
  const W = width, H = height;
  const padL = 38, padR = 8, padT = 8, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const step = innerW / (series.length - 1);
  const pts = series.map((v, i) => [padL + i * step, padT + innerH - ((v - 0) / max) * innerH] as [number, number]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const dFill = d + ` L${pts[pts.length - 1][0]},${padT + innerH} L${padL},${padT + innerH} Z`;
  const yTicks = 4;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart-grid">
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = padT + (innerH / yTicks) * i;
        const val = Math.round(max - (max / yTicks) * i);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} />
            <text x={padL - 8} y={y + 3} fontSize="10" fill="var(--ink-3)" textAnchor="end" fontFamily="var(--mono)">{val}</text>
          </g>
        );
      })}
      <path d={dFill} fill={color} opacity="0.07" />
      <path d={d} stroke={color} strokeWidth="1.4" fill="none" />
      {labels.map((l, i) => {
        if (i % Math.ceil(labels.length / 6) !== 0 && i !== labels.length - 1) return null;
        const x = padL + (innerW / (labels.length - 1)) * i;
        return <text key={i} x={x} y={H - 6} fontSize="10" fill="var(--ink-3)" textAnchor="middle" fontFamily="var(--mono)">{l}</text>;
      })}
    </svg>
  );
};

// ── Endpoint URL with copy ────────────────────────────────────────────────
interface EndpointProps {
  url: string;
  label?: string;
}
export const Endpoint: React.FC<EndpointProps> = ({ url, label }) => {
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="ds-endpoint">
      {label && <div className="ds-endpoint-label">{label}</div>}
      <div className="ds-endpoint-url mono">{url}</div>
      <button
        onClick={onCopy}
        className={`ds-endpoint-copy${copied ? ' copied' : ''}`}
        title="复制"
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        )}
      </button>
    </div>
  );
};

// ── Stat pill card ────────────────────────────────────────────────────────
interface StatPillProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaKind?: 'up' | 'down';
  spark?: number[];
  sparkColor?: string;
  icon?: React.ReactNode;
}
export const StatPill: React.FC<StatPillProps> = ({
  label, value, delta, deltaKind, spark, sparkColor, icon,
}) => (
  <div className="stat-card">
    <div className="stat-card-label">
      {icon && <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>}
      <span>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="stat-card-value">{value}</span>
        {delta && (
          <span className={`stat-card-delta ${deltaKind === 'down' ? 'down' : 'up'}`}>
            {deltaKind === 'down' ? '↓' : '↑'}{delta}
          </span>
        )}
      </div>
      {spark && <Sparkline data={spark} color={sparkColor || 'var(--ink-2)'} width={86} height={28} />}
    </div>
  </div>
);
