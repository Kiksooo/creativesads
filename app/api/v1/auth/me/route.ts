// GET /api/v1/auth/me - Get current user

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { verifyToken } from '@/src/lib/auth/jwt';
import { logApiRequest, createErrorResponse } from '@/src/lib/api-logger';

export async function GET(request: NextRequest) {
  const method = 'GET';
  const path = '/api/v1/auth/me';
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      const response = createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
      logApiRequest(method, path, 401);
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      const response = createErrorResponse('INVALID_TOKEN', 'Invalid or expired token', 401);
      logApiRequest(method, path, 401);
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await db.getUserById(payload.userId);
    if (!user) {
      const response = createErrorResponse('USER_NOT_FOUND', 'User not found', 404);
      logApiRequest(method, path, 404);
      return NextResponse.json(response, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    logApiRequest(method, path, 200);
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const response = createErrorResponse(
      'GET_USER_ERROR',
      'Failed to get user',
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

