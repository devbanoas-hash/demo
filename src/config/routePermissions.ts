/**
 * Route Permissions Configuration for Vani Bakery
 * 
 * Defines which roles can access which routes.
 * Admin role always has access to all routes.
 */

export const ADMIN_ROLE = 'Admin';

export interface RoutePermission {
  path: string;
  allowedRoles: string[];
  description?: string;
}

/**
 * Route permissions configuration for Vani Bakery
 * Admin can access all routes automatically
 * 
 * Roles:
 * - admin: Quản trị viên (full access)
 * - sales: Nhân viên bán hàng
 * - shipper: Người giao hàng
 * - kitchen_lead: Quản lý bếp
 * - kitchen_staff: Nhân viên bếp
 */
export const routePermissions: RoutePermission[] = [
  {
    path: '/',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager', 'Front_Desk_Clerk'],
    description: 'Dashboard chính',
  },
  {
    path: '/orders',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager', 'Front_Desk_Clerk'],
    description: 'Quản lý đơn hàng',
  },
  {
    path: '/production',
    allowedRoles: [ADMIN_ROLE, 'Production_Manager'],
    description: 'Quản lý sản xuất',
  },
  {
    path: '/delivery',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager', 'Front_Desk_Clerk'],
    description: 'Quản lý giao hàng',
  },
  {
    path: '/products',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager', 'Production_Manager'],
    description: 'Quản lý sản phẩm',
  },
  {
    path: '/shippers',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager'],
    description: 'Quản lý người giao hàng',
  },
  {
    path: '/users',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager'],
    description: 'Quản lý người dùng',
  },
  {
    path: '/customers',
    allowedRoles: [ADMIN_ROLE, 'Store_Manager', 'Front_Desk_Clerk'],
    description: 'Quản lý khách hàng',
  },
];

/**
 * Get allowed roles for a specific route
 */
export function getAllowedRolesForRoute(path: string): string[] {
  const route = routePermissions.find(r => r.path === path);
  return route ? route.allowedRoles : [ADMIN_ROLE];
}

/**
 * Check if a role can access a route
 * Admin always returns true
 */
export function canRoleAccessRoute(role: string, path: string): boolean {
  // Admin can access everything
  if (role === ADMIN_ROLE) {
    return true;
  }
  
  const allowedRoles = getAllowedRolesForRoute(path);
  return allowedRoles.includes(role);
}

/**
 * Get the first route that a role can access
 * Returns the first matching route path, or '/' as fallback
 */
export function getFirstAccessibleRoute(role: string): string {
  // Admin can access everything, return first route (usually '/')
  if (role === ADMIN_ROLE) {
    return routePermissions[1]?.path || '/';
  }
  
  // Find first route that role can access
  const accessibleRoute = routePermissions.find(route => 
    canRoleAccessRoute(role, route.path)
  );
  
  return accessibleRoute?.path || '/';
}