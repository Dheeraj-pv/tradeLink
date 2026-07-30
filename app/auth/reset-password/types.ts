export type PasswordRule = {
  valid: boolean;
  message: string;
};

export type TokenValidationResponse = {
  valid?: boolean;
  requiresTwoFactor?: boolean;
};

export type ResetPasswordResponse = {
  requiresTwoFactor?: boolean;
  error?: string;
};

export type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
  totpCode: string;
};
