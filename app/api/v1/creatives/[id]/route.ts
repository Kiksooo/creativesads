// GET /api/v1/creatives/[id] - Get creative details

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
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

