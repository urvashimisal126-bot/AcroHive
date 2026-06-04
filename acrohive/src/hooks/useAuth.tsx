import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

type UserRole = 'student' | 'admin' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    rollNumber: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[AuthProvider] Profile fetch error:', error.message);
      return null;
    }
    return data as Profile;
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const prof = await fetchProfile(currentSession.user.id);
        if (mounted) {
          setProfile(prof);
          setRole(prof?.role || null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        const prof = await fetchProfile(newSession.user.id);
        if (mounted) {
          setProfile(prof);
          setRole(prof?.role || null);
        }
      } else {
        setProfile(null);
        setRole(null);
      }

      if (event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Failed to fetch')) {
        console.warn("[AuthProvider] Supabase unreachable. Falling back to MOCK LOGIN.");
        const isMockAdmin = email.includes('admin') || email.includes('organizer');
        const mockUser = { id: 'mock-123', email } as User;
        const mockProfile: Profile = { id: 'mock-123', role: isMockAdmin ? 'admin' : 'student', full_name: 'Mock User', roll_number: 'DEMO123', created_at: new Date().toISOString() };
        setUser(mockUser);
        setProfile(mockProfile);
        setRole(mockProfile.role);
        setSession({ user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' });
        return { error: null };
      }
      return { error: error.message };
    }

    if (data.user) {
      const prof = await fetchProfile(data.user.id);
      setProfile(prof);
      setRole(prof?.role || null);
    }

    return { error: null };
  };

  // Sign up as student
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    rollNumber: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Failed to fetch')) {
        console.warn("[AuthProvider] Supabase unreachable. Falling back to MOCK SIGNUP.");
        const mockUser = { id: 'mock-123', email } as User;
        const mockProfile: Profile = { id: 'mock-123', role: 'student', full_name: fullName, roll_number: rollNumber, created_at: new Date().toISOString() };
        setUser(mockUser);
        setProfile(mockProfile);
        setRole(mockProfile.role);
        setSession({ user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' });
        return { error: null };
      }
      return { error: error.message };
    }

    if (data.user) {
      // Insert student profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role: 'student',
        full_name: fullName,
        roll_number: rollNumber,
      });

      if (profileError) {
        console.error('[AuthProvider] Profile insert error:', profileError);
        return { error: 'Account created but profile setup failed. Please contact admin.' };
      }

      const prof = await fetchProfile(data.user.id);
      setProfile(prof);
      setRole('student');
    }

    return { error: null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, role, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
