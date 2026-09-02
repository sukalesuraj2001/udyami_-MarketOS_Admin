import { AuthUser } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Exact shape returned by POST /auth/loginUser. Stored verbatim in
 * localStorage — no `data` envelope, no refresh token, single accessToken.
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
  testMode: boolean;
}
