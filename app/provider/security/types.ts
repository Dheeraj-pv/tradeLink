export interface SecuritySettingsProps {
  initialTwoFactorEnabled: boolean;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode?: string;
}

export interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode: string;
}
