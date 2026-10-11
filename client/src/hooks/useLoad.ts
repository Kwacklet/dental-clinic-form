import { useEffect, useState } from 'react'

interface LoadState<T> {
  loading: boolean
  data: T | null
  error: Error | null
}

/*
 * Loads data when a page opens, e.g. `useLoad(getAssessment, id)`.
 * `load` must be defined outside the component (so it doesn't change on
 * every render); `arg` is passed to it.
 */
export function useLoad<T, A = void>(load: (arg: A) => Promise<T>, arg?: A) {
  const [state, setState] = useState<LoadState<T>>({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true // ignore the result if the page was closed meanwhile
    load(arg as A)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error: Error) => active && setState({ loading: false, data: null, error }))
    return () => {
      active = false
    }
  }, [load, arg])

  // Lets a page update what it shows after a change (e.g. a delete).
  const setData = (data: T) => setState((current) => ({ ...current, data }))

  return { ...state, setData }
}
