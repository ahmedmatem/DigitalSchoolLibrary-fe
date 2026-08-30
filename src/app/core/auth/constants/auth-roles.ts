export const AUTH_ROLES = {
  Student: 'Student',
  Teacher: 'Teacher',
  Admin: 'Admin',
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];