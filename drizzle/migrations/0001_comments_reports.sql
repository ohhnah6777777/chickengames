CREATE TABLE public.game_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL CHECK (char_length(game_id) BETWEEN 1 AND 120),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 50),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX game_comments_game_idx ON public.game_comments (game_id, created_at DESC);
GRANT SELECT ON public.game_comments TO anon;
GRANT SELECT, INSERT, DELETE ON public.game_comments TO authenticated;
GRANT ALL ON public.game_comments TO service_role;
ALTER TABLE public.game_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.game_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users post own comments" ON public.game_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own comments" ON public.game_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.game_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL CHECK (char_length(game_id) BETWEEN 1 AND 120),
  user_id uuid DEFAULT auth.uid(),
  reason text NOT NULL CHECK (reason IN ('Not loading','Broken or glitchy','Inappropriate','Other')),
  details text CHECK (details IS NULL OR char_length(details) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.game_reports TO anon, authenticated;
GRANT ALL ON public.game_reports TO service_role;
ALTER TABLE public.game_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a report" ON public.game_reports FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());