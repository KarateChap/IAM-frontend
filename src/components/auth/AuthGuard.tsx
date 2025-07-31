import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useMyPermissions, useTokenValidation } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth)
  
  // Validate token and restore user data if needed
  const tokenValidation = useTokenValidation()
  
  // Fetch permissions using React Query when authenticated
  useMyPermissions()

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  // Show loading while validating token (only if we have token but no user)
  if (isAuthenticated && !user && tokenValidation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
