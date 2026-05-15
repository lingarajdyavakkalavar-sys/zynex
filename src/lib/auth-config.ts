export const authConfig = {
  enabled: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') && 
           process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!.length > 20,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  secretKey: process.env.CLERK_SECRET_KEY || '',
};

export function isAuthEnabled(): boolean {
  return authConfig.enabled || false;
}