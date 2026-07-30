export type Role = "CUSTOMER" | "PROVIDER";

export type Category = {
  id: number;
  name: string;
};

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
};

export type RegisterResponse = {
  data?: {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  };
  error?: string;
};
