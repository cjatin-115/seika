import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function AuthCallbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  const role = (session.user as any).role;

  if (role === 'SUPER_ADMIN') {
    redirect('/superadmin');
  }

  if (role === 'HOSPITAL_ADMIN') {
    redirect('/dashboard');
  }

  redirect('/patient/home');
}
