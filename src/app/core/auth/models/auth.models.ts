export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  firstName: string;
  fatherName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gradeLevelId: number | null;
  schoolClassId: string | null;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  fatherName: string;
  lastName: string;
  fullName: string;
  email: string;
  roles: string[];
  gradeLevelId: number | null;
  gradeNumber: number | null;
  schoolClassId: string | null;
  schoolClassName: string | null;
}