import './App.css'
import PatientApp from './PatientApp'
import DentistPanel from './dentist/DentistPanel'
import AuthProvider from './context/AuthProvider'
import { usePathname } from './utils/navigation'

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
