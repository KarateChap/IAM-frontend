import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { authService } from '@/services/authService'
import type {
  LoginRequest,
  RegisterRequest,
  SimulateActionRequest
} from '@/types'
import { setCredentials, setPermissions, logout } from '@/store/slices/authSlice'

export const useLogin = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }))
    },
  })
}

export const useRegister = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }))
    },
  })
}

export const useMyPermissions = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const query = useQuery({
    queryKey: ['permissions', 'me'],
    queryFn: authService.getMyPermissions,
    enabled: isAuthenticated, // Only run when authenticated
  })

  // Use useEffect to dispatch when data changes
  React.useEffect(() => {
    if (query.data) {
      dispatch(setPermissions(query.data))
    }
  }, [query.data, dispatch])

  return query
}

export const useSimulateAction = () => {
  return useMutation({
    mutationFn: (data: SimulateActionRequest) => authService.simulateAction(data),
  })
}

export const useLogout = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return () => {
    dispatch(logout())
    queryClient.clear()
    window.location.href = '/login'
  }
}

// Hook to validate token on app startup
export const useTokenValidation = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const query = useQuery({
    queryKey: ['validateToken'],
    queryFn: authService.validateToken,
    enabled: isAuthenticated && !user, // Only run if authenticated but no user data
    retry: false,
    refetchOnWindowFocus: false,
  })

  // Handle success/error using useEffect
  React.useEffect(() => {
    if (query.isSuccess) {
      if (query.data) {
        dispatch(setCredentials({ user: query.data.user, token: query.data.token }))
      } else {
        dispatch(logout())
      }
    }
    if (query.isError) {
      dispatch(logout())
    }
  }, [query.isSuccess, query.isError, query.data, dispatch])

  return query
}
