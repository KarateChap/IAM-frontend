import { api } from '@/lib/axios'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Permission,
  SimulateActionRequest,
  SimulateActionResponse
} from '@/types'

interface BackendAuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      username: string
      email: string
      firstName?: string
      lastName?: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
    token: string
  }
}

interface BackendPermissionsResponse {
  success: boolean
  count: number
  data: Permission[]
}

interface BackendSimulateActionResponse {
  success: boolean
  data: {
    userId: number
    moduleId: number
    moduleName: string
    action: string
    hasPermission: boolean
  }
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/auth/login', credentials)
    return response.data.data // Extract data from nested response
  },

  // Validate current token and get user info
  validateToken: async (): Promise<AuthResponse | null> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      
      // Try to fetch user permissions to validate token
      const response = await api.get<BackendPermissionsResponse>('/me/permissions')
      
      // If successful, return stored user data
      const storedUser = localStorage.getItem('user')
      if (storedUser && response.data.success) {
        return {
          user: JSON.parse(storedUser),
          token
        }
      }
      return null
    } catch {
      // Token is invalid, clear storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      return null
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/auth/register', userData)
    return response.data.data // Extract data from nested response
  },

  getMyPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<BackendPermissionsResponse>('/me/permissions')
    return response.data.data // Extract permissions array
  },

  simulateAction: async (data: SimulateActionRequest): Promise<SimulateActionResponse> => {
    const response = await api.post<BackendSimulateActionResponse>('/simulate-action', data)
    // Use the module name from the frontend request instead of backend response
    const moduleName = data.moduleName || response.data.data.moduleName || 'unknown'
    return {
      allowed: response.data.data.hasPermission,
      reason: response.data.data.hasPermission ? undefined : `No ${data.action} permission for ${moduleName} module`
    }
  },
}
