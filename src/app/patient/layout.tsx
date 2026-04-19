'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

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
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-4 md:px-12"
        style={{
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          height: '65px',
        }}
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
      <main className="flex-1 md:pt-[65px] md:pl-64">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-3 py-2.5"
        style={{
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <NavLink icon={Home} label="Home" href="/patient/home" pathname={pathname} />
        <NavLink icon={Search} label="Search" href="/patient/search" pathname={pathname} />
        <NavLink
          icon={Calendar}
          label="Appointments"
          href="/patient/appointments"
          pathname={pathname}
        />
        <NavLink icon={Bell} label="Alerts" href="/patient/notifications" pathname={pathname} />
        <NavLink icon={User} label="Profile" href="/patient/profile" pathname={pathname} />
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col fixed left-0 bottom-0"
        style={{
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          top: '65px',
        }}
      >
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <SidebarLink icon={Home} label="Home" href="/patient/home" pathname={pathname} />
            <SidebarLink
              icon={Search}
              label="Search Doctors"
              href="/patient/search"
              pathname={pathname}
            />
            <SidebarLink
              icon={Calendar}
              label="My Appointments"
              href="/patient/appointments"
              pathname={pathname}
            />
            <SidebarLink
              icon={Bell}
              label="Notifications"
              href="/patient/notifications"
              pathname={pathname}
            />
            <SidebarLink
              icon={User}
              label="Profile"
              href="/patient/profile"
              pathname={pathname}
            />
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
    </div>
  );
}

function NavLink({
  icon: Icon,
  label,
  href,
  pathname,
}: {
  icon: any;
  label: string;
  href: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className="flex min-w-[60px] flex-col items-center gap-1 rounded-lg px-2 py-1.5"
      style={{ backgroundColor: isActive ? 'rgba(212, 118, 138, 0.12)' : 'transparent' }}
    >
      <Icon size={19} style={{ color: isActive ? colors.accentDark : colors.accentCherry }} />
      <span
        style={{ color: isActive ? colors.textPrimary : colors.textSecondary }}
        className="text-[11px] font-medium"
      >
        {label}
      </span>
    </Link>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  href,
  pathname,
}: {
  icon: any;
  label: string;
  href: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
      style={{
        color: isActive ? colors.textPrimary : colors.textSecondary,
        backgroundColor: isActive ? 'rgba(212, 118, 138, 0.12)' : 'transparent',
      }}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
