// ===========================================
// AUTHENTICATION CONTEXT - SUPABASE INTEGRATION
// ===========================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== '' && key !== '';
};

// Mock users database (fallback when Supabase not configured)
const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'admin@posum.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    email: 'user@posum.com',
    password: 'user123',
    name: 'Demo User',
    role: 'user' as const,
    createdAt: new Date('2024-01-15')
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        // Fallback to localStorage for mock mode
        try {
          const storedUser = localStorage.getItem('posum_user');
          const sessionToken = localStorage.getItem('posum_token');

          if (storedUser && sessionToken) {
            const user = JSON.parse(storedUser);
            user.createdAt = new Date(user.createdAt);
            if (user.lastLogin) {
              user.lastLogin = new Date(user.lastLogin);
            }

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Session check error:', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
        return;
      }

      // Use Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile from database
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar || undefined,
              createdAt: new Date(profile.created_at),
              lastLogin: profile.last_login ? new Date(profile.last_login) : undefined
            };

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkSession();

    // Subscribe to auth state changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar || undefined,
              createdAt: new Date(profile.created_at),
              lastLogin: profile.last_login ? new Date(profile.last_login) : undefined
            };

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUser = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!mockUser) {
        throw new Error('Invalid email or password');
      }

      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        lastLogin: new Date()
      };

      const sessionToken = `mock-token-${Date.now()}-${mockUser.id}`;
      localStorage.setItem('posum_user', JSON.stringify(user));
      localStorage.setItem('posum_token', sessionToken);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return;
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar || undefined,
        createdAt: new Date(profile.created_at),
        lastLogin: new Date()
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Mock register
      await new Promise(resolve => setTimeout(resolve, 500));

      const existingUser = MOCK_USERS.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const sessionToken = `mock-token-${Date.now()}-${newUser.id}`;
      localStorage.setItem('posum_user', JSON.stringify(newUser));
      localStorage.setItem('posum_token', sessionToken);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });
      return;
    }

    // Supabase register
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: 'user',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const newUser: User = {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = async () => {
    if (!isSupabaseConfigured()) {
      // Mock logout
      localStorage.removeItem('posum_user');
      localStorage.removeItem('posum_token');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return;
    }

    // Supabase logout
    await supabase.auth.signOut();

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = {
      ...authState.user,
      ...updates
    };

    if (!isSupabaseConfigured()) {
      // Mock update
      localStorage.setItem('posum_user', JSON.stringify(updatedUser));

      setAuthState({
        ...authState,
        user: updatedUser
      });
      return;
    }

    // Supabase update
    const { error } = await supabase
      .from('users')
      .update({
        name: updatedUser.name,
        avatar: updatedUser.avatar || null,
        role: updatedUser.role
      })
      .eq('id', authState.user.id);

    if (error) {
      console.error('Update user error:', error);
      return;
    }

    setAuthState({
      ...authState,
      user: updatedUser
    });
  };

  const value = {
    authState,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
