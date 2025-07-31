import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, Permission } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
}

// Helper functions for localStorage
const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const getStoredPermissions = (): Permission[] => {
  try {
    const storedPermissions = localStorage.getItem('permissions')
    return storedPermissions ? JSON.parse(storedPermissions) : []
  } catch {
    return []
  }
}

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  permissions: getStoredPermissions(),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      // Persist to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload
      // Persist permissions to localStorage
      localStorage.setItem('permissions', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.permissions = []
      state.isAuthenticated = false
      // Clear all auth data from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    // Action to restore user data from localStorage (for page refresh)
    restoreAuth: (state) => {
      const storedUser = getStoredUser()
      const storedToken = localStorage.getItem('token')
      const storedPermissions = getStoredPermissions()
      
      if (storedUser && storedToken) {
        state.user = storedUser
        state.token = storedToken
        state.permissions = storedPermissions
        state.isAuthenticated = true
      }
    },
  },
})

export const { setCredentials, setPermissions, logout, setLoading, restoreAuth } = authSlice.actions
export const login = setCredentials // Alias for backward compatibility
export default authSlice.reducer
