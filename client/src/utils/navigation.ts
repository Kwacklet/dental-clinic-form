import { useEffect, useState } from 'react'

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleChange = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handleChange)
    return () => window.removeEventListener('popstate', handleChange)
  }, [])

  return pathname
}
