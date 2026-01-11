// API logging and error formatting utilities

import { NextRequest } from 'next/server';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Log API request details
 */
export function logApiRequest(
  method: string,
  path: string,
  status: number,
  error?: unknown
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    method,
    path,
    status,
    ...(error && { error: error instanceof Error ? error.message : String(error) }),
  };

  if (status >= 400) {
    console.error('[API Error]', JSON.stringify(logData, null, 2));
    if (error instanceof Error && error.stack) {
      console.error('[Stack]', error.stack);
    }
  } else {
    console.log('[API]', JSON.stringify(logData, null, 2));
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Check required environment variables and return error if missing
 */
export function checkRequiredEnv(
  vars: Record<string, string | undefined>
): { missing: string[] } | null {
  const missing: string[] = [];
  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      missing.push(key);
    }
  }
  return missing.length > 0 ? { missing } : null;
}

