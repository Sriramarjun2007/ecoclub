import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ============================================================
  // RESTORE LOGIN SESSION
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem('access')

    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me/')
      .then((r) => {
        setUser(r.data)
      })
      .catch((error) => {
        console.error(
          'Auth restore failed:',
          error.response?.data || error
        )

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (username, password) => {
    const r = await api.post('/auth/login/', {
      username,
      password,
    })

    console.log('LOGIN RESPONSE:', r.data)

    // ----------------------------------------------------------
    // Support both:
    //
    // {
    //   access: "...",
    //   refresh: "..."
    // }
    //
    // and:
    //
    // {
    //   tokens: {
    //     access: "...",
    //     refresh: "..."
    //   }
    // }
    // ----------------------------------------------------------

    const access =
      r.data?.access ||
      r.data?.tokens?.access

    const refresh =
      r.data?.refresh ||
      r.data?.tokens?.refresh

    if (!access) {
      console.error(
        'Login succeeded but no access token was returned:',
        r.data
      )

      throw new Error(
        'Login response does not contain an access token.'
      )
    }

    // ----------------------------------------------------------
    // SAVE TOKENS
    // ----------------------------------------------------------

    localStorage.setItem(
      'access',
      access
    )

    if (refresh) {
      localStorage.setItem(
        'refresh',
        refresh
      )
    }

    // ----------------------------------------------------------
    // GET CURRENT USER
    // ----------------------------------------------------------

    const me = await api.get('/auth/me/')

    setUser(me.data)

    return me.data
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    const refresh =
      localStorage.getItem('refresh')

    try {
      if (refresh) {
        await api.post(
          '/auth/logout/',
          {
            refresh,
          }
        )
      }
    } catch (error) {
      console.error(
        'Logout API error:',
        error.response?.data || error
      )
    }

    localStorage.removeItem('access')
    localStorage.removeItem('refresh')

    setUser(null)
  }

  // ============================================================
  // ADMIN CHECK
  // ============================================================

  const isAdmin = () => {
    return (
      user?.user?.role === 'admin' ||
      user?.role === 'admin' ||
      user?.user?.is_staff === true ||
      user?.is_staff === true
    )
  }

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)