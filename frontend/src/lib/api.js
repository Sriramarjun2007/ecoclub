
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || '/api'

const ACCESS_KEY = 'access'
const REFRESH_KEY = 'refresh'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// ATTACH JWT ACCESS TOKEN
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
// PREVENT MULTIPLE REFRESH REQUESTS
// ============================================================

let refreshing = null

// ============================================================
// AUTO REFRESH ACCESS TOKEN
// ============================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config

    // --------------------------------------------------------
    // Only handle 401
    // --------------------------------------------------------

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry
    ) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem(REFRESH_KEY)

    // --------------------------------------------------------
    // No refresh token
    // --------------------------------------------------------

    if (!refresh) {
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)

      return Promise.reject(error)
    }

    original._retry = true

    try {
      // ------------------------------------------------------
      // If another request is already refreshing,
      // wait for that request.
      // ------------------------------------------------------

      refreshing =
        refreshing ||
        axios
          .post(
            `${API_URL}/auth/token/refresh/`,
            {
              refresh,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
          .then((response) => {
            const newAccess =
              response.data.access

            if (!newAccess) {
              throw new Error(
                'No access token returned from refresh endpoint'
              )
            }

            localStorage.setItem(
              ACCESS_KEY,
              newAccess
            )

            // Some JWT configurations rotate
            // the refresh token.
            if (response.data.refresh) {
              localStorage.setItem(
                REFRESH_KEY,
                response.data.refresh
              )
            }

            return newAccess
          })
          .finally(() => {
            refreshing = null
          })

      const newAccessToken =
        await refreshing

      // ------------------------------------------------------
      // Retry original request
      // ------------------------------------------------------

      original.headers =
        original.headers || {}

      original.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(original)

    } catch (refreshError) {

      // ------------------------------------------------------
      // Refresh failed → logout
      // ------------------------------------------------------

      localStorage.removeItem(
        ACCESS_KEY
      )

      localStorage.removeItem(
        REFRESH_KEY
      )

      localStorage.removeItem(
        'user'
      )

      localStorage.removeItem(
        'cb_access'
      )

      localStorage.removeItem(
        'cb_refresh'
      )

      window.location.href =
        '/login'

      return Promise.reject(
        refreshError
      )
    }
  }
)

export default api

