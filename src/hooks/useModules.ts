import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modulesService } from '@/services/modulesService'
import type { CreateModuleRequest, UpdateModuleRequest, ModulesQueryParams } from '@/types'

export const useModules = (params: ModulesQueryParams = {}) => {
  return useQuery({
    queryKey: ['modules', params],
    queryFn: () => modulesService.getModules(params),
  })
}

export const useModule = (id: number) => {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => modulesService.getModuleById(id),
    enabled: !!id,
  })
}

export const useCreateModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateModuleRequest) => modulesService.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export const useUpdateModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModuleRequest }) =>
      modulesService.updateModule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['modules', id] })
    },
  })
}

export const useDeleteModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => modulesService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}
