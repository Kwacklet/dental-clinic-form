import { useEffect, useState } from 'react'
import Link from '../components/Link'
import ToothIcon from '../components/ToothIcon'
import DashboardPage from './DashboardPage'
import AssessmentsPage from './AssessmentsPage'
import AssessmentDetailPage from './AssessmentDetailPage'
import SettingsPage from './SettingsPage'
import DentistLogin from './DentistLogin'
import { formSettings } from '../data/formSettings'
import { getSettings } from '../services/assessmentService'
import { LOGIN_REQUIRED, isDentist, signOut, watchSession } from '../services/authService'
import { useLoad } from '../utils/useLoad'
import './dentist.css'

const NAV_ITEMS = [
  { page: '', label: 'Dashboard' },
  { page: 'assessments', label: 'Assessments' },
  // Questionnaire page set aside for now. To bring it back, restore this line,
  // the `case 'questionnaire'` in renderPage and the QuestionnairePage import:
  // { page: 'questionnaire', label: 'Questionnaire' },
  { page: 'settings', label: 'Settings' },
]

// Dentist / form owner area, shown at /dentist. Requires a dentist login.
function DentistPanel({ pathname }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  // Follow login / logout.
  useEffect(() => watchSession(setSession), [])

  if (session === undefined) return <p className="dentist-loading-page">Loading…</p>
  if (!session) return <DentistLogin />
  // `key` starts fresh if a different account logs in.
  return <DentistArea key={session.user.id} email={session.user.email} pathname={pathname} />
}

// Shown once someone is logged in: checks they are on the dentist list.
function DentistArea({ email, pathname }) {
  const access = useLoad(isDentist)

  if (access.loading) return <p className="dentist-loading-page">Checking your account…</p>
  if (access.error || !access.data) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>No access</h1>
          <p className="notice notice-error" role="alert">
            {access.error
              ? access.error.message
              : `The account ${email} is not on the clinic's dentist list, so it cannot see patient records.`}
          </p>
          <button type="button" className="button button-secondary" onClick={signOut}>
            Log out
          </button>
        </div>
      </div>
    )
  }
  return <PanelLayout email={email} pathname={pathname} />
}

function PanelLayout({ email, pathname }) {
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
          {LOGIN_REQUIRED && (
            <button type="button" className="dentist-logout" onClick={signOut}>
              Log out
            </button>
          )}
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
