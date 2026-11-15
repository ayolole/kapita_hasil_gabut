import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook ringkas untuk mengambil data API beserta status loading/error.
 * `deps` menentukan kapan data diambil ulang.
 */
export function useApiResource(fetcher, deps = []) {
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    setState((previous) => ({ ...previous, loading: true, error: null }))

    fetcherRef
      .current()
      .then((response) => {
        if (active) {
          setState({ data: response.data, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (active) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  return { ...state, reload }
}
