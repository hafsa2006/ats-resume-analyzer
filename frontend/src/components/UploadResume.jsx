import { useRef, useImperativeHandle } from 'react'

const ACCEPT = '.pdf,.docx,.doc,.png,.jpg,.jpeg'
const MAX_SIZE_MB = 5

export default function UploadResume({ file, onFileChange, error, resetRef, disabled = false }) {
  const inputRef = useRef(null)

  useImperativeHandle(resetRef, () => () => {
    if (inputRef.current) inputRef.current.value = ''
  })

  const handleChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) {
      onFileChange(null)
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      onFileChange(null, `File must be under ${MAX_SIZE_MB}MB`)
      return
    }
    onFileChange(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (disabled) return
    const f = e.dataTransfer?.files?.[0]
    if (f && (f.type === 'application/pdf' || f.type.startsWith('image/') || f.name.endsWith('.docx') || f.name.endsWith('.doc'))) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        onFileChange(null, `File must be under ${MAX_SIZE_MB}MB`)
      } else {
        onFileChange(f)
      }
    } else {
      onFileChange(null, 'Use PDF, DOCX, or image (PNG/JPG)')
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div className="w-full" onDrop={handleDrop} onDragOver={handleDragOver}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        aria-label="Choose resume file"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="w-full glass-card rounded-2xl p-8 text-center transition-all hover:border-primary/40 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[200px] flex flex-col items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {file ? (
          <>
            <p className="text-body font-medium text-primary break-all">{file.name}</p>
            <p className="text-caption text-text-muted">Click to replace file</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-text-muted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-text-secondary text-body">Drop resume here or click to upload</p>
            <p className="text-text-muted text-caption">PDF, DOCX, PNG, JPG — max 5MB</p>
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-caption text-danger" role="alert">{error}</p>
      )}
    </div>
  )
}
