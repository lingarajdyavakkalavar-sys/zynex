import { useUser as useClerkUser } from '@clerk/nextjs';
import { isAuthEnabled } from '@/lib/auth-config';

interface MockUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export function useUser() {
  const authEnabled = isAuthEnabled();
  
  if (!authEnabled) {
    // Return mock user for demo mode
    const mockUser: MockUser = {
      id: 'demo-user-123',
      email: 'demo@zypher.com',
      firstName: 'Demo',
      lastName: 'User',
      imageUrl: null,
    };
    
    return {
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    };
  }
  
  // Use real Clerk user
  return useClerkUser();
}