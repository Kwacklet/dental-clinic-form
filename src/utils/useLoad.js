import { useEffect, useState } from 'react'

/*
 * Loads data when a page opens, e.g. `useLoad(getAssessmentById, id)`.
 * Returns { loading, data, error, setData }.
 * `load` must be a function defined outside the component (so it doesn't
 * change on every render); `arg` is passed to it.
 */
export function useLoad(load, arg) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true // ignore the result if the page was closed meanwhile
    load(arg)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error) => active && setState({ loading: false, data: null, error }))
    return () => {
      active = false
    }
  }, [load, arg])

  // Lets a page update what it shows after a change (e.g. a delete).
  const setData = (data) => setState((current) => ({ ...current, data }))

  return { ...state, setData }
}
