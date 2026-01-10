// Main database adapter export

export * from './adapter';
export * from './memory';
export { getDbAdapter, getSupabaseClient, getSupabaseStorage } from './supabase';

import { getDbAdapter } from './supabase';

// Export singleton instance
export const db = getDbAdapter();

