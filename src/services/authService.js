/*
 * Dentist login / logout.
 *
 * For now there is no login (./local/). Must point to the same folder as
 * the `from` line in assessmentService.js.
 */
export { LOGIN_REQUIRED, signIn, signOut, watchSession, isDentist } from './local/authService'
