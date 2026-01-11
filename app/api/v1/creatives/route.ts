// GET /api/v1/creatives - List creatives
// POST /api/v1/creatives - Create creative

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/auth/jwt';
import { getSupabaseStorage } from '@/src/lib/db/supabase';
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

export async function GET(request: NextRequest) {
  const method = 'GET';
  const path = '/api/v1/creatives';
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      const response = createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
      logApiRequest(method, path, 401);
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const creatives = await db.getCreativesByUserId(user.id, limit, offset);

    logApiRequest(method, path, 200);
    return NextResponse.json(
      {
        creatives,
        total: creatives.length,
        limit,
        offset,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const response = createErrorResponse(
      'FETCH_CREATIVES_ERROR',
      'Failed to fetch creatives',
      500,
      error instanceof Error ? error.message : String(error)
    );
    logApiRequest(method, path, 500, error);
    return NextResponse.json(response, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  const method = 'POST';
  const path = '/api/v1/creatives';
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      const response = createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
      logApiRequest(method, path, 401);
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      const response = createErrorResponse('MISSING_FILE', 'File is required', 400);
      logApiRequest(method, path, 400);
      return NextResponse.json(response, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      const response = createErrorResponse(
        'INVALID_FILE_TYPE',
        'File must be an image or video',
        400
      );
      logApiRequest(method, path, 400);
      return NextResponse.json(response, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get metadata from form
    const platform = formData.get('platform')?.toString() || null;
    const vertical = formData.get('vertical')?.toString() || null;
    const country = formData.get('country')?.toString() || null;
    const language = formData.get('language')?.toString() || null;
    const goal = formData.get('goal')?.toString() || null;

    // Check storage configuration if needed
    const storage = getSupabaseStorage();
    const envCheck = checkRequiredEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    // Upload file to storage (optional - can work without storage)
    let fileUrl: string | null = null;
    
    if (storage) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = isImage ? `creatives/images/${fileName}` : `creatives/videos/${fileName}`;

        // Convert File to ArrayBuffer then to Buffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error: uploadError } = await storage
          .from('creatives')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = storage
          .from('creatives')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      } catch (storageError) {
        console.error('Storage upload error:', storageError);
        // Continue without file URL for in-memory mode
        // Log warning but don't fail the request
      }
    } else if (envCheck) {
      // Storage is expected but not configured
      const response = createErrorResponse(
        'STORAGE_NOT_CONFIGURED',
        `Storage is not configured. Please set the following environment variables: ${envCheck.missing.join(', ')}`,
        500,
        { missing: envCheck.missing }
      );
      logApiRequest(method, path, 500, new Error('Storage not configured'));
      return NextResponse.json(response, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create creative record
    const creative = await db.createCreative({
      user_id: user.id,
      type: isImage ? 'image' : 'video',
      filename: file.name,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type,
      platform,
      vertical,
      country,
      language,
      goal,
      status: 'queued',
    });

    logApiRequest(method, path, 201);
    return NextResponse.json(
      { creative },
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const response = createErrorResponse(
      'CREATE_CREATIVE_ERROR',
      error instanceof Error ? error.message : 'Failed to create creative',
      500,
      error instanceof Error ? { stack: error.stack } : String(error)
    );
    logApiRequest(method, path, 500, error);
    return NextResponse.json(response, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

