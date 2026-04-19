'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { colors } from '@/lib/constants';
import { ChevronRight, ShieldCheck, Clock3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role;
      if (role === 'SUPER_ADMIN') {
        router.push('/superadmin');
      } else if (role === 'HOSPITAL_ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/patient/home');
      }
    }
  }, [status, session, router]);

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen flex flex-col"
    >
      {/* Navigation */}
      <nav
        className="flex items-center justify-between px-6 py-4 md:px-12"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div style={{ color: colors.textPrimary }} className="text-2xl font-serif">
          MediBook
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/auth')}
            disabled={status === 'loading'}
            className="px-6 py-2 rounded-md text-sm font-medium transition-all active:scale-95 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.accentCherry,
              color: 'white',
              borderRadius: '6px',
              border: `1px solid ${colors.accentCherry}`,
            }}
          >
            {status === 'loading' ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl w-full text-center"
        >
          {/* Decorative SVG */}
          <div className="mb-8 h-40 flex items-center justify-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 20 Q 80 40, 60 60 Q 40 40, 60 20"
                stroke={colors.accentCherry}
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="60"
                cy="70"
                r="18"
                stroke={colors.accentCherry}
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="60"
                y1="52"
                x2="60"
                y2="88"
                stroke={colors.accentCherry}
                strokeWidth="2"
              />
              <line
                x1="42"
                y1="70"
                x2="78"
                y2="70"
                stroke={colors.accentCherry}
                strokeWidth="2"
              />
            </svg>
          </div>

          <h1
            style={{
              color: colors.textPrimary,
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '2.75rem',
              lineHeight: '1.2',
            }}
            className="mb-4 text-balance"
          >
            予約を、もっと簡単に
          </h1>

          <p
            style={{ color: colors.textPrimary, fontSize: '1.5rem' }}
            className="mb-6 font-serif"
          >
            Booking, made simpler
          </p>

          <p
            style={{ color: colors.textSecondary, lineHeight: '1.8' }}
            className="mb-12 max-w-xl mx-auto text-lg text-balance"
          >
            Schedule doctor appointments with ease. Find hospitals and clinics near you,
            book online, and receive instant confirmations.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            <div className="text-center soft-card p-5">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Sparkles size={18} style={{ color: colors.accentCherry }} />
              </div>
              <p
                style={{ color: colors.textSecondary, fontSize: '0.95rem' }}
                className="leading-relaxed"
              >
                Easy to use interface
              </p>
            </div>
            <div className="text-center soft-card p-5">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Clock3 size={18} style={{ color: colors.accentCherry }} />
              </div>
              <p
                style={{ color: colors.textSecondary, fontSize: '0.95rem' }}
                className="leading-relaxed"
              >
                Real-time availability
              </p>
            </div>
            <div className="text-center soft-card p-5">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <ShieldCheck size={18} style={{ color: colors.accentCherry }} />
              </div>
              <p
                style={{ color: colors.textSecondary, fontSize: '0.95rem' }}
                className="leading-relaxed"
              >
                Secure & protected
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/auth')}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            style={{
              backgroundColor: colors.accentCherry,
              color: 'white',
              border: `1px solid ${colors.accentCherry}`,
            }}
          >
            {status === 'loading' ? 'Loading...' : 'Get Started'}
            {status !== 'loading' && (
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          <p
            style={{ color: colors.textSecondary, fontSize: '0.875rem' }}
            className="mt-8"
          >
            Sign in with email • Google • Secure & protected
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-8 md:px-12 text-center text-sm"
        style={{
          backgroundColor: colors.surface,
          color: colors.textSecondary,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <p>MediBook © 2024 • Hospital & Clinic Appointment Platform</p>
      </footer>
    </div>
  );
}
