// Verify token and get user info
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const user = await db.getUserById(decoded.userId);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
        },
        valid: true,
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token', valid: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

