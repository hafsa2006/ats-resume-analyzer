/** Theme-aware Recharts styling */
export function getChartTheme(theme = 'dark') {
  const isLight = theme === 'light'
  return {
    tick: { fill: isLight ? '#475569' : '#94a3b8', fontSize: 12 },
    tickSm: { fill: isLight ? '#475569' : '#94a3b8', fontSize: 11 },
    grid: isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(99, 102, 241, 0.18)',
    lineGradientId: 'chart-line-gradient',
    lineStroke: '#6366f1',
    tooltip: {
      contentStyle: {
        background: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(31,41,55,0.96)',
        border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(99,102,241,0.25)'}`,
        borderRadius: 12,
        boxShadow: isLight
          ? '0 8px 24px rgba(15, 23, 42, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        color: isLight ? '#0f172a' : '#f9fafb',
      },
      labelStyle: { color: isLight ? '#0f172a' : '#f9fafb', fontWeight: 600 },
      itemStyle: { color: isLight ? '#475569' : '#d1d5db' },
      cursor: { stroke: 'rgba(99, 102, 241, 0.35)', strokeWidth: 1 },
    },
  }
}

export function ChartGradients({ prefix = '' }) {
  const id = (name) => `${prefix}${name}`
  return (
    <defs>
      <linearGradient id={id('chart-line-gradient')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
      </linearGradient>
      <linearGradient id={id('chart-area-gradient')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}
