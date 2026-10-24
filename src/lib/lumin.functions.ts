import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getLuminLibrary = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="games"></div><p id="status">Loading LuminSDK…</p><script src="https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js"></script><script>async function start(){try{if(!window.Lumin)throw new Error('unavailable');await Lumin.init({container:'#games',theme:'dark',onError:function(){document.getElementById('status').textContent='LuminSDK is unavailable right now. Please retry.'}});document.getElementById('status').remove()}catch(e){document.getElementById('status').textContent='LuminSDK is unavailable right now. Please retry.'}}start()</script></body></html>`;
  });