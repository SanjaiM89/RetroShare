'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus, Files, Home } from 'lucide-react';

export default function Header() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle error (e.g., show a toast notification)
    }
  };

  return (
    <header className="bg-card text-card-foreground shadow-md py-3 px-4 mb-4 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary hover:text-primary/80 transition-colors">
          RetroShare
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild className="text-sm sm:text-base">
                    <Link href="/my-files">
                      <Files className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> My Files
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut} className="text-sm sm:text-base">
                    <LogOut className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-sm sm:text-base">
                    <Link href="/login">
                      <LogIn className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Login
                    </Link>
                  </Button>
                  <Button variant="default" asChild className="text-sm sm:text-base">
                    <Link href="/register">
                      <UserPlus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Register
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
          {loading && (
            <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
          )}
        </nav>
      </div>
    </header>
  );
}
