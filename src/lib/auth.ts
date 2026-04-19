import type { NextAuthOptions } from 'next-auth';
import type { JWT } from '@auth/core/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import type { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }

  interface User {
    id: string;
    role?: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Check if user has a password (not OAuth-only)
        if (!user.emailVerified) {
          throw new Error('Email not verified. Please sign up first.');
        }

        // For password verification, we need to store hashed passwords
        // This is a placeholder - you'll need to implement password hashing on signup
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'credentials',
          },
        });

        if (!account) {
          throw new Error('No password set for this account');
        }

        // Verify password (this assumes you store the password hash in the providerAccountId)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          account.providerAccountId
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: (user as any).role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // With database sessions, `user` is the reliable source; fallback to token for JWT sessions.
        session.user.id = (user?.id as string) || (token.id as string);
        session.user.role = ((user as any)?.role || (token.role as any) || 'PATIENT') as UserRole;
      }
      return session;
    },
    async redirect({ url, baseUrl, user }) {
      // Always redirect authenticated users to their role-specific dashboard
      // Ignore the callback URL and use role-based routing instead
      if (user) {
        const userRole = (user as any)?.role;
        if (userRole === 'SUPER_ADMIN') return `${baseUrl}/superadmin`;
        if (userRole === 'HOSPITAL_ADMIN') return `${baseUrl}/dashboard`;
        return `${baseUrl}/patient/home`;
      }
      
      // If no user, allow the redirect to proceed
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};
