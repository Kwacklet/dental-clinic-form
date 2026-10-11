import { createContext, useContext } from 'react'
import type { User } from '../types'

export interface AuthState {
  user: User | null
  checking: boolean // true while a saved login is being checked with the server
  logIn: (email: string, password: string) => Promise<void>
  logOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>.')
  return auth
}
