import { api } from '@/lib/axios'
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionsQueryParams,
  PaginatedResponse,
  AssignPermissionsToUserRequest
} from '@/types'

interface BackendPermissionsResponse {
  success: boolean
  count: number
  data: Permission[]
}

interface BackendPermissionResponse {
  success: boolean
  data: Permission
  message?: string
}

interface BackendDeleteResponse {
  success: boolean
  message: string
}

export const permissionsService = {
  getPermissions: async (params: PermissionsQueryParams = {}): Promise<PaginatedResponse<Permission>> => {
    // Convert frontend params to backend format
    const backendParams = {
      search: params.search,
      limit: params.limit || 1000,
      offset: params.page ? (params.page - 1) * (params.limit || 1000) : 0,
      moduleId: params.moduleId,
      isActive: params.isActive,
    }
    
    const response = await api.get<BackendPermissionsResponse>('/permissions', { params: backendParams })
    
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

  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await api.get<BackendPermissionResponse>(`/permissions/${id}`)
    return response.data.data
  },

  createPermission: async (permissionData: CreatePermissionRequest): Promise<Permission> => {
    const response = await api.post<BackendPermissionResponse>('/permissions', permissionData)
    return response.data.data
  },

  updatePermission: async (id: number, permissionData: UpdatePermissionRequest): Promise<Permission> => {
    const response = await api.put<BackendPermissionResponse>(`/permissions/${id}`, permissionData)
    return response.data.data
  },

  deletePermission: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/permissions/${id}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },

  assignPermissionsToUser: async (userId: number, data: AssignPermissionsToUserRequest): Promise<void> => {
    await api.post(`/users/${userId}/permissions`, data)
  },
}
