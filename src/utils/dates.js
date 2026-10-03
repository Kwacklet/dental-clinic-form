/*
 * Date helpers. Dates are stored as 'YYYY-MM-DD' strings,
 * the same format used by <input type="date">.
 */

export function getTodayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Returns a Date object, or null if the value is not a real calendar date.
export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  // Rejects impossible dates such as 2023-02-31.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

// Age in whole years, or '' if the date of birth is missing or invalid.
export function calculateAge(dateOfBirth) {
  const birth = parseISODate(dateOfBirth)
  if (!birth) return ''

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hadBirthdayThisYear) age -= 1

  return age >= 0 && age <= 120 ? String(age) : ''
}

// '2026-09-26' -> 'September 26, 2026' (in the user's locale)
export function formatDate(value) {
  const date = parseISODate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

// ISO timestamp -> 'Sep 26, 2026, 9:15 AM' (in the user's locale)
export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// ISO timestamp -> the local calendar date as 'YYYY-MM-DD'
export function toLocalISODate(isoString) {
  const date = new Date(isoString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
