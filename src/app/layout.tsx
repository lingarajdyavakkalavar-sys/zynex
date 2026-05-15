import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { isAuthEnabled } from '@/lib/auth-config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zypher - AI-Powered Learning Platform',
  description: 'Syllabus-aware AI learning platform for GATE, CAT, and semester exam preparation',
  icons: {
    icon: '/favicon.ico',
  },
};

function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const authEnabled = isAuthEnabled();
  
  if (!authEnabled) {
    return <>{children}</>;
  }
  
  const { ClerkProvider } = require('@clerk/nextjs');
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background font-sans`}>
        <ClerkProviderWrapper>
          <Providers>{children}</Providers>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}