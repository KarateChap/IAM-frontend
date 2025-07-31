import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { hasPagePermission } from '@/utils/permissions'

interface PermissionGuardProps {
  children: React.ReactNode
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const location = useLocation()
  const { permissions } = useSelector((state: RootState) => state.auth)
  
  // Check if user has permission to access current page
  const hasAccess = hasPagePermission(permissions, location.pathname)
  
  if (!hasAccess) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
