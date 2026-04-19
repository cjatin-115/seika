import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDoctorSlots } from '@/lib/slots';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';

/**
 * GET /api/doctors/:id/slots - Get available slots for a doctor on a specific date
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        errorResponse('INVALID_DATE', 'Date parameter is required (YYYY-MM-DD)'),
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        errorResponse('INVALID_DATE', 'Invalid date format'),
        { status: 400 }
      );
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Doctor not found'),
        { status: 404 }
      );
    }

    // Generate slots
    const slots = await generateDoctorSlots(id, date);

    return NextResponse.json(
      successResponse({
        doctor: {
          id: doctor.id,
          name: doctor.name,
        },
        date: dateStr,
        slots,
      })
    );
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
