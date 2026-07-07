import { Metadata } from 'next';
import { LoginButton } from '@/features/auth/components/login-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';

export const metadata: Metadata = {
  title: 'Login | Hilmi OS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent">
            <Logo className="w-full h-full" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Hilmi OS</CardTitle>
            <CardDescription>
              Personal Operating System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resolvedSearchParams.error === 'unauthorized' && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              Access denied. This system is private.
            </div>
          )}
          {resolvedSearchParams.error === 'auth-callback-failed' && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              Authentication failed. Please try again.
            </div>
          )}
          <LoginButton />
          <div className="text-center text-xs text-muted-foreground">
            Strictly authorized access only.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
