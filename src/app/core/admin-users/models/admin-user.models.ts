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
