import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/utils/errors';

/**
 * POST /api/auth/signup - Create a new user account with email and password
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        errorResponse('MISSING_FIELDS', 'Email, password, and name are required'),
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        errorResponse('WEAK_PASSWORD', 'Password must be at least 8 characters'),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('USER_EXISTS', 'User with this email already exists'),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: new Date(), // Mark as verified for simplicity (you can add email verification later)
        role: 'PATIENT',
      },
    });

    // Store password hash in Account table
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: hashedPassword, // Store the hash here
      },
    });

    return NextResponse.json(
      successResponse({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      errorResponse('SERVER_ERROR', 'Failed to create user'),
      { status: 500 }
    );
  }
}
