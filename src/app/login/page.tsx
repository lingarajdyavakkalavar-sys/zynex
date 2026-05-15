'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAuthEnabled } from '@/lib/auth-config';

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MockLogin({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('mockUser', email || 'demo@zypher.com');
    router.push(redirectUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8a8a9a]">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9a]" />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-[#1a1a24] border-[#2a2a3a] text-white"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8a8a9a]">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9a]" />
          <Input
            type="password"
            placeholder="Any password works"
            className="pl-10 bg-[#1a1a24] border-[#2a2a3a] text-white"
          />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-[#0066cc] hover:bg-[#0052a3]"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
      <p className="text-center text-sm text-[#8a8a9a]">
        Demo mode - enter any email to continue
      </p>
    </form>
  );
}

function ClerkLogin({ redirectUrl }: { redirectUrl: string }) {
  const { SignIn } = require('@clerk/nextjs');

  return (
    <SignIn 
      routing="virtual"
      afterSignInUrl={redirectUrl}
      signUpFallbackRedirectUrl={redirectUrl}
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-[#1a1a24] border-[#2a2a3a]',
          headerTitle: 'text-white',
          headerSubtitle: 'text-[#8a8a9a]',
          socialButtonsBlockButton: 'bg-[#2a2a3a] text-white border-[#3a3a4a]',
          formFieldInput: 'bg-[#1a1a24] border-[#2a2a3a] text-white',
          formButtonPrimary: 'bg-[#0066cc] hover:bg-[#0052a3]',
          footerActionLink: 'text-[#0066cc]',
        },
      }}
    />
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const authEnabled = isAuthEnabled();

  return (
    <div className="min-h-screen bg-[#050508] flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-semibold text-2xl">Zypher</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#8a8a9a] mb-8">
            {authEnabled ? 'Sign in to continue your learning' : 'Sign in to continue your learning'}
          </p>

          {authEnabled ? (
            <ClerkLogin redirectUrl={redirectUrl} />
          ) : (
            <MockLogin redirectUrl={redirectUrl} />
          )}
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[#0a0a0f] items-center justify-center p-8 border-l border-[#1f1f2e]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">AI-Powered Exam Preparation</h2>
          <p className="text-[#8a8a9a] max-w-md mb-8">
            Master GATE, CAT, and semester exams with personalized AI tutoring, 
            smart practice tests, and intelligent study planning.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: 'Active Students', value: '50K+' },
              { label: 'Questions Solved', value: '10M+' },
              { label: 'Success Rate', value: '95%' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-sm bg-[#1a1a24]">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[#8a8a9a] text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginContent />
    </Suspense>
  );
}