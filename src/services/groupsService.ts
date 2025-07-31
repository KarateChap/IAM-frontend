import { api } from '@/lib/axios'
import type {
  Group,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupsQueryParams,
  PaginatedResponse,
  AssignUsersToGroupRequest,
  AssignRolesToGroupRequest
} from '@/types'

interface BackendGroupsResponse {
  success: boolean
  count: number
  data: Group[]
}

interface BackendGroupResponse {
  success: boolean
  data: Group
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

export const groupsService = {
  getGroups: async (params: GroupsQueryParams = {}): Promise<PaginatedResponse<Group>> => {
    // Convert frontend params to backend format
    const backendParams = {
      search: params.search,
      limit: params.limit || 1000,
      offset: params.page ? (params.page - 1) * (params.limit || 1000) : 0,
      isActive: params.isActive,
    }
    
    const response = await api.get<BackendGroupsResponse>('/groups', { params: backendParams })
    
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

  getGroupById: async (id: number): Promise<Group> => {
    const response = await api.get<BackendGroupResponse>(`/groups/${id}`)
    return response.data.data
  },

  createGroup: async (groupData: CreateGroupRequest): Promise<Group> => {
    const response = await api.post<BackendGroupResponse>('/groups', groupData)
    return response.data.data
  },

  updateGroup: async (id: number, groupData: UpdateGroupRequest): Promise<Group> => {
    const response = await api.put<BackendGroupResponse>(`/groups/${id}`, groupData)
    return response.data.data
  },

  deleteGroup: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/groups/${id}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },

  assignUsersToGroup: async (groupId: number, data: AssignUsersToGroupRequest): Promise<{ success: boolean; message: string; assigned: number; skipped: number }> => {
    const response = await api.post<BackendAssignmentResponse>(`/groups/${groupId}/users`, data)
    return {
      success: response.data.success,
      message: response.data.message,
      assigned: response.data.data.assigned,
      skipped: response.data.data.skipped
    }
  },

  assignRolesToGroup: async (groupId: number, data: AssignRolesToGroupRequest): Promise<{ success: boolean; message: string; assigned: number; skipped: number }> => {
    const response = await api.post<BackendAssignmentResponse>(`/groups/${groupId}/roles`, data)
    return {
      success: response.data.success,
      message: response.data.message,
      assigned: response.data.data.assigned,
      skipped: response.data.data.skipped
    }
  },

  removeUserFromGroup: async (groupId: number, userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/groups/${groupId}/users/${userId}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },

  removeRoleFromGroup: async (groupId: number, roleId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/groups/${groupId}/roles/${roleId}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },
}
