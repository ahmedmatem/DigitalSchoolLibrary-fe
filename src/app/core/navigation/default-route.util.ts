import {
  AUTH_ROLES,
} from '../auth/constants/auth-roles';


export function getDefaultRouteForRoles(
  roles: readonly string[]
): string {
  if (roles.includes(AUTH_ROLES.Admin)) {
    return '/teacher';
  }

  if (roles.includes(AUTH_ROLES.Teacher)) {
    return '/teacher';
  }

  if (roles.includes(AUTH_ROLES.Student)) {
    return '/for-me';
  }

  return '/';
}
