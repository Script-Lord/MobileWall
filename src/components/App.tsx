import React, { useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import AuthForm from './AuthForm';
import WalletApp from './WalletApp';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    authService.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? (
    <WalletApp onSignOut={handleSignOut} />
  ) : (
    <AuthForm onAuthSuccess={handleAuthSuccess} />
  );
}