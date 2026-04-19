import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';
import { canCancelAppointment } from '@/lib/utils/date';

/**
 * PATCH /api/appointments/:id/cancel - Cancel an appointment
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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!appointment) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Appointment not found'),
        { status: 404 }
      );
    }

    if (appointment.patientId !== session.user.id) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'You do not have permission to cancel this appointment'),
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled
    if (!canCancelAppointment(appointment.appointmentDate, appointment.slotTime)) {
      return NextResponse.json(
        errorResponse('CANNOT_CANCEL', 'Appointment cannot be cancelled less than 2 hours before'),
        { status: 400 }
      );
    }

    const body = await req.json();
    const { cancellationReason } = body;

    if (!cancellationReason || cancellationReason.length < 5) {
      return NextResponse.json(
        errorResponse('INVALID_REASON', 'Cancellation reason must be at least 5 characters'),
        { status: 400 }
      );
    }

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason,
        cancelledBy: 'PATIENT',
        cancelledAt: new Date(),
      },
      include: { doctor: { include: { hospital: true } } },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        appointmentId: id,
        userId: session.user.id,
        action: 'CANCELLED',
        oldValue: { status: appointment.status },
        newValue: { status: 'CANCELLED' },
        metadata: { reason: cancellationReason },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Appointment Cancelled',
        body: `Your appointment with ${appointment.doctor.name} has been cancelled`,
        type: 'CANCELLED',
        metadata: {
          appointmentId: id,
        },
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
