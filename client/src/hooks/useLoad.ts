import { useEffect, useState } from 'react'

interface LoadState<T> {
  loading: boolean
  data: T | null
  error: Error | null
}

export function useLoad<T, A = void>(load: (arg: A) => Promise<T>, arg?: A) {
  const [state, setState] = useState<LoadState<T>>({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true
    load(arg as A)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error: Error) => active && setState({ loading: false, data: null, error }))
    return () => {
      active = false
    }
  }, [load, arg])

  const setData = (data: T) => setState((current) => ({ ...current, data }))

  return { ...state, setData }
}
