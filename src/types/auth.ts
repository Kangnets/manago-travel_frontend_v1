export enum UserType {
  CUSTOMER = 'customer',
  AGENCY = 'agency',
}

/** 여행사 내 역할: 사장 | 직원 */
export type AgencyRole = 'owner' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  agencyName?: string;
  agencyEmail?: string;
  businessNumber?: string;
  licenseNumber?: string;
  address?: string;
  /** 여행사일 때만: owner(사장) | employee(직원) */
  agencyRole?: AgencyRole;
  /** 직원일 때만: 소속 사장의 user id */
  agencyOwnerId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: UserType;
  agencyName?: string;
  agencyEmail?: string;
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
