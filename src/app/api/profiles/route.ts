import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPatientProfileSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';

/**
 * GET /api/profiles - Get all profiles for current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'You must be logged in'),
        { status: 401 }
      );
    }

    const profiles = await prisma.patientProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json(successResponse(profiles));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}

/**
 * POST /api/profiles - Create a new patient profile
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'You must be logged in'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const validData = createPatientProfileSchema.parse(body);

    // Check max profiles per user
    const existingProfiles = await prisma.patientProfile.count({
      where: { userId: session.user.id },
    });

    if (existingProfiles >= 5) {
      return NextResponse.json(
        errorResponse('MAX_PROFILES_REACHED', 'You can have at most 5 profiles'),
        { status: 400 }
      );
    }

    // If this is the first profile, make it default
    const isDefault = existingProfiles === 0;

    const profile = await prisma.patientProfile.create({
      data: {
        userId: session.user.id,
        ...validData,
        isDefault,
      },
    });

    return NextResponse.json(successResponse(profile), { status: 201 });
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
