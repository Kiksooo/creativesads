import { apiPost, type ApiResponse } from './client';

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message?: string;
  success?: boolean;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface VerifyResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
  };
  message?: string;
  success?: boolean;
}

export async function login(email: string): Promise<ApiResponse<LoginResponse>> {
  return apiPost<LoginResponse>('/auth/login', { email });
}

export async function verify(
  email: string,
  code: string
): Promise<ApiResponse<VerifyResponse>> {
  return apiPost<VerifyResponse>('/auth/verify', { email, code });
}

