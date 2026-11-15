import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const SettingsContext = createContext({
  settings: null,
  loading: true,
  error: null,
})

export function SettingsProvider({ children }) {
  const [state, setState] = useState({
    settings: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true

    api
      .get('/api/settings/public')
      .then((response) => {
        if (active) {
          setState({
            settings: response.data?.data ?? null,
            loading: false,
            error: null,
          })
        }
      })
      .catch((error) => {
        if (active) {
          setState({ settings: null, loading: false, error })
        }
      })

    return () => {
      active = false
    }
  }, [])

  return <SettingsContext.Provider value={state}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
