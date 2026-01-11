// Environment variables helper

/**
 * Get required environment variable
 * Throws error if variable is not set
 */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable with default value
 */
export function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Get optional environment variable (returns string | undefined)
 */
export function optionalEnvUndefined(name: string): string | undefined {
  return process.env[name];
}

// JWT configuration (required only if JWT is used in API routes)
export function getJWT_SECRET(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export const JWT_EXPIRES_IN = optionalEnv('JWT_EXPIRES_IN', '7d');

// Node environment
export const NODE_ENV = optionalEnv('NODE_ENV', 'development');

// API configuration (optional, for proxy to backend)
export const API_INTERNAL_BASE_URL = optionalEnvUndefined('API_INTERNAL_BASE_URL');

