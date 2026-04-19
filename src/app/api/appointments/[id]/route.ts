import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';
import { isAppointmentInPast } from '@/lib/utils/date';

/**
 * GET /api/appointments/:id - Get appointment details
 */
export async function GET(
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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { include: { hospital: true, department: true } },
        patientProfile: true,
        review: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Appointment not found'),
        { status: 404 }
      );
    }

    // Check authorization
    if (appointment.patientId !== session.user.id) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to view this appointment'),
        { status: 403 }
      );
    }

    return NextResponse.json(successResponse(appointment));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
