import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/account-provider";

const REASONS = ["Not loading", "Broken or glitchy", "Inappropriate", "Other"] as const;

export function ReportButton({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]>("Not loading");
  const [details, setDetails] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { error } = await supabase.from("game_reports").insert({ game_id: gameId, reason, details: details.trim() || null });
    setBusy(false);
    if (error) setMsg("Could not send the report. Please try again.");
    else { setMsg("Thanks! Your report was sent."); setDetails(""); }
  };
  return <>
    <Button variant="ghost" size="icon" aria-label="Report game" title="Report game" onClick={() => { setOpen(true); setMsg(""); }}><Flag /></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl bg-popover">
        <DialogTitle>Report this game</DialogTitle>
        <DialogDescription>Tell us what's wrong.</DialogDescription>
        <form onSubmit={submit} className="grid gap-3">
          <div className="flex flex-wrap gap-2">{REASONS.map(r => <button key={r} type="button" onClick={() => setReason(r)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${reason === r ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>{r}</button>)}</div>
          <textarea className="account-input min-h-20" maxLength={500} placeholder="More details (optional)" value={details} onChange={e => setDetails(e.target.value)} />
          <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send report"}</Button>
          {msg && <p role="status" className="text-sm">{msg}</p>}
        </form>
      </DialogContent>
    </Dialog>
  </>;
}

export function CommentBox({ gameId }: { gameId: string }) {
  const { profile } = useAccount();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const key = ["comments", gameId];
  const { data: comments = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("game_comments").select("id,user_id,display_name,body,created_at").eq("game_id", gameId).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });
  const post = useMutation({
    mutationFn: async () => {
      const text = body.trim();
      if (!text) throw new Error("Write something first.");
      const { error } = await supabase.from("game_comments").insert({ game_id: gameId, body: text, display_name: profile.display_name || "Player" });
      if (error) throw error;
    },
    onSuccess: () => { setBody(""); setMsg(""); void qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setMsg(e instanceof Error ? e.message : "Could not post your comment."),
  });
  return (
    <section className="mt-3 rounded-2xl bg-card p-4" aria-label="Comments">
      <div className="mb-3 flex items-center gap-2"><MessageCircle className="size-4 text-primary" /><h2 className="text-sm font-bold">Comments ({comments.length})</h2></div>
      <form onSubmit={e => { e.preventDefault(); post.mutate(); }} className="flex items-end gap-2">
        <textarea aria-label="Write a comment" className="account-input min-h-12 flex-1 resize-y text-sm" maxLength={500} placeholder={`Comment as ${profile.display_name}…`} value={body} onChange={e => setBody(e.target.value)} />
        <Button type="submit" disabled={post.isPending || !body.trim()}><Send />Comment</Button>
      </form>
      {msg && <p role="status" className="mt-2 text-sm">{msg}</p>}
      <ul className="mt-4 grid gap-3">
        {isLoading && <li className="text-sm text-muted-foreground">Loading comments…</li>}
        {!isLoading && comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet. Be the first!</li>}
        {comments.map(c => (
          <li key={c.id} className="rounded-xl bg-background/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs"><span className="font-bold">{c.display_name}</span><span className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
