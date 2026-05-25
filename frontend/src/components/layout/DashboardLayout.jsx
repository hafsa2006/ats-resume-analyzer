import Sidebar from './Sidebar'
import PremiumBackground from '../ui/PremiumBackground'
import BackendStatusBanner from '../BackendStatusBanner'

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <PremiumBackground parallax />
      <Sidebar />
      <main className="flex-1 min-w-0 lg:pl-0 pt-16 lg:pt-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <BackendStatusBanner />
          {(title || subtitle) && (
            <header className="mb-10">
              {title && <h1 className="page-title">{title}</h1>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
