import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, GitCompare } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import ATSResult from '../components/ATSResult'
import { getHistory, getAnalysisById } from '../services/api'
import { exportAnalysisPdf } from '../utils/exportPdf'

export default function History() {
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [compare, setCompare] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  const viewReport = async (id) => {
    try {
      const data = await getAnalysisById(id)
      setSelected(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.')
    }
  }

  const toggleCompare = (id) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    )
  }

  const compareItems = history.filter((h) => compare.includes(h._id))

  return (
    <DashboardLayout title="Analysis History" subtitle="Past uploads, scores, and downloadable reports">
      {error && <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>}

      {compareItems.length === 2 && (
        <GlassCard className="p-6 mb-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <GitCompare className="w-5 h-5" /> Comparison
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {compareItems.map((item) => (
              <div key={item._id} className="p-4 rounded-xl surface-subtle text-center">
                <p className="text-sm text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</p>
                <p className="text-3xl font-bold text-primary mt-2">{item.atsScore}%</p>
                <p className="text-xs text-text-secondary mt-1">{item.matchedSkills?.length || 0} matched skills</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {loading ? (
        <p className="text-text-secondary">Loading history...</p>
      ) : history.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-text-secondary mb-4">No analyses yet.</p>
          <Link to="/analyzer" className="text-primary hover:underline">Analyze a resume</Link>
        </GlassCard>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {history.map((item) => (
              <GlassCard key={item._id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-text-primary">{item.fileName || 'Resume'}</p>
                    <p className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xl font-bold text-primary">{item.atsScore}%</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => viewReport(item._id)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20">
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button type="button" onClick={() => getAnalysisById(item._id).then(exportAnalysisPdf)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg surface-subtle text-text-secondary text-xs">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button type="button" onClick={() => toggleCompare(item._id)} className={`px-3 py-2 rounded-lg text-xs transition-colors ${compare.includes(item._id) ? 'bg-secondary/20 text-secondary ring-1 ring-secondary/30' : 'surface-subtle text-text-muted'}`}>
                    Compare
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          {selected && (
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Report Details</h2>
              <ATSResult {...selected} onExport={() => exportAnalysisPdf(selected)} />
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
