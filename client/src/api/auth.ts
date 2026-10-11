import { api, request } from './axios'
import type { User } from '../types'

export function login(email: string, password: string) {
  return request(api.post<{ token: string; user: User }>('/auth/login', { email, password }), 'Could not log in.')
}

export function getCurrentUser() {
  return request(api.get<{ user: User }>('/auth/me'), 'Could not check your login.')
}
