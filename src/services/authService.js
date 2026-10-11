/*
 * Dentist Panel login / logout.
 * The server checks the password and returns a session token, kept in this
 * browser until logout. Every Dentist Panel request sends it (authHeaders).
 */
import { API_BASE } from './api'

export const LOGIN_REQUIRED = true

const STORAGE_KEY = 'dentalForm.session' // { token, user }
const listeners = new Set()

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function store(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: the login still works until the page is closed.
  }
  listeners.forEach((listener) => listener(session ? { user: session.user } : null))
}

async function post(path, body, headers = {}) {
  try {
    return await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Make sure it is running.')
  }
}

export function authHeaders() {
  const token = readStored()?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Called when the server rejects the session (expired or logged out elsewhere).
export function handleUnauthorized() {
  store(null)
}

export async function signIn(email, password) {
  const response = await post('/login', { email, password })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not log in.')
  store({ token: data.token, user: data.user })
}

export async function signOut() {
  const headers = authHeaders()
  store(null)
  await post('/logout', {}, headers).catch(() => {})
}

// Calls onChange with { user } or null now and on every login / logout.
// Returns a function that stops listening.
export function watchSession(onChange) {
  let active = true
  const listener = (session) => active && onChange(session)
  listeners.add(listener)

  const stored = readStored()
  if (!stored?.token) {
    Promise.resolve().then(() => listener(null))
  } else {
    fetch(`${API_BASE}/me`, { headers: authHeaders() })
      .then(async (response) => {
        if (response.ok) store({ token: stored.token, user: (await response.json()).user })
        else if (response.status === 401) store(null)
        else listener(null)
      })
      .catch(() => listener(null))
  }

  return () => {
    active = false
    listeners.delete(listener)
  }
}

// The server only lets dentist, staff and admin accounts log in.
export async function isDentist() {
  return true
}
