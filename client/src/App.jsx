// Shared styles first, so the Dentist Panel's own styles (dentist.css) can build on them.
import './App.css'
import PatientApp from './PatientApp'
import DentistPanel from './dentist/DentistPanel'
import { usePathname } from './utils/navigation'

// Two separate areas:
//   /          -> Patient side (the assessment form, no login needed)
//   /dentist/* -> Dentist side (dashboard for the dentist / form owner)
function App() {
  const pathname = usePathname()

  if (pathname === '/dentist' || pathname.startsWith('/dentist/')) {
    return <DentistPanel pathname={pathname} />
  }
  return <PatientApp />
}

export default App
