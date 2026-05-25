import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import UploadResume from '../components/UploadResume'
import ATSResult from '../components/ATSResult'
import GlowButton from '../components/ui/GlowButton'
import PdfParseErrorAlert, { PDF_PARSE_MESSAGE } from '../components/PdfParseErrorAlert'
import { uploadAndAnalyze } from '../services/api'
import { exportAnalysisPdf } from '../utils/exportPdf'
import { getApiErrorMessage, isPdfParseError, isBackendOffline } from '../utils/parseApiError'
import { useApiHealth } from '../context/ApiHealthContext'

export default function Analyzer() {
  const { online: apiOnline, checking: apiChecking } = useApiHealth()
  const uploadResetRef = useRef(null)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfParseFailed, setPdfParseFailed] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (f, err) => {
    setFile(f || null)
    setFileError(err || '')
    setPdfParseFailed(false)
    setError('')
    setResult(null)
  }

  const handleTryAnotherFile = () => {
    setFile(null)
    setFileError('')
    setPdfParseFailed(false)
    setError('')
    setResult(null)
    uploadResetRef.current?.()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPdfParseFailed(false)
    setResult(null)
    if (!file) {
      setFileError('Please select a resume file.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter the job description.')
      return
    }
    if (!apiOnline && !apiChecking) {
      const msg = 'Backend is not running. From the project root run: npm run dev'
      setError(msg)
      toast.error(msg, { id: 'backend-offline' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription.trim())
      const data = await uploadAndAnalyze(formData)
      setResult(data)
      toast.success(`Analysis complete — ${data.atsScore}% ATS score`)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Analysis failed.')
      if (isPdfParseError(err)) {
        setPdfParseFailed(true)
        setError('')
        toast.error(PDF_PARSE_MESSAGE, {
          id: 'pdf-parse-error',
          duration: 6000,
          icon: '⚠️',
        })
      } else {
        setError(msg)
        toast.error(msg, { duration: isBackendOffline(err) ? 8000 : 4000 })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Resume Analyzer" subtitle="Upload your resume and paste a job description">
      <AnimatePresence mode="wait">
        {pdfParseFailed && (
          <motion.div
            key="pdf-error"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <PdfParseErrorAlert onTryAgain={handleTryAnotherFile} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className={`p-6 ${pdfParseFailed ? 'ring-1 ring-warning/25' : ''}`}>
          <h2 className="font-semibold text-text-primary mb-4">Resume Upload</h2>
          <UploadResume
            file={file}
            onFileChange={handleFileChange}
            error={fileError}
            resetRef={uploadResetRef}
            disabled={loading}
          />
          <p className="mt-3 text-xs text-text-muted">
            Supported: PDF, DOCX, PNG, JPG (max 5MB). For best results, use a text-based PDF from Word or Google Docs.
          </p>
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
              disabled={loading}
            />
            {error && !pdfParseFailed && (
              <p className="text-sm text-danger" role="alert">{error}</p>
            )}
            <GlowButton
              type="submit"
              disabled={loading || (!apiOnline && !apiChecking)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </GlowButton>
            {pdfParseFailed && (
              <p className="text-xs text-center text-text-muted">
                Fix your resume file above, then run analysis again.
              </p>
            )}
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
