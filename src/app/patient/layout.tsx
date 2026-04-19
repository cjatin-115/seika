'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { colors } from '@/lib/constants';
import { Home, Search, Calendar, Bell, User } from 'lucide-react';
import Link from 'next/link';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.accentCherry }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-20 md:pb-0"
      style={{ backgroundColor: colors.background }}
    >
      {/* Desktop Top Bar */}
      <div
        className="hidden md:flex items-center justify-between px-6 py-4 md:px-12"
        style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface }}
      >
        <div style={{ color: colors.textPrimary }} className="text-xl font-serif">
          MediBook
        </div>
        <div className="flex items-center gap-4">
          <span style={{ color: colors.textSecondary }} className="text-sm">
            {session.user?.name}
          </span>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              border: `1px solid`,
            }}
            className="px-4 py-2 rounded-md text-sm transition-colors hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3"
        style={{ backgroundColor: colors.surface, borderTop: `1px solid ${colors.border}` }}
      >
        <NavLink icon={Home} label="Home" href="/patient/home" />
        <NavLink icon={Search} label="Search" href="/patient/search" />
        <NavLink icon={Calendar} label="Appointments" href="/patient/appointments" />
        <NavLink icon={Bell} label="Alerts" href="/patient/notifications" />
        <NavLink icon={User} label="Profile" href="/patient/profile" />
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0"
        style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}`, marginTop: '65px' }}
      >
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <SidebarLink icon={Home} label="Home" href="/patient/home" />
            <SidebarLink icon={Search} label="Search Doctors" href="/patient/search" />
            <SidebarLink icon={Calendar} label="My Appointments" href="/patient/appointments" />
            <SidebarLink icon={Bell} label="Notifications" href="/patient/notifications" />
            <SidebarLink icon={User} label="Profile" href="/patient/profile" />
          </div>
        </div>
        <div className="p-4 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            style={{
              color: colors.textSecondary,
              borderColor: colors.border,
              border: `1px solid`,
            }}
            className="w-full px-4 py-2 rounded-md text-sm transition-colors hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Desktop Content Offset */}
      <style jsx>{`
        main {
          margin-top: 65px;
        }
        @media (min-width: 768px) {
          main {
            margin-left: 256px;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}

function NavLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1">
      <Icon size={20} style={{ color: colors.accentCherry }} />
      <span style={{ color: colors.textSecondary }} className="text-xs">
        {label}
      </span>
    </Link>
  );
}

function SidebarLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors"
      style={{
        color: colors.textSecondary,
      }}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
