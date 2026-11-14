export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  gradeLevelId: number | null;
  gradeNumber: number | null;
  schoolClassId: string | null;
  schoolClassName: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUsersQuery {
  search?: string;
  role?: string;
  isActive?: boolean;
  gradeLevelId?: number;
  schoolClassId?: string;
  sortBy?: 'name' | 'email' | 'status';
  sortDescending?: boolean;
  page: number;
  pageSize: number;
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  details: string | null;
  createdAtUtc: string;
  adminUserId: string;
}

export interface AdminUserDetails extends AdminUserListItem {
  firstName: string;
  fatherName: string;
  lastName: string;
  deactivatedAtUtc: string | null;
  deactivationReason: string | null;
  promotedToTeacherAtUtc: string | null;
  mustChangePassword: boolean;
  createdResourcesCount: number;
  savedResourcesCount: number;
  auditLog: AdminAuditLogItem[];
}

export interface UpdateAdminUserRequest {
  firstName: string;
  fatherName: string;
  lastName: string;
  email: string;
  gradeLevelId: number | null;
  schoolClassId: string | null;
}

export interface DeactivateAdminUserRequest {
  reason: string | null;
}

export interface ResetAdminUserPasswordRequest {
  temporaryPassword: string;
}
