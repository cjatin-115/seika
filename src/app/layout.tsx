import type { Metadata } from 'next';
import { Noto_Serif_JP, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';

const notoSerifJP = Noto_Serif_JP({
  variable: '--font-noto-serif-jp',
  weight: ['400'],
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  weight: ['300', '400', '500'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'MediBook - Hospital & Clinic Appointment Booking',
  description: 'Book doctor appointments online. Find hospitals and clinics near you.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerifJP.variable} ${notoSansJP.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
