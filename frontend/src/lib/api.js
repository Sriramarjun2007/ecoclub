
import axios from 'axios'

// ============================================================
// API URL
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://ecoclub-3q19.onrender.com/api'
).replace(/\/+$/, '')

// ============================================================
// STORAGE KEYS
// ============================================================

const ACCESS_KEY = 'ecoclub_access'
const REFRESH_KEY = 'ecoclub_refresh'
const USER_KEY = 'ecoclub_user'

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_KEY)

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ============================================================
// TOKEN REFRESH STATE
// ============================================================

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => {
    callback(token)
  })

  refreshSubscribers = []
}

// ============================================================
// LOGOUT
// ============================================================

const logout = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    const url = originalRequest?.url || ''

    // ----------------------------------------------------------
    // Never refresh these endpoints
    // ----------------------------------------------------------

    if (
      url.includes('/auth/login/') ||
      url.includes('/auth/token/') ||
      url.includes('/auth/token/refresh/') ||
      url.includes('/auth/refresh/')
    ) {
      return Promise.reject(error)
    }

    // ----------------------------------------------------------
    // Only handle 401
    // ----------------------------------------------------------

    if (
      error.response.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken =
      localStorage.getItem(REFRESH_KEY)

    // ----------------------------------------------------------
    // No refresh token
    // ----------------------------------------------------------

    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    // ----------------------------------------------------------
    // Another request is already refreshing
    // ----------------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error)
            return
          }

          originalRequest.headers =
            originalRequest.headers || {}

          originalRequest.headers.Authorization =
            `Bearer ${token}`

          resolve(api(originalRequest))
        })
      })
    }

    // ----------------------------------------------------------
    // Refresh token
    // ----------------------------------------------------------

    isRefreshing = true

    try {
      const refreshResponse = await axios.post(
        `${API_URL}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const newAccessToken =
        refreshResponse.data?.access

      if (!newAccessToken) {
        throw new Error(
          'Refresh succeeded but no access token was returned.'
        )
      }

      // Save new token
      localStorage.setItem(
        ACCESS_KEY,
        newAccessToken
      )

      // Notify waiting requests
      onRefreshed(newAccessToken)

      // Retry original request
      originalRequest.headers =
        originalRequest.headers || {}

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)

    } catch (refreshError) {
      onRefreshed(null)

      logout()

      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

// ============================================================
// EXPORT
// ============================================================

export default api

export {
  API_URL,
  ACCESS_KEY,
  REFRESH_KEY,
  USER_KEY,
}

