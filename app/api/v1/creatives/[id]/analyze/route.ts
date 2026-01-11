// POST /api/v1/creatives/[id]/analyze - Start analysis

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import type { AnalysisResult } from '@/src/lib/db/adapter';
import { analyzeCreative, checkAnalysisLimit } from '@/src/lib/ai/analyze';
import { verifyToken } from '@/src/lib/auth/jwt';
import { logApiRequest, createErrorResponse, checkRequiredEnv } from '@/src/lib/api-logger';

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const user = await db.getUserById(decoded.userId);
  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const method = 'POST';
  let path = '/api/v1/creatives/[id]/analyze';
  
  try {
    const { id } = await params;
    path = `/api/v1/creatives/${id}/analyze`;
    
    const user = await getUserFromRequest(request);
    
    if (!user) {
      const response = createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
      logApiRequest(method, path, 401);
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const creative = await db.getCreativeById(id, user.id);
    
    if (!creative) {
      const response = createErrorResponse('CREATIVE_NOT_FOUND', 'Creative not found', 404);
      logApiRequest(method, path, 404);
      return NextResponse.json(response, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check analysis limit
    const limitCheck = await checkAnalysisLimit(user.id);
    if (!limitCheck.allowed) {
      const response = createErrorResponse(
        'ANALYSIS_LIMIT_REACHED',
        'Daily analysis limit reached',
        429,
        { limit: limitCheck.limit, count: limitCheck.count }
      );
      logApiRequest(method, path, 429);
      return NextResponse.json(response, { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if analysis already exists
    const existingAnalysis = await db.getAnalysisByCreativeId(id);
    if (existingAnalysis) {
      logApiRequest(method, path, 200);
      return NextResponse.json({
        analysis: existingAnalysis,
        message: 'Analysis already exists',
      }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read request body to get language preference
    let body: { language?: string } = {};
    try {
      body = await request.json().catch(() => ({}));
    } catch {
      // Body parsing failed, use default language
    }
    
    // Get language from request body, validate it, default to 'en'
    const requestedLanguage = body.language;
    const validLanguages = ['ru', 'en', 'es'];
    const language = validLanguages.includes(requestedLanguage) ? requestedLanguage : 'en';
    
    console.log(`[API] Analysis requested for creative ${id} with language: ${language}`);

    // Check required environment variables for AI analysis
    const envCheck = checkRequiredEnv({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      // ANTHROPIC_API_KEY is optional, so we don't check it
    });
    
    // Note: We allow analysis to proceed even without API keys (will use fallback)
    // But log a warning if keys are missing
    if (envCheck) {
      console.warn(`[API] Missing AI API keys: ${envCheck.missing.join(', ')}. Will use fallback analysis.`);
    }

    // Update status to processing
    await db.updateCreative(id, { status: 'processing' });

    // Run analysis (this might take time, consider making it async/background job)
    try {
      const analysisResult = await analyzeCreative(creative, language);

      // Save analysis - map camelCase to snake_case and add creative_id
      const analysisToSave = {
        creative_id: id,
        score: analysisResult.score,
        hook_score: analysisResult.hookScore,
        clarity_score: analysisResult.clarityScore,
        compliance_risk: analysisResult.complianceRisk,
        strengths: analysisResult.strengths,
        issues: analysisResult.issues,
        fixes: analysisResult.fixes,
        hooks: analysisResult.hooks,
        ctas: analysisResult.ctas,
        script_15s: analysisResult.script15s,
        summary: analysisResult.summary,
      } satisfies Omit<AnalysisResult, 'id' | 'created_at'>;

      const analysis = await db.createAnalysisResult(analysisToSave);

      // Update creative status to done
      await db.updateCreative(id, { status: 'done' });

      // Increment usage counter
      const today = new Date().toISOString().split('T')[0];
      await db.incrementUserDailyAnalysisCount(user.id, today);

      logApiRequest(method, path, 200);
      return NextResponse.json({
        analysis,
        message: 'Analysis completed',
      }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (analysisError) {
      // Update status to failed
      await db.updateCreative(id, { status: 'failed' });
      
      const response = createErrorResponse(
        'ANALYSIS_FAILED',
        analysisError instanceof Error ? analysisError.message : 'Analysis failed',
        500,
        analysisError instanceof Error ? { stack: analysisError.stack } : String(analysisError)
      );
      logApiRequest(method, path, 500, analysisError);
      return NextResponse.json(response, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    const response = createErrorResponse(
      'START_ANALYSIS_ERROR',
      'Failed to start analysis',
      500,
      error instanceof Error ? { message: error.message, stack: error.stack } : String(error)
    );
    logApiRequest(method, path, 500, error);
    return NextResponse.json(response, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

