import axios from 'axios'

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

const ACCESS_KEY = 'cb_access'
const REFRESH_KEY = 'cb_refresh'

const api = axios.create({
  baseURL: API_URL,

  headers: {
    'Content-Type': 'application/json',
  },
})


/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
  (config) => {

    const url = config.url || ''

    /*
     * PUBLIC EVENT REGISTRATION
     *
     * Do NOT send JWT.
     */
    const isPublicRegistration =
      url.includes('/events/') &&
      url.includes('/register/')

    if (!isPublicRegistration) {

      const token =
        localStorage.getItem(ACCESS_KEY)

      if (token) {

        config.headers = config.headers || {}

        config.headers.Authorization =
          `Bearer ${token}`
      }
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)


/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config

    /*
     * Never refresh token for public registration.
     */
    if (
      originalRequest?.url?.includes('/events/') &&
      originalRequest?.url?.includes('/register/')
    ) {
      return Promise.reject(error)
    }

    /*
     * Only refresh on 401.
     */
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true

      const refreshToken =
        localStorage.getItem(REFRESH_KEY)

      if (!refreshToken) {
        return Promise.reject(error)
      }

      try {

        const refreshResponse =
          await axios.post(
            `${API_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          )

        const newAccessToken =
          refreshResponse.data.access

        if (!newAccessToken) {
          throw new Error(
            'No access token returned.'
          )
        }

        localStorage.setItem(
          ACCESS_KEY,
          newAccessToken
        )

        originalRequest.headers =
          originalRequest.headers || {}

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return api(originalRequest)

      } catch (refreshError) {

        localStorage.removeItem(
          ACCESS_KEY
        )

        localStorage.removeItem(
          REFRESH_KEY
        )

        return Promise.reject(
          refreshError
        )
      }
    }

    return Promise.reject(error)
  }
)

export default api