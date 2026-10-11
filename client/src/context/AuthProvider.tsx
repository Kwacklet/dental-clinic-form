import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login } from '../api/auth'
import { getToken, setToken, setUnauthorizedHandler } from '../api/axios'
import { AuthContext } from './auth'
import type { User } from '../types'

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(() => getToken() !== null)

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    if (!getToken()) return

    let active = true
    getCurrentUser()
      .then((data) => active && setUser(data.user))
      .catch(() => {})
      .finally(() => active && setChecking(false))
    return () => {
      active = false
    }
  }, [])

  async function logIn(email: string, password: string) {
    const data = await login(email, password)
    setToken(data.token)
    setUser(data.user)
  }

  function logOut() {
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, checking, logIn, logOut }}>{children}</AuthContext.Provider>
}

export default AuthProvider
