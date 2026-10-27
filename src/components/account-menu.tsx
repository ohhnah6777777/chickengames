import { useState, type FormEvent, type ReactNode } from 'react';
import { UserCircle, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from './account-provider';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';

export function AccountMenu({ children, className }: { children?: ReactNode; className?: string } = {}) {
  const { user, profile, saveProfile, signOut, ready } = useAccount();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'info' | 'login' | 'signup' | 'forgot'>('info');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (work: () => Promise<void>) => {
    setBusy(true); setMessage('');
    try { await work(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() || 'Player' } } });
        if (error) throw error;
        setMessage('Check your email to confirm your account, then log in.'); setPassword('');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMode('info'); setPassword('');
      }
    });
  };
  const social = (provider: 'google' | 'lovable') => void run(async () => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) throw result.error;
    if (!result.redirected) setMode('info');
  });
  const openMenu = () => { setOpen(true); setMode('info'); setMessage(''); setName(profile?.display_name ?? ''); };
  return <>
    {children ? <button type="button" className={className} onClick={openMenu}>{children}</button> : <Button variant="outline" size="icon" className="shrink-0 rounded-full border-2" aria-label="Account" title="Account" onClick={openMenu}><UserCircle /></Button>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg bg-card">
        <DialogTitle>Your account</DialogTitle>
        <DialogDescription>{user ? 'Your profile and likes are saved to your account.' : 'Local account · Not synced. Likes stay in this browser only.'}</DialogDescription>
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-border pb-5">
          <UserCircle className="size-10 text-primary" />
          <div className="min-w-0 flex-1"><p className="font-bold break-words">{user ? profile?.display_name ?? 'Player' : 'Local player'}</p><p className="break-all text-xs text-muted-foreground">{user?.email ?? 'No saved account'}</p></div>
          {!user && <div className="flex gap-2"><Button size="sm" variant="outline" disabled={!ready} onClick={() => { setMode('login'); setMessage(''); }}>Log in</Button><Button size="sm" disabled={!ready} onClick={() => { setMode('signup'); setMessage(''); }}>Sign up</Button></div>}
          {user && <Button variant="outline" size="icon" aria-label="Sign out" title="Sign out" disabled={busy} onClick={() => void run(async () => { await signOut(); setMode('info'); })}><LogOut /></Button>}
        </div>
        {!user && mode !== 'info' && <form onSubmit={submit} className="grid gap-3">
          <h3 className="font-bold">{mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : 'Welcome back'}</h3>
          {mode === 'signup' && <label className="grid gap-1 text-sm">Display name<input className="account-input" value={name} maxLength={50} required onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>}
          <label className="grid gap-1 text-sm">Email<input className="account-input" type="email" value={email} required onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
          {mode !== 'forgot' && <label className="grid gap-1 text-sm">Password<input className="account-input" type="password" value={password} minLength={8} required onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>}
          <Button disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Log in'}</Button>
          {mode === 'login' && <Button variant="link" type="button" onClick={() => setMode('forgot')}>Forgot password?</Button>}
          {mode !== 'forgot' && <><Button type="button" variant="outline" disabled={busy} onClick={() => social('google')}>Continue with Google</Button><Button type="button" className="lovable-auth-button" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></>}
        </form>}
        {user && <form className="flex items-end gap-2" onSubmit={e => { e.preventDefault(); void run(() => saveProfile({ display_name: name.trim() || 'Player' })); }}><label className="grid min-w-0 flex-1 gap-1 text-sm">Display name<input className="account-input" value={name} maxLength={50} required onChange={e => setName(e.target.value)} /></label><Button type="submit" size="icon" aria-label="Save profile" title="Save profile" disabled={busy}><Save /></Button></form>}
        {message && <p role="status" className="break-words text-sm text-primary">{message}</p>}
      </DialogContent>
    </Dialog>
  </>;
}