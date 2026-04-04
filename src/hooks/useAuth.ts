import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import * as authService from '@/lib/firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return authService.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return authService.signUp(email, password);
  }, []);

  const signOut = useCallback(async () => {
    return authService.signOut();
  }, []);

  return { user, loading, signIn, signUp, signOut };
}
