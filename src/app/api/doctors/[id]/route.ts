import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDoctorSlots } from '@/lib/slots';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';

/**
 * GET /api/doctors/:id - Get doctor details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: true,
        department: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Doctor not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(doctor));
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
