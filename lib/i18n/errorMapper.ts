/**
 * Map HTTP status codes to i18n keys
 * Used for unified error handling across the app
 */
export function mapHttpStatusToKey(status: number): string {
  if (status === 401) return 'errors.unauthorized';
  if (status === 404) return 'errors.notFound';
  if (status >= 500) return 'errors.serverError';
  if (status >= 400) return 'errors.requestFailed';
  return 'errors.requestFailed';
}

/**
 * Map backend error response to i18n key
 * Handles both { error: { code, message } } and { error: "message" } formats
 */
export function mapBackendErrorToKey(error: any): string {
  if (!error) return 'errors.serverError';
  
  // Handle standardized error format: { error: { code, message } }
  if (error.error && typeof error.error === 'object') {
    const code = error.error.code;
    if (code && typeof code === 'string') {
      return mapErrorCodeToKey(code);
    }
    const message = error.error.message;
    if (message && typeof message === 'string') {
      return mapErrorMessageToKey(message);
    }
  }
  
  // Handle string error: { error: "message" }
  if (error.error && typeof error.error === 'string') {
    return mapErrorMessageToKey(error.error);
  }
  
  // Handle direct message: { message: "..." }
  if (error.message && typeof error.message === 'string') {
    return mapErrorMessageToKey(error.message);
  }
  
  // Handle status code if present
  if (error.status && typeof error.status === 'number') {
    return mapHttpStatusToKey(error.status);
  }
  
  return 'errors.serverError';
}

/**
 * Map API error codes to i18n keys
 */
export function mapErrorCodeToKey(errorCode: string): string {
  const errorMap: Record<string, string> = {
    // API error codes
    'UNAUTHORIZED': 'errors.unauthorized',
    'NOT_FOUND': 'errors.notFound',
    'USER_NOT_FOUND': 'errors.notFound',
    'CREATIVE_NOT_FOUND': 'errors.notFound',
    'INVALID_CREDENTIALS': 'auth.invalidCredentials',
    'INVALID_PASSWORD': 'auth.invalidCredentials',
    'USER_EXISTS': 'auth.userExists',
    'VALIDATION_ERROR': 'errors.requestFailed',
    'SERVER_ERROR': 'errors.serverError',
    'FETCH_CREATIVE_ERROR': 'errors.failedToLoadCreative',
    'FETCH_CREATIVES_ERROR': 'errors.requestFailed',
    'CREATE_CREATIVE_ERROR': 'errors.uploadFailed',
    'ANALYSIS_FAILED': 'analysis.failedMessage',
    'ANALYSIS_LIMIT_REACHED': 'analysis.dailyLimitReached',
    'LOGIN_ERROR': 'errors.loginFailed',
    'REGISTRATION_ERROR': 'errors.registrationFailed',
    'STORAGE_NOT_CONFIGURED': 'errors.serverError',
    'SIGNED_URL_ERROR': 'errors.serverError',
    'UPLOAD_URL_ERROR': 'errors.serverError',
    'START_ANALYSIS_ERROR': 'analysis.failedMessage',
    'INVALID_JSON': 'errors.requestFailed',
    'GET_USER_ERROR': 'errors.failedToLoadSettings',
  };
  
  return errorMap[errorCode] || 'errors.serverError';
}

// Map error messages (from API or UI) to i18n keys
export function mapErrorMessageToKey(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Pattern matching for common error messages
  if (lowerMessage.includes('session expired') || lowerMessage.includes('unauthorized')) {
    return 'errors.unauthorized';
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('doesn\'t exist')) {
    return 'errors.notFound';
  }
  if (lowerMessage.includes('invalid email') || 
      lowerMessage.includes('invalid password') ||
      lowerMessage.includes('invalid email or password') ||
      lowerMessage.includes('invalid credentials')) {
    return 'auth.invalidCredentials';
  }
  if (lowerMessage.includes('user exists') || lowerMessage.includes('already exists')) {
    return 'auth.userExists';
  }
  if (lowerMessage.includes('failed to load')) {
    if (lowerMessage.includes('creative')) return 'errors.failedToLoadCreative';
    if (lowerMessage.includes('library')) return 'errors.failedToLoadLibrary';
    if (lowerMessage.includes('settings')) return 'errors.failedToLoadSettings';
    if (lowerMessage.includes('dashboard')) return 'errors.failedToLoadDashboard';
    if (lowerMessage.includes('preview')) return 'errors.failedToLoadPreview';
    return 'errors.failedToLoad';
  }
  if (lowerMessage.includes('upload failed') || lowerMessage.includes('failed to upload')) {
    return 'errors.uploadFailed';
  }
  if (lowerMessage.includes('login failed')) {
    return 'errors.loginFailed';
  }
  if (lowerMessage.includes('registration failed')) {
    return 'errors.registrationFailed';
  }
  if (lowerMessage.includes('analysis failed')) {
    return 'analysis.failedMessage';
  }
  if (lowerMessage.includes('limit reached')) {
    return 'analysis.dailyLimitReached';
  }
  
  // Default fallback
  return 'errors.serverError';
}

