'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    // Check if Clerk is available at runtime
    const checkClerk = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (publishableKey && publishableKey.startsWith('pk_test_') && publishableKey.length > 20) {
        setClerkReady(true);
      } else {
        setClerkReady(false);
      }
    };
    checkClerk();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}