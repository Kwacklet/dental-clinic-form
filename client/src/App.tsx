// Shared styles first, so the Dentist Panel's own styles (dentist.css) can build on them.
import './App.css'
import PatientApp from './PatientApp'
import DentistPanel from './dentist/DentistPanel'
import AuthProvider from './context/AuthProvider'
import { usePathname } from './utils/navigation'

// Two separate areas:
//   /          -> Patient side (the assessment form, no login needed)
//   /dentist/* -> Dentist Panel (needs a login)
function App() {
  const pathname = usePathname()

  if (pathname === '/dentist' || pathname.startsWith('/dentist/')) {
    return (
      <AuthProvider>
        <DentistPanel pathname={pathname} />
      </AuthProvider>
    )
  }
  return <PatientApp />
}

export default App
