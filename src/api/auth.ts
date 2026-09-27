import { apiPost } from './client'
import type { AuthTokenResponse, MessageResponse } from '../types/auth'

export function signup(email: string, password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>(
    '/api/auth/signup',
    { email, password },
    { auth: false },
  )
}

export function login(email: string, password: string): Promise<AuthTokenResponse> {
  return apiPost<AuthTokenResponse>(
    '/api/auth/login',
    { email, password },
    { auth: false },
  )
}

export function resetPassword(payload: {
  email: string
  new_password: string
  reset_token?: string
}): Promise<MessageResponse> {
  const body: Record<string, string> = {
    email: payload.email,
    new_password: payload.new_password,
  }
  if (payload.reset_token?.trim()) {
    body.reset_token = payload.reset_token.trim()
  }
  return apiPost<MessageResponse>('/api/auth/reset-password', body, {
    auth: false,
  })
}
