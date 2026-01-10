// Supabase database adapter

import { createClient } from '@supabase/supabase-js';
import type { DbAdapter, Creative, AnalysisResult, User, UserUsage } from './adapter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseStorage() {
  const client = getSupabaseClient();
  if (!client) return null;
  return client.storage;
}

class SupabaseDb implements DbAdapter {
  private client;

  constructor() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables.');
    }
    this.client = client;
  }

  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  async createUser(email: string): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert({ email })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data as User;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  // Creatives
  async createCreative(data: Omit<Creative, 'id' | 'created_at' | 'updated_at'>): Promise<Creative> {
    const { data: creative, error } = await this.client
      .from('creatives')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create creative: ${error.message}`);
    }
    return creative as Creative;
  }

  async getCreativeById(id: string, userId?: string): Promise<Creative | null> {
    let query = this.client
      .from('creatives')
      .select('*')
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;
    return data as Creative;
  }

  async getCreativesByUserId(userId: string, limit = 50, offset = 0): Promise<Creative[]> {
    const { data, error } = await this.client
      .from('creatives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch creatives: ${error.message}`);
    }
    return (data || []) as Creative[];
  }

  async updateCreative(id: string, data: Partial<Creative>): Promise<Creative | null> {
    const { data: creative, error } = await this.client
      .from('creatives')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !creative) return null;
    return creative as Creative;
  }

  // Analysis
  async createAnalysisResult(data: Omit<AnalysisResult, 'id' | 'created_at'>): Promise<AnalysisResult> {
    const { data: analysis, error } = await this.client
      .from('analysis_results')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }
    return analysis as AnalysisResult;
  }

  async getAnalysisByCreativeId(creativeId: string): Promise<AnalysisResult | null> {
    const { data, error } = await this.client
      .from('analysis_results')
      .select('*')
      .eq('creative_id', creativeId)
      .single();

    if (error || !data) return null;
    return data as AnalysisResult;
  }

  // Usage limits
  async getUserDailyAnalysisCount(userId: string, date: string): Promise<number> {
    const { data, error } = await this.client
      .from('user_usage')
      .select('analysis_count')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error || !data) return 0;
    return data.analysis_count || 0;
  }

  async incrementUserDailyAnalysisCount(userId: string, date: string): Promise<void> {
    // Try to increment existing record
    const { data: existing } = await this.client
      .from('user_usage')
      .select('analysis_count')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      const { error } = await this.client
        .from('user_usage')
        .update({ analysis_count: (existing.analysis_count || 0) + 1 })
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        throw new Error(`Failed to increment usage: ${error.message}`);
      }
    } else {
      const { error } = await this.client
        .from('user_usage')
        .insert({
          user_id: userId,
          date,
          analysis_count: 1,
        });

      if (error) {
        throw new Error(`Failed to create usage record: ${error.message}`);
      }
    }
  }
}

// Factory function to get the appropriate adapter
export function getDbAdapter(): DbAdapter {
  if (supabaseUrl && supabaseServiceKey) {
    try {
      return new SupabaseDb();
    } catch (error) {
      console.warn('Failed to initialize Supabase adapter, falling back to memory:', error);
    }
  }

  // Fallback to in-memory
  const { getMemoryDb } = require('./memory');
  return getMemoryDb();
}

