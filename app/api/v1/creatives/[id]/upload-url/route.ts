// POST /api/v1/creatives/[id]/upload-url - Get signed URL for direct upload (optional)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { getSupabaseStorage } from '@/src/lib/db/supabase';
import { verifyToken } from '@/src/lib/auth/jwt';

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

    const storage = getSupabaseStorage();
    
    if (!storage) {
      return NextResponse.json(
        { error: 'Storage not configured. Use direct upload endpoint instead.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: `Failed to generate signed URL: ${signedError.message}` },
        { status: 500 }
      );
    }

    // Update creative with file path (will be updated with full URL after upload)
    await db.updateCreative(id, {
      filename,
      mime_type: contentType,
    });

    return NextResponse.json({
      uploadUrl: signedData.signedUrl,
      path: filePath,
      token: signedData.token,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

