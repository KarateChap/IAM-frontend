import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '@/services/rolesService'
import type { CreateRoleRequest, UpdateRoleRequest, RolesQueryParams, AssignPermissionsToRoleRequest } from '@/types'

export const useRoles = (params: RolesQueryParams = {}) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesService.getRoles(params),
  })
}

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesService.getRoleById(id),
    enabled: !!id,
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) =>
      rolesService.updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => rolesService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useAssignPermissionsToRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: AssignPermissionsToRoleRequest }) =>
      rolesService.assignPermissionsToRole(roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] })
    },
  })
}
