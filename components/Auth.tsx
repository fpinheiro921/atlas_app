import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const Auth: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // User successfully logged in, trial management is handled in App.tsx
      // through the authStateChanged listener and loadUserData
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          setError("Sign in was cancelled. Please try again.");
        } else {
          setError("Failed to sign in with Google. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                 <h1 className="font-display text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                    ATLAS
                </h1>
            </div>
            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                    Welcome to Atlas
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                     Your personal AI metabolic coach.
                </p>
                <div className="space-y-4">
                    <Button 
                        onClick={signInWithGoogle} 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                Signing in...
                            </span>
                        ) : (
                            "Sign in with Google"
                        )}
                    </Button>
                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm text-center mt-2">
                            {error}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    </div>
  );
};
