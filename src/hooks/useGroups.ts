import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/services/groupsService'
import type { CreateGroupRequest, UpdateGroupRequest, GroupsQueryParams } from '@/types'

export const useGroups = (params: GroupsQueryParams = {}) => {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => groupsService.getGroups(params),
  })
}

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsService.getGroupById(id),
    enabled: !!id,
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupsService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGroupRequest }) =>
      groupsService.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', id] })
    },
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => groupsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useAssignUsersToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, userIds }: { groupId: number; userIds: number[] }) =>
      groupsService.assignUsersToGroup(groupId, { userIds }),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useAssignRolesToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, roleIds }: { groupId: number; roleIds: number[] }) =>
      groupsService.assignRolesToGroup(groupId, { roleIds }),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useRemoveUserFromGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      groupsService.removeUserFromGroup(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useRemoveRoleFromGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, roleId }: { groupId: number; roleId: number }) =>
      groupsService.removeRoleFromGroup(groupId, roleId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}
