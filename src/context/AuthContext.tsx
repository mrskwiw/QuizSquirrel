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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
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
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://quiz-squirrel.vercel.app';
      const redirectTo = `${siteUrl}/auth/callback`;

      console.log('Starting signup process...', {
        siteUrl,
        redirectTo,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            timestamp: new Date().toISOString(),
            signupOrigin: siteUrl
          }
        }
      });

      console.log('Signup response:', {
        success: !error,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        identitiesCount: data?.user?.identities?.length,
        hasSession: !!data?.session,
        error: error ? {
          message: error.message,
          status: error.status
        } : null,
        timestamp: new Date().toISOString()
      });

      const debugDetails = {
        redirectUrl: redirectTo,
        userCreated: !!data.user,
        identitiesCount: data.user?.identities?.length,
        session: !!data.session,
        confirmationEmailSent: !error && !data.session && !!data.user,
        timestamp: new Date().toISOString(),
        origin: siteUrl
      };

      return {
        error,
        confirmationSent: !error && data.user && !data.session,
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
