import { useState, type FormEvent } from 'react'
import { saveSettings } from '../api/settings'
import { isEmpty } from '../utils/validation'
import type { Settings } from '../types'

const FIELDS: { id: keyof Settings; label: string }[] = [
  { id: 'dentistName', label: 'Dentist name' },
  { id: 'clinicName', label: 'Clinic name' },
  { id: 'formTitle', label: 'Form title' },
]

interface SettingsPageProps {
  settings: Settings
  onSaved: (settings: Settings) => void
}

// Clinic settings, saved in the database. The form title and clinic name
// are also shown on the patient form.
function SettingsPage({ settings, onSaved }: SettingsPageProps) {
  const [values, setValues] = useState(settings)
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleChange(id: keyof Settings, value: string) {
    setValues((previous) => ({ ...previous, [id]: value }))
    setSaved(false)
    if (errors[id]) setErrors((previous) => ({ ...previous, [id]: isEmpty(value) ? 'This field is required.' : '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = Object.fromEntries(
      FIELDS.filter((field) => isEmpty(values[field.id])).map((field) => [field.id, 'This field is required.']),
    )
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const trimmed: Settings = {
      dentistName: values.dentistName.trim(),
      clinicName: values.clinicName.trim(),
      formTitle: values.formTitle.trim(),
    }
    setSaving(true)
    setSaveError('')
    try {
      await saveSettings(trimmed)
      onSaved(trimmed)
      setSaved(true)
    } catch (error) {
      setSaveError((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="dentist-page-header">
        <h1>Settings</h1>
        <p>Basic details about the form owner and the assessment form.</p>
      </div>

      <form className="dentist-card settings-form" onSubmit={handleSubmit} noValidate>
        {FIELDS.map((field) => (
          <div key={field.id} className="settings-field">
            <label htmlFor={field.id} className="field-label">
              {field.label}
            </label>
            <input
              id={field.id}
              className={`input ${errors[field.id] ? 'input-invalid' : ''}`}
              value={values[field.id]}
              aria-invalid={Boolean(errors[field.id])}
              aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
              onChange={(event) => handleChange(field.id, event.target.value)}
            />
            {errors[field.id] && (
              <p id={`${field.id}-error`} className="field-error">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}

        <div className="settings-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved && (
            <p className="settings-saved" role="status">
              Saved.
            </p>
          )}
          {saveError && (
            <p className="field-error" role="alert">
              {saveError}
            </p>
          )}
        </div>
      </form>
    </>
  )
}

export default SettingsPage
