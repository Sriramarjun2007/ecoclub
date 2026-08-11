
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../lib/api'

const AuthContext = createContext(null)

const ACCESS_KEY = 'access'
const REFRESH_KEY = 'refresh'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ============================================================
  // RESTORE LOGIN SESSION
  // ============================================================

  useEffect(() => {
    const restoreSession = async () => {
      const access = localStorage.getItem(
        ACCESS_KEY
      )

      const refresh = localStorage.getItem(
        REFRESH_KEY
      )

      // No tokens
      if (!access && !refresh) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get(
          '/auth/me/'
        )

        setUser(response.data)

      } catch (error) {
        console.error(
          'Auth restore failed:',
          error.response?.data || error
        )

        localStorage.removeItem(
          ACCESS_KEY
        )

        localStorage.removeItem(
          REFRESH_KEY
        )

        setUser(null)

      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (
    username,
    password
  ) => {
    const response = await api.post(
      '/auth/login/',
      {
        username,
        password,
      }
    )

    console.log(
      'LOGIN RESPONSE:',
      response.data
    )

    // ----------------------------------------------------------
    // Support:
    //
    // {
    //   access: "...",
    //   refresh: "..."
    // }
    //
    // OR:
    //
    // {
    //   tokens: {
    //     access: "...",
    //     refresh: "..."
    //   }
    // }
    // ----------------------------------------------------------

    const access =
      response.data?.access ||
      response.data?.tokens?.access

    const refresh =
      response.data?.refresh ||
      response.data?.tokens?.refresh

    if (!access) {
      console.error(
        'No access token returned:',
        response.data
      )

      throw new Error(
        'Login response does not contain an access token.'
      )
    }

    // ----------------------------------------------------------
    // SAVE ACCESS TOKEN
    // ----------------------------------------------------------

    localStorage.setItem(
      ACCESS_KEY,
      access
    )

    // ----------------------------------------------------------
    // SAVE REFRESH TOKEN
    // ----------------------------------------------------------

    if (refresh) {
      localStorage.setItem(
        REFRESH_KEY,
        refresh
      )
    }

    // ----------------------------------------------------------
    // Verify authenticated user
    // ----------------------------------------------------------

    const me = await api.get(
      '/auth/me/'
    )

    console.log(
      'AUTHENTICATED USER:',
      me.data
    )

    setUser(me.data)

    return me.data
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    const refresh =
      localStorage.getItem(
        REFRESH_KEY
      )

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

    localStorage.removeItem(
      ACCESS_KEY
    )

    localStorage.removeItem(
      REFRESH_KEY
    )

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

// ============================================================
// HOOK
// ============================================================

export const useAuth = () =>
  useContext(AuthContext)

