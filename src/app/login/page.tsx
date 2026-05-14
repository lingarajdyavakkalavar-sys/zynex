'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn, SignUp, ClerkProvider } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <ClerkProvider>
      <LoginForm />
    </ClerkProvider>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const [isSignUp, setIsSignUp] = useState(false);

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
            <span className="text-white font-semibold text-2xl">StudyHub</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-[#8a8a9a] mb-8">
            {isSignUp 
              ? 'Start your competitive exam preparation journey'
              : 'Sign in to continue your learning'}
          </p>

          <SignIn 
            routing="virtual"
            afterSignInUrl={redirectUrl}
            signUpFallbackRedirectUrl={redirectUrl}
          />
          
          <div className="mt-6 text-center">
            <span className="text-[#8a8a9a]">Don't have an account? </span>
            <Link href="/sign-up" className="text-[#0066cc] hover:underline">
              Sign up
            </Link>
          </div>
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