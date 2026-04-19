import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updatePatientProfileSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';

/**
 * PATCH /api/profiles/:id - Update a patient profile
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'You must be logged in'),
        { status: 401 }
      );
    }

    // Check that profile belongs to user
    const profile = await prisma.patientProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Profile not found'),
        { status: 404 }
      );
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to update this profile'),
        { status: 403 }
      );
    }

    const body = await req.json();
    const validData = updatePatientProfileSchema.parse(body);

    const updated = await prisma.patientProfile.update({
      where: { id },
      data: validData,
    });

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}

/**
 * DELETE /api/profiles/:id - Delete a patient profile
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'You must be logged in'),
        { status: 401 }
      );
    }

    // Check that profile belongs to user
    const profile = await prisma.patientProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Profile not found'),
        { status: 404 }
      );
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to delete this profile'),
        { status: 403 }
      );
    }

    // Cannot delete default profile or profile with future appointments
    if (profile.isDefault) {
      const otherProfiles = await prisma.patientProfile.count({
        where: { userId: session.user.id, id: { not: id } },
      });

      if (otherProfiles === 0) {
        return NextResponse.json(
          errorResponse('CANNOT_DELETE_DEFAULT', 'You must have at least one profile'),
          { status: 400 }
        );
      }

      // Make another profile default
      const otherProfile = await prisma.patientProfile.findFirst({
        where: { userId: session.user.id, id: { not: id } },
      });

      if (otherProfile) {
        await prisma.patientProfile.update({
          where: { id: otherProfile.id },
          data: { isDefault: true },
        });
      }
    }

    // Check for future appointments
    const futureAppointments = await prisma.appointment.count({
      where: {
        patientProfileId: id,
        appointmentDate: { gte: new Date() },
      },
    });

    if (futureAppointments > 0) {
      return NextResponse.json(
        errorResponse('HAS_FUTURE_APPOINTMENTS', 'Cannot delete profile with future appointments'),
        { status: 400 }
      );
    }

    await prisma.patientProfile.delete({
      where: { id },
    });

    return NextResponse.json(successResponse({ message: 'Profile deleted' }));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
