import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{
    error: AuthError | null;
    confirmationSent: boolean;
    debugDetails?: any;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('Signup attempt with redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        }
      });

      const debugDetails = {
        redirectUrl: redirectTo,
        userCreated: !!data.user,
        identitiesCount: data.user?.identities?.length,
        session: !!data.session,
        timestamp: new Date().toISOString(),
        origin: window.location.origin,
      };

      console.log('Signup response:', { data, error, debugDetails });

      return {
        error,
        confirmationSent: !error && data.user?.identities?.length === 0,
        debugDetails
      };
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      return {
        error: {
          message: 'Unexpected error during signup',
          status: 500,
          name: 'UnexpectedError'
        } as AuthError,
        confirmationSent: false,
        debugDetails: {
          error: err,
          timestamp: new Date().toISOString()
        }
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
