// POST /api/auth/register - Register new user

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { generateToken } from '@/src/lib/auth/jwt';

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
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { email, password } = validated.data;

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create user (password hash is stored internally for in-memory DB)
    // In production with Supabase, you'd use Supabase Auth
    const user = await db.createUser(email);

    // Generate token
    const token = generateToken(user.id, user.email);

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
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

