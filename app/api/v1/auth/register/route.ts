// POST /api/v1/auth/register - Register new user

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

export async function POST(request: NextRequest) {
  const method = 'POST';
  const path = '/api/v1/auth/register';
  
  try {
    const body = await request.json();
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

    // Check if user exists
    const existingUser = await db.getUserByEmail(emailNorm);
    if (existingUser) {
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with password hash
    const user = await db.createUser(emailNorm, passwordHash);

    // Generate token
    const token = generateToken(user.id, user.email);

    logApiRequest(method, path, 201);
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    }, {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
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

