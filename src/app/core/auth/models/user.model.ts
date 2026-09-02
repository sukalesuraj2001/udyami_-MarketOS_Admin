/**
 * Values match the backend's `roles` array on the user (e.g. "super_admin",
 * "ward_chairman") — NOT the PascalCase `role` field.
 */
export enum AppRole {
  SuperAdmin = 'super_admin',
  Editor = 'editor',
}

export interface AuthUserRole {
  userId: string;
  roleId: number;
  role: {
    roleId: number;
    roleName: string;
    role: string;
    description: string;
  };
}

export interface AuthUserPosition {
  positionHolderId: string;
  positionId: string;
  positionName: string;
  permission: string;
  assignedBy: string;
  assignedByUser: {
    userId: string;
    firstName: string;
    mobileNumber: string;
    email: string;
  };
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  businessLocation: string | null;
  officeLocation: string | null;
  latitude: string;
  longitude: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles: AuthUserRole[];
  isBasic: boolean;
  isPrime: boolean;
  isPatron: boolean;
  otp: string;
  hasBusiness: boolean;
  memberId: string | null;
  cpId: string | null;
  isTrial: boolean;
  /** raw role string from the backend, e.g. "WardChairman" — not an AppRole */
  role: string;
  roles: string[];
  position: AuthUserPosition | null;
}
