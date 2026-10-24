import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getLuminLibrary } from '@/lib/lumin.functions';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

export function LuminLibrary() {
  const load = useServerFn(getLuminLibrary);
  const [doc, setDoc] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setDoc(''); setError(false);
    load().then(html => { if (active) setDoc(html); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [load, retry]);
  return <section className="min-h-[70dvh]">
    <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">LuminSDK games</h2><Button variant="outline" size="icon" title="Reload LuminSDK" aria-label="Reload LuminSDK" onClick={() => setRetry(n => n + 1)}><RotateCw /></Button></div>
    {error ? <p role="alert">Could not load LuminSDK. Please retry.</p> : !doc ? <p role="status">Loading LuminSDK…</p> : <iframe title="LuminSDK games" srcDoc={doc} sandbox="allow-scripts allow-popups allow-pointer-lock allow-forms" allow="fullscreen; autoplay; gamepad" allowFullScreen className="h-[78dvh] min-h-[500px] w-full rounded-lg border-2 border-border bg-card" />}
  </section>;
}