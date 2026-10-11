import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'dentalForm.token'

// The one Axios instance the app uses. The API address comes from client/.env.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
})

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked: the login lasts until the page is closed.
  }
}

// Set by AuthContext so an expired login sends the dentist back to the login screen.
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// Request interceptor: send the login token with every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: a 401 means the login expired or is invalid.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null)
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

// Turns any Axios error into a message that can be shown to the user.
function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (!error.response) return 'Could not reach the server. Make sure it is running.'
    return error.response.data?.error ?? fallback
  }
  return fallback
}

// Runs one API call and returns its data, or throws an Error with a readable message.
export async function request<T>(call: Promise<{ data: T }>, fallback: string): Promise<T> {
  try {
    const response = await call
    return response.data
  } catch (error) {
    throw new Error(errorMessage(error, fallback), { cause: error })
  }
}
