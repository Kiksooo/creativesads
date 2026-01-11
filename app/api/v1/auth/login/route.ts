// POST /api/v1/auth/login - Login user

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { generateToken } from '@/src/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { logApiRequest, createErrorResponse } from '@/src/lib/api-logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  const method = 'POST';
  const path = '/api/v1/auth/login';
  
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      const response = createErrorResponse(
        'VALIDATION_ERROR',
        validated.error.errors[0].message,
        400,
        validated.error.errors
      );
      logApiRequest(method, path, 400);
      return NextResponse.json(response, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = validated.data;
    
    // Normalize email
    const emailNorm = email.trim().toLowerCase();

    // Find user
    const user = await db.getUserByEmail(emailNorm);
    if (!user) {
      // Log for debugging (can be disabled in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Auth] Login attempt failed: user not found for email ${emailNorm}`);
      }
      const response = createErrorResponse(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401
      );
      logApiRequest(method, path, 401, 'user not found');
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check password
    if (!user.password_hash) {
      // User exists but has no password hash (legacy user)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Auth] Login attempt failed: user ${user.id} has no password hash`);
      }
      const response = createErrorResponse(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401
      );
      logApiRequest(method, path, 401, 'password hash missing');
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Log for debugging (can be disabled in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Auth] Login attempt failed: password mismatch for user ${user.id}`);
      }
      const response = createErrorResponse(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401
      );
      logApiRequest(method, path, 401, 'password mismatch');
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    logApiRequest(method, path, 200);
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const response = createErrorResponse(
      'LOGIN_ERROR',
      'Login failed',
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

