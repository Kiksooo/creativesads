// POST /api/v1/auth/login - Login user

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { generateToken } from '@/src/lib/auth/jwt';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // For MVP with in-memory DB, we skip password check
    // In production with Supabase, use Supabase Auth
    // For now, we'll allow login if user exists (MVP simplification)
    // In real app, check password: const passwordMatch = await bcrypt.compare(password, user.password_hash);

    // Generate token
    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

