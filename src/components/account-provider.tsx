import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Local-only account: display name + liked games live in this browser's localStorage.
type Profile = { display_name: string; liked_games: string[] };
type Account = { profile: Profile; saveProfile: (updates: Partial<Profile>) => Promise<void> };
const KEY = 'cg-profile';
const DEFAULT: Profile = { display_name: 'Player', liked_games: [] };
const AccountContext = createContext<Account | null>(null);

function load(): Profile {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && typeof v === 'object') {
      return {
        display_name: typeof v.display_name === 'string' && v.display_name.trim() ? v.display_name : 'Player',
        liked_games: Array.isArray(v.liked_games) ? (v.liked_games as unknown[]).filter((x): x is string => typeof x === 'string') : [],
      };
    }
  } catch { /* ignore */ }
  return DEFAULT;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  useEffect(() => { setProfile(load()); }, []);
  const saveProfile = async (updates: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  return <AccountContext.Provider value={{ profile, saveProfile }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('Account provider missing');
  return account;
}
