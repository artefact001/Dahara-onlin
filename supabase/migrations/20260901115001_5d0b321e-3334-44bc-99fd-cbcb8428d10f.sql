CREATE TYPE public.app_role AS ENUM ('eleve', 'professeur', 'admin');
CREATE TYPE public.step_status AS ENUM ('a_faire', 'en_cours', 'termine');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  city TEXT,
  bio TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  is_teacher BOOLEAN NOT NULL DEFAULT false,
  daily_minutes_goal INTEGER NOT NULL DEFAULT 30,
  weekly_verses_goal INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher profiles are public" ON public.profiles FOR SELECT TO anon, authenticated USING (is_teacher = true);
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_paths TO authenticated;
GRANT ALL ON public.learning_paths TO service_role;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own learning paths" ON public.learning_paths FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learning_paths ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status public.step_status NOT NULL DEFAULT 'a_faire',
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.path_steps TO authenticated;
GRANT ALL ON public.path_steps TO service_role;
ALTER TABLE public.path_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own path steps" ON public.path_steps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER path_steps_updated_at BEFORE UPDATE ON public.path_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT 'hebdomadaire',
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'versets',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.prayer_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prayer TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  offset_minutes INTEGER NOT NULL DEFAULT 10,
  city TEXT NOT NULL DEFAULT 'Dakar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, prayer)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_reminders TO authenticated;
GRANT ALL ON public.prayer_reminders TO service_role;
ALTER TABLE public.prayer_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prayer reminders" ON public.prayer_reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER prayer_reminders_updated_at BEFORE UPDATE ON public.prayer_reminders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.surah_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  total_verses INTEGER NOT NULL,
  memorized_verses INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, surah_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surah_progress TO authenticated;
GRANT ALL ON public.surah_progress TO service_role;
ALTER TABLE public.surah_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own surah progress" ON public.surah_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER surah_progress_updated_at BEFORE UPDATE ON public.surah_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.memorization_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT current_date,
  surah_number INTEGER,
  verses INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memorization_sessions TO authenticated;
GRANT ALL ON public.memorization_sessions TO service_role;
ALTER TABLE public.memorization_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own memorization sessions" ON public.memorization_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
  _path_id UUID;
BEGIN
  _role := CASE WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'eleve') = 'professeur'
                THEN 'professeur'::public.app_role ELSE 'eleve'::public.app_role END;

  INSERT INTO public.profiles (id, full_name, city, is_teacher)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'city',
    _role = 'professeur'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  INSERT INTO public.prayer_reminders (user_id, prayer, enabled, offset_minutes)
  SELECT NEW.id, p, true, 10 FROM unnest(ARRAY['Fajr','Dhuhr','Asr','Maghrib','Isha']) AS p;

  IF _role = 'eleve' THEN
    INSERT INTO public.learning_paths (user_id, title, description)
    VALUES (NEW.id, 'Mon parcours Dahara', 'Parcours progressif : lecture, tajwid et mémorisation.')
    RETURNING id INTO _path_id;

    INSERT INTO public.path_steps (path_id, user_id, title, detail, position, status)
    VALUES
      (_path_id, NEW.id, 'Découverte de l''alphabet arabe', 'Reconnaître et prononcer les 28 lettres.', 1, 'en_cours'),
      (_path_id, NEW.id, 'Lecture fluide avec voyelles', 'Lire des mots courts sans hésitation.', 2, 'a_faire'),
      (_path_id, NEW.id, 'Bases du tajwid', 'Règles de prolongation et points d''articulation.', 3, 'a_faire'),
      (_path_id, NEW.id, 'Mémorisation du Juz 30', 'Sourates courtes, 2 par semaine.', 4, 'a_faire');

    INSERT INTO public.goals (user_id, label, period, target_value, current_value, unit)
    VALUES
      (NEW.id, 'Versets mémorisés cette semaine', 'hebdomadaire', 20, 0, 'versets'),
      (NEW.id, 'Minutes de révision par jour', 'quotidien', 30, 0, 'minutes');

    INSERT INTO public.surah_progress (user_id, surah_number, surah_name, total_verses, memorized_verses)
    VALUES
      (NEW.id, 1, 'Al-Fâtiha', 7, 0),
      (NEW.id, 112, 'Al-Ikhlâs', 4, 0),
      (NEW.id, 67, 'Al-Mulk', 30, 0),
      (NEW.id, 78, 'An-Naba''', 40, 0);
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();