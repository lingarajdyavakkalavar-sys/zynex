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

// For client-side: always return mock to avoid SSR/build issues
// Server-side getUser() handles real auth
export function useUser() {
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