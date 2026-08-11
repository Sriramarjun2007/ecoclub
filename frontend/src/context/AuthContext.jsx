import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api, {
  ACCESS_KEY,
  REFRESH_KEY,
} from '../lib/api'

const USER_KEY = 'ecoclub_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /*
  |--------------------------------------------------------------------------
  | Load logged-in user
  |--------------------------------------------------------------------------
  */
  const loadUser = async () => {
    const accessToken =
      localStorage.getItem(ACCESS_KEY)

    if (!accessToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me/')

      const userData = response.data

      setUser(userData)

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(userData)
      )

    } catch (error) {
      console.error(
        'GET /auth/me/ failed:',
        error.response?.data || error
      )

      /*
      |--------------------------------------------------------------------------
      | Try cached user only if available
      |--------------------------------------------------------------------------
      */
      const cachedUser =
        localStorage.getItem(USER_KEY)

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser))
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }

    } finally {
      setLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initial authentication
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    loadUser()
  }, [])

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */
  const login = async (username, password) => {
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

    const access =
      response.data?.access

    const refresh =
      response.data?.refresh

    if (!access || !refresh) {
      throw new Error(
        'Login response did not contain JWT tokens.'
      )
    }

    /*
    |--------------------------------------------------------------------------
    | VERY IMPORTANT
    |--------------------------------------------------------------------------
    | Save tokens BEFORE calling /auth/me/
    */
    localStorage.setItem(
      ACCESS_KEY,
      access
    )

    localStorage.setItem(
      REFRESH_KEY,
      refresh
    )

    /*
    |--------------------------------------------------------------------------
    | Get current user
    |--------------------------------------------------------------------------
    */
    try {
      const meResponse =
        await api.get('/auth/me/')

      const userData =
        meResponse.data

      setUser(userData)

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(userData)
      )

      return userData

    } catch (error) {
      console.error(
        'GET /auth/me/ after login failed:',
        error.response?.data || error
      )

      /*
      |--------------------------------------------------------------------------
      | Do NOT immediately delete valid JWTs here.
      |--------------------------------------------------------------------------
      */
      throw error
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  const logout = () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)

    setUser(null)
  }

  /*
  |--------------------------------------------------------------------------
  | REFRESH USER
  |--------------------------------------------------------------------------
  */
  const refreshUser = async () => {
    try {
      const response =
        await api.get('/auth/me/')

      const userData =
        response.data

      setUser(userData)

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(userData)
      )

      return userData

    } catch (error) {
      console.error(
        'refreshUser error:',
        error.response?.data || error
      )

      throw error
    }
  }

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