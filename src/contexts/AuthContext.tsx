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
    let timeoutFired = false;

    // FAIL-SAFE: Force clear loading after 5 seconds no matter what
    const failSafeTimeout = setTimeout(() => {
      console.error('🚨 FAIL-SAFE: Forcing isLoading = false after 5 seconds');
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    }, 5000);

    const checkSession = async () => {
      console.log('🔍 Starting session check...');

      if (!isSupabaseConfigured()) {
        console.log('📴 Supabase not configured, using mock mode');
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

            console.log('✅ Mock user found:', user.email);
            clearTimeout(failSafeTimeout);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            console.log('❌ No mock user found');
            clearTimeout(failSafeTimeout);
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('❌ Mock session check error:', error);
          clearTimeout(failSafeTimeout);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
        return;
      }

      // CRITICAL: Aggressive 5-second timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Session check timeout! Force clearing...');
        timeoutFired = true;

        // Clear any invalid sessions
        console.log('🧹 Clearing invalid session...');
        supabase.auth.signOut().catch(err => console.error('⚠️ Timeout signOut failed:', err));

        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }, 5000); // REDUCED to 5 seconds for faster recovery

      try {
        console.log('🔐 Checking Supabase session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Don't process if timeout already fired
        if (timeoutFired) {
          console.log('⏱️ Timeout already fired, ignoring session check result');
          return;
        }

        console.log('📦 Session result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError?.message
        });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          clearTimeout(timeoutId);
          clearTimeout(failSafeTimeout);
          // Non-blocking sign out
          supabase.auth.signOut().catch(err => console.error('⚠️ Sign out failed:', err));
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          return;
        }

        if (session?.user) {
          console.log('👤 Session user found, fetching profile...');

          // Fetch user profile with timeout protection
          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const { data: profile, error: profileError } = await profilePromise;

          // Don't process if timeout already fired
          if (timeoutFired) {
            console.log('⏱️ Timeout already fired, ignoring profile result');
            return;
          }

          console.log('📋 Profile result:', {
            hasProfile: !!profile,
            profileEmail: profile?.email,
            error: profileError?.message,
            errorCode: profileError?.code
          });

          if (profileError || !profile) {
            console.error('❌ Profile not found or error:', profileError);
            clearTimeout(timeoutId);
            clearTimeout(failSafeTimeout);
            // Non-blocking sign out
            supabase.auth.signOut().catch(err => console.error('⚠️ Sign out failed:', err));
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
            return;
          }

          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar || undefined,
            createdAt: new Date(profile.created_at),
            lastLogin: profile.last_login ? new Date(profile.last_login) : undefined
          };

          console.log('✅ Session check complete, user authenticated:', user.email);
          clearTimeout(timeoutId);
          clearTimeout(failSafeTimeout);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          console.log('❌ No session user found');
          clearTimeout(timeoutId);
          clearTimeout(failSafeTimeout);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('❌ Session check fatal error:', error);

        // Don't process if timeout already fired
        if (timeoutFired) {
          console.log('⏱️ Timeout already fired, ignoring fatal error');
          return;
        }

        clearTimeout(timeoutId);
        clearTimeout(failSafeTimeout);
        // Non-blocking sign out
        supabase.auth.signOut().catch(err => console.error('⚠️ Sign out failed:', err));
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    // CRITICAL: Check URL hash for password recovery BEFORE anything else
    // This is more reliable than waiting for PASSWORD_RECOVERY event
    if (isSupabaseConfigured()) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasRecoveryToken = hashParams.get('type') === 'recovery' || window.location.hash.includes('recovery');

      if (hasRecoveryToken) {
        console.log('🔑 DETECTED PASSWORD RECOVERY IN URL HASH');
        console.log('🔑 Hash params:', window.location.hash);
        console.log('🔑 Setting password recovery mode flag IMMEDIATELY');
        sessionStorage.setItem('password_recovery_mode', 'true');
      }
    }

    checkSession();

    // Subscribe to auth state changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔔 AUTH STATE CHANGE EVENT');
        console.log('   Event:', event);
        console.log('   Has Session:', !!session);
        console.log('   Session User ID:', session?.user?.id || 'N/A');
        console.log('   Current Path:', window.location.pathname);
        console.log('   URL Hash:', window.location.hash || 'none');

        const currentFlag = sessionStorage.getItem('password_recovery_mode');
        console.log('   Recovery Mode Flag:', currentFlag || 'not set');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          console.log('✅ SIGNED_OUT event - clearing state');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          return;
        }

        // CRITICAL: Don't auto-login on password recovery
        // User must complete password reset flow first
        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 PASSWORD_RECOVERY EVENT DETECTED');
          console.log('🔑 Setting password recovery mode flag');

          // Set flag to prevent auto-login
          sessionStorage.setItem('password_recovery_mode', 'true');

          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });

          // Redirect to reset password page
          if (window.location.pathname !== '/reset-password') {
            console.log('🔑 Redirecting from', window.location.pathname, 'to /reset-password');
            window.location.href = '/reset-password';
          } else {
            console.log('🔑 Already on /reset-password');
          }

          return;
        }

        // Check if we're in password recovery mode
        const isPasswordRecoveryMode = sessionStorage.getItem('password_recovery_mode') === 'true';

        if (isPasswordRecoveryMode) {
          console.log('🚫 PASSWORD RECOVERY MODE ACTIVE - BLOCKING ALL AUTH');
          console.log('🚫 Event:', event);
          console.log('🚫 Has Session:', !!session);

          // Keep user logged out
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });

          // Make sure we're on the reset password page
          if (window.location.pathname !== '/reset-password') {
            console.log('🔑 Recovery mode: Redirecting to /reset-password');
            window.location.href = '/reset-password';
          }

          console.log('🚫 AUTH BLOCKED - Exiting handler');
          return;
        }

        // Handle user session
        if (session?.user) {
          console.log('👤 Processing session for user:', session.user.id);
          try {
            console.log('📡 onAuthStateChange: Fetching profile for', session.user.id);

            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            console.log('📡 onAuthStateChange: Profile result:', {
              hasProfile: !!profile,
              error: profileError?.message
            });

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

              console.log('📡 onAuthStateChange: Setting authenticated state for', user.email);
              setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false
              });
            } else if (profileError) {
              // Profile doesn't exist - just clear state, don't call signOut again
              console.error('📡 onAuthStateChange: Profile not found:', profileError);
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false
              });
            }
          } catch (error) {
            console.error('📡 onAuthStateChange: Error in handler:', error);
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } else {
          console.log('📡 onAuthStateChange: No session user, clearing state');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      });

      // Cleanup on unmount
      return () => {
        clearTimeout(failSafeTimeout);
        subscription.unsubscribe();
      };
    } else {
      // If not configured, still need to cleanup timeout
      return () => {
        clearTimeout(failSafeTimeout);
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
        throw new Error('auth.errors.invalidCredentials');
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
    console.log('🔐 Step 1: Attempting Supabase login...', credentials.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      console.log('✅ Step 2: Login API response:', {
        hasUser: !!data?.user,
        userId: data?.user?.id,
        error: error?.message
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error('auth.errors.invalidCredentials');
      }

      if (!data.user) {
        throw new Error('auth.errors.invalidCredentials');
      }

      // Verify profile exists
      console.log('🔍 Step 3: Checking if profile exists for user:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('👤 Step 4: Profile check result:', {
        hasProfile: !!profile,
        profileData: profile ? { id: profile.id, email: profile.email } : null,
        error: profileError?.message,
        errorCode: profileError?.code
      });

      if (profileError || !profile) {
        console.error('❌ Profile not found or error:', profileError);
        // Sign out if profile doesn't exist
        await supabase.auth.signOut();
        throw new Error('auth.errors.profileNotFound');
      }

      // Update last login
      console.log('⏰ Step 5: Updating last login...');
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
      console.log('✅ Last login updated');

      // IMMEDIATELY set auth state (don't wait for onAuthStateChange)
      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar || undefined,
        createdAt: new Date(profile.created_at),
        lastLogin: new Date()
      };

      console.log('🎉 Step 6: Login successful! Setting auth state immediately for:', user.email);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });

    } catch (err) {
      console.error('❌ Login process failed:', err);
      throw err;
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
    console.log('📝 Step 1: Starting Supabase registration for:', data.email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    });

    console.log('📝 Step 2: SignUp API response:', {
      hasUser: !!authData?.user,
      userId: authData?.user?.id,
      error: authError?.message
    });

    if (authError) {
      console.error('❌ Registration error:', authError);
      // Check if user already exists in auth.users
      if (authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already exists')) {
        console.log('⚠️ User already registered, attempting to sign in...');
        // Try to sign in and check if profile exists
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (signInError) {
          console.error('❌ Auto sign-in failed:', signInError);
          throw new Error('auth.errors.userAlreadyRegistered');
        }

        if (signInData.user) {
          console.log('✅ Auto sign-in successful, checking for profile...');
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', signInData.user.id)
            .single();

          if (existingProfile) {
            console.log('✅ Profile exists, registration complete via sign-in');

            // Update last login
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', signInData.user.id);

            // IMMEDIATELY set auth state (don't wait for onAuthStateChange)
            const user: User = {
              id: existingProfile.id,
              email: existingProfile.email,
              name: existingProfile.name,
              role: existingProfile.role,
              avatar: existingProfile.avatar || undefined,
              createdAt: new Date(existingProfile.created_at),
              lastLogin: new Date()
            };

            console.log('✅ Setting auth state immediately for:', user.email);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          } else {
            console.log('⚠️ Profile missing, creating new profile...');
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: signInData.user.id,
                email: data.email,
                name: data.name,
                role: 'user',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Profile creation failed:', createError);
              await supabase.auth.signOut();
              throw new Error('auth.errors.registrationIncomplete');
            }

            if (newProfile) {
              console.log('✅ Profile created successfully, registration complete');

              // IMMEDIATELY set auth state
              const user: User = {
                id: newProfile.id,
                email: newProfile.email,
                name: newProfile.name,
                role: newProfile.role,
                avatar: newProfile.avatar || undefined,
                createdAt: new Date(newProfile.created_at),
                lastLogin: new Date()
              };

              console.log('✅ Setting auth state immediately for:', user.email);
              setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false
              });
              return;
            }
          }
        }
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      console.error('❌ No user data returned from signUp');
      throw new Error('Registration failed');
    }

    console.log('✅ Step 3: User created in auth.users:', authData.user.id);

    // Check if profile already exists (for existing auth users without profile)
    console.log('🔍 Step 4: Checking if profile already exists...');
    const { data: checkProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (checkProfile) {
      console.log('✅ Profile already exists, registration complete');

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      // IMMEDIATELY set auth state
      const user: User = {
        id: checkProfile.id,
        email: checkProfile.email,
        name: checkProfile.name,
        role: checkProfile.role,
        avatar: checkProfile.avatar || undefined,
        createdAt: new Date(checkProfile.created_at),
        lastLogin: new Date()
      };

      console.log('✅ Setting auth state immediately for:', user.email);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return;
    }

    console.log('⚠️ Step 5: Profile does not exist, creating new profile...');

    // Create user profile manually with RLS policy
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: 'user',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Step 6: Insert profile error:', insertError);

      // If insert fails, try to fetch existing profile one more time
      console.log('⚠️ Trying to fetch existing profile one more time...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (fetchError) {
        console.error('❌ Fetch existing profile error:', fetchError);
        await supabase.auth.signOut();
        throw new Error('auth.errors.registrationIncomplete');
      }

      if (existingProfile) {
        console.log('✅ Found existing profile, registration complete');

        // IMMEDIATELY set auth state
        const user: User = {
          id: existingProfile.id,
          email: existingProfile.email,
          name: existingProfile.name,
          role: existingProfile.role,
          avatar: existingProfile.avatar || undefined,
          createdAt: new Date(existingProfile.created_at),
          lastLogin: new Date()
        };

        console.log('✅ Setting auth state immediately for:', user.email);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return;
      }

      console.error('❌ No profile found, registration failed');
      await supabase.auth.signOut();
      throw new Error('auth.errors.registrationFailed');
    }

    console.log('✅ Step 6: Profile created successfully!');

    // IMMEDIATELY set auth state with new profile
    const newUser: User = {
      id: insertData.id,
      email: insertData.email,
      name: insertData.name,
      role: insertData.role,
      avatar: insertData.avatar || undefined,
      createdAt: new Date(insertData.created_at),
      lastLogin: new Date()
    };

    console.log('✅ Setting auth state immediately for:', newUser.email);
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
