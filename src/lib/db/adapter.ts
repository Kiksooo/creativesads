// Database adapter with Supabase support and in-memory fallback

export interface Creative {
  id: string;
  user_id: string;
  type: 'image' | 'video';
  filename: string;
  file_url: string | null;
  file_size: number;
  mime_type: string;
  platform: string | null;
  vertical: string | null;
  country: string | null;
  language: string | null;
  goal: string | null;
  status: 'queued' | 'processing' | 'done' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  creative_id: string;
  score: number;
  hook_score: number;
  clarity_score: number;
  compliance_risk: number;
  strengths: string[];
  issues: string[];
  fixes: string[];
  hooks: string[];
  ctas: string[];
  script_15s: string | null;
  summary: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string; // Optional for backward compatibility
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  user_id: string;
  date: string; // YYYY-MM-DD
  analysis_count: number;
}

export interface DbAdapter {
  // Users
  getUserByEmail(email: string): Promise<User | null>;
  createUser(email: string, passwordHash?: string): Promise<User>;
  getUserById(id: string): Promise<User | null>;

  // Creatives
  createCreative(data: Omit<Creative, 'id' | 'created_at' | 'updated_at'>): Promise<Creative>;
  getCreativeById(id: string, userId?: string): Promise<Creative | null>;
  getCreativesByUserId(userId: string, limit?: number, offset?: number): Promise<Creative[]>;
  updateCreative(id: string, data: Partial<Creative>): Promise<Creative | null>;

  // Analysis
  createAnalysisResult(data: Omit<AnalysisResult, 'id' | 'created_at'>): Promise<AnalysisResult>;
  getAnalysisByCreativeId(creativeId: string): Promise<AnalysisResult | null>;

  // Usage limits
  getUserDailyAnalysisCount(userId: string, date: string): Promise<number>;
  incrementUserDailyAnalysisCount(userId: string, date: string): Promise<void>;
}

