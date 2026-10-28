import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { seedDemoData } from '@/lib/seed';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.full_name || 'User',
          email: session.user.email
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.full_name || 'User',
          email: session.user.email
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', fontWeight: 'bold' }}>Loading PayTrack AI...</div>;

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}