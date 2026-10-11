/*
 * Local version: there are no accounts, so the Dentist Panel opens without
 * a login. Anyone using this browser can see the saved assessments.
 */
export const LOGIN_REQUIRED = false

const LOCAL_SESSION = { user: { id: 'local', email: '' } }

export async function signIn() {}

export async function signOut() {}

// Always "logged in". Returns a function that stops listening, like the other versions.
export function watchSession(onChange) {
  let active = true
  Promise.resolve().then(() => active && onChange(LOCAL_SESSION))
  return () => {
    active = false
  }
}

export async function isDentist() {
  return true
}
