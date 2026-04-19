import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAppointmentSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleError, AppError } from '@/lib/utils/errors';
import { lockSlot, generateDoctorSlots, getNextAvailableSlot } from '@/lib/slots';
import { sendEmail, getAppointmentConfirmationEmail } from '@/lib/notifications';
import { format } from 'date-fns';

/**
 * GET /api/appointments - Get appointments for current user
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { patientId: session.user.id };
    if (status) where.status = status;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: { include: { hospital: true } },
          patientProfile: true,
        },
        orderBy: { appointmentDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json(
      successResponse({
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}

/**
 * POST /api/appointments - Create a new appointment
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
    const { patientProfileId, ...appointmentData } = body;

    // Validate input
    const validData = createAppointmentSchema.parse(appointmentData);

    // Verify patient profile belongs to user
    const profile = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json(
        errorResponse('INVALID_PROFILE', 'Invalid patient profile'),
        { status: 400 }
      );
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: validData.doctorId },
      include: { hospital: true },
    });

    if (!doctor) {
      return NextResponse.json(
        errorResponse('DOCTOR_NOT_FOUND', 'Doctor not found'),
        { status: 404 }
      );
    }

    // Check if slot is available
    const date = new Date(validData.appointmentDate);
    const slots = await generateDoctorSlots(validData.doctorId, date);
    const slot = slots.find((s) => s.time === validData.slotTime);

    if (!slot || !slot.available) {
      return NextResponse.json(
        errorResponse('SLOT_NOT_AVAILABLE', 'Selected slot is not available'),
        { status: 400 }
      );
    }

    // Lock the slot
    const slotLocked = await lockSlot(
      validData.doctorId,
      date,
      validData.slotTime,
      patientProfileId
    );

    if (!slotLocked) {
      return NextResponse.json(
        errorResponse('SLOT_LOCKED', 'This slot was just booked by another user. Please select another slot'),
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        patientProfileId,
        doctorId: validData.doctorId,
        hospitalId: doctor.hospitalId,
        appointmentDate: date,
        slotTime: validData.slotTime,
        slotEndTime: validData.slotEndTime,
        reason: validData.reason,
        consultationFee: doctor.consultationFee,
        status: 'CONFIRMED',
      },
      include: {
        doctor: { include: { hospital: true } },
        patientProfile: true,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        appointmentId: appointment.id,
        userId: session.user.id,
        action: 'CREATED',
        newValue: appointment,
      },
    });

    // Send confirmation email
    try {
      const emailHtml = getAppointmentConfirmationEmail({
        patientName: profile.displayName,
        doctorName: doctor.name,
        hospitalName: doctor.hospital.name,
        appointmentDate: format(date, 'EEEE, dd MMMM yyyy'),
        appointmentTime: validData.slotTime,
        appointmentId: appointment.id,
      });

      await sendEmail({
        to: session.user.email || '',
        subject: 'Appointment Confirmed - MediBook',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Appointment Confirmed',
        body: `Your appointment with ${doctor.name} is confirmed for ${format(date, 'MMM dd')} at ${validData.slotTime}`,
        type: 'APPOINTMENT_CONFIRMED',
        metadata: {
          appointmentId: appointment.id,
          doctorId: doctor.id,
        },
      },
    });

    return NextResponse.json(successResponse(appointment), { status: 201 });
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
