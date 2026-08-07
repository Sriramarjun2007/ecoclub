
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Prevent multiple refresh requests
let refreshing = null

// Auto-refresh access token when expired
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config

    const refresh = localStorage.getItem('refresh')

    // No response / no refresh token
    if (
      error.response?.status !== 401 ||
      !refresh ||
      original?._retry
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      // If another request is already refreshing, wait for it
      refreshing =
        refreshing ||
        axios
          .post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          })
          .then((response) => {
            const newAccess = response.data.access

            localStorage.setItem('access', newAccess)

            // Some JWT configurations rotate the refresh token
            if (response.data.refresh) {
              localStorage.setItem('refresh', response.data.refresh)
            }

            return newAccess
          })
          .finally(() => {
            refreshing = null
          })

      const newAccessToken = await refreshing

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${newAccessToken}`

      return api(original)
    } catch (refreshError) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')

      window.location.href = '/login'

      return Promise.reject(refreshError)
    }
  }
)

export default api

