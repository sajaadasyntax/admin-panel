import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gwsudan.xyz'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors and API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      }
    } else if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url)
      // You might want to show a user-friendly message here
    }
    return Promise.reject(error)
  }
)

export default api
