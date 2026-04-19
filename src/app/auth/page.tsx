'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/constants';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role;
      if (role === 'SUPER_ADMIN') {
        router.push('/superadmin');
      } else if (role === 'HOSPITAL_ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/patient/home');
      }
    }
  }, [session, router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log('Attempting sign in with email:', email);
      // Let NextAuth handle the redirect based on user role
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Authentication failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || data.message || 'Signup failed');
        console.error('Signup error:', data);
      } else {
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => {
          setMode('signin');
          setSuccess(null);
          (e.target as HTMLFormElement).reset();
        }, 2000);
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign in...');
      setError(null);
      // Let NextAuth handle the redirect automatically
      await signIn('google', {
        redirect: true,
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('Google sign in exception:', err);
      setError('Google sign in failed. Make sure your Google OAuth credentials are configured correctly.');
      setLoading(false);
    }
  };

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
        <Link href="/">
          <div style={{ color: colors.textPrimary }} className="text-2xl font-serif cursor-pointer">
            MediBook
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-md text-sm font-medium transition-all active:scale-95 cursor-pointer hover:opacity-80"
            style={{
              color: colors.accentCherry,
              border: `1px solid ${colors.accentCherry}`,
            }}
          >
            Back
          </button>
        </div>
      </nav>

      {/* Auth Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccess(null);
              }}
              className="flex-1 py-3 rounded-md font-medium transition-all active:scale-95 cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: mode === 'signin' ? colors.accentCherry : colors.surface,
                color: mode === 'signin' ? 'white' : colors.textPrimary,
                borderBottom:
                  mode === 'signin' ? `3px solid ${colors.accentCherry}` : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccess(null);
              }}
              className="flex-1 py-3 rounded-md font-medium transition-all active:scale-95 cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: mode === 'signup' ? colors.accentCherry : colors.surface,
                color: mode === 'signup' ? 'white' : colors.textPrimary,
                borderBottom:
                  mode === 'signup' ? `3px solid ${colors.accentCherry}` : 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 p-4 rounded-md text-sm"
              style={{
                backgroundColor: '#fee',
                color: '#c33',
                border: `1px solid #fcc`,
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              className="mb-4 p-4 rounded-md text-sm"
              style={{
                backgroundColor: '#efe',
                color: '#3c3',
                border: `1px solid #cfc`,
              }}
            >
              {success}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md font-medium transition-all active:scale-95 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.accentCherry,
                  color: 'white',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="••••••••"
                />
                <p style={{ color: colors.textSecondary }} className="text-xs mt-1">
                  Minimum 8 characters
                </p>
              </div>
              <div>
                <label
                  style={{ color: colors.textSecondary }}
                  className="block text-sm font-medium mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md font-medium transition-all active:scale-95 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.accentCherry,
                  color: 'white',
                }}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div
              style={{ backgroundColor: colors.border }}
              className="flex-1 h-px"
            ></div>
            <span style={{ color: colors.textSecondary }} className="text-sm">
              Or
            </span>
            <div
              style={{ backgroundColor: colors.border }}
              className="flex-1 h-px"
            ></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
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
