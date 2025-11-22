import { useAuthStore } from '@/lib/store';

export function usePermission() {
  const { user } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }

    return user.role.permissions.some(p => p.name === permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
