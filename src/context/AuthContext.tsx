import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  firstName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        
        // Fetch user details from users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role || 'student',
            firstName: userData.first_name || 'User'
          });
        } else {
          // Check admin table
          const { data: adminData } = await supabase
            .from('admin')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (adminData) {
            setUser({
              id: adminData.id,
              email: adminData.email,
              role: 'admin',
              firstName: 'Admin'
            });
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setToken(session.access_token);
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role || 'student',
            firstName: userData.first_name || 'User'
          });
        } else {
          const { data: adminData } = await supabase
            .from('admin')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (adminData) {
            setUser({
              id: adminData.id,
              email: adminData.email,
              role: 'admin',
              firstName: 'Admin'
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
