// POST /api/auth/login - Login user

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

// Handle CORS preflight - returns 204 No Content
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handle GET requests with helpful message
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/login with { email, password } in the request body.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle PUT requests with helpful message
export async function PUT() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/login with { email, password } in the request body.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle PATCH requests with helpful message
export async function PATCH() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/login with { email, password } in the request body.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle DELETE requests with helpful message
export async function DELETE() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/login with { email, password } in the request body.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const method = 'POST';
  const path = '/api/auth/login';
  
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      const response = createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', 400);
      logApiRequest(method, path, 400);
      return NextResponse.json(response, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    // Log login attempt (without password)
    console.log(`[Auth Login] Attempt for email: ${emailNorm}`);

    // Find user
    const user = await db.getUserByEmail(emailNorm);
    if (!user) {
      // User not found - return 404
      console.log(`[Auth Login] User not found for email: ${emailNorm}`);
      const response = createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        404
      );
      logApiRequest(method, path, 404, 'user not found');
      return NextResponse.json(response, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log user found
    console.log(`[Auth Login] User found: id=${user.id}, hasPasswordHash=${!!user.password_hash}`);

    // Check password
    if (!user.password_hash) {
      // User exists but has no password hash (legacy user)
      console.log(`[Auth Login] User ${user.id} has no password_hash`);
      const response = createErrorResponse(
        'INVALID_PASSWORD',
        'Invalid password',
        401
      );
      logApiRequest(method, path, 401, 'password hash missing');
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Invalid password - return 401
      console.log(`[Auth Login] Password mismatch for user ${user.id}`);
      const response = createErrorResponse(
        'INVALID_PASSWORD',
        'Invalid password',
        401
      );
      logApiRequest(method, path, 401, 'password mismatch');
      return NextResponse.json(response, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Password matches - success
    console.log(`[Auth Login] Success for user ${user.id}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    logApiRequest(method, path, 200);
    return NextResponse.json(
      {
        token,
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

