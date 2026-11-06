import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type ReferenceRole = 'reader' | 'editor' | 'admin';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<ReferenceRole | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    const loadRole = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (active) {
        setRole((data?.role as ReferenceRole | undefined) ?? 'reader');
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(Boolean(nextSession));
      if (nextSession) {
        window.setTimeout(() => void loadRole(nextSession.user.id), 0);
      } else {
        setRole(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    role,
    loading,
    canEdit: role === 'editor' || role === 'admin',
  };
}