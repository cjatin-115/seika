import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/debug-users - Check user and account data (DEV ONLY)
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // Get all users with their accounts
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userInfo = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      hasCredentialsAccount: user.accounts.some((acc) => acc.provider === 'credentials'),
      accounts: user.accounts.map((acc) => ({
        provider: acc.provider,
        type: acc.type,
        hasHash: !!acc.providerAccountId,
      })),
    }));

    return NextResponse.json({
      success: true,
      totalUsers: userInfo.length,
      users: userInfo,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
