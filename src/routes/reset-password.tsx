import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [
    { title: 'Reset Password — Blues Games' },
    { name: 'description', content: 'Set a new password for your Blues Games account.' },
    { property: 'og:title', content: 'Reset Password — Blues Games' },
    { property: 'og:description', content: 'Set a new password for your Blues Games account.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }), component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    setRecovery(hash.get('type') === 'recovery');
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage(error.message);
    else { setDone(true); setMessage('Password updated.'); }
  };
  return <main className="mx-auto max-w-md px-5 py-16"><h1 className="mb-6 text-2xl font-bold">Reset password</h1>{recovery && !done ? <form onSubmit={submit} className="grid gap-4"><label className="grid gap-1">New password<input className="account-input" type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label><label className="grid gap-1">Confirm password<input className="account-input" type="password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label><Button disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button></form> : !done && <p>Open the password reset link from your email to continue.</p>}{message && <p role="status" className="my-4">{message}</p>}<Button asChild variant="link" className="mt-5"><Link to="/">Back to Blues Games</Link></Button></main>;
}