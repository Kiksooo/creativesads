// GET /api/v1/creatives - List creatives
// POST /api/v1/creatives - Create creative

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import jwt from 'jsonwebtoken';
import { getSupabaseStorage } from '@/src/lib/db/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const creatives = await db.getCreativesByUserId(user.id, limit, offset);

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
    console.error('Error fetching creatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creatives' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'File must be an image or video' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get metadata from form
    const platform = formData.get('platform')?.toString() || null;
    const vertical = formData.get('vertical')?.toString() || null;
    const country = formData.get('country')?.toString() || null;
    const language = formData.get('language')?.toString() || null;
    const goal = formData.get('goal')?.toString() || null;

    // Upload file to storage
    let fileUrl: string | null = null;
    const storage = getSupabaseStorage();
    
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
      }
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

    return NextResponse.json(
      { creative },
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating creative:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create creative' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

