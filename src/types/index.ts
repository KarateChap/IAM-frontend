// Base types
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

// User types
export interface User extends BaseEntity {
  username: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  groups?: Group[]
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

// Group types
export interface Group extends BaseEntity {
  name: string
  description?: string
  isActive: boolean
  users?: User[]
  roles?: Role[]
}

export interface CreateGroupRequest {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  isActive?: boolean
}

export interface GroupsQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

// Role types
export interface Role extends BaseEntity {
  name: string
  description?: string
  isActive: boolean
  permissions?: Permission[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  isActive?: boolean
}

export interface RolesQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

// Module types
export interface Module extends BaseEntity {
  name: string
  description?: string
  isActive: boolean
  permissions?: Permission[]
}

export interface CreateModuleRequest {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateModuleRequest {
  name?: string
  description?: string
  isActive?: boolean
}

export interface ModulesQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

// Permission types
export interface Permission extends BaseEntity {
  name: string
  description?: string
  action: string
  moduleId: number
  isActive: boolean
  module?: Module
}

export interface CreatePermissionRequest {
  name: string
  description?: string
  action: string
  moduleId: number
  isActive?: boolean
}

export interface UpdatePermissionRequest {
  name?: string
  description?: string
  action?: string
  moduleId?: number
  isActive?: boolean
}

export interface PermissionsQueryParams {
  page?: number
  limit?: number
  search?: string
  moduleId?: number
  isActive?: boolean
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
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

export interface PermissionsResponse {
  permissions: Permission[]
}

export interface SimulateActionRequest {
  userId: number
  moduleId: number
  moduleName: string
  action: string
}

export interface SimulateActionResponse {
  allowed: boolean
  reason?: string
}

// Assignment types
export interface AssignUsersToGroupRequest {
  userIds: number[]
}

export interface AssignRolesToGroupRequest {
  roleIds: number[]
}

export interface AssignPermissionsToRoleRequest {
  permissionIds: number[]
}

export interface AssignPermissionsToUserRequest {
  permissionIds: number[]
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
