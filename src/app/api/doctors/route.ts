import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDoctorSlots } from '@/lib/slots';
import { successResponse, errorResponse, handleError } from '@/lib/utils/errors';

/**
 * GET /api/doctors - List all doctors with filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');
    const specialization = searchParams.get('specialization');
    const name = searchParams.get('name');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (hospitalId) where.hospitalId = hospitalId;
    if (specialization) where.specialization = specialization;
    if (name) where.name = { contains: name, mode: 'insensitive' };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          hospital: true,
          department: true,
        },
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);

    return NextResponse.json(
      successResponse({
        doctors,
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
