export type SecurityFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode: string;
};

export interface SecurityClientProps {
  initialTwoFactorEnabled: boolean;
}
