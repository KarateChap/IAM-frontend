import { api } from '@/lib/axios'
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolesQueryParams,
  PaginatedResponse,
  AssignPermissionsToRoleRequest
} from '@/types'

interface BackendRolesResponse {
  success: boolean
  count: number
  data: Role[]
}

interface BackendRoleResponse {
  success: boolean
  data: Role
  message?: string
}

interface BackendDeleteResponse {
  success: boolean
  message: string
}

interface BackendAssignmentResponse {
  success: boolean
  message: string
  data: {
    assigned: number
    skipped: number
  }
}

export const rolesService = {
  getRoles: async (params: RolesQueryParams = {}): Promise<PaginatedResponse<Role>> => {
    // Convert frontend params to backend format
    const backendParams = {
      search: params.search,
      limit: params.limit || 1000,
      offset: params.page ? (params.page - 1) * (params.limit || 1000) : 0,
      isActive: params.isActive,
    }
    
    const response = await api.get<BackendRolesResponse>('/roles', { params: backendParams })
    
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

  getRoleById: async (id: number): Promise<Role> => {
    const response = await api.get<BackendRoleResponse>(`/roles/${id}`)
    return response.data.data
  },

  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    const response = await api.post<BackendRoleResponse>('/roles', roleData)
    return response.data.data
  },

  updateRole: async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
    const response = await api.put<BackendRoleResponse>(`/roles/${id}`, roleData)
    return response.data.data
  },

  deleteRole: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/roles/${id}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },

  assignPermissionsToRole: async (roleId: number, data: AssignPermissionsToRoleRequest): Promise<{ success: boolean; message: string; assigned: number; skipped: number }> => {
    const response = await api.post<BackendAssignmentResponse>(`/roles/${roleId}/permissions`, data)
    return {
      success: response.data.success,
      message: response.data.message,
      assigned: response.data.data.assigned,
      skipped: response.data.data.skipped
    }
  },

  removePermissionFromRole: async (roleId: number, permissionId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/roles/${roleId}/permissions/${permissionId}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },
}
