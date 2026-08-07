import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401 (token expired)
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const refresh = localStorage.getItem('refresh')
    if (error.response?.status === 401 && refresh && !original._retry) {
      original._retry = true
      try {
        refreshing = refreshing || axios.post('/api/auth/token/refresh/', { refresh }).then(r => {
          localStorage.setItem('access', r.data.access)
          if (r.data.refresh) localStorage.setItem('refresh', r.data.refresh)
          return r.data.access
        }).finally(() => { refreshing = null })
        const token = await refreshing
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (e) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  },
)

export default api