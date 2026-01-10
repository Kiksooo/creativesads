// POST /api/v1/creatives/[id]/analyze - Start analysis

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { analyzeCreative, checkAnalysisLimit } from '@/src/lib/ai/analyze';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = await db.getUserById(decoded.userId);
    return user;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const creative = await db.getCreativeById(id, user.id);
    
    if (!creative) {
      return NextResponse.json(
        { error: 'Creative not found' },
        { status: 404 }
      );
    }

    // Check analysis limit
    const limitCheck = await checkAnalysisLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Daily analysis limit reached',
          limit: limitCheck.limit,
          count: limitCheck.count,
        },
        { status: 429 }
      );
    }

    // Check if analysis already exists
    const existingAnalysis = await db.getAnalysisByCreativeId(id);
    if (existingAnalysis) {
      return NextResponse.json({
        analysis: existingAnalysis,
        message: 'Analysis already exists',
      });
    }

    // Update status to processing
    await db.updateCreative(id, { status: 'processing' });

    // Run analysis (this might take time, consider making it async/background job)
    try {
      const analysisResult = await analyzeCreative(creative);

      // Save analysis
      const analysis = await db.createAnalysisResult({
        creative_id: id,
        ...analysisResult,
      });

      // Update creative status to done
      await db.updateCreative(id, { status: 'done' });

      // Increment usage counter
      const today = new Date().toISOString().split('T')[0];
      await db.incrementUserDailyAnalysisCount(user.id, today);

      return NextResponse.json({
        analysis,
        message: 'Analysis completed',
      });
    } catch (analysisError) {
      // Update status to failed
      await db.updateCreative(id, { status: 'failed' });
      
      console.error('Analysis error:', analysisError);
      return NextResponse.json(
        { 
          error: 'Analysis failed',
          message: analysisError instanceof Error ? analysisError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

