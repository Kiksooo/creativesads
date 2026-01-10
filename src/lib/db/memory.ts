// In-memory database adapter for development/fallback

import type { DbAdapter, Creative, AnalysisResult, User, UserUsage } from './adapter';

class MemoryDb implements DbAdapter {
  private users: Map<string, User> = new Map();
  private creatives: Map<string, Creative> = new Map();
  private analyses: Map<string, AnalysisResult> = new Map();
  private usage: Map<string, UserUsage> = new Map(); // key: `${userId}_${date}`

  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(email: string): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const user: User = {
      id,
      email,
      created_at: now,
      updated_at: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  // Creatives
  async createCreative(data: Omit<Creative, 'id' | 'created_at' | 'updated_at'>): Promise<Creative> {
    const id = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const creative: Creative = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    this.creatives.set(id, creative);
    return creative;
  }

  async getCreativeById(id: string, userId?: string): Promise<Creative | null> {
    const creative = this.creatives.get(id);
    if (!creative) return null;
    if (userId && creative.user_id !== userId) return null;
    return creative;
  }

  async getCreativesByUserId(userId: string, limit = 50, offset = 0): Promise<Creative[]> {
    const userCreatives: Creative[] = [];
    for (const creative of this.creatives.values()) {
      if (creative.user_id === userId) {
        userCreatives.push(creative);
      }
    }
    // Sort by created_at DESC
    userCreatives.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return userCreatives.slice(offset, offset + limit);
  }

  async updateCreative(id: string, data: Partial<Creative>): Promise<Creative | null> {
    const creative = this.creatives.get(id);
    if (!creative) return null;
    const updated: Creative = {
      ...creative,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.creatives.set(id, updated);
    return updated;
  }

  // Analysis
  async createAnalysisResult(data: Omit<AnalysisResult, 'id' | 'created_at'>): Promise<AnalysisResult> {
    const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const analysis: AnalysisResult = {
      ...data,
      id,
      created_at: now,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysisByCreativeId(creativeId: string): Promise<AnalysisResult | null> {
    for (const analysis of this.analyses.values()) {
      if (analysis.creative_id === creativeId) {
        return analysis;
      }
    }
    return null;
  }

  // Usage limits
  async getUserDailyAnalysisCount(userId: string, date: string): Promise<number> {
    const key = `${userId}_${date}`;
    const usage = this.usage.get(key);
    return usage?.analysis_count || 0;
  }

  async incrementUserDailyAnalysisCount(userId: string, date: string): Promise<void> {
    const key = `${userId}_${date}`;
    const existing = this.usage.get(key);
    if (existing) {
      existing.analysis_count += 1;
      this.usage.set(key, existing);
    } else {
      this.usage.set(key, {
        user_id: userId,
        date,
        analysis_count: 1,
      });
    }
  }
}

// Singleton instance
let memoryDbInstance: MemoryDb | null = null;

export function getMemoryDb(): MemoryDb {
  if (!memoryDbInstance) {
    memoryDbInstance = new MemoryDb();
  }
  return memoryDbInstance;
}

