import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'dentalForm.token'

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
    console.warn('This browser blocked saving the login; it will last until the page is closed.')
  }
}

let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (!error.response) return 'Could not reach the server. Make sure it is running.'
    return error.response.data?.error ?? fallback
  }
  return fallback
}

export async function request<T>(call: Promise<{ data: T }>, fallback: string): Promise<T> {
  try {
    const response = await call
    return response.data
  } catch (error) {
    throw new Error(errorMessage(error, fallback), { cause: error })
  }
}
