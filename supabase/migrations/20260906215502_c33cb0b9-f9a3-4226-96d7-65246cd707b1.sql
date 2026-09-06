-- TEACHER PROFILES
CREATE TABLE public.teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  headline text,
  bio text,
  city text,
  photo_url text,
  subjects text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  hourly_price integer NOT NULL DEFAULT 5000,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  status text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teacher_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_profiles TO authenticated;
GRANT ALL ON public.teacher_profiles TO service_role;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved teachers are public" ON public.teacher_profiles FOR SELECT USING (status = 'valide');
CREATE POLICY "Teachers read own profile" ON public.teacher_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all teachers" ON public.teacher_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers create own profile" ON public.teacher_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers update own profile" ON public.teacher_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update teachers" ON public.teacher_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER teacher_profiles_updated BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AVAILABILITY
CREATE TABLE public.teacher_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teacher_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_availability TO authenticated;
GRANT ALL ON public.teacher_availability TO service_role;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability is public" ON public.teacher_availability FOR SELECT USING (true);
CREATE POLICY "Teachers manage own availability" ON public.teacher_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teacher_profiles t WHERE t.id = teacher_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_profiles t WHERE t.id = teacher_id AND t.user_id = auth.uid()));

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  price integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'en_attente',
  notes text,
  room_name text NOT NULL DEFAULT concat('dahara-', replace(gen_random_uuid()::text, '-', '')),
  recording_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers read their bookings" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teacher_profiles t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "Students create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers update their bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teacher_profiles t WHERE t.id = teacher_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_profiles t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LIBRARY
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  language text NOT NULL DEFAULT 'Français',
  description text,
  cover_url text,
  chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon;
GRANT SELECT ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are public" ON public.books FOR SELECT USING (true);

CREATE TABLE public.book_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_favorites TO authenticated;
GRANT ALL ON public.book_favorites TO service_role;
ALTER TABLE public.book_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites" ON public.book_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_index integer NOT NULL DEFAULT 0,
  percent integer NOT NULL DEFAULT 0,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own reading progress" ON public.reading_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- QURAN
CREATE TABLE public.quran_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  ayah_number integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, surah_number, ayah_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_bookmarks TO authenticated;
GRANT ALL ON public.quran_bookmarks TO service_role;
ALTER TABLE public.quran_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own bookmarks" ON public.quran_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.quran_last_read (
  user_id uuid PRIMARY KEY,
  surah_number integer NOT NULL DEFAULT 1,
  ayah_number integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_last_read TO authenticated;
GRANT ALL ON public.quran_last_read TO service_role;
ALTER TABLE public.quran_last_read ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own last read" ON public.quran_last_read FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DEMO TEACHERS
INSERT INTO public.teacher_profiles (slug, full_name, headline, bio, city, subjects, languages, hourly_price, rating, status) VALUES
('serigne-abdou-sane', 'Serigne Abdou Sane', 'Maître de récitation et de tajwid', 'Vingt ans d''enseignement au dahra de Guédiawaye. Spécialiste du tajwid et de la mémorisation progressive pour les enfants comme pour les adultes.', 'Dakar', ARRAY['Coran','Tajwid','Mémorisation'], ARRAY['Wolof','Français','العربية'], 6000, 4.9, 'valide'),
('oustaza-aicha-diallo', 'Oustaza Aïcha Diallo', 'Langue arabe et sciences islamiques', 'Diplômée en langue arabe, elle accompagne les débutantes et débutants avec douceur et méthode, de l''alphabet à la lecture fluide.', 'Thiès', ARRAY['Langue arabe','Fiqh','Coran'], ARRAY['Français','العربية'], 5000, 4.8, 'valide'),
('oustaz-moussa-ba', 'Oustaz Moussa Ba', 'Sira et éducation spirituelle', 'Enseignant passionné de l''histoire du Prophète et de l''éthique musulmane, il rend chaque séance vivante et concrète.', 'Saint-Louis', ARRAY['Sira','Fiqh','Tajwid'], ARRAY['Wolof','Français'], 4500, 4.7, 'valide');

INSERT INTO public.teacher_availability (teacher_id, weekday, start_time, end_time)
SELECT t.id, d.weekday, '17:00'::time, '20:00'::time
FROM public.teacher_profiles t CROSS JOIN (VALUES (1),(2),(3),(4),(6)) AS d(weekday)
WHERE t.status = 'valide';

-- DEMO BOOKS
INSERT INTO public.books (slug, title, author, category, language, description, chapters) VALUES
('les-quarante-hadiths', 'Les quarante hadiths', 'Imam An-Nawawi', 'Hadith', 'Français', 'Un recueil fondamental de quarante paroles prophétiques, expliquées simplement.', '[{"title":"L''intention","content":"Les actes ne valent que par l''intention qui les habite. Chacun sera récompensé selon ce qu''il visait vraiment. Celui qui émigre pour Dieu trouve Dieu ; celui qui émigre pour un bien de ce monde n''obtient que ce bien.\n\nCe premier hadith fonde toute la vie spirituelle : avant le geste, il y a le cœur. On apprend donc à se demander, avant chaque acte : pourquoi je fais cela ?"},{"title":"Les piliers de l''islam","content":"L''islam repose sur cinq appuis : le témoignage de foi, la prière, l''aumône purificatrice, le jeûne du mois de Ramadan et le pèlerinage pour qui en a les moyens.\n\nChaque pilier soutient les autres. La prière rythme le jour, le jeûne éduque la patience, l''aumône libère du désir de posséder."},{"title":"La bonté envers autrui","content":"Nul n''est pleinement croyant tant qu''il ne désire pas pour son frère ce qu''il désire pour lui-même. La foi se mesure aux relations : la parole douce, la main qui aide, le silence qui protège la réputation d''autrui."}]'::jsonb),
('regles-du-tajwid', 'Les règles essentielles du tajwid', 'Cheikh Ibrahima Niang', 'Tajwid', 'Français', 'Les bases de la belle récitation : points d''articulation, allongements et assimilations.', '[{"title":"Pourquoi le tajwid","content":"Le tajwid est l''art de donner à chaque lettre du Coran ce qui lui revient : son point de sortie, sa durée, sa clarté. Réciter sans tajwid, c''est parler une langue en avalant ses mots.\n\nOn commence toujours par l''écoute : imiter un récitateur avant de comprendre la règle."},{"title":"Les points d''articulation","content":"La gorge produit le hamza et le hâ'' ; le fond de la langue le qâf et le kâf ; les lèvres le bâ'', le mîm et le wâw. Chaque lettre possède une maison ; sortie d''ailleurs, elle devient une autre lettre et le sens change."},{"title":"Les allongements","content":"L''allongement naturel dure deux temps ; il s''étire à quatre ou cinq lorsqu''une hamza ou un soukoun le suit. Compter mentalement, régulièrement, sans presser : la mesure fait la beauté."}]'::jsonb),
('histoire-du-prophete', 'La vie du Prophète, pas à pas', 'Oustaz Moussa Ba', 'Sira', 'Français', 'La biographie prophétique racontée en épisodes courts et vivants.', '[{"title":"La Mecque avant la révélation","content":"Une cité de commerce et de pèlerinage, riche en idoles et pauvre en justice. Les tribus se disputent l''eau et l''honneur ; les orphelins et les femmes comptent pour peu.\n\nC''est dans ce monde que naît, en l''an 570, un enfant orphelin de père : Muhammad."},{"title":"La grotte et la première parole","content":"À quarante ans, retiré dans la grotte de Hira, il entend : « Lis ! » Il tremble, rentre chez lui, se fait envelopper. Khadija, sa femme, le rassure la première : « Dieu ne t''humiliera pas. »"},{"title":"Médine, la cité du vivre-ensemble","content":"Après l''exil, la première chose bâtie est une mosquée ; la deuxième, un pacte entre musulmans, juifs et clans de la ville. La foi s''incarne dans une organisation sociale : voisinage, marché honnête, protection des faibles."}]'::jsonb),
('initiation-langue-arabe', 'Initiation à la langue arabe', 'Oustaza Aïcha Diallo', 'Langue arabe', 'Français', 'De l''alphabet aux premières phrases, avec exercices de lecture.', '[{"title":"L''alphabet","content":"Vingt-huit lettres, écrites de droite à gauche, qui changent de forme selon leur place dans le mot. Commencez par les reconnaître à l''œil, puis à l''oreille, puis à la main.\n\nAlif, bâ'', tâ'', thâ''… répétez chaque jour cinq minutes."},{"title":"Les voyelles brèves","content":"Fatha, kasra, damma : trois petits signes qui ouvrent, abaissent ou arrondissent la voix. Sans eux, un mot reste muet ; avec eux, il prend vie : kataba, il a écrit ; kutiba, il a été écrit."},{"title":"Premières phrases","content":"Nom + adjectif : al-baytu kabîr, la maison est grande. Ajoutez un verbe : dhahaba ilâ l-madrasa, il est allé à l''école. Trois structures suffisent pour parler de sa journée."}]'::jsonb);