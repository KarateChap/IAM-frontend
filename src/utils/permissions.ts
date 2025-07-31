import type { Permission } from '@/types'

// Define the module-action mappings for each page
export const PAGE_PERMISSIONS = {
  '/dashboard': [], // Dashboard is always accessible
  '/users': [{ module: 'Users', action: 'read' }],
  '/groups': [{ module: 'Groups', action: 'read' }],
  '/roles': [{ module: 'Roles', action: 'read' }],
  '/modules': [{ module: 'Modules', action: 'read' }],
  '/permissions': [{ module: 'Permissions', action: 'read' }],
} as const

export type PagePath = keyof typeof PAGE_PERMISSIONS

/**
 * Check if user has permission for a specific module and action
 */
export function hasPermission(
  permissions: Permission[],
  module: string,
  action: string
): boolean {
  return permissions.some(
    (permission) =>
      permission.module?.name === module &&
      permission.action === action &&
      permission.isActive
  )
}

/**
 * Check if user has create permission for a module
 */
export function canCreate(permissions: Permission[], module: string): boolean {
  return hasPermission(permissions, module, 'create')
}

/**
 * Check if user has read permission for a module
 */
export function canRead(permissions: Permission[], module: string): boolean {
  return hasPermission(permissions, module, 'read')
}

/**
 * Check if user has update permission for a module
 */
export function canUpdate(permissions: Permission[], module: string): boolean {
  return hasPermission(permissions, module, 'update')
}

/**
 * Check if user has delete permission for a module
 */
export function canDelete(permissions: Permission[], module: string): boolean {
  return hasPermission(permissions, module, 'delete')
}

/**
 * Check if user has any of the required permissions for a page
 */
export function hasPagePermission(
  permissions: Permission[],
  pagePath: string
): boolean {
  const requiredPermissions = PAGE_PERMISSIONS[pagePath as PagePath]
  
  // Dashboard is always accessible
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  // Check if user has at least one of the required permissions
  return requiredPermissions.some(({ module, action }) =>
    hasPermission(permissions, module, action)
  )
}

/**
 * Get list of accessible pages for the user based on their permissions
 */
export function getAccessiblePages(permissions: Permission[]): PagePath[] {
  return Object.keys(PAGE_PERMISSIONS).filter((pagePath) =>
    hasPagePermission(permissions, pagePath)
  ) as PagePath[]
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions<T extends { href: string }>(
  navigationItems: T[],
  permissions: Permission[]
): T[] {
  return navigationItems.filter((item) =>
    hasPagePermission(permissions, item.href)
  )
}
