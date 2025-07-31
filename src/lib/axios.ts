import axios from 'axios'
import { store } from '@/store'

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page and not a login attempt
      const isLoginPage = window.location.pathname === '/login'
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      
      if (!isLoginPage && !isLoginRequest) {
        // Handle unauthorized - dispatch logout action
        store.dispatch({ type: 'auth/logout' })
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
