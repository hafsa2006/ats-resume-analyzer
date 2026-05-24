import SpotlightCard from './SpotlightCard'

export default function StatCard({ icon: Icon, label, value, accent = 'text-primary', delay = 0 }) {
  return (
    <SpotlightCard
      className="p-6 stat-card"
      transition={{ duration: 0.45, delay }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`stat-icon-wrap ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="stat-value text-heading mt-4">{value}</p>
      <p className="stat-label text-label mt-1">{label}</p>
    </SpotlightCard>
  )
}
