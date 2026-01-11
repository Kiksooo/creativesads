// GET /api/v1/creatives/[id] - Get creative details

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/auth/jwt';
import { logApiRequest, createErrorResponse } from '@/src/lib/api-logger';
import { getSupabaseStorage } from '@/src/lib/db/supabase';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const method = 'GET';
  let path = '/api/v1/creatives/[id]';
  
  try {
    const { id } = await params;
    path = `/api/v1/creatives/${id}`;
    
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

    // Ensure file_url is set or try to generate it from storage
    let fileUrl = creative.file_url;
    
    if (!fileUrl) {
      // Log warning if file_url is missing (for debugging)
      console.warn(`[Creative API] file_url is empty for creative_id=${id}, filename=${creative.filename}, type=${creative.type}`);
      
      // Note: We cannot reliably reconstruct the storage path without storing it separately
      // The file path includes timestamp and random string: `${user.id}/${Date.now()}_${random}.${ext}`
      // So we log this for investigation but don't try to regenerate the URL
      // In production, consider storing storage_path or storage_key in the creative record
    }

    // Create response with potentially updated file_url
    const creativeResponse = {
      ...creative,
      file_url: fileUrl,
    };

    // Get analysis if exists
    const analysis = await db.getAnalysisByCreativeId(id);

    logApiRequest(method, path, 200);
    return NextResponse.json({
      creative: creativeResponse,
      analysis: analysis || null,
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const response = createErrorResponse(
      'FETCH_CREATIVE_ERROR',
      'Failed to fetch creative',
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

