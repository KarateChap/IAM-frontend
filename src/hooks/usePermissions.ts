import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionsService } from '@/services/permissionsService'
import type { CreatePermissionRequest, UpdatePermissionRequest, PermissionsQueryParams, AssignPermissionsToUserRequest } from '@/types'

export const usePermissions = (params: PermissionsQueryParams = {}) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionsService.getPermissions(params),
  })
}

export const usePermission = (id: number) => {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => permissionsService.getPermissionById(id),
    enabled: !!id,
  })
}

export const useCreatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePermissionRequest) => permissionsService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export const useUpdatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionRequest }) =>
      permissionsService.updatePermission(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissions', id] })
    },
  })
}

export const useDeletePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => permissionsService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export const useAssignPermissionsToUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AssignPermissionsToUserRequest }) =>
      permissionsService.assignPermissionsToUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
      queryClient.invalidateQueries({ queryKey: ['permissions', 'me'] })
    },
  })
}
