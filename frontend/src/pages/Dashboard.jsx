import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, FileText, Award, Activity } from 'lucide-react'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid, Area, AreaChart,
} from 'recharts'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import { getDashboardStats } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, ChartGradients } from '../utils/chartTheme'
import { getMockDashboardStats } from '../utils/mockDashboardStats'
import { getApiErrorMessage, isServerUnavailable, SERVER_WAKING_MSG } from '../utils/parseApiError'
import { useApiHealth } from '../context/ApiHealthContext'

const COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B']

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function Dashboard() {
  const { theme } = useTheme()
  const { online: apiOnline, checking: apiChecking } = useApiHealth()
  const chart = getChartTheme(theme)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    if (apiChecking) return undefined

    setLoading(true)
    getDashboardStats()
      .then((data) => {
        setStats(data)
        setOffline(Boolean(data?.mock) && import.meta.env.DEV)
        setError('')
      })
      .catch((err) => {
        if (isServerUnavailable(err)) {
          if (import.meta.env.DEV) {
            setStats(getMockDashboardStats())
            setOffline(true)
          }
          setError(getApiErrorMessage(err, SERVER_WAKING_MSG))
          return
        }
        setError(getApiErrorMessage(err, 'Failed to load dashboard.'))
      })
      .finally(() => setLoading(false))

    return undefined
  }, [apiChecking, apiOnline])

  if (loading || apiChecking) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle={apiChecking ? SERVER_WAKING_MSG : 'Loading analytics...'}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Your resume intelligence overview">
      {(error || offline) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl text-sm border ${
            offline
              ? 'bg-warning/10 border-warning/30 text-warning'
              : 'bg-danger/10 border-danger/20 text-danger'
          }`}
        >
          {error || 'Using demo dashboard data.'}
        </motion.div>
      )}

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={FileText} label="Total Analyses" value={stats?.totalAnalyses ?? 0} accent="text-primary" delay={0} />
          <StatCard icon={TrendingUp} label="Average Score" value={`${stats?.avgScore ?? 0}%`} accent="text-success" delay={0.05} />
          <StatCard icon={Award} label="Best Score" value={`${stats?.bestScore ?? 0}%`} accent="text-secondary" delay={0.1} />
          <StatCard icon={Activity} label="Recent Runs" value={stats?.recentActivity?.length ?? 0} accent="text-warning" delay={0.15} />
        </motion.div>

        <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 chart-card" hover>
            <h3 className="section-title mb-6">Score Trend</h3>
            {(stats?.scoreTrend?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.scoreTrend}>
                  <ChartGradients />
                  <CartesianGrid stroke={chart.grid} strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="name" tick={chart.tick} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={chart.tick} axisLine={false} tickLine={false} />
                  <Tooltip {...chart.tooltip} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="url(#chart-line-gradient)"
                    strokeWidth={2.5}
                    fill="url(#chart-area-gradient)"
                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-label py-16 text-center">Run your first analysis to see trends</p>
            )}
          </GlassCard>

          <GlassCard className="p-6 chart-card" hover>
            <h3 className="section-title mb-6">Top Matched Skills</h3>
            {(stats?.topSkills?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.topSkills} barCategoryGap="20%">
                  <CartesianGrid stroke={chart.grid} strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="skill" tick={chart.tickSm} axisLine={false} tickLine={false} />
                  <YAxis tick={chart.tick} axisLine={false} tickLine={false} />
                  <Tooltip {...chart.tooltip} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000} animationEasing="ease-out">
                    {stats.topSkills.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-label py-16 text-center">No skill data yet</p>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="p-6" hover>
            <h3 className="section-title mb-6">Recent Activity</h3>
            {(stats?.recentActivity?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-4 rounded-xl surface-subtle"
                  >
                    <div>
                      <p className="text-sm font-medium text-heading">{act.fileName}</p>
                      <p className="text-xs text-label mt-0.5">{new Date(act.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-lg font-bold text-primary tabular-nums">{act.score}%</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No analyses yet</p>
                <Link to="/analyzer" className="text-primary hover:underline font-medium">Start analyzing</Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
