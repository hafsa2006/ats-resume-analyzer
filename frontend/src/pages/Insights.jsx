import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import ATSResult from '../components/ATSResult'
import { getHistory, getAnalysisById } from '../services/api'
import { exportAnalysisPdf } from '../utils/exportPdf'

export default function Insights() {
  const [searchParams] = useSearchParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = searchParams.get('id')
    const load = id
      ? getAnalysisById(id)
      : getHistory().then((list) => (list[0] ? getAnalysisById(list[0]._id) : null))

    load
      .then((data) => setAnalysis(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load insights.'))
      .finally(() => setLoading(false))
  }, [searchParams])

  return (
    <DashboardLayout title="Resume Insights" subtitle="Deep analysis and AI recommendations">
      {loading && <p className="text-text-secondary">Loading insights...</p>}
      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}
      {!loading && !analysis && !error && (
        <GlassCard className="p-12 text-center">
          <p className="text-text-secondary">No analysis found. Run the analyzer first.</p>
        </GlassCard>
      )}
      {analysis && (
        <ATSResult
          {...analysis}
          onExport={() => exportAnalysisPdf(analysis)}
        />
      )}
    </DashboardLayout>
  )
}
