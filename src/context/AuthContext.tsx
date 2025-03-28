import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Cache keys
const USER_CACHE_KEY = 'auth_user';
const SESSION_CACHE_KEY = 'auth_session';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | Error | null }>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize state from cache if available
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem(USER_CACHE_KEY);
      return cachedUser ? JSON.parse(cachedUser) : null;
    }
    return null;
  });
  
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined') {
      const cachedSession = localStorage.getItem(SESSION_CACHE_KEY);
      return cachedSession ? JSON.parse(cachedSession) : null;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(!user);

  // Update cache when user or session changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  }, [session]);

  useEffect(() => {
    // Only fetch session if we don't have one cached
    const fetchSession = async () => {
      if (!user || !session) {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        setIsLoading(false);
      }
    };
    
    fetchSession();
    
    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Clear the cache on logout
          localStorage.removeItem(USER_CACHE_KEY);
          localStorage.removeItem(SESSION_CACHE_KEY);
        }
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this only runs once on mount

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Cache clearing is handled in the auth state change listener
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?loginMode=recovery`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };
  
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 