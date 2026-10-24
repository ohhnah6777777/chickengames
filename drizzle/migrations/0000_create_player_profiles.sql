CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT 'Player',
 lumin_enabled boolean NOT NULL DEFAULT false,
 liked_games text[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Players update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE FUNCTION public.create_player_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, left(coalesce(nullif(NEW.raw_user_meta_data->>'display_name',''), nullif(NEW.raw_user_meta_data->>'full_name',''), 'Player'), 50));
 RETURN NEW;
END;
$$;
CREATE TRIGGER on_player_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_player_profile();