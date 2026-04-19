import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AuthCallbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  let role = (session.user as any).role as string | undefined;
  if (!role && session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    role = user?.role;
  }

  if (role === 'SUPER_ADMIN') {
    redirect('/superadmin');
  }

  if (role === 'HOSPITAL_ADMIN') {
    redirect('/dashboard');
  }

  redirect('/patient/home');
}
