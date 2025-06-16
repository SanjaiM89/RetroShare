'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { signUpWithEmail } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function RegisterPage() {
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

  const handleRegister = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
      router.push('/my-files'); // Successful registration
    } catch (error: any) {
      console.error('Registration failed:', error);
      // The error will be caught and displayed by AuthForm
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        title="Create an Account"
        buttonText="Sign Up"
      />
       <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
