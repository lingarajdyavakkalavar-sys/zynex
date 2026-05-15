'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { isAuthEnabled } from '@/lib/auth-config';

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authEnabled = isAuthEnabled();
    
    if (authEnabled) {
      // Check for mock user (demo mode)
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        router.push('/dashboard');
        return;
      }
      // For now, just redirect to login
      router.push('/login');
    } else {
      // No auth - go directly to dashboard
      router.push('/dashboard');
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#8a8a9a]">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}