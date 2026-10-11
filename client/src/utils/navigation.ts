/*
 * Minimal client-side navigation, so the app can have separate URLs
 * (/ for the patient form, /dentist/... for the Dentist Panel)
 * without installing a routing library.
 */
import { useEffect, useState } from 'react'

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  // Tell usePathname() listeners that the URL changed.
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

// Returns the current URL path and re-renders when it changes
// (including the browser's Back and Forward buttons).
export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleChange = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handleChange)
    return () => window.removeEventListener('popstate', handleChange)
  }, [])

  return pathname
}
