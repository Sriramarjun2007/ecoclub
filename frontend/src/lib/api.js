import axios from 'axios'

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://ecoclub-3q19.onrender.com/api'
).replace(/\/+$/, '')

const ACCESS_KEY = 'ecoclub_access'
const REFRESH_KEY = 'ecoclub_refresh'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
| Always attach the current access token.
*/
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

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
| If access token expires, try refresh token once.
*/
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const logout = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem('ecoclub_user')
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    /*
    |--------------------------------------------------------------------------
    | Do not refresh these endpoints
    |--------------------------------------------------------------------------
    */
    const url = originalRequest?.url || ''

    if (
      url.includes('/auth/login/') ||
      url.includes('/auth/token/') ||
      url.includes('/auth/refresh/')
    ) {
      return Promise.reject(error)
    }

    /*
    |--------------------------------------------------------------------------
    | Only refresh on 401
    |--------------------------------------------------------------------------
    */
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem(REFRESH_KEY)

      if (!refreshToken) {
        logout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(error)
              return
            }

            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`

            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        )

        const newAccessToken =
          refreshResponse.data?.access

        if (!newAccessToken) {
          throw new Error('No access token returned')
        }

        localStorage.setItem(
          ACCESS_KEY,
          newAccessToken
        )

        onRefreshed(newAccessToken)

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

    return Promise.reject(error)
  }
)

export default api

export {
  ACCESS_KEY,
  REFRESH_KEY,
}