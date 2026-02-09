export enum UserType {
  CUSTOMER = 'customer',
  AGENCY = 'agency',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  agencyName?: string;
  businessNumber?: string;
  licenseNumber?: string;
  address?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: UserType;
  agencyName?: string;
  businessNumber?: string;
  licenseNumber?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
