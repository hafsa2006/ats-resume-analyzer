import { motion } from 'framer-motion'
import {
  Sparkles, Cpu, Layers, FileSearch, Eye, Map,
  ArrowRight, GitBranch, ScanText, Scale, AlertCircle,
} from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'
import PremiumBackground from '../components/ui/PremiumBackground'
import GlowButton from '../components/ui/GlowButton'
import GlassCard from '../components/ui/GlassCard'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

const engineSteps = [
  { step: '01', title: 'Extract text', desc: 'PDF via pdf-parse; scanned PDFs and images via Tesseract OCR; DOCX via Mammoth.' },
  { step: '02', title: 'Parse structure', desc: 'Regex-based section detection for experience, education, skills, projects, and contact fields.' },
  { step: '03', title: 'Score against JD', desc: 'Five weighted dimensions computed deterministically from resume + job description tokens.' },
  { step: '04', title: 'Surface insights', desc: 'Matched/missing skills, formatting flags, heatmap, keyword density, and optional Gemini enhancements.' },
]

const scoreWeights = [
  { label: 'Keyword Match', pct: 40, color: 'from-primary to-indigo-400' },
  { label: 'Skills', pct: 20, color: 'from-secondary to-violet-400' },
  { label: 'Experience', pct: 15, color: 'from-emerald-500 to-green-400' },
  { label: 'Formatting', pct: 15, color: 'from-amber-500 to-orange-400' },
  { label: 'Projects', pct: 10, color: 'from-cyan-500 to-blue-400' },
]

const coreFeatures = [
  { icon: Scale, title: 'Deterministic scoring', desc: 'ATS score is a weighted sum of five sub-scores — never random.' },
  { icon: ScanText, title: 'JD token matching', desc: 'Resume and job description tokens compared for overlap, gaps, and stuffing detection.' },
  { icon: AlertCircle, title: 'Issue detection', desc: 'Flags weak verbs, missing metrics, incomplete sections, and ATS-unfriendly formatting.' },
  { icon: FileSearch, title: 'Analysis history', desc: 'Every run stored in MongoDB with full breakdown for review and comparison.' },
  { icon: GitBranch, title: 'PDF export', desc: 'Download a structured report with score, skills, and suggestions.' },
  { icon: Layers, title: 'Auth & persistence', desc: 'JWT-secured API; analyses scoped per user account.' },
]

const intelligenceCapabilities = [
  { title: 'Structured parsing', items: ['Name, email, phone extraction', 'Technical & soft skill detection', 'Experience entries with bullet parsing', 'Education, projects, certifications'] },
  { title: 'Job alignment', items: ['Matched vs missing skill lists', 'Recommended keywords from JD', 'Compatibility percentage', 'Years-of-experience estimation'] },
  { title: 'AI layer (optional)', items: ['Gemini 1.5 Flash when API key is set', 'Bullet rewrite suggestions', 'Summary improvements', 'Interview questions by skill', 'Local fallback when offline'] },
]

const recruiterInsights = [
  { label: 'Attention heatmap', desc: 'Line-by-line attention scores based on position and keyword hits in the top of the resume.' },
  { label: 'Keyword density', desc: 'Per-keyword occurrence count and density relative to total word count.' },
  { label: 'Readability signal', desc: 'Sentence-length heuristic to flag overly dense bullet blocks.' },
  { label: 'Section completeness', desc: 'Checks for experience, education, and skills sections expected by parsers.' },
]

const roadmap = [
  { phase: 'Now', items: ['Weighted ATS engine', 'Resume upload (PDF, DOCX, PNG, JPG)', 'Dashboard analytics & history', 'Dark/light theme'] },
  { phase: 'Next', items: ['Batch resume comparison', 'Role-specific keyword libraries', 'Improved DOC parsing', 'Webhook export API'] },
  { phase: 'Later', items: ['Team workspaces', 'Custom scoring weights', 'LinkedIn profile import', 'Interview prep mode'] },
]

function SectionHeader({ id, title, subtitle }) {
  return (
    <motion.div {...fadeUp} id={id} className="text-center mb-14 scroll-mt-28">
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">{title}</h2>
      <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">{subtitle}</p>
    </motion.div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <PremiumBackground variant="hero" parallax />
      <LandingNavbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-8">
              <Cpu className="w-4 h-4" /> Deterministic ATS analysis engine
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              Resume intelligence<br />
              <span className="bg-gradient-to-r from-primary via-secondary to-cyan-400 bg-clip-text text-transparent">
                built for how ATS actually reads
              </span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a resume, paste a job description, and get a weighted compatibility score with
              parsing, skill gaps, and recruiter-style attention signals — backed by real code, not marketing fluff.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <GlowButton to="/signup">Run an analysis</GlowButton>
              <GlowButton href="#engine" variant="outline">See how it works</GlowButton>
            </div>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {['pdf-parse', 'Tesseract OCR', 'Mammoth DOCX', 'MongoDB', 'Gemini (optional)'].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg glass-card text-xs text-text-muted font-mono">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 1. How The ATS Engine Works */}
      <section id="engine" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="How the ATS engine works"
            subtitle="A four-stage pipeline from file upload to stored analysis — every score traceable to its inputs."
          />
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              {engineSteps.map((s, i) => (
                <GlassCard key={s.step} className="p-5">
                  <motion.div {...fadeUp} transition={{ delay: i * 0.08 }} className="flex gap-4">
                    <span className="text-2xl font-bold text-primary/40 font-mono">{s.step}</span>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">{s.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="p-6">
              <h3 className="font-semibold text-text-primary mb-5 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Score composition
              </h3>
              <div className="space-y-4">
                {scoreWeights.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="text-text-primary font-mono">{item.pct}%</span>
                    </div>
                    <div className="h-2 progress-track">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-text-muted leading-relaxed">
                Final ATS score = Σ (dimension score × weight). Clamped 0–100. Same inputs always produce the same output.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 2. Core ATS Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Core ATS features"
            subtitle="What ships today in the analyzer, dashboard, and API."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f, i) => (
              <GlassCard key={f.title} className="p-6 group">
                <motion.div {...fadeUp} transition={{ delay: i * 0.06 }}>
                  <f.icon className="w-9 h-9 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </motion.div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Resume Intelligence Capabilities */}
      <section id="intelligence" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Resume intelligence capabilities"
            subtitle="Structured extraction and alignment logic running on every analysis."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {intelligenceCapabilities.map((block, i) => (
              <GlassCard key={block.title} className="p-6">
                <motion.div {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    {block.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Recruiter Insight Simulation */}
      <section id="recruiter" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Recruiter insight simulation"
            subtitle="Heuristics that approximate what a recruiter skims in the first pass — not eye-tracking, but structurally informed."
          />
          <div className="grid sm:grid-cols-2 gap-5">
            {recruiterInsights.map((item, i) => (
              <GlassCard key={item.label} className="p-6">
                <motion.div {...fadeUp} transition={{ delay: i * 0.08 }} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{item.label}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="mt-8 p-6">
            <p className="text-sm text-text-muted text-center font-mono">
              heatmap[line] = baseAttention(position) + keywordHits × 8 + sectionBoost
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 5. Future Roadmap */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Future roadmap"
            subtitle="Planned extensions — honest about what is live vs. in development."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {roadmap.map((phase, i) => (
              <GlassCard key={phase.phase} className={`p-6 ${i === 0 ? 'ring-1 ring-primary/30' : ''}`}>
                <motion.div {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-primary' : 'text-text-muted'}`}>
                    {phase.phase}
                  </span>
                  <ul className="mt-4 space-y-2.5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Map className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <GlassCard className="max-w-3xl mx-auto p-10 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">Try it on your resume</h2>
          <p className="text-text-secondary mb-8 text-sm md:text-base max-w-lg mx-auto">
            Create an account, upload a PDF or DOCX, paste a job description, and inspect the full score breakdown in under a minute.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <GlowButton to="/signup">Create free account</GlowButton>
            <GlowButton to="/login" variant="outline">Log in</GlowButton>
          </div>
        </GlassCard>
      </section>

      <footer className="py-8 px-6 border-t border-border text-center text-sm text-text-muted">
        © 2026 ResumeIQ — ATS Resume Intelligence Platform
      </footer>
    </div>
  )
}
