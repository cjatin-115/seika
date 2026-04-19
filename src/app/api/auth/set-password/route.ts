import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/utils/errors';

/**
 * POST /api/auth/set-password - Set password for a user (for testing)
 * Development only endpoint to set passwords for seeded test users
 */
export async function POST(req: NextRequest) {
  try {
    // Add basic protection - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'This endpoint is only available in development'),
        { status: 403 }
      );
    }

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        errorResponse('MISSING_FIELDS', 'Email and password are required'),
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        errorResponse('WEAK_PASSWORD', 'Password must be at least 8 characters'),
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('USER_NOT_FOUND', 'User with this email does not exist'),
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if account already exists
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'credentials',
      },
    });

    if (existingAccount) {
      // Update existing account
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          providerAccountId: hashedPassword,
        },
      });
    } else {
      // Create new account
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: hashedPassword,
        },
      });
    }

    return NextResponse.json(
      successResponse({
        message: 'Password set successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
    );
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      errorResponse('SERVER_ERROR', 'Failed to set password'),
      { status: 500 }
    );
  }
}
