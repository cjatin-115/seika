import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, handleError, successResponse } from '@/lib/utils/errors';

const createHospitalAdminSchema = z.object({
  adminName: z.string().min(2).max(100),
  adminEmail: z.string().email(),
  password: z.string().min(8).max(128),

  hospitalName: z.string().min(3).max(200),
  hospitalSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  hospitalAddress: z.string().min(5),
  hospitalCity: z.string().min(2),
  hospitalState: z.string().min(2),
  hospitalPincode: z.string().regex(/^\d{5,6}$/),
  hospitalPhone: z.string().regex(/^\d{10}$/),
  hospitalEmail: z.string().email(),
  hospitalWebsite: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : ''))
    .refine((v) => v === '' || /^https?:\/\//i.test(v), {
      message: 'Website must start with http:// or https://',
    }),
});

/**
 * POST /api/superadmin/hospital-admins
 * Creates a hospital admin user + hospital + credentials login.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'You must be logged in'), { status: 401 });
    }

    if ((session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(errorResponse('FORBIDDEN', 'Forbidden'), { status: 403 });
    }

    const body = await req.json();
    const data = createHospitalAdminSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.adminEmail } });
    if (existingUser) {
      return NextResponse.json(errorResponse('USER_EXISTS', 'User with this email already exists'), { status: 409 });
    }

    const existingSlug = await prisma.hospital.findUnique({ where: { slug: data.hospitalSlug } });
    if (existingSlug) {
      return NextResponse.json(errorResponse('SLUG_EXISTS', 'Hospital slug already exists'), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          name: data.adminName,
          role: 'HOSPITAL_ADMIN',
          emailVerified: new Date(),
        },
      });

      await tx.account.create({
        data: {
          userId: admin.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: hashedPassword,
        },
      });

      const hospital = await tx.hospital.create({
        data: {
          name: data.hospitalName,
          slug: data.hospitalSlug,
          address: data.hospitalAddress,
          city: data.hospitalCity,
          state: data.hospitalState,
          pincode: data.hospitalPincode,
          phone: data.hospitalPhone,
          email: data.hospitalEmail,
          website: data.hospitalWebsite || undefined,
          adminUserId: admin.id,
          isVerified: true,
          isActive: true,
        },
      });

      return { admin, hospital };
    });

    return NextResponse.json(
      successResponse({
        admin: { id: result.admin.id, email: result.admin.email, name: result.admin.name },
        hospital: { id: result.hospital.id, slug: result.hospital.slug, name: result.hospital.name },
      }),
      { status: 201 }
    );
  } catch (error) {
    const { statusCode, message, code } = handleError(error);
    return NextResponse.json(errorResponse(code, message), { status: statusCode });
  }
}
