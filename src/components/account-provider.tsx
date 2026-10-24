import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Profile = { display_name: string; lumin_enabled: boolean; liked_games: string[] };
type Account = { user: User | null; ready: boolean; profile: Profile | null; saveProfile: (updates: Partial<Profile>) => Promise<void>; signOut: () => Promise<void> };
const AccountContext = createContext<Account | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      const { data } = await supabase.auth.getUser();
      if (active && current === revision) { setUser(data.user); setReady(true); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) return;
      if (event === 'SIGNED_OUT') { revision++; setUser(null); setReady(true); }
      else { setTimeout(() => { void refresh(); }, 0); }
      if (event !== 'INITIAL_SESSION') {
        void router.invalidate();
        if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
      }
    });
    void refresh();
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, queryClient]);
  const { data: profile = null } = useQuery({
    queryKey: ['profile', user?.id], enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('display_name,lumin_enabled,liked_games').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
  });
  const saveProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Please log in first.');
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  };
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    await router.navigate({ to: '/', replace: true });
  };
  return <AccountContext.Provider value={{ user, ready, profile, saveProfile, signOut }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('Account provider missing');
  return account;
}