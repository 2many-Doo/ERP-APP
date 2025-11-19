/**
 * Permissions utility functions
 * Handles role and permission management
 */

export interface Permission {
  id: number;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
}

export interface Role {
  id: number;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  permissions: Permission[];
}

export interface RolesResponse {
  data: Role[];
}

/**
 * Get permissions from localStorage
 */
export const getPermissions = (): string[] => {
  if (typeof window === "undefined") return [];
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return [];
  
  try {
    const user = JSON.parse(userStr);
    const roles: Role[] = user.roles || [];
    
    // Extract all permission titles from all roles
    const permissions = new Set<string>();
    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission.title);
      });
    });
    
    return Array.from(permissions);
  } catch {
    return [];
  }
};

/**
 * Get roles from localStorage
 */
export const getRoles = (): Role[] => {
  if (typeof window === "undefined") return [];
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return [];
  
  try {
    const user = JSON.parse(userStr);
    return user.roles || [];
  } catch {
    return [];
  }
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (permissionTitle: string): boolean => {
  const permissions = getPermissions();
  return permissions.includes(permissionTitle);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (permissionTitles: string[]): boolean => {
  const permissions = getPermissions();
  return permissionTitles.some((title) => permissions.includes(title));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (permissionTitles: string[]): boolean => {
  const permissions = getPermissions();
  return permissionTitles.every((title) => permissions.includes(title));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (roleTitle: string): boolean => {
  const roles = getRoles();
  return roles.some((role) => role.title === roleTitle);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roleTitles: string[]): boolean => {
  const roles = getRoles();
  return roles.some((role) => roleTitles.includes(role.title));
};

