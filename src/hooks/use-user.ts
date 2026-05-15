import { isAuthEnabled } from '@/lib/auth-config';

interface MockUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  emailAddresses: { emailAddress: string }[];
}

export function useUser() {
  // Always return mock user for demo mode
  // This avoids any Clerk imports during build
  const mockUser: MockUser = {
    id: 'demo-user-123',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    imageUrl: null,
    primaryEmailAddress: { emailAddress: 'demo@zypher.com' },
    emailAddresses: [{ emailAddress: 'demo@zypher.com' }],
  };
  
  return {
    isLoaded: true,
    isSignedIn: true,
    user: mockUser,
  };
}