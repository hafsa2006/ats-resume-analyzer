import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'
import { useTheme } from '../context/ThemeContext'
import { getProfile, updateProfile, updatePreferences } from '../services/api'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [analysisAlerts, setAnalysisAlerts] = useState(true)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile()
      .then((user) => {
        setName(user.name || '')
        setEmail(user.email || '')
        if (user.preferences) {
          setTheme(user.preferences.theme || 'dark')
          setEmailNotifications(user.preferences.emailNotifications ?? true)
          setAnalysisAlerts(user.preferences.analysisAlerts ?? true)
          setExportFormat(user.preferences.exportFormat || 'pdf')
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [setTheme])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const user = await updateProfile({ name, email })
      localStorage.setItem('user', JSON.stringify(user))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      await updatePreferences({ theme, emailNotifications, analysisAlerts, exportFormat })
      toast.success('Preferences saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLayout title="Settings"><p className="text-text-secondary">Loading...</p></DashboardLayout>
  }

  return (
    <DashboardLayout title="Settings" subtitle="Profile, appearance, and notifications">
      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <GlassCard className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Profile</h3>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-text-secondary">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1 h-11 px-4" />
            </label>
            <label className="block">
              <span className="text-sm text-text-secondary">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1 h-11 px-4" />
            </label>
            <GlowButton onClick={saveProfile} disabled={saving}>Save Profile</GlowButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Theme</span>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input-field !w-auto px-3 py-2 text-sm">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Email notifications</span>
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Analysis alerts</span>
              <input type="checkbox" checked={analysisAlerts} onChange={(e) => setAnalysisAlerts(e.target.checked)} className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Export format</span>
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="input-field !w-auto px-3 py-2 text-sm">
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </label>
            <GlowButton onClick={savePreferences} disabled={saving}>Save Preferences</GlowButton>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
