import { api } from '@/lib/axios'
import type {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  ModulesQueryParams,
  PaginatedResponse
} from '@/types'

interface BackendModulesResponse {
  success: boolean
  count: number
  data: Module[]
}

interface BackendModuleResponse {
  success: boolean
  data: Module
  message?: string
}

interface BackendDeleteResponse {
  success: boolean
  message: string
}

export const modulesService = {
  getModules: async (params: ModulesQueryParams = {}): Promise<PaginatedResponse<Module>> => {
    // Convert frontend params to backend format
    const backendParams = {
      search: params.search,
      limit: params.limit || 1000,
      offset: params.page ? (params.page - 1) * (params.limit || 1000) : 0,
      isActive: params.isActive,
    }
    
    const response = await api.get<BackendModulesResponse>('/modules', { params: backendParams })
    
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

  getModuleById: async (id: number): Promise<Module> => {
    const response = await api.get<BackendModuleResponse>(`/modules/${id}`)
    return response.data.data
  },

  createModule: async (moduleData: CreateModuleRequest): Promise<Module> => {
    const response = await api.post<BackendModuleResponse>('/modules', moduleData)
    return response.data.data
  },

  updateModule: async (id: number, moduleData: UpdateModuleRequest): Promise<Module> => {
    const response = await api.put<BackendModuleResponse>(`/modules/${id}`, moduleData)
    return response.data.data
  },

  deleteModule: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<BackendDeleteResponse>(`/modules/${id}`)
    return {
      success: response.data.success,
      message: response.data.message
    }
  },
}
