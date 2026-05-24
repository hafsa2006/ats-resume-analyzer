import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import UploadResume from '../components/UploadResume'
import ATSResult from '../components/ATSResult'
import GlowButton from '../components/ui/GlowButton'
import { uploadAndAnalyze } from '../services/api'
import { exportAnalysisPdf } from '../utils/exportPdf'

export default function Analyzer() {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleFileChange = (f, err) => {
    setFile(f || null)
    setFileError(err || '')
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!file) { setFileError('Please select a resume file.'); return }
    if (!jobDescription.trim()) { setError('Please enter the job description.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription.trim())
      const data = await uploadAndAnalyze(formData)
      setResult(data)
      toast.success(`Analysis complete — ${data.atsScore}% ATS score`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Resume Analyzer" subtitle="Upload your resume and paste a job description">
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="font-semibold text-text-primary mb-4">Resume Upload</h2>
          <UploadResume file={file} onFileChange={handleFileChange} error={fileError} />
          <p className="mt-3 text-xs text-text-muted">Supported: PDF, DOCX, PNG, JPG (max 5MB)</p>
        </GlassCard>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
            <label className="font-semibold text-text-primary">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="input-field flex-1 px-4 py-3 resize-y min-h-[200px]"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <GlowButton type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Resume'}
            </GlowButton>
          </form>
        </GlassCard>
      </div>

      {result && (
        <motion.section
          className="mt-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-title mb-8">Analysis Results</h2>
          <ATSResult {...result} onExport={() => exportAnalysisPdf(result)} />
        </motion.section>
      )}
    </DashboardLayout>
  )
}
