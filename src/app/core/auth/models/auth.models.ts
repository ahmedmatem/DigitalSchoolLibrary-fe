export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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
  mustChangePassword: boolean;
}
