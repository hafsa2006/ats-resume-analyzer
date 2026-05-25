import { AlertCircle, FileText, RefreshCw } from 'lucide-react'
import GlowButton from './ui/GlowButton'

export const PDF_PARSE_MESSAGE =
  'Unable to process this PDF. Please upload a text-based resume PDF exported from Word or Google Docs.'

export default function PdfParseErrorAlert({ onTryAgain }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-warning/30 bg-warning/5 p-6 shadow-soft"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-warning" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary mb-1">
            PDF could not be processed
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {PDF_PARSE_MESSAGE}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>Export from <strong className="text-text-secondary">Microsoft Word</strong> or <strong className="text-text-secondary">Google Docs</strong> using &quot;Save as PDF&quot;</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>Avoid scanned images, password-protected, or heavily compressed PDFs</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>You can also upload <strong className="text-text-secondary">DOCX</strong> directly</span>
            </li>
          </ul>
          {onTryAgain && (
            <GlowButton type="button" variant="outline" className="mt-5" onClick={onTryAgain}>
              <RefreshCw className="w-4 h-4" />
              Choose another file
            </GlowButton>
          )}
        </div>
      </div>
    </div>
  )
}
