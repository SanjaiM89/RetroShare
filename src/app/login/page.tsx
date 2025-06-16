'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { signInWithEmail } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/my-files');
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading || (!loading && isAuthenticated)) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-ping h-8 w-8 bg-primary rounded-full"></div>
      </div>
    );
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      router.push('/my-files'); // Successful login
    } catch (error: any) {
      console.error('Login failed:', error);
      // The error will be caught and displayed by AuthForm
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        title="Welcome Back!"
        buttonText="Sign In"
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
