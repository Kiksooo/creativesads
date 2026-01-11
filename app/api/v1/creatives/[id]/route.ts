// GET /api/v1/creatives/[id] - Get creative details

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
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

export async function GET(
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

    // Get analysis if exists
    const analysis = await db.getAnalysisByCreativeId(id);

    return NextResponse.json({
      creative,
      analysis: analysis || null,
    });
  } catch (error) {
    console.error('Error fetching creative:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creative' },
      { status: 500 }
    );
  }
}

