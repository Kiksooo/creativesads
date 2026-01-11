// POST /api/v1/creatives/[id]/upload-url - Get signed URL for direct upload (optional)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { getSupabaseStorage } from '@/src/lib/db/supabase';
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
  let path = '/api/v1/creatives/[id]/upload-url';
  
  try {
    const { id } = await params;
    path = `/api/v1/creatives/${id}/upload-url`;
    
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

    // Check storage configuration
    const envCheck = checkRequiredEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    const storage = getSupabaseStorage();
    
    if (!storage || envCheck) {
      const response = createErrorResponse(
        'STORAGE_NOT_CONFIGURED',
        envCheck 
          ? `Storage is not configured. Please set the following environment variables: ${envCheck.missing.join(', ')}`
          : 'Storage not configured. Use direct upload endpoint instead.',
        503,
        envCheck ? { missing: envCheck.missing } : undefined
      );
      logApiRequest(method, path, 503, new Error('Storage not configured'));
      return NextResponse.json(response, { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      const response = createErrorResponse(
        'MISSING_PARAMETERS',
        'filename and contentType are required',
        400
      );
      logApiRequest(method, path, 400);
      return NextResponse.json(response, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileExt = filename.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = creative.type === 'image' 
      ? `creatives/images/${fileName}` 
      : `creatives/videos/${fileName}`;

    // Generate signed URL for upload
    const { data: signedData, error: signedError } = await storage
      .from('creatives')
      .createSignedUploadUrl(filePath);

    if (signedError) {
      const response = createErrorResponse(
        'SIGNED_URL_ERROR',
        `Failed to generate signed URL: ${signedError.message}`,
        500,
        { error: signedError.message }
      );
      logApiRequest(method, path, 500, signedError);
      return NextResponse.json(response, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update creative with file path (will be updated with full URL after upload)
    await db.updateCreative(id, {
      filename,
      mime_type: contentType,
    });

    logApiRequest(method, path, 200);
    return NextResponse.json({
      uploadUrl: signedData.signedUrl,
      path: filePath,
      token: signedData.token,
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const response = createErrorResponse(
      'UPLOAD_URL_ERROR',
      'Failed to generate upload URL',
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

