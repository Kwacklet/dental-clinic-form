import { useState, type FormEvent } from 'react'
import ToothIcon from '../components/ToothIcon'
import { useAuth } from '../context/auth'
import { isEmpty, validateEmail } from '../utils/validation'

function DentistLogin() {
  const { logIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = {
      email: validateEmail(email),
      password: isEmpty(password) ? 'Password is required.' : '',
    }
    setErrors(newErrors)
    setLoginError('')
    if (newErrors.email || newErrors.password) return

    setLoggingIn(true)
    try {
      await logIn(email.trim(), password)
    } catch (error) {
      setLoginError((error as Error).message)
      setLoggingIn(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-brand">
          <ToothIcon size={26} />
          <span>Dentist Panel</span>
        </div>
        <h1>Log in</h1>
        <p className="login-intro">For clinic staff only. Patients do not need to log in.</p>

        {loginError && (
          <p className="notice notice-error" role="alert">
            {loginError}
          </p>
        )}

        <div className="login-field">
          <label htmlFor="login-email" className="field-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            className={`input ${errors.email ? 'input-invalid' : ''}`}
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && (
            <p id="login-email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="login-field">
          <label htmlFor="login-password" className="field-label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={`input ${errors.password ? 'input-invalid' : ''}`}
            value={password}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password && (
            <p id="login-password-error" className="field-error">
              {errors.password}
            </p>
          )}
        </div>

        <button type="submit" className="button button-primary login-button" disabled={loggingIn}>
          {loggingIn ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export default DentistLogin
