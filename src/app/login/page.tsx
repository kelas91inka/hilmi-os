import { LoginButton } from '@/features/auth/components/login-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Hilmi OS</CardTitle>
          <CardDescription>
            Personal Operating System
          </CardDescription>
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
