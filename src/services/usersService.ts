import { api } from '@/lib/axios'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
  PaginatedResponse
} from '@/types'

interface BackendUsersResponse {
  success: boolean
  count: number
  data: User[]
}

interface BackendUserResponse {
  success: boolean
  data: User
  message?: string
}

interface BackendDeleteResponse {
  success: boolean
  message: string
}

export const usersService = {
  getUsers: async (params: UsersQueryParams = {}): Promise<PaginatedResponse<User>> => {
    // Convert frontend params to backend format
    const backendParams = {
      search: params.search,
      limit: params.limit || 1000,
      offset: params.page ? (params.page - 1) * (params.limit || 1000) : 0,
      isActive: params.isActive,
    }
    
    const response = await api.get<BackendUsersResponse>('/users', { params: backendParams })
    
    // Convert backend response to frontend format
    const limit = backendParams.limit
    const total = response.data.count
    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.floor(backendParams.offset / limit) + 1
    
    return {
      data: response.data.data,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages
      }
    }
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<BackendUserResponse>(`/users/${id}`)
    return response.data.data
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<BackendUserResponse>('/users', userData)
    return response.data.data
  },

  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await api.put<BackendUserResponse>(`/users/${id}`, userData)
    return response.data.data
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/users/${id}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },
}
