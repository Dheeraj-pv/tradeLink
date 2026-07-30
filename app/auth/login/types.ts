export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  data?: {
    requiresTwoFactor?: boolean;
    pendingToken?: string | null;
    user?: {
      id: string;
      email: string;
      role: string;
    };
  };
  error?: string;
};

export type TwoFactorVerification = {
  pendingToken: string;
  code: string;
  isBackupCode: boolean;
};

export type TwoFactorResponse = {
  data?: {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  };
  error?: string;
};
