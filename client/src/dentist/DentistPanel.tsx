import { useState } from 'react'
import Link from '../components/Link'
import ToothIcon from '../components/ToothIcon'
import DashboardPage from './DashboardPage'
import AssessmentsPage from './AssessmentsPage'
import AssessmentDetailPage from './AssessmentDetailPage'
import SettingsPage from './SettingsPage'
import DentistLogin from './DentistLogin'
import { getSettings } from '../api/settings'
import { useAuth } from '../context/auth'
import { formSettings } from '../data/formSettings'
import { useLoad } from '../hooks/useLoad'
import './dentist.css'

const NAV_ITEMS = [
  { page: '', label: 'Dashboard' },
  { page: 'assessments', label: 'Assessments' },
  { page: 'settings', label: 'Settings' },
]

// Dentist / form owner area, shown at /dentist. Requires a login.
function DentistPanel({ pathname }: { pathname: string }) {
  const { user, checking } = useAuth()

  if (checking) return <p className="dentist-loading-page">Loading…</p>
  if (!user) return <DentistLogin />
  // `key` starts fresh if a different account logs in.
  return <PanelLayout key={user.id} email={user.email} pathname={pathname} />
}

function PanelLayout({ email, pathname }: { email: string; pathname: string }) {
  const { logOut } = useAuth()
  const loadedSettings = useLoad(getSettings)
  const settings = loadedSettings.data ?? formSettings
  const [menuOpen, setMenuOpen] = useState(false)

  // '/dentist/assessments/12' -> page 'assessments', id '12'
  const [, , page = '', id] = pathname.replace(/\/+$/, '').split('/')

  function renderPage() {
    switch (page) {
      case '':
        return <DashboardPage dentistName={settings.dentistName} />
      case 'assessments':
        // `key` gives each assessment a fresh detail page.
        return id ? <AssessmentDetailPage key={id} assessmentId={id} /> : <AssessmentsPage />
      case 'settings':
        return loadedSettings.loading ? (
          <p className="dentist-loading">Loading settings…</p>
        ) : (
          <SettingsPage settings={settings} onSaved={loadedSettings.setData} />
        )
      default:
        return (
          <div className="dentist-page-header">
            <h1>Page not found</h1>
            <p>
              <Link to="/dentist">Go to the dashboard</Link>
            </p>
          </div>
        )
    }
  }

  const initials = settings.dentistName
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="dentist-layout">
      <aside className={`dentist-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="dentist-sidebar-top">
          <div className="dentist-brand">
            <ToothIcon size={22} />
            <div>
              <span className="dentist-brand-title">Dentist Panel</span>
              <span className="dentist-brand-subtitle">{settings.clinicName}</span>
            </div>
          </div>
          <button
            type="button"
            className="dentist-menu-button"
            aria-expanded={menuOpen}
            aria-controls="dentist-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        <div className="dentist-sidebar-body" id="dentist-nav">
          <nav aria-label="Dentist Panel">
            <ul className="dentist-nav">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.page ? `/dentist/${item.page}` : '/dentist'}
                    className={`dentist-nav-link ${page === item.page ? 'is-active' : ''}`}
                    aria-current={page === item.page ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="dentist-owner">
            <span className="dentist-avatar" aria-hidden="true">
              {initials}
            </span>
            <div>
              <span className="dentist-owner-name" title={settings.dentistName}>
                {settings.dentistName}
              </span>
              {email && (
                <span className="dentist-owner-role" title={email}>
                  {email}
                </span>
              )}
            </div>
          </div>
          <button type="button" className="dentist-logout" onClick={logOut}>
            Log out
          </button>
          <Link to="/" className="dentist-patient-link">
            Open patient form
          </Link>
        </div>
      </aside>

      <main className="dentist-main">{renderPage()}</main>
    </div>
  )
}

export default DentistPanel
