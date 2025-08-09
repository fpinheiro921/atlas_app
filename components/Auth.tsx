import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const Auth: React.FC = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
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
                    <Button onClick={signInWithGoogle} className="w-full" size="lg">
                        Sign in with Google
                    </Button>
                </div>
            </Card>
        </div>
    </div>
  );
};
