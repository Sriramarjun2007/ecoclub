import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/settings/').then(r => setSettings(r.data)).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const s = (key, fallback = '') => settings[key] || fallback

  return (
    <SettingsContext.Provider value={{ settings, s, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)