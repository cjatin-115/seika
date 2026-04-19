'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { colors } from '@/lib/constants';
import { LogOut } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated' && userRole !== 'SUPER_ADMIN') {
      router.push('/patient/home');
    }
  }, [status, userRole, router]);

  if (status === 'loading' || userRole !== 'SUPER_ADMIN') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="soft-card px-6 py-5 text-center">
          <div
            className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: colors.accentCherry }}
          />
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex">
        {/* Sidebar */}
        <aside
          className="w-64 h-screen fixed flex flex-col"
          style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}` }}
        >
          <div className="p-6">
            <h1 style={{ color: colors.textPrimary }} className="text-xl font-serif">
              MediBook Super Admin
            </h1>
            <p style={{ color: colors.textSecondary }} className="text-xs mt-2">
              {session?.user?.name}
            </p>
          </div>
          <nav className="mt-8 space-y-2 px-4 flex-1">
            <NavItem label="Hospitals" />
            <NavItem label="Users" />
            <NavItem label="Analytics" />
            <NavItem label="Settings" />
          </nav>
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/auth' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: colors.accentCherry }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1">
          <div
            className="p-8"
            style={{ backgroundColor: colors.background }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm cursor-pointer hover:translate-x-0.5"
      style={{ color: colors.textSecondary, backgroundColor: 'transparent' }}
    >
      {label}
    </div>
  );
}
