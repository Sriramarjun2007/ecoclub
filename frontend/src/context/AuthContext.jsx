
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api, {
  ACCESS_KEY,
  REFRESH_KEY,
  USER_KEY,
} from '../lib/api'

// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null)

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================================
  // SAVE USER
  // ==========================================================

  const saveUser = (userData) => {
    setUser(userData)

    if (userData) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(userData)
      )
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  // ==========================================================
  // LOAD USER
  // ==========================================================

  const loadUser = async () => {
    const accessToken =
      localStorage.getItem(ACCESS_KEY)

    const refreshToken =
      localStorage.getItem(REFRESH_KEY)

    // --------------------------------------------------------
    // No tokens = logged out
    // --------------------------------------------------------

    if (!accessToken && !refreshToken) {
      saveUser(null)
      setLoading(false)
      return
    }

    // --------------------------------------------------------
    // Try /auth/me/
    //
    // api.js automatically:
    // Authorization: Bearer <access_token>
    //
    // If access token expired, api.js attempts refresh.
    // --------------------------------------------------------

    try {
      const response =
        await api.get('/auth/me/')

      const userData =
        response.data

      console.log(
        'AUTH RESTORED:',
        userData
      )

      saveUser(userData)

    } catch (error) {
      console.error(
        'Auth restore failed:',
        error?.response?.data || error
      )

      // ------------------------------------------------------
      // Do NOT trust cached user when JWT authentication
      // failed with an invalid/expired token.
      // ------------------------------------------------------

      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem(
          ACCESS_KEY
        )

        localStorage.removeItem(
          REFRESH_KEY
        )

        localStorage.removeItem(
          USER_KEY
        )

        setUser(null)

      } else {
        // ----------------------------------------------------
        // Network/server error.
        //
        // Keep cached user temporarily if available.
        // ----------------------------------------------------

        const cachedUser =
          localStorage.getItem(USER_KEY)

        if (cachedUser) {
          try {
            setUser(
              JSON.parse(cachedUser)
            )
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }

    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // INITIAL AUTH RESTORE
  // ==========================================================

  useEffect(() => {
    let mounted = true

    const restore = async () => {
      if (!mounted) {
        return
      }

      await loadUser()
    }

    restore()

    return () => {
      mounted = false
    }
  }, [])

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    username,
    password
  ) => {
    // --------------------------------------------------------
    // Login request
    // --------------------------------------------------------

    const response =
      await api.post(
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

    // --------------------------------------------------------
    // Get JWT tokens
    // --------------------------------------------------------

    const access =
      response.data?.access

    const refresh =
      response.data?.refresh

    if (!access) {
      throw new Error(
        'Login response did not contain an access token.'
      )
    }

    if (!refresh) {
      throw new Error(
        'Login response did not contain a refresh token.'
      )
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // Save tokens BEFORE /auth/me/
    // --------------------------------------------------------

    localStorage.setItem(
      ACCESS_KEY,
      access
    )

    localStorage.setItem(
      REFRESH_KEY,
      refresh
    )

    // --------------------------------------------------------
    // Verify authenticated user
    // --------------------------------------------------------

    try {
      const meResponse =
        await api.get('/auth/me/')

      const userData =
        meResponse.data

      console.log(
        'AUTH ME RESPONSE:',
        userData
      )

      saveUser(userData)

      return userData

    } catch (error) {
      console.error(
        'Auth /me failed after login:',
        error?.response?.data || error
      )

      // ------------------------------------------------------
      // Do NOT keep a broken authentication state.
      // ------------------------------------------------------

      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem(
          ACCESS_KEY
        )

        localStorage.removeItem(
          REFRESH_KEY
        )

        localStorage.removeItem(
          USER_KEY
        )

        setUser(null)
      }

      throw error
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem(
      ACCESS_KEY
    )

    localStorage.removeItem(
      REFRESH_KEY
    )

    localStorage.removeItem(
      USER_KEY
    )

    setUser(null)
  }

  // ==========================================================
  // REFRESH USER
  // ==========================================================

  const refreshUser = async () => {
    try {
      const response =
        await api.get('/auth/me/')

      const userData =
        response.data

      saveUser(userData)

      return userData

    } catch (error) {
      console.error(
        'refreshUser error:',
        error?.response?.data || error
      )

      if (
        error?.response?.status === 401
      ) {
        logout()
      }

      throw error
    }
  }

  // ==========================================================
  // CONTEXT
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}

