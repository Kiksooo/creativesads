// POST /api/auth/register - Register new user

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { generateToken } from '@/src/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { logApiRequest, createErrorResponse } from '@/src/lib/api-logger';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/register with { email, password } in the request body.',
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
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/register with { email, password } in the request body.',
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
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/register with { email, password } in the request body.',
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
      message: 'This endpoint only accepts POST requests. Use POST /api/auth/register with { email, password } in the request body.',
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
  const path = '/api/auth/register';
  
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

    const validated = registerSchema.safeParse(body);

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

    // Log registration attempt (without password)
    console.log(`[Auth Register] Attempt for email: ${emailNorm}`);

    // Check if user exists
    const existingUser = await db.getUserByEmail(emailNorm);
    if (existingUser) {
      console.log(`[Auth Register] User already exists: id=${existingUser.id}`);
      const response = createErrorResponse(
        'USER_EXISTS',
        'User with this email already exists',
        409
      );
      logApiRequest(method, path, 409);
      return NextResponse.json(response, { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`[Auth Register] Password hashed successfully, hash length: ${passwordHash.length}`);

    // Create user with password hash
    const user = await db.createUser(emailNorm, passwordHash);
    console.log(`[Auth Register] User created: id=${user.id}, hasPasswordHash=${!!user.password_hash}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    logApiRequest(method, path, 201);
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const response = createErrorResponse(
      'REGISTRATION_ERROR',
      'Registration failed',
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

